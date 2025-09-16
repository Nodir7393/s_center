/*
  # Update clients table to use telegram instead of email

  1. Changes
    - Remove `email` column from `clients` table
    - Add `telegram` column to `clients` table
    - Update existing data if needed

  2. Security
    - Maintain existing RLS policies
*/

-- Add telegram column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'telegram'
  ) THEN
    ALTER TABLE clients ADD COLUMN telegram text;
  END IF;
END $$;

-- Remove email column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email'
  ) THEN
    ALTER TABLE clients DROP COLUMN email;
  END IF;
END $$;