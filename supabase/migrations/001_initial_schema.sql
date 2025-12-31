-- B2B Kits Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer Types table
CREATE TABLE customer_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Access Codes table
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  customer_type_id UUID NOT NULL REFERENCES customer_types(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Usage Logs table
CREATE TABLE code_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id UUID NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  language TEXT
);

-- Admin Users table (linked to Supabase Auth)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer'))
);

-- Indexes for performance
CREATE INDEX idx_access_codes_customer_type ON access_codes(customer_type_id);
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_code_usage_logs_code ON code_usage_logs(code_id);
CREATE INDEX idx_code_usage_logs_accessed ON code_usage_logs(accessed_at DESC);
CREATE INDEX idx_customer_types_slug ON customer_types(slug);

-- Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE customer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Customer Types: Public read, admin write
CREATE POLICY "customer_types_read" ON customer_types
  FOR SELECT USING (true);

CREATE POLICY "customer_types_admin_all" ON customer_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Access Codes: Public can validate codes, admin can manage
CREATE POLICY "access_codes_validate" ON access_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "access_codes_admin_all" ON access_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Code Usage Logs: Service role insert, admin read
CREATE POLICY "code_usage_logs_admin_read" ON code_usage_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin Users: Only admins can see admin list
CREATE POLICY "admin_users_read" ON admin_users
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert initial customer types
INSERT INTO customer_types (slug, name_es, name_en, description_es, description_en, primary_color) VALUES
  ('startup', 'Kit Startup', 'Startup Kit', 'Kit para emprendedores', 'Kit for entrepreneurs', '#6366F1'),
  ('oro', 'Kit Oro', 'Gold Kit', 'Kit para profesionales', 'Kit for professionals', '#D97706'),
  ('zafiro', 'Kit Zafiro', 'Sapphire Kit', 'Kit para empresas', 'Kit for enterprises', '#2563EB');

-- Function to increment use count
CREATE OR REPLACE FUNCTION increment_code_use_count(code_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE access_codes
  SET use_count = use_count + 1
  WHERE id = code_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if code is valid
CREATE OR REPLACE FUNCTION is_code_valid(code_param TEXT)
RETURNS TABLE (
  id UUID,
  pdf_url TEXT,
  customer_type_id UUID,
  customer_type_slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.pdf_url,
    ac.customer_type_id,
    ct.slug
  FROM access_codes ac
  JOIN customer_types ct ON ct.id = ac.customer_type_id
  WHERE
    ac.code = UPPER(code_param)
    AND ac.is_active = true
    AND (ac.expires_at IS NULL OR ac.expires_at > NOW())
    AND (ac.max_uses IS NULL OR ac.use_count < ac.max_uses);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
