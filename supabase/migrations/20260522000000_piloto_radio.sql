CREATE TABLE IF NOT EXISTS piloto_radios (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_radio        text NOT NULL,
  nom_contact      text,
  telephone        text,
  tranche_debut    time NOT NULL,
  tranche_fin      time NOT NULL,
  tarif_horaire    numeric(10,2) NOT NULL DEFAULT 0,
  jours_travailles text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_radios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_radios"
  ON piloto_radios FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS piloto_radio_exclusions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id uuid NOT NULL REFERENCES piloto_radios(id) ON DELETE CASCADE,
  date     date NOT NULL,
  UNIQUE (radio_id, date)
);

ALTER TABLE piloto_radio_exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_radio_exclusions"
  ON piloto_radio_exclusions FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
