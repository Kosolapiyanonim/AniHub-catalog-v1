-- Migration: Add user ratings system (anime + episodes)
-- Run this in Supabase SQL Editor for EXISTING databases.
-- Safe to run multiple times (uses IF NOT EXISTS / DROP POLICY IF EXISTS).

-- 1) Tables
CREATE TABLE IF NOT EXISTS user_anime_ratings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id BIGINT NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, anime_id)
);

CREATE TABLE IF NOT EXISTS user_episode_ratings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id BIGINT NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  episode_number INT NOT NULL CHECK (episode_number > 0),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, anime_id, episode_number)
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_user_anime_ratings_user
  ON user_anime_ratings(user_id, rating DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_anime_ratings_anime
  ON user_anime_ratings(anime_id);

CREATE INDEX IF NOT EXISTS idx_user_episode_ratings_user
  ON user_episode_ratings(user_id, rating DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_episode_ratings_anime
  ON user_episode_ratings(anime_id);

-- 3) RLS
ALTER TABLE user_anime_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_episode_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_anime_ratings_select_owner" ON user_anime_ratings;
CREATE POLICY "user_anime_ratings_select_owner"
  ON user_anime_ratings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_anime_ratings_insert_owner" ON user_anime_ratings;
CREATE POLICY "user_anime_ratings_insert_owner"
  ON user_anime_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_anime_ratings_update_owner" ON user_anime_ratings;
CREATE POLICY "user_anime_ratings_update_owner"
  ON user_anime_ratings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_anime_ratings_delete_owner" ON user_anime_ratings;
CREATE POLICY "user_anime_ratings_delete_owner"
  ON user_anime_ratings FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_episode_ratings_select_owner" ON user_episode_ratings;
CREATE POLICY "user_episode_ratings_select_owner"
  ON user_episode_ratings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_episode_ratings_insert_owner" ON user_episode_ratings;
CREATE POLICY "user_episode_ratings_insert_owner"
  ON user_episode_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_episode_ratings_update_owner" ON user_episode_ratings;
CREATE POLICY "user_episode_ratings_update_owner"
  ON user_episode_ratings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_episode_ratings_delete_owner" ON user_episode_ratings;
CREATE POLICY "user_episode_ratings_delete_owner"
  ON user_episode_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- 4) Verification (optional)
-- SELECT * FROM user_anime_ratings LIMIT 1;
-- SELECT * FROM user_episode_ratings LIMIT 1;
