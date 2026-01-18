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
    const prompt = `You are analyzing a voice input about an expense. The user spoke in ${language}. Extract expense information and return ONLY a valid JSON object (no markdown, no explanation).

IMPORTANT: Keep the "name" and "description" fields in the SAME LANGUAGE as the user's input (${language}). Do NOT translate to English.

Expected JSON format:
{
  "name": "Store name or what was purchased (in user's language)",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "description": "Brief description (in user's language)",
  "confidence": "high/medium/low",
  "suggestedCategory": "groceries/transport/utilities/entertainment/healthcare/education/other"
}

Rules:
1. Today is ${todayStr}
2. Date words: "today/сегодня/σήμερα/bugün" = ${todayStr}, "yesterday/вчера/χθες" = ${yesterdayStr}
3. Convert relative dates to YYYY-MM-DD
4. Extract numbers for amount (евро/euro/ευρώ/€ = EUR currency)
5. Categories:
   - Supermarkets, food, Лидл, Σκλαβενίτης, магазин → "groceries"
   - Gas, бензин, parking, taxi, bus, метро → "transport"
   - Electric, вода, телефон, интернет, ДЕΗ → "utilities"
   - Restaurant, кафе, cinema, кино → "entertainment"
   - Pharmacy, аптека, doctor, врач → "healthcare"
   - School, курсы, books, книги → "education"
   - Everything else → "other"
6. If date not mentioned, use: ${todayStr}
7. If amount unclear, use: null
8. "name" should be the store/place name if mentioned, otherwise what was purchased
9. ALWAYS try to extract amount - look for numbers followed by currency words

Example input: "вчера в Лидле потратил 45 евро на продукты"
Example output: {"name":"Лидл","amount":45,"date":"${yesterdayStr}","description":"продукты","confidence":"high","suggestedCategory":"groceries"}

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
