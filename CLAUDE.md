# Piloto — Règles permanentes du projet

## Contexte
Piloto est un outil de pilotage d'activité multi-activités (admin + espace client).
Stack : Next.js 14 (App Router) + TypeScript + Tailwind v4 + Supabase + Vercel.
Hébergé sur piloto.anthonychesnier.fr.

## Infrastructure
- Supabase : projet PARTAGÉ avec Swipcode. TOUTES les tables Piloto sont préfixées `piloto_`.
- Déploiement : Vercel, redéploiement auto au push sur origin/main.

## Workflow OBLIGATOIRE à la fin de CHAQUE tâche
1. Lancer `npm run build` en local et confirmer que ça compile SANS erreur.
2. Ne JAMAIS pousser si le build échoue — corriger d'abord.
3. Après un build réussi : `git push origin main`.
4. Si la tâche crée ou modifie des tables : appliquer la migration en remote avec `supabase db push` et confirmer que les tables/policies existent.
Ne pas considérer une tâche comme terminée tant que le code n'est pas poussé ET les migrations appliquées.

## Règles de code
- React 18 : NE JAMAIS utiliser `useActionState` (hook React 19, incompatible — provoque un crash client "useActionState is not a function"). Utiliser `useState` + fonction async classique au submit/onClick.
- RLS activé dès le départ sur toute nouvelle table.

## Git
- RÈGLE ABSOLUE : aucun `Co-Authored-By` ni mention de Claude dans les commits (Vercel Hobby refuse les contributeurs multiples).

## Identité visuelle
- Interface admin (/admin/*) : multicolore par module, sobre et pro.
- Espace client (/client) et page de connexion client : identité SOS Ordi (bleu #046BD2). NE PAS y toucher lors des relookings admin.
