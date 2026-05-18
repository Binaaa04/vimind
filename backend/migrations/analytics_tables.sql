-- 1. Menambahkan kolom untuk melacak aktivitas terakhir dan wilayah user
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS last_region VARCHAR(100);

-- 2. Membuat tabel baru untuk mencatat Daily Mood Test
CREATE TABLE IF NOT EXISTS user_moods (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    mood VARCHAR(50) NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_user_mood_per_day UNIQUE(user_id, created_at) 
);

-- Note: Kolom birth_date sudah ada di tabel users (bertipe date), 
-- jadi kita tidak perlu menambahkannya lagi via SQL, tinggal diatur di Backend.
