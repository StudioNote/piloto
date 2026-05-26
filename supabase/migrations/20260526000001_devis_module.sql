-- ============================================================
-- Module Devis — tables production
-- ============================================================

-- Ajouter site_web à piloto_parametres
ALTER TABLE piloto_parametres ADD COLUMN IF NOT EXISTS site_web text;

-- ── Catalogue ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS piloto_devis_catalogue (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     text          NOT NULL,
  description text,
  prix_ht     numeric(10,2) NOT NULL DEFAULT 0,
  categorie   text          NOT NULL DEFAULT 'autre'
                CHECK (categorie IN ('base','module','connexion','autre')),
  ordre       integer       NOT NULL DEFAULT 0,
  actif       boolean       NOT NULL DEFAULT true,
  created_at  timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE piloto_devis_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_devis_catalogue" ON piloto_devis_catalogue
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- ── Séquence de numérotation ───────────────────────────────

CREATE TABLE IF NOT EXISTS piloto_devis_seq (
  annee  integer PRIMARY KEY,
  valeur integer NOT NULL DEFAULT 0
);
ALTER TABLE piloto_devis_seq ENABLE ROW LEVEL SECURITY;
-- pas de policy : accès uniquement via la fonction SECURITY DEFINER

CREATE OR REPLACE FUNCTION next_piloto_devis_numero()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  yr int := EXTRACT(YEAR FROM now())::int;
  v  int;
BEGIN
  INSERT INTO piloto_devis_seq (annee, valeur) VALUES (yr, 1)
  ON CONFLICT (annee) DO UPDATE SET valeur = piloto_devis_seq.valeur + 1
  RETURNING valeur INTO v;
  RETURN 'DEVIS-' || yr || '-' || LPAD(v::text, 3, '0');
END; $$;

-- ── Devis (en-têtes) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS piloto_devis (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            text          NOT NULL UNIQUE,
  date_emission     date          NOT NULL DEFAULT CURRENT_DATE,
  date_validite     date          NOT NULL DEFAULT (CURRENT_DATE + 30),
  client_nom        text,
  client_adresse    text,
  client_cp_ville   text,
  client_tel        text,
  client_email      text,
  objet             text,
  statut            text          NOT NULL DEFAULT 'brouillon'
                      CHECK (statut IN ('brouillon','envoye','accepte','refuse')),
  remise_libelle    text,
  remise_montant    numeric(10,2) NOT NULL DEFAULT 0,
  notes             text,
  total_ht          numeric(10,2) NOT NULL DEFAULT 0,
  prospect_id       uuid          REFERENCES piloto_builder_prospects(id) ON DELETE SET NULL,
  builder_client_id uuid          REFERENCES piloto_builder_clients(id)   ON DELETE SET NULL,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS piloto_devis_statut_idx    ON piloto_devis(statut);
CREATE INDEX IF NOT EXISTS piloto_devis_date_idx      ON piloto_devis(date_emission DESC);
ALTER TABLE piloto_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_devis" ON piloto_devis
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- ── Lignes ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS piloto_devis_lignes (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id         uuid          NOT NULL REFERENCES piloto_devis(id) ON DELETE CASCADE,
  catalogue_id     uuid          REFERENCES piloto_devis_catalogue(id) ON DELETE SET NULL,
  libelle          text          NOT NULL,
  description      text,
  quantite         numeric(10,3) NOT NULL DEFAULT 1,
  prix_unitaire_ht numeric(10,2) NOT NULL,
  total_ligne      numeric(10,2) NOT NULL DEFAULT 0,
  ordre            integer       NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS piloto_devis_lignes_devis_idx ON piloto_devis_lignes(devis_id);
ALTER TABLE piloto_devis_lignes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_devis_lignes" ON piloto_devis_lignes
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- ── Seed catalogue ─────────────────────────────────────────

INSERT INTO piloto_devis_catalogue (libelle, prix_ht, categorie, ordre) VALUES
  ('LA BASE',                   990,  'base',      1),
  ('Catégories clients',        290,  'module',   10),
  ('Historique relation',       390,  'module',   20),
  ('Fidélité',                  490,  'module',   30),
  ('Espace client sécurisé',    690,  'module',   40),
  ('Rappels email',             390,  'module',   50),
  ('Agenda interne',            490,  'module',   60),
  ('Sync calendrier',           490,  'module',   70),
  ('Notifications SMS',         490,  'module',   80),
  ('Tableau de bord',           490,  'module',   90),
  ('Devis & factures PDF',      590,  'module',  100),
  ('Cockpit multi-activités',   890,  'module',  110),
  ('Mises de côté',             390,  'module',  120),
  ('Suivi de stock',            490,  'module',  130),
  ('Bibliothèque de modèles',   290,  'module',  140),
  ('Génération documents PDF',  490,  'module',  150),
  ('Newsletter',                490,  'module',  160),
  ('Multi-utilisateurs',        590,  'module',  170),
  ('Paiement Stripe',           590,  'connexion',200),
  ('Connexion RDV',             590,  'connexion',210),
  ('Récupération ventes caisse',690,  'connexion',220),
  ('Stripe Terminal',           890,  'connexion',230)
ON CONFLICT DO NOTHING;
