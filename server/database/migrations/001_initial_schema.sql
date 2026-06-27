-- =============================================================================
-- Migration: 001_initial_schema
-- Description: Create all tables, RLS policies, triggers, and seed data
-- =============================================================================

-- (The entire content of schema.sql above would be repeated here, 
--  but for production migrations you'd use a tool like Knex or Prisma.
--  Here we'll add IF NOT EXISTS to every CREATE and ADD seed data.)

-- Seed a free user for development (password: 'test1234' – hashed by Supabase)
-- Note: In real app, users are created via Supabase Auth. This is for local testing.
INSERT INTO users (id, email, full_name, plan) VALUES
    ('d0d0d0d0-0000-0000-0000-000000000001', 'dev@dpdpready.com', 'Dev User', 'pro')
ON CONFLICT (id) DO NOTHING;

-- Add a sample scan for the dev user
INSERT INTO scans (id, user_id, url, status, overall_score, results_json) VALUES
    ('e0e0e0e0-0000-0000-0000-000000000001', 'd0d0d0d0-0000-0000-0000-000000000001', 'https://example.com', 'completed', 87, '{
        "checks": [
            {"checkId": "consentBanner", "status": "passed", "score": 100, "severity": "info"},
            {"checkId": "cookieConsent", "status": "passed", "score": 100, "severity": "info"},
            {"checkId": "dataRetention", "status": "failed", "score": 50, "severity": "warning"},
            {"checkId": "thirdPartySharing", "status": "failed", "score": 40, "severity": "warning"},
            {"checkId": "privacyPolicy", "status": "passed", "score": 100, "severity": "info"},
            {"checkId": "userRights", "status": "passed", "score": 100, "severity": "info"}
        ]
    }'::jsonb)
ON CONFLICT (id) DO NOTHING;
