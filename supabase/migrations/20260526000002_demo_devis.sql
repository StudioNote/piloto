-- ============================================================
-- Module Devis — tables DÉMO
-- ============================================================

ALTER TABLE demo_piloto_parametres ADD COLUMN IF NOT EXISTS site_web text;
UPDATE demo_piloto_parametres SET site_web = 'pixel-co.fr' WHERE id = 'singleton';

-- ── Catalogue démo ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_devis_catalogue (
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
ALTER TABLE demo_piloto_devis_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_devis_catalogue" ON demo_piloto_devis_catalogue
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- ── Séquence démo ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_devis_seq (
  annee  integer PRIMARY KEY,
  valeur integer NOT NULL DEFAULT 0
);
ALTER TABLE demo_piloto_devis_seq ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION next_demo_piloto_devis_numero()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  yr int := EXTRACT(YEAR FROM now())::int;
  v  int;
BEGIN
  INSERT INTO demo_piloto_devis_seq (annee, valeur) VALUES (yr, 1)
  ON CONFLICT (annee) DO UPDATE SET valeur = demo_piloto_devis_seq.valeur + 1
  RETURNING valeur INTO v;
  RETURN 'DEVIS-' || yr || '-' || LPAD(v::text, 3, '0');
END; $$;

-- ── Devis démo ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_devis (
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
  prospect_id       uuid          REFERENCES demo_piloto_builder_prospects(id) ON DELETE SET NULL,
  builder_client_id uuid          REFERENCES demo_piloto_builder_clients(id)   ON DELETE SET NULL,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_devis" ON demo_piloto_devis
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- ── Lignes démo ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_devis_lignes (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id         uuid          NOT NULL REFERENCES demo_piloto_devis(id) ON DELETE CASCADE,
  catalogue_id     uuid          REFERENCES demo_piloto_devis_catalogue(id) ON DELETE SET NULL,
  libelle          text          NOT NULL,
  description      text,
  quantite         numeric(10,3) NOT NULL DEFAULT 1,
  prix_unitaire_ht numeric(10,2) NOT NULL,
  total_ligne      numeric(10,2) NOT NULL DEFAULT 0,
  ordre            integer       NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_devis_lignes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_devis_lignes" ON demo_piloto_devis_lignes
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- ── Seed catalogue démo ────────────────────────────────────

INSERT INTO demo_piloto_devis_catalogue (id, libelle, prix_ht, categorie, ordre) VALUES
  ('dc000001-0000-0000-0000-000000000001', 'LA BASE',                   990,  'base',       1),
  ('dc000001-0000-0000-0000-000000000002', 'Catégories clients',        290,  'module',    10),
  ('dc000001-0000-0000-0000-000000000003', 'Historique relation',       390,  'module',    20),
  ('dc000001-0000-0000-0000-000000000004', 'Fidélité',                  490,  'module',    30),
  ('dc000001-0000-0000-0000-000000000005', 'Espace client sécurisé',    690,  'module',    40),
  ('dc000001-0000-0000-0000-000000000006', 'Rappels email',             390,  'module',    50),
  ('dc000001-0000-0000-0000-000000000007', 'Agenda interne',            490,  'module',    60),
  ('dc000001-0000-0000-0000-000000000008', 'Sync calendrier',           490,  'module',    70),
  ('dc000001-0000-0000-0000-000000000009', 'Notifications SMS',         490,  'module',    80),
  ('dc000001-0000-0000-0000-000000000010', 'Tableau de bord',           490,  'module',    90),
  ('dc000001-0000-0000-0000-000000000011', 'Devis & factures PDF',      590,  'module',   100),
  ('dc000001-0000-0000-0000-000000000012', 'Cockpit multi-activités',   890,  'module',   110),
  ('dc000001-0000-0000-0000-000000000013', 'Mises de côté',             390,  'module',   120),
  ('dc000001-0000-0000-0000-000000000014', 'Suivi de stock',            490,  'module',   130),
  ('dc000001-0000-0000-0000-000000000015', 'Bibliothèque de modèles',   290,  'module',   140),
  ('dc000001-0000-0000-0000-000000000016', 'Génération documents PDF',  490,  'module',   150),
  ('dc000001-0000-0000-0000-000000000017', 'Newsletter',                490,  'module',   160),
  ('dc000001-0000-0000-0000-000000000018', 'Multi-utilisateurs',        590,  'module',   170),
  ('dc000001-0000-0000-0000-000000000019', 'Paiement Stripe',           590,  'connexion',200),
  ('dc000001-0000-0000-0000-000000000020', 'Connexion RDV',             590,  'connexion',210),
  ('dc000001-0000-0000-0000-000000000021', 'Récupération ventes caisse',690,  'connexion',220),
  ('dc000001-0000-0000-0000-000000000022', 'Stripe Terminal',           890,  'connexion',230)
ON CONFLICT DO NOTHING;

-- ── Seed devis démo (3 devis) ──────────────────────────────

-- Initialiser la séquence à 3 (les 3 devis sont déjà créés manuellement)
INSERT INTO demo_piloto_devis_seq (annee, valeur) VALUES (2026, 3) ON CONFLICT DO NOTHING;

INSERT INTO demo_piloto_devis
  (id, numero, date_emission, date_validite, client_nom, client_adresse, client_cp_ville,
   client_tel, client_email, objet, statut, remise_libelle, remise_montant, notes, total_ht,
   builder_client_id, created_at, updated_at)
VALUES
  (
    'de000001-0000-0000-0000-000000000001',
    'DEVIS-2026-001',
    '2026-03-10', '2026-04-09',
    'Artisans Bouchard',
    '5 rue de la Forge', '29200 Brest',
    '06 11 22 33 44', 'contact@artisans-bouchard.fr',
    'Création outil de gestion artisan — Site vitrine + espace clients + agenda',
    'accepte',
    'Remise lancement', 50,
    'Acompte 40 % reçu le 18/03.',
    3190,
    '22000001-0000-0000-0000-000000000001',
    '2026-03-10 09:15:00+01', '2026-03-10 09:15:00+01'
  ),
  (
    'de000001-0000-0000-0000-000000000002',
    'DEVIS-2026-002',
    '2026-04-22', '2026-05-22',
    'Garage Métro — Jean-Marc Vidal',
    '88 avenue de la Gare', '29600 Morlaix',
    '06 33 44 55 66', 'contact@garage-metro.fr',
    'Outil de gestion garage — Catalogue véhicules + suivi stock + paiement en ligne',
    'envoye',
    NULL, 0,
    'Relancer si pas de retour avant le 30/04.',
    2750,
    '22000001-0000-0000-0000-000000000004',
    '2026-04-22 14:30:00+02', '2026-04-22 14:30:00+02'
  ),
  (
    'de000001-0000-0000-0000-000000000003',
    'DEVIS-2026-003',
    '2026-05-15', '2026-06-14',
    'Commerce Bio Naturel',
    '3 place du Marché', '29000 Quimper',
    '06 44 55 66 77', 'info@bio-naturel.fr',
    'Boutique e-commerce bio — Espace client + newsletter + paiement Stripe + RDV',
    'brouillon',
    'Remise partenaire', 200,
    'À envoyer après validation du cahier des charges.',
    4720,
    '22000001-0000-0000-0000-000000000005',
    '2026-05-15 10:00:00+02', '2026-05-15 10:00:00+02'
  )
ON CONFLICT DO NOTHING;

-- Lignes devis 1 (accepté — Artisans Bouchard)
INSERT INTO demo_piloto_devis_lignes
  (devis_id, catalogue_id, libelle, quantite, prix_unitaire_ht, total_ligne, ordre)
VALUES
  ('de000001-0000-0000-0000-000000000001','dc000001-0000-0000-0000-000000000001','LA BASE',                  1, 990, 990,  1),
  ('de000001-0000-0000-0000-000000000001','dc000001-0000-0000-0000-000000000005','Espace client sécurisé',   1, 690, 690,  2),
  ('de000001-0000-0000-0000-000000000001','dc000001-0000-0000-0000-000000000007','Agenda interne',           1, 490, 490,  3),
  ('de000001-0000-0000-0000-000000000001','dc000001-0000-0000-0000-000000000010','Tableau de bord',          1, 490, 490,  4),
  ('de000001-0000-0000-0000-000000000001','dc000001-0000-0000-0000-000000000018','Multi-utilisateurs',       1, 590, 590,  5)
ON CONFLICT DO NOTHING;

-- Lignes devis 2 (envoyé — Garage Métro)
INSERT INTO demo_piloto_devis_lignes
  (devis_id, catalogue_id, libelle, quantite, prix_unitaire_ht, total_ligne, ordre)
VALUES
  ('de000001-0000-0000-0000-000000000002','dc000001-0000-0000-0000-000000000001','LA BASE',                  1, 990, 990,  1),
  ('de000001-0000-0000-0000-000000000002','dc000001-0000-0000-0000-000000000002','Catégories clients',       1, 290, 290,  2),
  ('de000001-0000-0000-0000-000000000002','dc000001-0000-0000-0000-000000000003','Historique relation',      1, 390, 390,  3),
  ('de000001-0000-0000-0000-000000000002','dc000001-0000-0000-0000-000000000014','Suivi de stock',           1, 490, 490,  4),
  ('de000001-0000-0000-0000-000000000002','dc000001-0000-0000-0000-000000000019','Paiement Stripe',          1, 590, 590,  5)
ON CONFLICT DO NOTHING;

-- Lignes devis 3 (brouillon — Commerce Bio Naturel)
INSERT INTO demo_piloto_devis_lignes
  (devis_id, catalogue_id, libelle, quantite, prix_unitaire_ht, total_ligne, ordre)
VALUES
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000001','LA BASE',                  1,  990,  990, 1),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000005','Espace client sécurisé',   1,  690,  690, 2),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000017','Newsletter',               1,  490,  490, 3),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000011','Devis & factures PDF',     1,  590,  590, 4),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000018','Multi-utilisateurs',       1,  590,  590, 5),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000019','Paiement Stripe',          1,  590,  590, 6),
  ('de000001-0000-0000-0000-000000000003','dc000001-0000-0000-0000-000000000020','Connexion RDV',            1,  590,  590, 7)
ON CONFLICT DO NOTHING;
