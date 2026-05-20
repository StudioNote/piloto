-- Ajout colonne adresse à piloto_clients
ALTER TABLE piloto_clients ADD COLUMN IF NOT EXISTS adresse text;

-- Table interventions
CREATE TABLE IF NOT EXISTS piloto_interventions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid NOT NULL REFERENCES piloto_clients(id) ON DELETE CASCADE,
  date           date NOT NULL,
  duree_minutes  integer,
  description    text,
  statut         text NOT NULL DEFAULT 'À faire'
                   CHECK (statut IN ('À faire', 'En cours', 'Terminé')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS piloto_interventions_client_id_idx
  ON piloto_interventions(client_id);

ALTER TABLE piloto_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_interventions"
  ON piloto_interventions
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
