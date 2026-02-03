-- Migration: Create payments table for admin payment journal
-- Date: 2024-02-03
--
-- NOTE: This table is written by Stripe webhooks (service role) and
-- read/updated by admin panel. Regular users cannot access it.

-- =============================================
-- PAYMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_event_id TEXT UNIQUE NOT NULL,  -- Deduplication key
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL,          -- When payment was received
  amount NUMERIC NOT NULL,               -- Amount in EUR (not cents!)
  currency TEXT NOT NULL DEFAULT 'eur',
  type TEXT NOT NULL CHECK (type IN ('account_purchase', 'subscription_payment')),
  plan TEXT,                             -- basic/standard/premium (for subscriptions)
  invoice_created BOOLEAN NOT NULL DEFAULT FALSE,  -- Admin: τιμολόγιο created in myDATA
  invoice_sent BOOLEAN NOT NULL DEFAULT FALSE,     -- Admin: τιμολόγιο sent to customer
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_pending_invoice ON payments(invoice_created)
  WHERE NOT invoice_created;  -- Fast lookup for payments needing invoice

-- Comments
COMMENT ON TABLE payments IS 'Payment journal - tracks all Stripe payments for admin panel';
COMMENT ON COLUMN payments.stripe_event_id IS 'Unique Stripe event ID for webhook deduplication';
COMMENT ON COLUMN payments.amount IS 'Amount in EUR (Stripe cents divided by 100)';
COMMENT ON COLUMN payments.type IS 'account_purchase (62€ one-time) or subscription_payment (monthly)';
COMMENT ON COLUMN payments.plan IS 'Subscription plan: basic, standard, premium (null for account_purchase)';
COMMENT ON COLUMN payments.invoice_created IS 'Admin checkbox: τιμολόγιο created in myDATA';
COMMENT ON COLUMN payments.invoice_sent IS 'Admin checkbox: τιμολόγιο sent to customer';

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running migration
DROP POLICY IF EXISTS "Admin full access" ON payments;
DROP POLICY IF EXISTS "Service role insert" ON payments;
DROP POLICY IF EXISTS "Users view own payments" ON payments;

-- Policy 1: Admin can SELECT, UPDATE (not DELETE - keep audit trail)
-- Admin is identified by profiles.role = 'admin'
CREATE POLICY "Admin read and update" ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 2: Service role can INSERT (webhooks run as service role)
-- Note: Service role automatically bypasses RLS, but explicit policy for clarity
-- This policy allows INSERT when there's no authenticated user (webhook context)
CREATE POLICY "Webhook insert" ON payments
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR auth.role() = 'service_role');

-- =============================================
-- VERIFICATION QUERIES (run manually to test)
-- =============================================

-- Check RLS is enabled:
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'payments';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'payments';
