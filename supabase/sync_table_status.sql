-- ============================================
-- SYNC TABLE STATUS WITH ACTIVE SESSIONS
-- ============================================
-- This script fixes inconsistent table statuses by syncing with actual active sessions

-- Step 1: Check current inconsistencies
SELECT 
    t.label,
    t.status AS table_status,
    CASE 
        WHEN ts.id IS NOT NULL THEN 'occupied (has active session)'
        ELSE 'should be available (no session)'
    END AS actual_status,
    ts.customer_name,
    ts.created_at AS session_started
FROM tables t
LEFT JOIN table_sessions ts ON t.id = ts.table_id AND ts.status = 'active'
ORDER BY t.label;

-- Step 2: Fix tables that should be OCCUPIED (have active session but status is not occupied)
UPDATE tables t
SET status = 'occupied', updated_at = NOW()
FROM table_sessions ts
WHERE t.id = ts.table_id 
  AND ts.status = 'active'
  AND t.status != 'occupied';

-- Step 3: Fix tables that should be AVAILABLE (no active session but status is occupied)
UPDATE tables t
SET status = 'available', updated_at = NOW()
WHERE t.status = 'occupied'
  AND NOT EXISTS (
    SELECT 1 FROM table_sessions ts 
    WHERE ts.table_id = t.id 
    AND ts.status = 'active'
  );

-- Step 4: Verify the fix
SELECT 
    t.label,
    t.status,
    ts.customer_name AS host,
    ts.created_at AS session_started
FROM tables t
LEFT JOIN table_sessions ts ON t.id = ts.table_id AND ts.status = 'active'
ORDER BY t.label;

-- Step 5: Count by status
SELECT 
    status,
    COUNT(*) as count
FROM tables
GROUP BY status
ORDER BY status;
