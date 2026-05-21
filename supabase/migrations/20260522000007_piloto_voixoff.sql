-- Clients voix-off
CREATE TABLE IF NOT EXISTS piloto_voixoff_clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        text        NOT NULL,
  prenom     text        NOT NULL,
  email      text,
  telephone  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_voixoff_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_voixoff_clients"
  ON piloto_voixoff_clients FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- Prestations voix-off
CREATE TABLE IF NOT EXISTS piloto_voixoff_prestations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL REFERENCES piloto_voixoff_clients(id) ON DELETE CASCADE,
  date        date        NOT NULL,
  description text,
  montant     numeric,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS piloto_voixoff_prestations_client_id_idx
  ON piloto_voixoff_prestations(client_id);

CREATE INDEX IF NOT EXISTS piloto_voixoff_prestations_date_idx
  ON piloto_voixoff_prestations(date DESC);

ALTER TABLE piloto_voixoff_prestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_voixoff_prestations"
  ON piloto_voixoff_prestations FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
