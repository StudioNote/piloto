-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS piloto_rendezvous (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  activite text NOT NULL CHECK (activite IN ('sos_ordi', 'builder', 'radio', 'autre')),
  client_nom text,
  adresse text,
  date date NOT NULL,
  heure_debut time NOT NULL,
  heure_fin time,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE piloto_rendezvous ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_rendezvous"
  ON piloto_rendezvous FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- Token pour le flux iCal (singleton)
CREATE TABLE IF NOT EXISTS piloto_calendar_token (
  id text PRIMARY KEY DEFAULT 'singleton',
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE piloto_calendar_token ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_calendar_token"
  ON piloto_calendar_token FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
