-- ============================================================
-- Migration: Add Articles Table and Ensure Schema Consistency
-- ============================================================

-- Use UUIDs to match the user's existing Supabase schema style
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 📰 NEW ARTICLES TABLE (Admin News)
CREATE TABLE IF NOT EXISTS articles (
    article_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    content     TEXT,
    image_url   TEXT,
    link_url    TEXT,
    source      TEXT DEFAULT 'Vimind Admin',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- 💡 Ensure FAQ doesn't use fixed position constraints
-- FAQ table usually already exists with faq_id as UUID

-- 🚀 ENSURE PROMOTION & ARTICLES have automatic UUID generation
ALTER TABLE promotion ALTER COLUMN promotion_id SET DEFAULT uuid_generate_v4();
ALTER TABLE articles ALTER COLUMN article_id SET DEFAULT uuid_generate_v4();
ALTER TABLE faq ALTER COLUMN faq_id SET DEFAULT uuid_generate_v4();
