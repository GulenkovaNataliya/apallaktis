-- APALLAKTIS Database Schema
-- PostgreSQL 14+

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country_code VARCHAR(10),

  -- Business account fields (optional)
  is_business BOOLEAN DEFAULT FALSE,
  company_name VARCHAR(255),
  afm VARCHAR(9), -- Greek tax number
  doy VARCHAR(255), -- Greek tax office

  -- Subscription & Demo
  subscription_status VARCHAR(20) DEFAULT 'demo' CHECK (subscription_status IN ('demo', 'active', 'expired', 'vip')),
  demo_expires_at TIMESTAMP,
  subscription_expires_at TIMESTAMP,

  -- Referral system
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Objects table (for DEMO limits)
CREATE TABLE IF NOT EXISTS objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  client_name VARCHAR(255),
  client_contact VARCHAR(255),
  contract_price DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  color VARCHAR(20), -- Color from gradient
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_objects_user_id ON objects(user_id);
CREATE INDEX IF NOT EXISTS idx_objects_status ON objects(status);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_account')),
  name VARCHAR(255) NOT NULL,
  last_four_digits VARCHAR(4),
  iban VARCHAR(34),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name JSONB NOT NULL, -- Multilingual: {"el": "Κατηγορία", "en": "Category"}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);

-- Global expenses (not tied to objects)
CREATE TABLE IF NOT EXISTS global_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  receipt_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_expenses_user_id ON global_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_global_expenses_date ON global_expenses(date);

-- Object expenses
CREATE TABLE IF NOT EXISTS object_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  receipt_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_object_expenses_object_id ON object_expenses(object_id);
CREATE INDEX IF NOT EXISTS idx_object_expenses_date ON object_expenses(date);

-- Object finance (extra prices)
CREATE TABLE IF NOT EXISTS object_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_object_extras_object_id ON object_extras(object_id);

-- Object payments from client
CREATE TABLE IF NOT EXISTS object_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_object_payments_object_id ON object_payments(object_id);

-- Referral bonuses
CREATE TABLE IF NOT EXISTS referral_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bonus_months INTEGER NOT NULL DEFAULT 1,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_bonuses_user_id ON referral_bonuses(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON objects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No confusing chars
  result VARCHAR(20) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_referral_code BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION set_referral_code();

-- Function to set demo expiration (48 hours from creation)
CREATE OR REPLACE FUNCTION set_demo_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_status = 'demo' AND NEW.demo_expires_at IS NULL THEN
    NEW.demo_expires_at := CURRENT_TIMESTAMP + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_demo_expiration BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION set_demo_expiration();
