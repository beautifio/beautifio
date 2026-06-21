-- Profile edit improvements: date_of_birth, address, indonesia regions

ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';

-- Indonesia provinces & regencies reference
CREATE TABLE IF NOT EXISTS indonesia_provinces (
  id INT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS indonesia_regencies (
  id INT PRIMARY KEY,
  province_id INT NOT NULL REFERENCES indonesia_provinces(id),
  type TEXT NOT NULL CHECK (type IN ('Kabupaten', 'Kota')),
  name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_regencies_province ON indonesia_regencies(province_id);
CREATE INDEX IF NOT EXISTS idx_regencies_name ON indonesia_regencies(name);
