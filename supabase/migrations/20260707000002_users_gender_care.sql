-- Add gender and care agreement fields to users

ALTER TABLE users
ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('perempuan','prefer_not_to_say','other')),
ADD COLUMN IF NOT EXISTS care_agreement_accepted
  BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS care_agreement_accepted_at
  TIMESTAMPTZ;
