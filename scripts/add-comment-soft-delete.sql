-- Migration: Add soft delete support for comments
-- This allows comments to be marked as deleted instead of being physically removed
-- If a comment has replies, it will be soft-deleted (deleted_at set)
-- If a comment has no replies, it can be physically deleted

-- Add deleted_at column for soft delete
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Remove CASCADE from parent_id foreign key to prevent automatic deletion of replies
-- First, drop the existing foreign key constraint
ALTER TABLE comments 
DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;

-- Recreate the foreign key without CASCADE
ALTER TABLE comments 
ADD CONSTRAINT comments_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL;
