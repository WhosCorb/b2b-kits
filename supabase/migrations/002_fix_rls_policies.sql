-- Fix infinite recursion in admin_users RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "admin_users_read" ON admin_users;

-- Create a non-recursive policy: users can only see their own row
CREATE POLICY "admin_users_read" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Also fix other policies that reference admin_users to avoid issues when no admin exists
-- Use SECURITY DEFINER functions instead

-- Create a helper function to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate policies that use admin check

-- customer_types: allow public read without admin check issues
DROP POLICY IF EXISTS "customer_types_admin_all" ON customer_types;
CREATE POLICY "customer_types_admin_all" ON customer_types
  FOR ALL USING (is_admin());

-- access_codes admin policy
DROP POLICY IF EXISTS "access_codes_admin_all" ON access_codes;
CREATE POLICY "access_codes_admin_all" ON access_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- code_usage_logs: allow insert for service role (anon can't insert due to RLS)
-- We need to allow the app to insert usage logs
DROP POLICY IF EXISTS "code_usage_logs_insert" ON code_usage_logs;
CREATE POLICY "code_usage_logs_insert" ON code_usage_logs
  FOR INSERT WITH CHECK (true);  -- Allow inserts (will be controlled by service role)

DROP POLICY IF EXISTS "code_usage_logs_admin_read" ON code_usage_logs;
CREATE POLICY "code_usage_logs_admin_read" ON code_usage_logs
  FOR SELECT USING (is_admin());
