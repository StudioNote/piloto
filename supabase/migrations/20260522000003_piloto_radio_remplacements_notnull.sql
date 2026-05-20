-- radio_id becomes mandatory: delete orphaned rows first, then enforce NOT NULL
DELETE FROM piloto_radio_remplacements WHERE radio_id IS NULL;
ALTER TABLE piloto_radio_remplacements ALTER COLUMN radio_id SET NOT NULL;
