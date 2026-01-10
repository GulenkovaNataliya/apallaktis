// TEST EMAIL ENDPOINT
// ====================
// Тестовый endpoint для проверки отправки email
// Доступен только в development режиме
//
// Использование:
// GET http://localhost:3000/api/test-email?to=your@email.com

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';
import { sendDemoExpiringEmail } from '@/lib/email/notifications';

export async function GET(request: Request) {
  // Только для development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const toEmail = searchParams.get('to');

    if (!toEmail) {
      return NextResponse.json({
        error: 'Параметр ?to=email обязателен',
        example: '/api/test-email?to=your@email.com'
      }, { status: 400 });
    }

    console.log('📧 Отправка тестового email на:', toEmail);

    // Отправляем простой тестовый email
    const success = await sendEmail({
      to: toEmail,
      subject: '✅ Тест Email - ΑΠΑΛΛΑΚΤΗΣ',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #01312d;">✅ Email система работает!</h1>
            <p>Это тестовое письмо от <strong>ΑΠΑΛΛΑΚΤΗΣ</strong></p>
            <p>Если вы получили это письмо, значит настройка Resend прошла успешно! 🎉</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666;">
              API Key: ${process.env.RESEND_API_KEY ? '✅ Настроен' : '❌ Не найден'}<br>
              Время отправки: ${new Date().toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
      `,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: '✅ Email отправлен успешно!',
        to: toEmail,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ Ошибка отправки email. Проверьте консоль.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Ошибка в test-email:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
