-- Add code_hash column for secure code storage
-- The original 'code' column will be kept temporarily for migration,
-- then can be dropped once all codes are migrated to hashed versions

ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS code_hash TEXT;

-- Create index on code_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_codes_code_hash ON access_codes(code_hash);

-- Note: After migrating existing codes to hashed versions,
-- you can drop the original 'code' column with:
-- ALTER TABLE access_codes DROP COLUMN code;
