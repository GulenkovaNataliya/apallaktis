// Send Receipt/Invoice Email
// ============================
// Отправка чеков и инвойсов на email

import { sendEmail } from './send';
import { generateReceiptOrInvoice, type ReceiptData } from '../receipts/generate';

/**
 * Отправка чека или инвойса на email
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
  const subjects = {
    el: receiptData.invoiceType === 'invoice'
      ? `ΤΙΜΟΛΟΓΙΟ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`
      : `ΑΠΟΔΕΙΞΗ #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    ru: receiptData.invoiceType === 'invoice'
      ? `ИНВОЙС #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`
      : `ЧЕК #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
    en: receiptData.invoiceType === 'invoice'
      ? `INVOICE #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`
      : `RECEIPT #${receiptData.accountNumber} - ΑΠΑΛΛΑΚΤΗΣ`,
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
