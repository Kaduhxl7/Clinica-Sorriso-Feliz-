-- Required grants for Supabase REST access from n8n and the dashboard.
-- Run this in the Supabase SQL Editor after creating the tables.

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE conversations TO authenticated;
GRANT SELECT ON TABLE messages TO authenticated;
GRANT SELECT ON TABLE conversation_metrics TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversation_metrics TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

COMMIT;
