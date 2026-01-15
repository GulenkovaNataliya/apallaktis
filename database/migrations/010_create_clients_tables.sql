-- Migration: Create clients and client_lookups tables for AFM lookup functionality
-- ФАЗА 8: Автозаполнение карточки клиента по ΑΦΜ (Greece)

-- ========================================
-- Table: clients
-- ========================================
-- Stores client information obtained from AFM lookup
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tax Information
  afm VARCHAR(9) UNIQUE NOT NULL, -- Greek tax number (ΑΦΜ)
  entity_type TEXT CHECK (entity_type IN ('company', 'individual', 'unknown')) DEFAULT 'unknown',
  verification_status TEXT CHECK (verification_status IN ('verified', 'partial', 'not_found', 'error')) DEFAULT 'not_found',

  -- Company Information (nullable for individuals)
  legal_name TEXT,
  trade_name TEXT,
  legal_form TEXT, -- IKE, AE, OE, EPE, etc.
  doy TEXT, -- ΔΟΥ (Tax Office)

  -- Address (stored as JSONB for flexibility)
  address_json JSONB DEFAULT '{}'::jsonb,

  -- Status
  status TEXT, -- 'active', 'inactive', etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_afm ON clients(afm);
CREATE INDEX IF NOT EXISTS idx_clients_entity_type ON clients(entity_type);
CREATE INDEX IF NOT EXISTS idx_clients_verification_status ON clients(verification_status);

-- ========================================
-- Table: client_lookups
-- ========================================
-- Audit log of all AFM lookup requests
CREATE TABLE IF NOT EXISTS client_lookups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  afm VARCHAR(9) NOT NULL,

  -- Requester
  requested_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Lookup Result
  sources_json JSONB DEFAULT '{}'::jsonb, -- Which sources were used: VIES
  result_hash TEXT, -- Hash of the result for detecting changes

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit and analytics
CREATE INDEX IF NOT EXISTS idx_client_lookups_afm ON client_lookups(afm);
CREATE INDEX IF NOT EXISTS idx_client_lookups_user_id ON client_lookups(requested_by_user_id);
CREATE INDEX IF NOT EXISTS idx_client_lookups_created_at ON client_lookups(created_at);
CREATE INDEX IF NOT EXISTS idx_client_lookups_client_id ON client_lookups(client_id);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_lookups ENABLE ROW LEVEL SECURITY;

-- Clients: Users can read all clients (public business data)
CREATE POLICY "Users can read all clients"
  ON clients
  FOR SELECT
  USING (true);

-- Clients: Only authenticated users can insert/update
CREATE POLICY "Authenticated users can insert clients"
  ON clients
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update clients"
  ON clients
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Client Lookups: Users can only see their own lookup history
CREATE POLICY "Users can read own lookup history"
  ON client_lookups
  FOR SELECT
  USING (auth.uid() = requested_by_user_id);

-- Client Lookups: Users can create lookups
CREATE POLICY "Authenticated users can create lookups"
  ON client_lookups
  FOR INSERT
  WITH CHECK (auth.uid() = requested_by_user_id);

-- ========================================
-- Functions
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_clients_timestamp
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- ========================================
-- Comments for documentation
-- ========================================

COMMENT ON TABLE clients IS 'Client information obtained from AFM (Greek tax number) lookup';
COMMENT ON COLUMN clients.afm IS 'Greek tax number (ΑΦΜ) - 9 digits';
COMMENT ON COLUMN clients.entity_type IS 'Type of entity: company, individual, or unknown';
COMMENT ON COLUMN clients.verification_status IS 'Result of AFM lookup: verified, partial, not_found, error';
COMMENT ON COLUMN clients.address_json IS 'Address stored as JSON: { street, city, postalCode, region }';

COMMENT ON TABLE client_lookups IS 'Audit log of all AFM lookup requests for GDPR compliance and rate limiting';
COMMENT ON COLUMN client_lookups.sources_json IS 'Which sources were queried: { vies: { status, checkedAt } }';
COMMENT ON COLUMN client_lookups.result_hash IS 'Hash of the lookup result for detecting changes over time';
