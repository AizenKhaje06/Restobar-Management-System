-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================
-- This allows clients to subscribe to real-time updates when table data changes

-- First, check if table is already in publication (to avoid errors on re-run)
DO $$
BEGIN
    -- Try to add the table to realtime publication
    -- If it already exists, this will be ignored
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'tables'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
        RAISE NOTICE 'Realtime enabled for public.tables';
    ELSE
        RAISE NOTICE 'Realtime already enabled for public.tables';
    END IF;
END $$;

-- Also enable for orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        RAISE NOTICE 'Realtime enabled for public.orders';
    ELSE
        RAISE NOTICE 'Realtime already enabled for public.orders';
    END IF;
END $$;

-- Also enable for table_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'table_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
        RAISE NOTICE 'Realtime enabled for public.table_sessions';
    ELSE
        RAISE NOTICE 'Realtime already enabled for public.table_sessions';
    END IF;
END $$;

-- Verify it's enabled
SELECT tablename, schemaname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('tables', 'orders', 'table_sessions')
ORDER BY tablename;
