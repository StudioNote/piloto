CREATE TABLE IF NOT EXISTS piloto_radio_factures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id    uuid        NOT NULL REFERENCES piloto_radios(id) ON DELETE CASCADE,
  annee       integer     NOT NULL,
  mois        integer     NOT NULL CHECK (mois BETWEEN 1 AND 12),
  montant     numeric(12,2) NOT NULL,
  detail_json jsonb,
  validee_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT piloto_radio_factures_unique UNIQUE (radio_id, annee, mois)
);

CREATE INDEX IF NOT EXISTS piloto_radio_factures_annee_idx
  ON piloto_radio_factures(annee);

ALTER TABLE piloto_radio_factures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_factures"
  ON piloto_radio_factures FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');
