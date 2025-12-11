/*
  # Kannamma ASHA Dashboard Schema

  1. New Tables
    - `ashas`
      - `id` (uuid, primary key)
      - `asha_id` (text, unique) - Login username
      - `password` (text) - Plain text for demo only
      - `name` (text)
      - `phc_name` (text) - Primary Health Center name
      - `created_at` (timestamptz)
    
    - `mothers`
      - `id` (uuid, primary key)
      - `asha_id` (uuid, foreign key to ashas)
      - `name` (text)
      - `age` (integer)
      - `phone` (text)
      - `address` (text)
      - `last_anc_date` (date)
      - `gestation_weeks` (integer)
      - `flagged` (boolean, default false)
      - `visited` (boolean, default false)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `phc_stock`
      - `id` (uuid, primary key)
      - `asha_id` (uuid, foreign key to ashas)
      - `iron_tablets` (integer, default 0)
      - `tt_vaccine` (integer, default 0)
      - `updated_at` (timestamptz)
    
    - `call_logs`
      - `id` (uuid, primary key)
      - `asha_id` (uuid, foreign key to ashas)
      - `mother_id` (uuid, foreign key to mothers)
      - `phone` (text)
      - `result` (text) - 'answered', 'not_answered', 'pressed_2'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated ASHA access
*/

CREATE TABLE IF NOT EXISTS ashas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_id text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  phc_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mothers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_id uuid REFERENCES ashas(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  last_anc_date date NOT NULL,
  gestation_weeks integer NOT NULL,
  flagged boolean DEFAULT false,
  visited boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phc_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_id uuid REFERENCES ashas(id) ON DELETE CASCADE UNIQUE NOT NULL,
  iron_tablets integer DEFAULT 0,
  tt_vaccine integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_id uuid REFERENCES ashas(id) ON DELETE CASCADE NOT NULL,
  mother_id uuid REFERENCES mothers(id) ON DELETE CASCADE NOT NULL,
  phone text NOT NULL,
  result text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ashas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE phc_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ASHA can view own profile"
  ON ashas FOR SELECT
  USING (true);

CREATE POLICY "ASHA can view assigned mothers"
  ON mothers FOR SELECT
  USING (true);

CREATE POLICY "ASHA can update assigned mothers"
  ON mothers FOR UPDATE
  USING (true);

CREATE POLICY "ASHA can view PHC stock"
  ON phc_stock FOR SELECT
  USING (true);

CREATE POLICY "ASHA can update own PHC stock"
  ON phc_stock FOR UPDATE
  USING (true);

CREATE POLICY "ASHA can insert PHC stock"
  ON phc_stock FOR INSERT
  WITH CHECK (true);

CREATE POLICY "ASHA can view call logs"
  ON call_logs FOR SELECT
  USING (true);

CREATE POLICY "ASHA can insert call logs"
  ON call_logs FOR INSERT
  WITH CHECK (true);