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

-- 💡 Ensure FAQ doesn't use fixed position constraints if needed
-- (The existing faq table already has faq_id as UUID based on user screenshots)

-- 🚀 Ensure PROMOTION table matches the repository expectations
-- (Based on screenshots, it already haspromotion_id, title, image_url, link_url, is_active, display_order)
