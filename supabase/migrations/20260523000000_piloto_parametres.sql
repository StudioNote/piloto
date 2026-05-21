CREATE TABLE IF NOT EXISTS piloto_parametres (
  id             text        PRIMARY KEY DEFAULT 'singleton',
  raison_sociale text,
  siret          text,
  adresse        text,
  telephone      text,
  email          text,
  mentions       text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_parametres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_parametres_all" ON piloto_parametres
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr')
  WITH CHECK ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr');

INSERT INTO piloto_parametres (id) VALUES ('singleton') ON CONFLICT (id) DO NOTHING;
