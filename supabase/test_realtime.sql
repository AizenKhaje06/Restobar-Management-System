-- ============================================
-- TEST REALTIME SETUP
-- ============================================
-- Run these queries to verify realtime is properly configured

-- 1. Check if tables is in the realtime publication
SELECT 
    tablename,
    schemaname,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected: You should see 'tables' in the results
-- If not, run: ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;


-- 2. Check current table statuses
SELECT 
    label,
    status,
    zone,
    seats,
    updated_at
FROM public.tables
ORDER BY label;


-- 3. Test update (this should trigger realtime update on Admin page if it's open)
-- UPDATE public.tables 
-- SET status = 'occupied' 
-- WHERE label = 'T-1';

-- Then check on Admin page if it updated automatically


-- 4. Check Supabase realtime configuration
SELECT 
    schemaname,
    tablename,
    rowfilter,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
