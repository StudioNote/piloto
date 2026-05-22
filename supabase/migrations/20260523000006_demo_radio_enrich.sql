-- ============================================================
-- Enrichissement données démo radio
-- Suppléments récurrents + remplacement + factures avec detail_json
-- ============================================================

-- 1. Supprimer la tranche 17h-19h doublonnée de Radio Horizon FM
--    (seed initial avait 2 tranches alors que les factures reflètent 1 seule)
DELETE FROM demo_piloto_radio_tranches
WHERE radio_id = '44000001-0000-0000-0000-000000000001'
  AND tranche_debut::text = '17:00:00';

-- 2. Supprimer les factures sans detail_json
DELETE FROM demo_piloto_radio_factures;

-- 3. Suppléments récurrents (un par radio)
INSERT INTO demo_piloto_radio_supplements (radio_id, label, montant, recurrent) VALUES
  ('44000001-0000-0000-0000-000000000001', 'Jeu antenne',         5.00, true),
  ('44000001-0000-0000-0000-000000000002', 'Indemnité technique',  6.00, true),
  ('44000001-0000-0000-0000-000000000003', 'Jeu antenne',         8.00, true);

-- 4. Remplacement ponctuel : Radio Horizon FM, 17-20 mars 2026
INSERT INTO demo_piloto_radio_remplacements
  (radio_id, nom_radio, date_debut, date_fin, tranche_debut, tranche_fin, tarif_horaire, notes)
VALUES
  ('44000001-0000-0000-0000-000000000001',
   'Radio Atlantique',
   '2026-03-17', '2026-03-20',
   '07:00', '09:00',
   60.00,
   'Remplacement présentateur absent');

-- 5. Factures avec detail_json complet
-- Formule :
--   Horizon  : 07:00-09:00 Mon-Fri, 2h/j, 45 €/h → base 20j = 1 800 €/mois
--   Du Pays  : 06:30-09:30 Mon-Sat, 3h/j, 40 €/h → base 24j = 2 880 €/mois
--   Soleil   : 06:00-10:00 Mon-Fri, 4h/j, 50 €/h → base 20j = 4 000 €/mois
--
--   Suppléments actifs à partir d'avril 2026 :
--     Horizon +5€×20j=100€  →  1 900 €
--     Du Pays +6€×24j=144€  →  3 024 €
--     Soleil  +8€×20j=160€  →  4 160 €
--
--   Remplacement Horizon mars (+4j×2h×60€=480€) → 2 280 €

-- ── Radio Horizon FM ──────────────────────────────────────────
INSERT INTO demo_piloto_radio_factures (radio_id, annee, mois, montant, validee_at, detail_json) VALUES

('44000001-0000-0000-0000-000000000001', 2026, 1, 1800.00, '2026-01-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"07:00","tranche_fin":"09:00","worked_days":20,"duration_hours":2,"tarif_horaire":45,"amount":1800}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":1800,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":1800}'::jsonb),

('44000001-0000-0000-0000-000000000001', 2026, 2, 1620.00, '2026-02-28T18:00:00Z',
 '{"tranches":[{"tranche_debut":"07:00","tranche_fin":"09:00","worked_days":18,"duration_hours":2,"tarif_horaire":45,"amount":1620}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":1620,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":1620}'::jsonb),

('44000001-0000-0000-0000-000000000001', 2026, 3, 2280.00, '2026-03-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"07:00","tranche_fin":"09:00","worked_days":20,"duration_hours":2,"tarif_horaire":45,"amount":1800}],"recurring":[],"one_time":[],"remplacements":[{"label":"Remplacement 17–20 mars","days_in_month":4,"duration_hours":2,"tarif_horaire":60,"amount":480}],"hours_amount":1800,"recurring_total":0,"one_time_total":0,"remplacements_total":480,"grand_total":2280}'::jsonb),

('44000001-0000-0000-0000-000000000001', 2026, 4, 1900.00, '2026-04-30T18:00:00Z',
 '{"tranches":[{"tranche_debut":"07:00","tranche_fin":"09:00","worked_days":20,"duration_hours":2,"tarif_horaire":45,"amount":1800}],"recurring":[{"label":"Jeu antenne","montant":5,"worked_days":20,"total":100}],"one_time":[],"remplacements":[],"hours_amount":1800,"recurring_total":100,"one_time_total":0,"remplacements_total":0,"grand_total":1900}'::jsonb),

('44000001-0000-0000-0000-000000000001', 2026, 5, 1900.00, '2026-05-20T18:00:00Z',
 '{"tranches":[{"tranche_debut":"07:00","tranche_fin":"09:00","worked_days":20,"duration_hours":2,"tarif_horaire":45,"amount":1800}],"recurring":[{"label":"Jeu antenne","montant":5,"worked_days":20,"total":100}],"one_time":[],"remplacements":[],"hours_amount":1800,"recurring_total":100,"one_time_total":0,"remplacements_total":0,"grand_total":1900}'::jsonb);

-- ── La Radio du Pays ──────────────────────────────────────────
INSERT INTO demo_piloto_radio_factures (radio_id, annee, mois, montant, validee_at, detail_json) VALUES

('44000001-0000-0000-0000-000000000002', 2026, 1, 2880.00, '2026-01-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:30","tranche_fin":"09:30","worked_days":24,"duration_hours":3,"tarif_horaire":40,"amount":2880}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":2880,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":2880}'::jsonb),

('44000001-0000-0000-0000-000000000002', 2026, 2, 2640.00, '2026-02-28T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:30","tranche_fin":"09:30","worked_days":22,"duration_hours":3,"tarif_horaire":40,"amount":2640}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":2640,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":2640}'::jsonb),

('44000001-0000-0000-0000-000000000002', 2026, 3, 2880.00, '2026-03-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:30","tranche_fin":"09:30","worked_days":24,"duration_hours":3,"tarif_horaire":40,"amount":2880}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":2880,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":2880}'::jsonb),

('44000001-0000-0000-0000-000000000002', 2026, 4, 3024.00, '2026-04-30T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:30","tranche_fin":"09:30","worked_days":24,"duration_hours":3,"tarif_horaire":40,"amount":2880}],"recurring":[{"label":"Indemnité technique","montant":6,"worked_days":24,"total":144}],"one_time":[],"remplacements":[],"hours_amount":2880,"recurring_total":144,"one_time_total":0,"remplacements_total":0,"grand_total":3024}'::jsonb),

('44000001-0000-0000-0000-000000000002', 2026, 5, 3024.00, '2026-05-20T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:30","tranche_fin":"09:30","worked_days":24,"duration_hours":3,"tarif_horaire":40,"amount":2880}],"recurring":[{"label":"Indemnité technique","montant":6,"worked_days":24,"total":144}],"one_time":[],"remplacements":[],"hours_amount":2880,"recurring_total":144,"one_time_total":0,"remplacements_total":0,"grand_total":3024}'::jsonb);

-- ── Radio Soleil ──────────────────────────────────────────────
INSERT INTO demo_piloto_radio_factures (radio_id, annee, mois, montant, validee_at, detail_json) VALUES

('44000001-0000-0000-0000-000000000003', 2026, 1, 4000.00, '2026-01-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:00","tranche_fin":"10:00","worked_days":20,"duration_hours":4,"tarif_horaire":50,"amount":4000}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":4000,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":4000}'::jsonb),

('44000001-0000-0000-0000-000000000003', 2026, 2, 3600.00, '2026-02-28T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:00","tranche_fin":"10:00","worked_days":18,"duration_hours":4,"tarif_horaire":50,"amount":3600}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":3600,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":3600}'::jsonb),

('44000001-0000-0000-0000-000000000003', 2026, 3, 4000.00, '2026-03-31T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:00","tranche_fin":"10:00","worked_days":20,"duration_hours":4,"tarif_horaire":50,"amount":4000}],"recurring":[],"one_time":[],"remplacements":[],"hours_amount":4000,"recurring_total":0,"one_time_total":0,"remplacements_total":0,"grand_total":4000}'::jsonb),

('44000001-0000-0000-0000-000000000003', 2026, 4, 4160.00, '2026-04-30T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:00","tranche_fin":"10:00","worked_days":20,"duration_hours":4,"tarif_horaire":50,"amount":4000}],"recurring":[{"label":"Jeu antenne","montant":8,"worked_days":20,"total":160}],"one_time":[],"remplacements":[],"hours_amount":4000,"recurring_total":160,"one_time_total":0,"remplacements_total":0,"grand_total":4160}'::jsonb),

('44000001-0000-0000-0000-000000000003', 2026, 5, 4160.00, '2026-05-20T18:00:00Z',
 '{"tranches":[{"tranche_debut":"06:00","tranche_fin":"10:00","worked_days":20,"duration_hours":4,"tarif_horaire":50,"amount":4000}],"recurring":[{"label":"Jeu antenne","montant":8,"worked_days":20,"total":160}],"one_time":[],"remplacements":[],"hours_amount":4000,"recurring_total":160,"one_time_total":0,"remplacements_total":0,"grand_total":4160}'::jsonb);
