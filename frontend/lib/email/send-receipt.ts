// Send Payment Confirmation Email
// ================================
// Отправка подтверждений оплаты на email
// ВАЖНО: Это НЕ налоговый документ! ΤΙΜΟΛΟΓΙΟ выдаётся отдельно через myDATA

import { sendEmail } from './send';
import { generateReceiptOrInvoice, type ReceiptData } from '../receipts/generate';

/**
 * Отправка подтверждения оплаты на email
 * ВАЖНО: ΤΙΜΟΛΟΓΙΟ/ΑΠΟΔΕΙΞΗ выдаётся администратором отдельно через timologio.aade.gr
 */
export async function sendReceiptEmail(
  userEmail: string,
  receiptData: {
    accountNumber: number;
    amount: number;
    tax: number;
    total: number;
    date: Date;
    invoiceType: 'receipt' | 'invoice';
    companyName?: string;
    afm?: string;
    doy?: string;
  },
  locale: string = 'el'
): Promise<boolean> {
  // Subject always in English
  const subject = `✅ PAYMENT CONFIRMATION #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`;

  const html = generateReceiptOrInvoice(receiptData);

  return sendEmail({
    to: userEmail,
    subject,
    html,
  });
}

// Export type for use in webhook
export type { ReceiptData } from '../receipts/generate';
