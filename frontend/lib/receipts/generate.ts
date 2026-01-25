// Payment Confirmation Generation
// ================================
// Генерация подтверждений оплаты (Επιβεβαίωση Πληρωμής)
// ВАЖНО: Это НЕ официальный налоговый документ!
// Τιμολόγιο/Απόδειξη выдаётся отдельно через myDATA (timologio.aade.gr)

export interface ReceiptData {
  accountNumber: number;
  amount: number;
  tax: number;
  total: number;
  date: Date;
  invoiceType: 'receipt' | 'invoice';
  companyName?: string;
  afm?: string;
  doy?: string;
}

/**
 * Генерация HTML подтверждения оплаты (Επιβεβαίωση Πληρωμής)
 * ВАЖНО: Это НЕ налоговый документ! Τιμολόγιο выдаётся отдельно через myDATA
 */
export function generateReceiptHTML(data: ReceiptData): string {
  const formattedDate = data.date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAYMENT CONFIRMATION #${data.accountNumber}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #f5f5f5;
    }
    .receipt {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #01312d;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #01312d;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0;
      font-size: 14px;
    }
    .receipt-number {
      background-color: #daf3f6;
      color: #01312d;
      padding: 10px 20px;
      border-radius: 4px;
      display: inline-block;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #666;
      font-weight: bold;
    }
    .info-value {
      color: #01312d;
      font-weight: bold;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background-color: #01312d;
      color: white;
      padding: 15px;
      text-align: left;
    }
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-row {
      background-color: #f9f9f9;
      font-weight: bold;
      font-size: 18px;
    }
    .total-row td {
      color: #01312d;
      padding: 20px 15px;
    }
    .notice {
      background-color: #fff3e0;
      border: 1px solid #ff8f0a;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
      color: #333;
    }
    .notice strong {
      color: #ff8f0a;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>ΑΠΑΛΛΑΚΤΗΣ</h1>
      <p>Property & Expense Management</p>
      <p>Tel: +30 698 320 8844</p>
    </div>

    <!-- Receipt Number -->
    <div style="text-align: center;">
      <div class="receipt-number">
        PAYMENT CONFIRMATION #${data.accountNumber}
      </div>
    </div>

    <!-- Info -->
    <div style="margin: 30px 0;">
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Account:</span>
        <span class="info-value">#${data.accountNumber}</span>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ΑΠΑΛΛΑΚΤΗΣ Account Purchase</td>
          <td style="text-align: right;">${data.amount.toFixed(2)} €</td>
        </tr>
        <tr>
          <td>VAT 24%</td>
          <td style="text-align: right;">${data.tax.toFixed(2)} €</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL</td>
          <td style="text-align: right;">${data.total.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>

    <!-- Important Notice -->
    <div class="notice">
      <strong>⚠️ Important Notice:</strong><br>
      This confirmation is for your payment via Stripe.<br>
      <strong>The official Tax Invoice (ΤΙΜΟΛΟΓΙΟ/ΑΠΟΔΕΙΞΗ) will be issued and sent separately</strong> via email.
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p>For any questions, contact us:</p>
      <p>Email: support@apallaktis.com | WhatsApp/Viber: +30 698 320 8844</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Генерация HTML подтверждения оплаты для компаний (с данными ΑΦΜ)
 * ВАЖНО: Это НЕ налоговый документ! Τιμολόγιο выдаётся отдельно через myDATA
 */
export function generateInvoiceHTML(data: ReceiptData): string {
  const formattedDate = data.date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAYMENT CONFIRMATION #${data.accountNumber}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #f5f5f5;
    }
    .invoice {
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #01312d;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-info h1 {
      color: #01312d;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .company-info p {
      color: #666;
      margin: 5px 0;
      font-size: 14px;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      background-color: #daf3f6;
      color: #01312d;
      padding: 10px 20px;
      border-radius: 4px;
      display: inline-block;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .customer-info {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 4px;
      margin: 30px 0;
    }
    .customer-info h3 {
      color: #01312d;
      margin: 0 0 15px 0;
    }
    .customer-info p {
      margin: 5px 0;
      color: #333;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background-color: #01312d;
      color: white;
      padding: 15px;
      text-align: left;
    }
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-row {
      background-color: #f9f9f9;
      font-weight: bold;
      font-size: 18px;
    }
    .total-row td {
      color: #01312d;
      padding: 20px 15px;
    }
    .notice {
      background-color: #fff3e0;
      border: 1px solid #ff8f0a;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
      color: #333;
    }
    .notice strong {
      color: #ff8f0a;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>ΑΠΑΛΛΑΚΤΗΣ</h1>
        <p>Property & Expense Management</p>
        <p><strong>Tel:</strong> +30 698 320 8844</p>
      </div>
      <div class="invoice-details">
        <div class="invoice-number">
          PAYMENT CONFIRMATION #${data.accountNumber}
        </div>
        <p style="margin: 10px 0; color: #666;"><strong>Date:</strong> ${formattedDate}</p>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
      <h3>Customer Details</h3>
      <p><strong>Company Name:</strong> ${data.companyName || 'N/A'}</p>
      <p><strong>ΑΦΜ (Tax ID):</strong> ${data.afm || 'N/A'}</p>
      <p><strong>ΔΟΥ (Tax Office):</strong> ${data.doy || 'N/A'}</p>
      <p><strong>Account:</strong> #${data.accountNumber}</p>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>ΑΠΑΛΛΑΚΤΗΣ Account Purchase<br><small>30 days free trial</small></td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${data.amount.toFixed(2)} €</td>
          <td style="text-align: right;">${data.amount.toFixed(2)} €</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: right;"><strong>Subtotal:</strong></td>
          <td style="text-align: right;">${data.amount.toFixed(2)} €</td>
        </tr>
        <tr>
          <td colspan="4" style="text-align: right;"><strong>VAT 24%:</strong></td>
          <td style="text-align: right;">${data.tax.toFixed(2)} €</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" style="text-align: right;">GRAND TOTAL:</td>
          <td style="text-align: right;">${data.total.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>

    <!-- Important Notice -->
    <div class="notice">
      <strong>⚠️ Important Notice:</strong><br>
      This confirmation is for your payment via Stripe.<br>
      <strong>The official Tax Invoice (ΤΙΜΟΛΟΓΙΟ) will be issued and sent separately</strong> via email.
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p>For any questions, contact us:</p>
      <p>Email: support@apallaktis.com | WhatsApp/Viber: +30 698 320 8844</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Генерация чека или инвойса в зависимости от типа регистрации
 */
export function generateReceiptOrInvoice(data: ReceiptData): string {
  if (data.invoiceType === 'invoice') {
    return generateInvoiceHTML(data);
  } else {
    return generateReceiptHTML(data);
  }
}
