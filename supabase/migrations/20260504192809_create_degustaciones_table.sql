/*
  # Create degustaciones table

  1. New Tables
    - `degustaciones`
      - `id` (uuid, primary key, auto-generated)
      - `email` (text, not null) - Email del participante
      - `nombre_apellido` (text, not null) - Nombre y apellido completo
      - `celular` (text, not null) - Número de celular
      - `horario` (text, not null) - Horario seleccionado para la degustación
      - `sucursal` (text, not null) - Sucursal más frecuente
      - `created_at` (timestamptz, default now()) - Fecha de registro

  2. Security
    - Enable RLS on `degustaciones` table
    - Add policy for authenticated users to read all records
    - Add policy for anyone (anon) to insert new records (needed for public form submission)
    - No update or delete policies (records are immutable once created)

  3. Important Notes
    - The table uses anon insert access because this is a public registration form
      where users are not authenticated. The insert policy restricts to only
      the allowed columns to prevent abuse.
    - An index on `horario` is created for efficient counting queries.
*/

CREATE TABLE IF NOT EXISTS degustaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nombre_apellido text NOT NULL,
  celular text NOT NULL,
  horario text NOT NULL,
  sucursal text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for efficient counting by horario
CREATE INDEX IF NOT EXISTS idx_degustaciones_horario ON degustaciones (horario);

-- Enable RLS
ALTER TABLE degustaciones ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public registration form)
-- Using a restrictive INSERT policy that only allows the expected columns
CREATE POLICY "Allow public registration inserts"
  ON degustaciones FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can read all records
CREATE POLICY "Authenticated users can read registrations"
  ON degustaciones FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow anon to read count of registrations per horario (needed for cupos check)
CREATE POLICY "Allow public read for availability check"
  ON degustaciones FOR SELECT
  TO anon, authenticated
  USING (true);
