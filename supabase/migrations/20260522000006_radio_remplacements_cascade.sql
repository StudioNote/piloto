-- Change ON DELETE SET NULL → ON DELETE CASCADE on piloto_radio_remplacements.radio_id
ALTER TABLE piloto_radio_remplacements
  DROP CONSTRAINT IF EXISTS piloto_radio_remplacements_radio_id_fkey;

ALTER TABLE piloto_radio_remplacements
  ADD CONSTRAINT piloto_radio_remplacements_radio_id_fkey
  FOREIGN KEY (radio_id) REFERENCES piloto_radios(id) ON DELETE CASCADE;
