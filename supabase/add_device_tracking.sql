-- Add device tracking to table_sessions for enhanced security
-- This prevents customers from scanning multiple tables with the same device

-- Add device_id column to track which device created the session
ALTER TABLE table_sessions 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add index for faster lookups when checking for active sessions by device
CREATE INDEX IF NOT EXISTS idx_table_sessions_device_active 
ON table_sessions(device_id, status) 
WHERE status = 'active';

-- Add comment explaining the column
COMMENT ON COLUMN table_sessions.device_id IS 
'Unique device fingerprint to prevent scanning multiple tables with same device. Generated client-side using browser fingerprinting.';

