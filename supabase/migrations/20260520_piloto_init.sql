-- ============================================================
-- Piloto — Migration initiale
-- ============================================================

-- Table clients
CREATE TABLE IF NOT EXISTS piloto_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text NOT NULL,
  prenom      text NOT NULL,
  email       text NOT NULL UNIQUE,
  telephone   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Table documents
CREATE TABLE IF NOT EXISTS piloto_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES piloto_clients(id) ON DELETE CASCADE,
  nom_fichier   text NOT NULL,
  description   text,
  url_storage   text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index pour accélèrer les lookups par client
CREATE INDEX IF NOT EXISTS piloto_documents_client_id_idx ON piloto_documents(client_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE piloto_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE piloto_documents ENABLE ROW LEVEL SECURITY;

-- piloto_clients : seul l'admin voit tout
CREATE POLICY "admin_full_access_clients"
  ON piloto_clients
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- piloto_documents : admin voit tout
CREATE POLICY "admin_full_access_documents"
  ON piloto_documents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- piloto_documents : client voit uniquement ses propres documents (via join sur son email)
CREATE POLICY "client_own_documents"
  ON piloto_documents
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM piloto_clients
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================
-- Storage RLS (policies sur storage.objects)
-- ============================================================

-- Admin peut uploader dans piloto-documents
CREATE POLICY "admin_upload_piloto_documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'piloto-documents'
    AND auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr'
  );

-- Admin peut tout gérer
CREATE POLICY "admin_manage_piloto_documents"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'piloto-documents'
    AND auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr'
  );

-- Clients peuvent télécharger uniquement leurs fichiers
-- Le chemin de stockage doit être : {client_id}/{nom_fichier}
CREATE POLICY "client_download_own_documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'piloto-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM piloto_clients
      WHERE email = auth.jwt() ->> 'email'
    )
  );
