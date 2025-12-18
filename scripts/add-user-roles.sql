-- Migration: Add user roles system
-- This adds role-based access control with roles: admin, manager, viewer
-- Run this migration to enable role-based permissions

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing users to have 'viewer' role if they don't have one
UPDATE profiles 
SET role = 'viewer' 
WHERE role IS NULL;

-- Set NOT NULL constraint after updating existing data
ALTER TABLE profiles 
ALTER COLUMN role SET NOT NULL;

-- Update the handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for admins to update any profile (for role management)
-- Note: This allows admins to update roles, but you may want to restrict this further
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Example: To assign admin role to a specific user, run:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID_HERE';
--
-- Example: To assign manager role to a specific user, run:
-- UPDATE profiles SET role = 'manager' WHERE id = 'USER_UUID_HERE';

