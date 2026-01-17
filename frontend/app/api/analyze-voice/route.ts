// Voice Text Analysis API Endpoint
// ==============================
// Анализирует голосовой текст с помощью Claude AI
// и возвращает структурированные данные для расхода

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
    const { text, locale } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Текст не предоставлен' },
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

    // Получаем текущую дату для контекста
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Промпт для анализа голосового текста
    const prompt = `You are analyzing a voice input about an expense. The user spoke in ${language} (but may use other languages). Extract expense information and return ONLY a valid JSON object (no markdown, no explanation):

{
  "name": "Store/business name or what was purchased",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "description": "Brief description",
  "confidence": "high/medium/low",
  "suggestedCategory": "groceries/transport/utilities/entertainment/healthcare/education/other"
}

Important rules:
1. Today's date is ${todayStr}
2. "today/сегодня/σήμερα" = ${todayStr}
3. "yesterday/вчера/χθες" = ${yesterdayStr}
4. Convert relative dates (last week, 3 days ago, etc.) to YYYY-MM-DD format
5. For amounts: extract numbers, understand "евро/euro/ευρώ/€" as currency
6. For "suggestedCategory":
   - Supermarkets, food, groceries → "groceries"
   - Gas/petrol, parking, taxi, bus → "transport"
   - Electric, water, phone, internet bills → "utilities"
   - Restaurants, cafes, cinema, entertainment → "entertainment"
   - Pharmacy, doctor, medicine → "healthcare"
   - School, courses, books → "education"
   - Everything else → "other"
7. If date is not mentioned, use today: ${todayStr}
8. If amount is not clear, use null
9. Return ONLY the JSON object, nothing else

Voice input to analyze: "${text}"`;

    // Вызываем Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
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
          error: 'Не удалось распознать данные',
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
        date: parsedData.date || todayStr,
        description: parsedData.description || null,
        confidence: parsedData.confidence || 'low',
        suggestedCategory: parsedData.suggestedCategory || 'other',
      }
    });

  } catch (error: unknown) {
    console.error('Voice analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Ошибка анализа голоса',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
