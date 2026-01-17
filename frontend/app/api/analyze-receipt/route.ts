// Receipt Analysis API Endpoint
// ==============================
// Анализирует фото чека с помощью Claude Vision API
// и возвращает структурированные данные

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Инициализация Anthropic клиента
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем, что API ключ настроен
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: 'Anthropic API не настроен',
          message: 'Добавь ANTHROPIC_API_KEY в .env.local'
        },
        { status: 500 }
      );
    }

    // Получаем данные из запроса
    const body = await request.json();
    const { imageBase64, locale } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Изображение не предоставлено' },
        { status: 400 }
      );
    }

    // Определяем язык для промпта
    const languageHints: Record<string, string> = {
      el: 'Greek (Ελληνικά)',
      ru: 'Russian (Русский)',
      uk: 'Ukrainian (Українська)',
      en: 'English',
      sq: 'Albanian (Shqip)',
      bg: 'Bulgarian (Български)',
      ro: 'Romanian (Română)',
      ar: 'Arabic (العربية)',
    };

    const language = languageHints[locale] || 'Greek (Ελληνικά)';

    // Промпт для анализа чека
    const prompt = `You are analyzing a receipt/invoice image. Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):

{
  "name": "Store/business name or description of purchase",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "description": "Brief description of items purchased",
  "confidence": "high/medium/low",
  "suggestedCategory": "groceries/transport/utilities/entertainment/healthcare/education/other"
}

Important rules:
1. The receipt is likely in ${language}, but may be in other languages
2. For "amount": extract the TOTAL amount (look for "ΣΥΝΟΛΟ", "TOTAL", "ИТОГО", "Σύνολο", etc.)
3. For "date": convert to YYYY-MM-DD format. If no date visible, use null
4. For "name": use the store name or merchant name
5. For "description": briefly list main items if visible
6. For "suggestedCategory": suggest based on the type of store/items:
   - Supermarkets, food stores → "groceries"
   - Gas stations, parking, taxis → "transport"
   - Electric, water, phone bills → "utilities"
   - Restaurants, cinemas, entertainment → "entertainment"
   - Pharmacies, doctors → "healthcare"
   - Schools, courses, books → "education"
   - Everything else → "other"
7. If you cannot read something clearly, use null for that field
8. Return ONLY the JSON object, nothing else

Analyze this receipt image now:`;

    // Убираем префикс data:image/...;base64, если есть
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Определяем тип изображения
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    if (imageBase64.includes('data:image/png')) {
      mediaType = 'image/png';
    } else if (imageBase64.includes('data:image/webp')) {
      mediaType = 'image/webp';
    } else if (imageBase64.includes('data:image/gif')) {
      mediaType = 'image/gif';
    }

    // Вызываем Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Извлекаем текст ответа
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Не удалось получить ответ от AI' },
        { status: 500 }
      );
    }

    // Парсим JSON из ответа
    let parsedData;
    try {
      // Пытаемся найти JSON в ответе
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(textContent.text);
      }
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      return NextResponse.json(
        {
          error: 'Не удалось распознать данные чека',
          rawResponse: textContent.text
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: parsedData.name || null,
        amount: typeof parsedData.amount === 'number' ? parsedData.amount : null,
        date: parsedData.date || null,
        description: parsedData.description || null,
        confidence: parsedData.confidence || 'low',
        suggestedCategory: parsedData.suggestedCategory || 'other',
      }
    });

  } catch (error: unknown) {
    console.error('Receipt analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Ошибка анализа чека',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
