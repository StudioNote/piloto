-- Bucket public pour les logos/branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'piloto-branding',
  'piloto-branding',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (pour affichage dans l'interface sans auth)
CREATE POLICY "public_read_piloto_branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'piloto-branding');

-- Écriture admin seulement
CREATE POLICY "admin_insert_piloto_branding" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'piloto-branding'
    AND auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr'
  );

CREATE POLICY "admin_delete_piloto_branding" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'piloto-branding'
    AND auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr'
  );

-- Colonne logo_path sur les deux tables paramètres
ALTER TABLE piloto_parametres ADD COLUMN IF NOT EXISTS logo_path text;
ALTER TABLE demo_piloto_parametres ADD COLUMN IF NOT EXISTS logo_path text;
-- Rattrapage des colonnes manquantes sur demo (cp_ville + site_web n'étaient pas dans la migration demo_tables)
ALTER TABLE demo_piloto_parametres ADD COLUMN IF NOT EXISTS cp_ville text;
ALTER TABLE demo_piloto_parametres ADD COLUMN IF NOT EXISTS site_web text;
