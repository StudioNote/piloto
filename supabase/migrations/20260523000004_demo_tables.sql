-- ============================================================
-- Tables DÉMO — miroir des tables Piloto, préfixées demo_
-- Accès : demo@anthonychesnier.fr uniquement (via service role dans l'app)
-- ============================================================

-- SOS Ordi ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_clients (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  civilite    text,
  nom         text        NOT NULL,
  prenom      text        NOT NULL,
  email       text        NOT NULL UNIQUE,
  telephone   text,
  adresse     text,
  auth_user_id uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_clients" ON demo_piloto_clients
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_interventions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid        NOT NULL REFERENCES demo_piloto_clients(id) ON DELETE CASCADE,
  date           date        NOT NULL,
  duree_minutes  integer,
  description    text,
  statut         text        NOT NULL DEFAULT 'À faire'
                   CHECK (statut IN ('À faire', 'En cours', 'Terminé')),
  montant        numeric,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_piloto_interventions_client_id_idx
  ON demo_piloto_interventions(client_id);
ALTER TABLE demo_piloto_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_interventions" ON demo_piloto_interventions
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_documents (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES demo_piloto_clients(id) ON DELETE CASCADE,
  nom_fichier   text        NOT NULL,
  description   text,
  url_storage   text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_documents" ON demo_piloto_documents
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- Radio ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_radios (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_radio        text        NOT NULL,
  nom_contact      text,
  telephone        text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_radios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radios" ON demo_piloto_radios
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_radio_exclusions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id uuid NOT NULL REFERENCES demo_piloto_radios(id) ON DELETE CASCADE,
  date     date NOT NULL,
  UNIQUE (radio_id, date)
);
ALTER TABLE demo_piloto_radio_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radio_exclusions" ON demo_piloto_radio_exclusions
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_radio_tranches (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id         uuid        NOT NULL REFERENCES demo_piloto_radios(id) ON DELETE CASCADE,
  tranche_debut    time        NOT NULL,
  tranche_fin      time        NOT NULL,
  jours_travailles text[]      NOT NULL DEFAULT '{}',
  tarif_horaire    numeric(10,2) NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_radio_tranches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radio_tranches" ON demo_piloto_radio_tranches
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_radio_remplacements (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id       uuid        NOT NULL REFERENCES demo_piloto_radios(id) ON DELETE CASCADE,
  nom_radio      text        NOT NULL,
  date_debut     date        NOT NULL,
  date_fin       date        NOT NULL,
  tranche_debut  time        NOT NULL,
  tranche_fin    time        NOT NULL,
  tarif_horaire  numeric(10,2) NOT NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_piloto_radio_remplacements_date_idx
  ON demo_piloto_radio_remplacements(date_debut DESC);
ALTER TABLE demo_piloto_radio_remplacements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radio_remplacements" ON demo_piloto_radio_remplacements
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_radio_supplements (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id   uuid        NOT NULL REFERENCES demo_piloto_radios(id) ON DELETE CASCADE,
  label      text        NOT NULL,
  montant    numeric(10,2) NOT NULL,
  recurrent  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_radio_supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radio_supplements" ON demo_piloto_radio_supplements
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_radio_factures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id    uuid        NOT NULL REFERENCES demo_piloto_radios(id) ON DELETE CASCADE,
  annee       integer     NOT NULL,
  mois        integer     NOT NULL CHECK (mois BETWEEN 1 AND 12),
  montant     numeric(12,2) NOT NULL,
  detail_json jsonb,
  validee_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT demo_piloto_radio_factures_unique UNIQUE (radio_id, annee, mois)
);
CREATE INDEX IF NOT EXISTS demo_piloto_radio_factures_annee_idx
  ON demo_piloto_radio_factures(annee);
ALTER TABLE demo_piloto_radio_factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_radio_factures" ON demo_piloto_radio_factures
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- Voix-Off ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_voixoff_clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  societe    text,
  nom        text,
  prenom     text,
  email      text,
  telephone  text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_voixoff_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_voixoff_clients" ON demo_piloto_voixoff_clients
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_voixoff_prestations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL REFERENCES demo_piloto_voixoff_clients(id) ON DELETE CASCADE,
  date        date        NOT NULL,
  description text,
  montant     numeric,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_piloto_voixoff_prestations_client_id_idx
  ON demo_piloto_voixoff_prestations(client_id);
CREATE INDEX IF NOT EXISTS demo_piloto_voixoff_prestations_date_idx
  ON demo_piloto_voixoff_prestations(date DESC);
ALTER TABLE demo_piloto_voixoff_prestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_voixoff_prestations" ON demo_piloto_voixoff_prestations
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- Builder ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_builder_clients (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  societe    text,
  nom        text,
  prenom     text,
  email      text,
  telephone  text,
  adresse    text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_builder_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_builder_clients" ON demo_piloto_builder_clients
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_builder_prestations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid        NOT NULL REFERENCES demo_piloto_builder_clients(id) ON DELETE CASCADE,
  date        date        NOT NULL,
  description text,
  montant     numeric,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_piloto_builder_prestations_client_id_idx
  ON demo_piloto_builder_prestations(client_id);
CREATE INDEX IF NOT EXISTS demo_piloto_builder_prestations_date_idx
  ON demo_piloto_builder_prestations(date DESC);
ALTER TABLE demo_piloto_builder_prestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_builder_prestations" ON demo_piloto_builder_prestations
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_builder_prospects (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  societe              text,
  nom                  text,
  prenom               text,
  email                text,
  telephone            text,
  adresse              text,
  source               text,
  besoin               text,
  notes                text,
  montant_estime       numeric,
  statut               text        NOT NULL DEFAULT 'a_contacter'
                         CHECK (statut IN ('a_contacter','contacte','rdv','devis_envoye','gagne','perdu')),
  prochaine_action_date date,
  converted_client_id  uuid        REFERENCES demo_piloto_builder_clients(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_builder_prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_builder_prospects" ON demo_piloto_builder_prospects
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

-- Agenda ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_rendezvous (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       text        NOT NULL,
  activite    text        NOT NULL CHECK (activite IN ('sos_ordi','builder','radio','autre')),
  client_nom  text,
  adresse     text,
  date        date        NOT NULL,
  heure_debut time        NOT NULL,
  heure_fin   time,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_rendezvous ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_rendezvous" ON demo_piloto_rendezvous
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

CREATE TABLE IF NOT EXISTS demo_piloto_calendar_token (
  id    text PRIMARY KEY DEFAULT 'singleton',
  token text NOT NULL
);
ALTER TABLE demo_piloto_calendar_token ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_calendar_token" ON demo_piloto_calendar_token
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

INSERT INTO demo_piloto_calendar_token (id, token)
VALUES ('singleton', 'demo-token-not-for-external-use')
ON CONFLICT (id) DO NOTHING;

-- Paramètres ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_parametres (
  id             text        PRIMARY KEY DEFAULT 'singleton',
  raison_sociale text,
  siret          text,
  adresse        text,
  telephone      text,
  email          text,
  mentions       text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_parametres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_parametres" ON demo_piloto_parametres
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');

INSERT INTO demo_piloto_parametres (id, raison_sociale, siret, adresse, telephone, email)
VALUES (
  'singleton',
  'Pixel & Co',
  '123 456 789 00012',
  '12 rue de la Paix, 75002 Paris',
  '06 01 02 03 04',
  'contact@pixel-co.fr'
) ON CONFLICT (id) DO NOTHING;

-- Modèles ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demo_piloto_modeles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text        NOT NULL,
  description text,
  url_storage text        NOT NULL,
  categorie   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE demo_piloto_modeles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_admin_modeles" ON demo_piloto_modeles
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'demo@anthonychesnier.fr');
