/*
  # Add gender field to circadian_profiles
  
  Adds a gender field to track whether the user is male or female
  to determine if menstrual cycle tracking is needed.
  
  1. New Column
    - `gender` (text) - 'male' or 'female'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'circadian_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE circadian_profiles ADD COLUMN gender text DEFAULT 'female';
  END IF;
END $$;