# Invoicing System - Τιμολόγηση

Greek tax document workflow for ΑΠΑΛΛΑΚΤΗΣ.

---

## 1. Important: Stripe vs Greek Tax Documents

**Stripe does NOT issue Greek tax documents (Τιμολόγιο/Απόδειξη).**

| Document Type | Source | Purpose |
|---------------|--------|---------|
| Payment Receipt (Stripe) | Automatic | Payment confirmation with VAT |
| Τιμολόγιο/Απόδειξη | Manual via myDATA | Official Greek tax document |

---

## 2. Document Types

### Επιβεβαίωση Πληρωμής (Payment Confirmation)
- **Sent by:** System (automatic via Stripe webhook)
- **Contains:** Payment amount, VAT, date, account number
- **NOT a tax document** - clearly stated in the email
- **Purpose:** Confirms successful payment

### Τιμολόγιο (Invoice)
- **Issued by:** Administrator (manual)
- **Via:** timologio.aade.gr (myDATA)
- **Required for:** Companies (with ΑΦΜ)
- **Legal requirement:** Must be transmitted to myDATA

### Απόδειξη (Receipt)
- **Issued by:** Administrator (manual)
- **Via:** timologio.aade.gr (myDATA)
- **Required for:** Individuals (without ΑΦΜ)
- **Legal requirement:** Must be transmitted to myDATA

---

## 3. Payment Flow

```
1. Customer pays via Stripe
       ↓
2. Stripe sends automatic payment receipt to customer
       ↓
3. System sends "Επιβεβαίωση Πληρωμής" email
   - Contains payment details
   - States: "Το Τιμολόγιο θα εκδοθεί ξεχωριστά"
       ↓
4. System sends notification to Administrator
   - Contains all customer data for invoicing
   - Link to timologio.aade.gr
       ↓
5. Administrator creates Τιμολόγιο in myDATA
   - Via timologio.aade.gr (FREE)
   - Automatic transmission to myDATA
       ↓
6. Administrator sends PDF to customer via email
```

---

## 4. Administrator Notification Email

### Trigger
Sent automatically on every successful payment via Stripe webhook.

### Subject
```
💰 Νέα πληρωμή: {Επωνυμία} — {ποσό}€
```

### Content
```
Στοιχεία Πελάτη:
- Επωνυμία: {legal_name}
- ΑΦΜ: {afm}
- Διεύθυνση: {address}
- Email: {client_email}
- Λογαριασμός: #{account_number}

Στοιχεία Πληρωμής:
- Τύπος: {Αγορά Λογαριασμού / Συνδρομή}
- Καθαρό ποσό: {amount}€
- ΦΠΑ 24%: {tax}€
- ΣΥΝΟΛΟ: {total}€

⚠️ Απαιτείται έκδοση Τιμολογίου
[Άνοιγμα timologio.aade.gr →]
```

### Environment Variable
```env
ADMIN_EMAIL=admin@apallaktis.gr
```

---

## 5. Customer Payment Confirmation

### Email Subject
```
✅ ΕΠΙΒΕΒΑΙΩΣΗ ΠΛΗΡΩΜΗΣ #{account_number} - ΑΠΑΛΛΑΚΤΗΣ
```

### Important Notice in Email
```
⚠️ Σημαντική Σημείωση:
Η παρούσα επιβεβαίωση αφορά την πληρωμή σας μέσω Stripe.
Το Τιμολόγιο/Απόδειξη θα εκδοθεί και θα αποσταλεί ξεχωριστά μέσω email.
```

---

## 6. Dashboard Display

### Payment History Section (Subscription Page)
Shows:
- List of payment confirmations from Stripe
- Note: "Εδώ εμφανίζονται οι επιβεβαιώσεις πληρωμών μέσω Stripe."

### Invoice Notice (Yellow Box)
```
⚠️ Το Τιμολόγιο/Απόδειξη θα εκδοθεί και θα αποσταλεί ξεχωριστά μέσω email.
```

---

## 7. Manual Invoice Process

### Step 1: Login to timologio.aade.gr
1. Go to https://timologio.aade.gr
2. Login with TaxisNet credentials

### Step 2: Create New Invoice
1. Click "Νέο Τιμολόγιο"
2. Enter customer data:
   - Επωνυμία (from admin notification)
   - ΑΦΜ (from admin notification)
   - Διεύθυνση (from admin notification)

### Step 3: Add Items
```
Περιγραφή: Αγορά Λογαριασμού ΑΠΑΛΛΑΚΤΗΣ
Ποσότητα: 1
Τιμή: 78.23€ (97€ με ΦΠΑ → καθαρό)
ΦΠΑ: 24%
```

### Step 4: Transmit to myDATA
- Automatic when saving
- Mark is added to the invoice

### Step 5: Download PDF
- Save PDF for records
- Send to customer via email

---

## 8. VAT Calculation

### Pricing
```
Final Price (με ΦΠΑ): 97.00€
VAT Rate: 24%
Net Amount: 97 / 1.24 = 78.23€
VAT Amount: 97 - 78.23 = 18.77€
```

### Formula
```typescript
const total = 97.00;
const vatRate = 0.24;
const netAmount = total / (1 + vatRate);  // 78.23
const vatAmount = total - netAmount;       // 18.77
```

---

## 9. Code Implementation

### Files Modified
```
frontend/
├── lib/
│   ├── email/
│   │   ├── notifications.ts    # Added sendAdminPaymentNotificationEmail
│   │   └── send-receipt.ts     # Updated subjects to "ΕΠΙΒΕΒΑΙΩΣΗ ΠΛΗΡΩΜΗΣ"
│   └── receipts/
│       └── generate.ts         # Updated templates with invoice notice
├── app/
│   ├── api/
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts    # Added admin notification calls
│   └── [locale]/
│       └── dashboard/
│           └── subscription/
│               └── page.tsx    # Added invoice notice in payment history
```

### Admin Notification Function
```typescript
// frontend/lib/email/notifications.ts

export async function sendAdminPaymentNotificationEmail(
  adminEmail: string,
  data: {
    legalName: string;
    afm: string;
    address: string;
    clientEmail: string;
    amount: number;
    tax: number;
    total: number;
    paymentType: 'purchase' | 'subscription';
    plan?: string;
    accountNumber: number;
    stripePaymentId?: string;
  }
): Promise<boolean>
```

### Webhook Integration
```typescript
// frontend/app/api/stripe/webhook/route.ts

// After successful payment:
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail) {
  await sendAdminPaymentNotificationEmail(adminEmail, {
    legalName: profile.company_name || profile.name || '',
    afm: profile.afm || '',
    address: profile.address || '',
    clientEmail: userEmail,
    amount: baseAmount,
    tax: taxAmount,
    total: totalAmount,
    paymentType: 'purchase',
    accountNumber: profile.account_number,
    stripePaymentId: session.payment_intent as string,
  });
}
```

---

## 10. Environment Variables

```env
# Required for admin notifications
ADMIN_EMAIL=admin@apallaktis.gr
```

---

## 11. Multilingual Support

All user-facing text supports 8 languages:
- Greek (el)
- Russian (ru)
- English (en)
- Ukrainian (uk)
- Albanian (sq)
- Bulgarian (bg)
- Romanian (ro)
- Arabic (ar)

Admin notifications are always in Greek.

---

## 12. Future Automation

When payment volume increases, consider automating via:

### Option 1: Workadu
- Stripe → myDATA integration
- Automatic invoice generation
- ~15€/month

### Option 2: Other Providers
- Elorus
- Epsilonnet
- myBusiness

### Benefits of Automation
- Automatic invoice with each payment
- Automatic myDATA transmission
- Automatic PDF to customer
- No manual work required

---

## 13. Legal Requirements

### For Companies (with ΑΦΜ)
- Must receive Τιμολόγιο
- Must be transmitted to myDATA within 2 days

### For Individuals (without ΑΦΜ)
- Can receive Απόδειξη Λιανικής
- Or simplified receipt (under certain conditions)

### VAT
- Standard rate: 24%
- Must be clearly stated on all documents

---

## 14. Troubleshooting

### Admin not receiving notifications?
1. Check `ADMIN_EMAIL` env variable is set
2. Check email in spam folder
3. Check Vercel logs for errors

### Customer confused about invoice?
- Payment confirmation clearly states invoice will be sent separately
- Dashboard shows the same notice

### myDATA transmission failed?
- Check timologio.aade.gr for errors
- Retry transmission
- Contact AADE support if persistent
