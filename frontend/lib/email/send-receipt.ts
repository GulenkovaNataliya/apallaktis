// Send Payment Confirmation Email
// ================================
// Отправка подтверждений оплаты на email
// ВАЖНО: Это НЕ налоговый документ! Τιμολόγιο выдаётся отдельно через myDATA

import { sendEmail } from './send';
import { generateReceiptOrInvoice, type ReceiptData } from '../receipts/generate';

/**
 * Отправка подтверждения оплаты на email
 * ВАЖНО: Τιμολόγιο/Απόδειξη выдаётся администратором отдельно через timologio.aade.gr
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
  // Тема письма - Подтверждение оплаты (не налоговый документ!)
  const subjects = {
    el: `✅ ΕΠΙΒΕΒΑΙΩΣΗ ΠΛΗΡΩΜΗΣ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    ru: `✅ ПОДТВЕРЖДЕНИЕ ОПЛАТЫ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    en: `✅ PAYMENT CONFIRMATION #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    uk: `✅ ПІДТВЕРДЖЕННЯ ОПЛАТИ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    sq: `✅ KONFIRMIMI I PAGESES #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    bg: `✅ ПОТВЪРЖДЕНИЕ ЗА ПЛАЩАНЕ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    ro: `✅ CONFIRMARE PLATĂ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    ar: `✅ تأكيد الدفع #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
  };

  const html = generateReceiptOrInvoice(receiptData);

  return sendEmail({
    to: userEmail,
    subject: subjects[locale as keyof typeof subjects] || subjects.el,
    html,
  });
}

// Export type for use in webhook
export type { ReceiptData } from '../receipts/generate';
