-- ============================================
-- CLEANUP OLD QR CODES
-- ============================================
-- This script removes old inactive QR codes to keep the database clean
-- Run this periodically (e.g., weekly) or set up as a cron job

-- Show QR codes that will be deleted (older than 30 days and inactive)
SELECT 
    tqr.id,
    t.label AS table_label,
    tqr.is_active,
    tqr.created_at,
    AGE(NOW(), tqr.created_at) AS age
FROM table_qr_codes tqr
JOIN tables t ON t.id = tqr.table_id
WHERE tqr.is_active = false
  AND tqr.created_at < NOW() - INTERVAL '30 days'
ORDER BY tqr.created_at DESC;

-- Delete old inactive QR codes (older than 30 days)
-- DELETE FROM table_qr_codes
-- WHERE is_active = false
--   AND created_at < NOW() - INTERVAL '30 days';

-- Show current active QR codes per table
SELECT 
    t.label,
    COUNT(tqr.id) FILTER (WHERE tqr.is_active = true) AS active_qr_count,
    COUNT(tqr.id) AS total_qr_count,
    MAX(tqr.created_at) FILTER (WHERE tqr.is_active = true) AS latest_qr_date
FROM tables t
LEFT JOIN table_qr_codes tqr ON t.id = tqr.table_id
GROUP BY t.label
ORDER BY t.label;
