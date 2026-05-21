-- Clients builder
CREATE TABLE IF NOT EXISTS piloto_builder_clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  societe    text,
  nom        text,
  prenom     text,
  email      text,
  telephone  text,
  adresse    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_builder_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_builder_clients"
  ON piloto_builder_clients FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- Prestations builder
CREATE TABLE IF NOT EXISTS piloto_builder_prestations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL REFERENCES piloto_builder_clients(id) ON DELETE CASCADE,
  date        date        NOT NULL,
  description text,
  montant     numeric,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS piloto_builder_prestations_client_id_idx
  ON piloto_builder_prestations(client_id);

CREATE INDEX IF NOT EXISTS piloto_builder_prestations_date_idx
  ON piloto_builder_prestations(date DESC);

ALTER TABLE piloto_builder_prestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_builder_prestations"
  ON piloto_builder_prestations FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
