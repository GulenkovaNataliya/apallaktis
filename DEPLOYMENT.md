# ΑΠΑΛΛΑΚΤΗΣ - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- [ ] GitHub repository with the latest code
- [ ] Supabase production project
- [ ] Stripe production account
- [ ] Domain name (apallaktis.gr)

---

## Step 1: Vercel Setup

### 1.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import the `apallaktis` repository

### 1.2 Configure Project
- Framework Preset: **Next.js**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

### 1.3 Set Region
- Select **Frankfurt (fra1)** for lowest latency to Greece

---

## Step 2: Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Supabase (Production)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Stripe (Production - Live Keys!)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Application
```
NEXT_PUBLIC_APP_URL=https://apallaktis.gr
NODE_ENV=production
```

### Email (Optional - Resend)
```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@apallaktis.gr
```

---

## Step 3: Domain Configuration

### 3.1 Add Domain in Vercel
1. Go to Project → Settings → Domains
2. Add `apallaktis.gr`
3. Add `www.apallaktis.gr`

### 3.2 DNS Records (at your registrar)
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3.3 SSL Certificate
- Vercel automatically provisions SSL
- Wait 5-10 minutes for propagation

---

## Step 4: Stripe Webhook

### 4.1 Create Production Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://apallaktis.gr/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### 4.2 Copy Signing Secret
- Copy `whsec_...` and add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

---

## Step 5: Supabase Production

### 5.1 Create Production Project
1. Create new project in Supabase
2. Select region: **Frankfurt**
3. Save the project URL and keys

### 5.2 Run Migrations
Execute all SQL migrations in order:
1. Create tables (profiles, properties, expenses, etc.)
2. Set up RLS policies
3. Create functions and triggers
4. Add indexes

### 5.3 Enable Features
- [ ] Enable Email Auth
- [ ] Configure Email templates
- [ ] Enable Row Level Security on all tables
- [ ] Set up database backups (Pro plan)

---

## Step 6: Cron Jobs

### Vercel Cron (configured in vercel.json)
The following cron job runs automatically:
- **Check expiring subscriptions**: Daily at 9:00 AM UTC
  - Path: `/api/cron/check-expiring-subscriptions`
  - Sends email notifications for:
    - DEMO expiring in 24 hours
    - Subscriptions expiring in 2 days

---

## Step 7: Monitoring Setup

### 7.1 Health Check Endpoint
- URL: `https://apallaktis.gr/api/health`
- Returns: JSON with Supabase and Stripe status

### 7.2 UptimeRobot (Free)
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://apallaktis.gr/api/health`
   - Interval: 5 minutes
   - Alert contacts: Your email

### 7.3 Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Tracks Web Vitals (LCP, FID, CLS)

### 7.4 Sentry (Optional)
```bash
npm install @sentry/nextjs
```

---

## Step 8: Post-Deployment Checklist

### Immediately After Deploy
- [ ] Verify homepage loads: https://apallaktis.gr/el
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test DEMO activation (24 hours)
- [ ] Test Stripe checkout (use test card)
- [ ] Verify webhook processes payment
- [ ] Check /api/health returns 200

### First 24 Hours
- [ ] Monitor Vercel logs for errors
- [ ] Check Stripe Dashboard for payments
- [ ] Verify email notifications work
- [ ] Test on mobile devices (iOS + Android)
- [ ] Test PWA installation

### First Week
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor conversion rate (DEMO → Paid)
- [ ] Collect user feedback
- [ ] Fix any critical bugs

---

## Monthly Costs Estimate

| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| Supabase Pro | $25/month |
| Domain (.gr) | ~€15/year |
| Sentry | Free tier |
| UptimeRobot | Free tier |
| **Total** | **~$45-50/month** |

---

## Rollback Procedure

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Next.js Docs: https://nextjs.org/docs
