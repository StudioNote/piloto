CREATE TABLE IF NOT EXISTS piloto_radio_remplacements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id       uuid REFERENCES piloto_radios(id) ON DELETE SET NULL,
  nom_radio      text NOT NULL,
  date_debut     date NOT NULL,
  date_fin       date NOT NULL,
  tranche_debut  time NOT NULL,
  tranche_fin    time NOT NULL,
  tarif_horaire  numeric(10,2) NOT NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS piloto_radio_remplacements_date_idx
  ON piloto_radio_remplacements(date_debut DESC);

ALTER TABLE piloto_radio_remplacements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_radio_remplacements"
  ON piloto_radio_remplacements FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
