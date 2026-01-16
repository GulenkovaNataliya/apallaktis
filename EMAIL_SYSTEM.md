# Email System Documentation

Email notification system for ΑΠΑΛΛΑΚΤΗΣ.

---

## 1. Overview

**Provider:** Resend (https://resend.com)
**Integration:** REST API (no SDK)
**Cost:** Free tier: 100 emails/day, 3000 emails/month

---

## 2. Environment Variables

```env
# Required for production
RESEND_API_KEY=re_...

# Optional (defaults to onboarding@resend.dev)
EMAIL_FROM=noreply@apallaktis.gr
```

> **Note:** If `RESEND_API_KEY` is not set, emails are logged to console (dev mode).

---

## 3. File Structure

```
frontend/
├── lib/
│   └── email/
│       ├── send.ts           # Core email sending function
│       ├── notifications.ts  # 9 notification types
│       └── send-receipt.ts   # Receipt/Invoice emails
├── app/
│   └── api/
│       ├── test-email/
│       │   └── route.ts      # Dev testing endpoint
│       └── cron/
│           └── check-expiring-subscriptions/
│               └── route.ts  # Daily cron for notifications
```

---

## 4. Core Email Function

### `sendEmail()` - Basic Email Sending

```typescript
// frontend/lib/email/send.ts

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ EMAIL: RESEND_API_KEY not configured');
    console.log('📧 Would send email:', options.subject);
    return true; // Dev fallback
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: options.from || 'ΑΠΑΛΛΑΚΤΗΣ <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  return response.ok;
}
```

---

## 5. Notification Types

### 5.1 DEMO Notifications

| Function | When Sent | Subject |
|----------|-----------|---------|
| `sendDemoExpiringEmail` | 24 hours before DEMO expires | Η δοκιμαστική περίοδος λήγει αύριο! |
| `sendDemoExpiredEmail` | When DEMO expires | Η δοκιμαστική περίοδος έληξε |

### 5.2 Subscription Notifications

| Function | When Sent | Subject |
|----------|-----------|---------|
| `sendSubscriptionExpiringEmail` | 2 days before expiry | Η συνδρομή σας λήγει σύντομα! |
| `sendSubscriptionExpiredEmail` | When subscription expires | Η συνδρομή σας έληξε |
| `sendSubscriptionActivatedEmail` | After successful payment | Η συνδρομή σας ενεργοποιήθηκε! |

### 5.3 Payment Notifications

| Function | When Sent | Subject |
|----------|-----------|---------|
| `sendPaymentFailedEmail` | Payment fails | Αποτυχία πληρωμής |
| `sendVIPActivatedEmail` | VIP subscription activated | VIP Ενεργοποιήθηκε! |

### 5.4 Referral Notifications

| Function | When Sent | Subject |
|----------|-----------|---------|
| `sendNewReferralEmail` | Someone uses referral code | Νέα παραπομπή! |
| `sendReferralPurchaseEmail` | Referral makes purchase | Η παραπομπή σας αγόρασε! |

---

## 6. Code Examples

### Send DEMO Expiring Email

```typescript
import { sendDemoExpiringEmail } from '@/lib/email/notifications';

await sendDemoExpiringEmail(
  'user@example.com',
  'Γιώργος',           // firstName
  '2025-01-17T10:00:00Z' // expiryDate
);
```

### Send Subscription Activated Email

```typescript
import { sendSubscriptionActivatedEmail } from '@/lib/email/notifications';

await sendSubscriptionActivatedEmail(
  'user@example.com',
  'Μαρία',             // firstName
  'yearly',            // plan: 'monthly' | 'yearly'
  '2026-01-16T10:00:00Z' // expiryDate
);
```

### Send Receipt Email

```typescript
import { sendReceiptEmail } from '@/lib/email/send-receipt';

await sendReceiptEmail({
  to: 'user@example.com',
  customerName: 'EXAMPLE COMPANY IKE',
  afm: '094259216',
  amount: 99.00,
  currency: 'EUR',
  plan: 'yearly',
  invoiceNumber: 'INV-2025-001',
  date: new Date(),
  isInvoice: true,  // true = ΤΙΜΟΛΟΓΙΟ, false = ΑΠΟΔΕΙΞΗ
});
```

---

## 7. HTML Templates

All email templates are inline HTML in `notifications.ts`. Template structure:

```typescript
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff8f0a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background: #ff8f0a;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
    }
    .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ΑΠΑΛΛΑΚΤΗΣ</h1>
    </div>
    <div class="content">
      <!-- Email content here -->
    </div>
    <div class="footer">
      © 2025 ΑΠΑΛΛΑΚΤΗΣ. Όλα τα δικαιώματα κατοχυρωμένα.
    </div>
  </div>
</body>
</html>
`;
```

---

## 8. Database Tracking

### Columns in `profiles` table

```sql
-- Prevents duplicate notifications
ALTER TABLE profiles ADD COLUMN demo_expiring_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN demo_expired_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN subscription_expiring_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN subscription_expired_email_sent BOOLEAN DEFAULT FALSE;
```

### Reset on new subscription

When a user subscribes or renews, reset these flags:

```typescript
await supabase
  .from('profiles')
  .update({
    subscription_expiring_email_sent: false,
    subscription_expired_email_sent: false,
  })
  .eq('id', userId);
```

---

## 9. Cron Job

### Daily Check (9:00 AM UTC)

**Endpoint:** `/api/cron/check-expiring-subscriptions`
**Schedule:** `0 9 * * *` (configured in `vercel.json`)

```typescript
// What it checks:
// 1. DEMO expiring in 24 hours → sendDemoExpiringEmail
// 2. DEMO expired → sendDemoExpiredEmail
// 3. Subscription expiring in 2 days → sendSubscriptionExpiringEmail
// 4. Subscription expired → sendSubscriptionExpiredEmail
```

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-expiring-subscriptions",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 10. Testing

### Development Endpoint

```bash
# Only works in development mode
GET /api/test-email?to=your@email.com
```

### Manual Testing

```typescript
// In any server component or API route
import { sendEmail } from '@/lib/email/send';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello!</h1><p>This is a test.</p>',
});
```

---

## 11. Multilingual Support

All notification functions accept a `locale` parameter (defaults to 'el'):

```typescript
await sendDemoExpiringEmail(email, firstName, expiryDate, 'ru');
```

### Supported Languages

| Code | Language |
|------|----------|
| `el` | Greek (default) |
| `ru` | Russian |
| `en` | English |
| `uk` | Ukrainian |
| `sq` | Albanian |
| `bg` | Bulgarian |
| `ro` | Romanian |
| `ar` | Arabic |

---

## 12. Error Handling

```typescript
try {
  const success = await sendEmail({
    to: email,
    subject: 'Test',
    html: '<p>Content</p>',
  });

  if (!success) {
    console.error('Email failed to send');
    // Handle failure (retry, log, notify admin)
  }
} catch (error) {
  console.error('Email error:', error);
  // Resend API error (rate limit, invalid key, etc.)
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check `RESEND_API_KEY` |
| 403 Forbidden | Domain not verified | Verify domain in Resend dashboard |
| 429 Too Many Requests | Rate limit exceeded | Wait or upgrade plan |
| 500 Server Error | Resend issue | Retry later |

---

## 13. Production Setup

### 1. Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add to Vercel env vars

### 2. Verify Domain (optional but recommended)
1. Go to Resend → Domains
2. Add `apallaktis.gr`
3. Add DNS records (SPF, DKIM)
4. Update `EMAIL_FROM` env var

### 3. Configure Sender
```env
# After domain verification
EMAIL_FROM=ΑΠΑΛΛΑΚΤΗΣ <noreply@apallaktis.gr>
```

---

## 14. Future Improvements

- [ ] Email templates as separate HTML files
- [ ] Email queue for bulk sending
- [ ] Delivery tracking (webhooks)
- [ ] Unsubscribe links
- [ ] Email preferences in user settings
