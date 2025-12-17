-- Migration: Add parent_id to comments table for nested replies
-- Run this migration to enable comment replies functionality

-- Add parent_id column (nullable, references comments.id)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Update existing comments to have NULL parent_id (they are top-level)
UPDATE comments SET parent_id = NULL WHERE parent_id IS NULL;
