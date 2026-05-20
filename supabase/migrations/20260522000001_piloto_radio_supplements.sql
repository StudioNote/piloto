CREATE TABLE IF NOT EXISTS piloto_radio_supplements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id   uuid NOT NULL REFERENCES piloto_radios(id) ON DELETE CASCADE,
  label      text NOT NULL,
  montant    numeric(10,2) NOT NULL,
  recurrent  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_radio_supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_radio_supplements"
  ON piloto_radio_supplements FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
