-- ============================================================
-- Seed démo — données fictives crédibles
-- ============================================================

-- SOS Ordi : 8 clients ──────────────────────────────────────

INSERT INTO demo_piloto_clients (id, civilite, nom, prenom, email, telephone, adresse) VALUES
  ('11000001-0000-0000-0000-000000000001', 'M.', 'Martin',   'Jean-Pierre',  'jp.martin@gmail.com',         '06 12 34 56 78', '4 allée des Chênes, 29200 Brest'),
  ('11000001-0000-0000-0000-000000000002', 'Mme','Dupont',   'Marie',        'marie.dupont@orange.fr',      '06 23 45 67 89', '17 rue Kéréon, 29000 Quimper'),
  ('11000001-0000-0000-0000-000000000003', NULL, 'Cabinet Leblanc & Associés', '', 'contact@cabinet-leblanc.fr', '02 98 00 11 22', '8 rue du Château, 29600 Morlaix'),
  ('11000001-0000-0000-0000-000000000004', 'Mme','Moreau',   'Christine',    'c.moreau@wanadoo.fr',         '06 34 56 78 90', '3 impasse des Roses, 29200 Brest'),
  ('11000001-0000-0000-0000-000000000005', 'M.', 'Renard',   'Paul',         'p.renard@laposte.net',        '07 45 67 89 01', '22 rue de Siam, 29200 Brest'),
  ('11000001-0000-0000-0000-000000000006', 'Mme','Aubert',   'Sylvie',       'saubert@yahoo.fr',            '06 56 78 90 12', '1 rue de la Mer, 29880 Plouguerneau'),
  ('11000001-0000-0000-0000-000000000007', NULL, 'Hôtel du Centre', '',       'contact@hotel-du-centre.com', '02 98 44 55 66', '15 place de la Liberté, 29600 Morlaix'),
  ('11000001-0000-0000-0000-000000000008', 'M.', 'Fontaine', 'André',        'a.fontaine@sfr.fr',           '06 67 89 01 23', '9 rue Jean Jaurès, 29000 Quimper');

-- SOS Ordi : interventions ──────────────────────────────────

INSERT INTO demo_piloto_interventions (client_id, date, duree_minutes, description, statut, montant) VALUES
  -- Jean-Pierre Martin
  ('11000001-0000-0000-0000-000000000001', '2026-01-08', 90,  'Suppression de virus et mise à jour Windows', 'Terminé', 95.00),
  ('11000001-0000-0000-0000-000000000001', '2026-02-15', 120, 'Configuration imprimante réseau et sauvegarde', 'Terminé', 120.00),
  ('11000001-0000-0000-0000-000000000001', '2026-04-10', 60,  'Optimisation démarrage et nettoyage disque', 'Terminé', 70.00),
  ('11000001-0000-0000-0000-000000000001', '2026-05-20', 90,  'Installation et configuration Microsoft 365', 'En cours', 110.00),
  -- Marie Dupont
  ('11000001-0000-0000-0000-000000000002', '2026-01-22', 60,  'Récupération données sur téléphone cassé', 'Terminé', 80.00),
  ('11000001-0000-0000-0000-000000000002', '2026-03-14', 90,  'Paramétrage email et accès à distance', 'Terminé', 90.00),
  ('11000001-0000-0000-0000-000000000002', '2026-05-07', 120, 'Remplacement disque SSD + migration données', 'Terminé', 250.00),
  -- Cabinet Leblanc
  ('11000001-0000-0000-0000-000000000003', '2026-02-05', 180, 'Audit et configuration réseau 6 postes', 'Terminé', 350.00),
  ('11000001-0000-0000-0000-000000000003', '2026-03-20', 120, 'Installation serveur NAS et droits d accès', 'Terminé', 280.00),
  ('11000001-0000-0000-0000-000000000003', '2026-05-15', 90,  'Mise à jour sécurité et vérification sauvegardes', 'Terminé', 190.00),
  -- Christine Moreau
  ('11000001-0000-0000-0000-000000000004', '2026-01-30', 60,  'Désinfection ransomware et restauration fichiers', 'Terminé', 120.00),
  ('11000001-0000-0000-0000-000000000004', '2026-04-22', 60,  'Configuration messagerie sur nouvel ordinateur', 'Terminé', 75.00),
  -- Paul Renard
  ('11000001-0000-0000-0000-000000000005', '2026-02-12', 60,  'Configuration email professionnel Outlook', 'Terminé', 65.00),
  ('11000001-0000-0000-0000-000000000005', '2026-03-28', 90,  'Dépannage connexion internet + routeur', 'Terminé', 85.00),
  ('11000001-0000-0000-0000-000000000005', '2026-05-03', 60,  'Installation logiciels comptabilité', 'Terminé', 70.00),
  -- Sylvie Aubert
  ('11000001-0000-0000-0000-000000000006', '2026-03-05', 90,  'Nettoyage virus et optimisation performances', 'Terminé', 90.00),
  ('11000001-0000-0000-0000-000000000006', '2026-05-12', 60,  'Configuration sauvegarde cloud et explications', 'Terminé', 75.00),
  -- Hôtel du Centre
  ('11000001-0000-0000-0000-000000000007', '2026-01-15', 240, 'Migration parc informatique 12 postes', 'Terminé', 480.00),
  ('11000001-0000-0000-0000-000000000007', '2026-03-10', 120, 'Maintenance trimestrielle réseau et sécurité', 'Terminé', 220.00),
  ('11000001-0000-0000-0000-000000000007', '2026-05-08', 120, 'Maintenance trimestrielle réseau et sécurité', 'Terminé', 220.00),
  -- André Fontaine
  ('11000001-0000-0000-0000-000000000008', '2026-02-25', 90,  'Récupération données disque dur défaillant', 'Terminé', 150.00),
  ('11000001-0000-0000-0000-000000000008', '2026-04-18', 60,  'Installation Windows 11 et transfert données', 'Terminé', 130.00);

-- Builder : 5 clients + 1 converti depuis prospect ─────────

INSERT INTO demo_piloto_builder_clients (id, societe, nom, prenom, email, telephone, adresse) VALUES
  ('22000001-0000-0000-0000-000000000001', 'Artisans Bouchard', NULL,      NULL,     'contact@artisans-bouchard.fr',  '06 11 22 33 44', '5 rue de la Forge, 29200 Brest'),
  ('22000001-0000-0000-0000-000000000002', NULL,              'Leclerc',  'Sophie', 'sophie.leclerc@studiolumierecom', '06 22 33 44 55', '14 rue Traverse, 29000 Quimper'),
  ('22000001-0000-0000-0000-000000000003', 'Association Esperanza', NULL,  NULL,     'asso.esperanza@gmail.com',      '02 98 55 66 77', NULL),
  ('22000001-0000-0000-0000-000000000004', 'Garage Métro',    'Vidal',    'Jean-Marc','contact@garage-metro.fr',     '06 33 44 55 66', '88 avenue de la Gare, 29600 Morlaix'),
  ('22000001-0000-0000-0000-000000000005', 'Commerce Bio Naturel', NULL,  NULL,     'info@bio-naturel.fr',           '06 44 55 66 77', '3 place du Marché, 29000 Quimper');

INSERT INTO demo_piloto_builder_prestations (client_id, date, description, montant) VALUES
  -- Artisans Bouchard
  ('22000001-0000-0000-0000-000000000001', '2026-01-20', 'Acompte refonte site vitrine + devis en ligne', 1500.00),
  ('22000001-0000-0000-0000-000000000001', '2026-02-28', 'Développement site vitrine (50%)', 1500.00),
  ('22000001-0000-0000-0000-000000000001', '2026-04-05', 'Livraison site vitrine + formation', 1200.00),
  -- Studio Lumière (Sophie Leclerc)
  ('22000001-0000-0000-0000-000000000002', '2026-02-10', 'Portfolio photographe — acompte', 800.00),
  ('22000001-0000-0000-0000-000000000002', '2026-03-25', 'Portfolio photographe — solde', 800.00),
  -- Association Esperanza
  ('22000001-0000-0000-0000-000000000003', '2026-01-12', 'Site association + espace membres', 600.00),
  ('22000001-0000-0000-0000-000000000003', '2026-03-08', 'Maintenance annuelle et ajouts contenus', 300.00),
  -- Garage Métro
  ('22000001-0000-0000-0000-000000000004', '2026-03-15', 'Site vitrine + catalogue véhicules (acompte)', 1200.00),
  ('22000001-0000-0000-0000-000000000004', '2026-05-02', 'Site vitrine + catalogue véhicules (solde)', 1200.00),
  -- Commerce Bio Naturel
  ('22000001-0000-0000-0000-000000000005', '2026-04-20', 'Site e-commerce (acompte 40%)', 2800.00),
  ('22000001-0000-0000-0000-000000000005', '2026-05-18', 'Site e-commerce (60% restant)', 4200.00);

-- Builder : 6 prospects (un par étape) ─────────────────────

INSERT INTO demo_piloto_builder_prospects
  (id, societe, nom, prenom, email, telephone, source, besoin, notes, montant_estime, statut, prochaine_action_date)
VALUES
  (
    '33000001-0000-0000-0000-000000000001',
    'Tech Solutions SA', NULL, NULL,
    'direction@tech-solutions.fr', '06 71 82 93 04',
    'Réseau professionnel',
    'Refonte complète du site corporate + intranet collaboratif',
    'Directeur rencontré au forum entreprises du 29. Budget validé en interne.',
    8500.00, 'a_contacter', '2026-05-25'
  ),
  (
    '33000001-0000-0000-0000-000000000002',
    NULL, 'Fontaine', 'Isabelle',
    'i.fontaine@gmail.com', '06 82 93 04 15',
    'Bouche-à-oreille',
    'Site vitrine pour cabinet de sophrologie',
    'Recommandée par Mme Dupont. Autonome sur la mise à jour des contenus.',
    2200.00, 'contacte', '2026-05-27'
  ),
  (
    '33000001-0000-0000-0000-000000000003',
    NULL, 'Vallet', 'Alexis',
    'alexis.vallet@atelier-menuiserie.fr', '06 93 04 15 26',
    'Site web (formulaire contact)',
    'Site e-commerce menuiserie artisanale : catalogue produits, configurateur devis',
    'Artisan sérieux, projet bien défini. RDV confirmé pour mardi.',
    12500.00, 'rdv', '2026-05-27'
  ),
  (
    '33000001-0000-0000-0000-000000000004',
    'Agence Pixel Création', NULL, NULL,
    'contact@agence-pixel.fr', '02 98 11 22 33',
    'Partenariat agence',
    'Sous-traitance développement web pour leurs clients',
    'Devis envoyé le 15/05. Attente retour direction. Relancer si pas de réponse avant fin mai.',
    4800.00, 'devis_envoye', '2026-05-30'
  ),
  (
    '33000001-0000-0000-0000-000000000005',
    'Commerce Bio Naturel', NULL, NULL,
    'info@bio-naturel.fr', '06 44 55 66 77',
    'Réseaux sociaux',
    'Boutique en ligne produits biologiques locaux',
    'Client converti. Projet livré et payé.',
    7200.00, 'gagne', NULL
  ),
  (
    '33000001-0000-0000-0000-000000000006',
    'Grande Surface Dumont', NULL, NULL,
    'direction@dumont-commerce.fr', '02 98 99 00 11',
    'Démarchage',
    'Refonte site + appli mobile de fidélité',
    'Budget trop contraint par rapport aux attentes. Ont finalement opté pour un prestataire national.',
    18000.00, 'perdu', NULL
  );

-- Lier prospect5 au client Commerce Bio Naturel
UPDATE demo_piloto_builder_prospects
SET converted_client_id = '22000001-0000-0000-0000-000000000005'
WHERE id = '33000001-0000-0000-0000-000000000005';

-- Radios : 3 radios ─────────────────────────────────────────

INSERT INTO demo_piloto_radios (id, nom_radio, nom_contact, telephone) VALUES
  ('44000001-0000-0000-0000-000000000001', 'Radio Horizon FM',   'Nathalie Perrin',  '02 98 30 40 50'),
  ('44000001-0000-0000-0000-000000000002', 'La Radio du Pays',   'Marc Guérin',      '02 98 41 51 61'),
  ('44000001-0000-0000-0000-000000000003', 'Radio Soleil',       'Stéphanie Morin',  '02 98 52 62 72');

-- Tranches horaires
INSERT INTO demo_piloto_radio_tranches (radio_id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire) VALUES
  ('44000001-0000-0000-0000-000000000001', '07:00', '09:00', ARRAY['lun','mar','mer','jeu','ven'], 45.00),
  ('44000001-0000-0000-0000-000000000001', '17:00', '19:00', ARRAY['lun','mar','mer','jeu','ven'], 45.00),
  ('44000001-0000-0000-0000-000000000002', '06:30', '09:30', ARRAY['lun','mar','mer','jeu','ven','sam'], 40.00),
  ('44000001-0000-0000-0000-000000000003', '06:00', '10:00', ARRAY['lun','mar','mer','jeu','ven'], 50.00);

-- Factures radio (5 derniers mois)
INSERT INTO demo_piloto_radio_factures (radio_id, annee, mois, montant) VALUES
  -- Radio Horizon (2h × 5j × 4sem × 45€ ≈ 1800/mois)
  ('44000001-0000-0000-0000-000000000001', 2026, 1, 1800.00),
  ('44000001-0000-0000-0000-000000000001', 2026, 2, 1620.00),
  ('44000001-0000-0000-0000-000000000001', 2026, 3, 1800.00),
  ('44000001-0000-0000-0000-000000000001', 2026, 4, 1800.00),
  ('44000001-0000-0000-0000-000000000001', 2026, 5, 1800.00),
  -- La Radio du Pays (3h × 6j × 4sem × 40€ ≈ 2880/mois)
  ('44000001-0000-0000-0000-000000000002', 2026, 1, 2880.00),
  ('44000001-0000-0000-0000-000000000002', 2026, 2, 2640.00),
  ('44000001-0000-0000-0000-000000000002', 2026, 3, 2880.00),
  ('44000001-0000-0000-0000-000000000002', 2026, 4, 2880.00),
  ('44000001-0000-0000-0000-000000000002', 2026, 5, 2880.00),
  -- Radio Soleil (4h × 5j × 4sem × 50€ ≈ 4000/mois)
  ('44000001-0000-0000-0000-000000000003', 2026, 1, 4000.00),
  ('44000001-0000-0000-0000-000000000003', 2026, 2, 3600.00),
  ('44000001-0000-0000-0000-000000000003', 2026, 3, 4000.00),
  ('44000001-0000-0000-0000-000000000003', 2026, 4, 4000.00),
  ('44000001-0000-0000-0000-000000000003', 2026, 5, 4000.00);

-- Voix-Off : 4 clients ──────────────────────────────────────

INSERT INTO demo_piloto_voixoff_clients (id, societe, nom, prenom, email, telephone) VALUES
  ('55000001-0000-0000-0000-000000000001', 'Publicité Cléar',    NULL,       NULL,       'contact@pub-clear.fr',       '06 10 20 30 40'),
  ('55000001-0000-0000-0000-000000000002', NULL,                 'Renault',  'Thomas',   't.renault@studio-son.com',   '06 21 31 41 51'),
  ('55000001-0000-0000-0000-000000000003', 'Studio K7',          NULL,       NULL,       'prod@studio-k7.fr',          '02 98 10 20 30'),
  ('55000001-0000-0000-0000-000000000004', 'TVLocal Bretagne',   NULL,       NULL,       'antenne@tvlocal-bretagne.fr','02 98 20 30 40');

INSERT INTO demo_piloto_voixoff_prestations (client_id, date, description, montant) VALUES
  -- Publicité Cléar
  ('55000001-0000-0000-0000-000000000001', '2026-01-14', 'Spot radio 30s — campagne janvier', 280.00),
  ('55000001-0000-0000-0000-000000000001', '2026-02-18', 'Spot radio 30s — Valentine Day', 280.00),
  ('55000001-0000-0000-0000-000000000001', '2026-04-08', 'Voix off publicité vidéo 60s', 350.00),
  ('55000001-0000-0000-0000-000000000001', '2026-05-06', 'Spot radio 30s — campagne printemps', 280.00),
  -- Thomas Renault
  ('55000001-0000-0000-0000-000000000002', '2026-02-05', 'Narration podcast entrepreneuriat — 4 épisodes', 520.00),
  ('55000001-0000-0000-0000-000000000002', '2026-04-15', 'Narration podcast entrepreneuriat — 4 épisodes', 520.00),
  -- Studio K7
  ('55000001-0000-0000-0000-000000000003', '2026-01-25', 'Voix off documentaire court-métrage', 420.00),
  ('55000001-0000-0000-0000-000000000003', '2026-03-12', 'Voix off présentation institutionnelle', 380.00),
  ('55000001-0000-0000-0000-000000000003', '2026-05-14', 'Voix off e-learning 3 modules', 650.00),
  -- TVLocal Bretagne
  ('55000001-0000-0000-0000-000000000004', '2026-01-08', 'Habillage antenne — voix off 12 jingles', 720.00),
  ('55000001-0000-0000-0000-000000000004', '2026-03-02', 'Voix off reportage local', 290.00),
  ('55000001-0000-0000-0000-000000000004', '2026-04-28', 'Habillage antenne — voix off 8 jingles', 480.00),
  ('55000001-0000-0000-0000-000000000004', '2026-05-19', 'Voix off reportage événement', 290.00);

-- Agenda : RDV sur le mois en cours (mai 2026) ─────────────

INSERT INTO demo_piloto_rendezvous (titre, activite, client_nom, adresse, date, heure_debut, heure_fin, description) VALUES
  ('Dépannage réseau',     'sos_ordi', 'Cabinet Leblanc & Associés',     '8 rue du Château, 29600 Morlaix',              '2026-05-22', '09:00', '11:00', 'Vérification sauvegardes et sécurité réseau'),
  ('Émission matinale',    'radio',    'Radio Horizon FM',                NULL,                                           '2026-05-23', '07:00', '09:00', 'Matinale du vendredi'),
  ('RDV commercial',       'builder',  'Alexis Vallet',                  NULL,                                           '2026-05-27', '14:00', '15:30', 'Présentation devis site e-commerce menuiserie'),
  ('Émission matinale',    'radio',    'Radio Soleil',                    NULL,                                           '2026-05-28', '06:00', '10:00', 'Matinale du mercredi'),
  ('Intervention poste',   'sos_ordi', 'Hôtel du Centre',                '15 place de la Liberté, 29600 Morlaix',        '2026-05-29', '10:00', '12:00', 'Maintenance trimestrielle'),
  ('Enregistrement spot',  'autre',    'Publicité Cléar',                 NULL,                                           '2026-05-30', '14:00', '15:00', 'Spot radio 30s — campagne été');

-- Modèles : 2 entrées fictives ──────────────────────────────

INSERT INTO demo_piloto_modeles (nom, description, url_storage, categorie) VALUES
  ('Devis type — Site vitrine', 'Modèle de devis pour création site vitrine', 'demo/devis-site-vitrine.docx', 'Devis'),
  ('Facture type — Intervention SOS Ordi', 'Facture standard pour interventions informatiques', 'demo/facture-sos-ordi.docx', 'Facture');
