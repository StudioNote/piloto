CREATE TABLE IF NOT EXISTS piloto_modeles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text        NOT NULL,
  description text,
  url_storage text        NOT NULL,
  categorie   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_modeles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_modeles_all" ON piloto_modeles
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr')
  WITH CHECK ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr');

INSERT INTO storage.buckets (id, name, public)
VALUES ('piloto-modeles', 'piloto-modeles', false)
ON CONFLICT (id) DO NOTHING;
