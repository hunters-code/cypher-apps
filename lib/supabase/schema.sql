-- Supabase Database Schema for Pending Registrations
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  viewing_key TEXT NOT NULL,
  viewing_key_private TEXT NOT NULL,
  spending_key TEXT NOT NULL,
  spending_key_private TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_registrations_username ON pending_registrations(username);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_wallet_address ON pending_registrations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_completed ON pending_registrations(completed);

-- Create composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_pending_registrations_username_completed_expires 
ON pending_registrations(username, completed, expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read pending registrations (for availability checking)
CREATE POLICY "Allow public read access for availability checking"
ON pending_registrations
FOR SELECT
USING (true);

-- Create policy to allow anyone to insert pending registrations
CREATE POLICY "Allow public insert access"
ON pending_registrations
FOR INSERT
WITH CHECK (true);

-- Create policy to allow updates only for the wallet owner
-- Note: This requires authentication. Adjust based on your auth setup.
CREATE POLICY "Allow update for wallet owner"
ON pending_registrations
FOR UPDATE
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Optional: Create a function to automatically clean up expired registrations
CREATE OR REPLACE FUNCTION cleanup_expired_registrations()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_registrations
  WHERE expires_at < NOW() AND completed = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-registrations', '0 0 * * *', 'SELECT cleanup_expired_registrations()');

