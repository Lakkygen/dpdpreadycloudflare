-- =============================================================================
-- DPDPready – Full Database Schema
-- PostgreSQL 15+ with pgcrypto extension for UUID generation
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";  -- case‑insensitive text (for emails)

-- ---------------------------------------------------------------------------
-- Users table – synced from Supabase Auth (mirrors auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    full_name       TEXT,
    avatar_url      TEXT,
    plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'agency')),
    stripe_customer_id TEXT UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Subscriptions – synced from Stripe webhooks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id     TEXT,
    status              TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing')),
    current_period_end  TIMESTAMPTZ,
    canceled_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ---------------------------------------------------------------------------
-- Scans – each scan of a website
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'analysing', 'completed', 'failed')),
    overall_score   INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    ai_confidence   FLOAT,
    results_json    JSONB,        -- full check results and AI analysis
    monitoring      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created ON scans(created_at DESC);
CREATE INDEX idx_scans_monitoring ON scans(monitoring) WHERE monitoring = true;

-- ---------------------------------------------------------------------------
-- Reports – generated PDF reports for a scan
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id         UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
    pdf_url         TEXT,
    report_data     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_scan_id ON reports(scan_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);

-- ---------------------------------------------------------------------------
-- Monitored sites – for recurring scans (Pro+ plan)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitored_sites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    frequency       TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    last_scan_id    UUID REFERENCES scans(id) ON DELETE SET NULL,
    next_scan_at    TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_monitored_sites_user ON monitored_sites(user_id);
CREATE INDEX idx_monitored_sites_next ON monitored_sites(next_scan_at) WHERE active = true;

-- =============================================================================
-- Row Level Security (RLS) – Compatible with Supabase
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;

-- Helper: get authenticated user's ID from Supabase
-- In a real Supabase setup, auth.uid() returns the user's UUID
-- For custom JWT, replace with current_setting('request.jwt.claims', true)::json->>'sub'

-- Users: can read own profile, can update own profile
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

-- Subscriptions: user can read own
CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING (user_id = auth.uid());

-- Scans: full CRUD for owner
CREATE POLICY "scans_select_own" ON scans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "scans_insert_own" ON scans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "scans_update_own" ON scans FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "scans_delete_own" ON scans FOR DELETE USING (user_id = auth.uid());

-- Reports: full CRUD for owner
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reports_insert_own" ON reports FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reports_update_own" ON reports FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reports_delete_own" ON reports FOR DELETE USING (user_id = auth.uid());

-- Monitored sites: full CRUD for owner
CREATE POLICY "monitored_select_own" ON monitored_sites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "monitored_insert_own" ON monitored_sites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "monitored_update_own" ON monitored_sites FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "monitored_delete_own" ON monitored_sites FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_scans_modtime BEFORE UPDATE ON scans FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_reports_modtime BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_monitored_sites_modtime BEFORE UPDATE ON monitored_sites FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =============================================================================
-- Function to count user scans this month (used by rate limiting)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_monthly_scans(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM scans
        WHERE user_id = $1
        AND created_at >= date_trunc('month', now())
    );
END;
$$ LANGUAGE plpgsql STABLE;
