-- Module Prospects (pipeline commercial Builder)

CREATE TABLE IF NOT EXISTS piloto_builder_prospects (
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
  converted_client_id  uuid        REFERENCES piloto_builder_clients(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_builder_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_prospects"
  ON piloto_builder_prospects
  FOR ALL
  TO authenticated
  USING  (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr')
  WITH CHECK (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- Trigger updated_at
CREATE OR REPLACE FUNCTION piloto_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_prospects
  BEFORE UPDATE ON piloto_builder_prospects
  FOR EACH ROW EXECUTE FUNCTION piloto_set_updated_at();
