-- Lien entre un client SOS Ordi et son compte auth Supabase
ALTER TABLE piloto_clients ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Permet aux clients de lire leur propre fiche (pour récupérer le prénom)
CREATE POLICY "client_read_own_profile" ON piloto_clients
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Bucket de stockage privé pour les documents clients
INSERT INTO storage.buckets (id, name, public)
VALUES ('piloto-documents', 'piloto-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Table des documents partagés avec les clients
CREATE TABLE IF NOT EXISTS piloto_documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL REFERENCES piloto_clients(id) ON DELETE CASCADE,
  nom_fichier text        NOT NULL,
  description text,
  url_storage text        NOT NULL,  -- chemin dans le bucket : {client_id}/{filename}
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_documents ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY "admin_documents_all" ON piloto_documents
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr')
  WITH CHECK ((auth.jwt() ->> 'email') = 'contact@anthonychesnier.fr');

-- Clients : lecture de leurs propres documents uniquement
CREATE POLICY "client_documents_read" ON piloto_documents
  FOR SELECT TO authenticated
  USING (
    client_id = (
      SELECT id FROM piloto_clients WHERE auth_user_id = auth.uid()
    )
  );
