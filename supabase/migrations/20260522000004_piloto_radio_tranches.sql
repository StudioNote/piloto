-- Table des tranches horaires par radio (remplace les colonnes fixes de piloto_radios)
CREATE TABLE piloto_radio_tranches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_id uuid NOT NULL REFERENCES piloto_radios(id) ON DELETE CASCADE,
  tranche_debut time NOT NULL,
  tranche_fin time NOT NULL,
  jours_travailles text[] NOT NULL DEFAULT '{}',
  tarif_horaire numeric(10, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE piloto_radio_tranches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_tranches" ON piloto_radio_tranches
  FOR ALL USING (auth.jwt() ->> 'email' = 'contact@anthonychesnier.fr');

-- Migrer les données existantes
INSERT INTO piloto_radio_tranches (radio_id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire)
SELECT id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire
FROM piloto_radios
WHERE tranche_debut IS NOT NULL AND tranche_fin IS NOT NULL AND tarif_horaire IS NOT NULL;

-- Supprimer les colonnes devenues redondantes
ALTER TABLE piloto_radios
  DROP COLUMN IF EXISTS tranche_debut,
  DROP COLUMN IF EXISTS tranche_fin,
  DROP COLUMN IF EXISTS jours_travailles,
  DROP COLUMN IF EXISTS tarif_horaire;
