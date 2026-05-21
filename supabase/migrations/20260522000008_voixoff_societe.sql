ALTER TABLE piloto_voixoff_clients
  ADD COLUMN IF NOT EXISTS societe text;

ALTER TABLE piloto_voixoff_clients
  ALTER COLUMN nom DROP NOT NULL;

ALTER TABLE piloto_voixoff_clients
  ALTER COLUMN prenom DROP NOT NULL;
