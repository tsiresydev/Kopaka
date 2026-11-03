# Kopaka — Cahier des charges et dossier Spec Kit

Version : 1.0 — 2 novembre 2026  
Statut : fondations Sprint 1 implémentées ; contrôles et validations dans `specs/003-sprint-1-fondations/validation.md`.

## Démarrer le projet

Prérequis : Node **24.22.2**, pnpm **10.8.0**, Git et Docker avec Compose et moteur Linux.

Suivre [le guide de développement](docs/development.md) pour créer les fichiers env locaux depuis les exemples et choisir un mot de passe local cohérent entre PostgreSQL et l'API, puis lancer :

```powershell
pnpm install --frozen-lockfile
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev
```

Web : <http://localhost:3000>. API : <http://localhost:3001/health/ready> (`ready` lorsque les données sont initialisées). Les applications peuvent être construites et démarrées séparément ; les commandes, migrations, tests isolés, pannes/reprises et le dépannage sont détaillés dans le guide.

## Vérifier une modification

```powershell
pnpm exec playwright install chromium firefox webkit
pnpm quality
```

La chaîne exécute lint, format, types, tests unitaires, intégration réelle PostgreSQL/Redis, build et E2E production. Elle identifie le contrôle fautif et retourne un code non nul en cas d'échec. Résultats dans `quality-results/summary.json`, rapports navigateur dans `playwright-report/` et `test-results/`.

Le workflow `.github/workflows/ci.yml` prévoit la chaîne complète sur Linux et un contrôle installation/build Windows. Le propriétaire a confirmé les validations finales et la clôture du Sprint 1 ; leur source et les résultats automatiques sont consignés dans le rapport de validation. La page actuelle démontre les fondations FR/MG ; aucun parcours invité, lobby ou jeu n'est encore livré.

## Décisions validées

- Nom : Kopaka.
- Jeux au lancement : Domino à 2 joueurs et Domino à 4 joueurs.
- Accès : mode invité utilisable sans inscription ; création de compte facultative.
- Langues : français et malagasy.
- Produit initial : jeux gratuits, sans mise, dépôt, retrait, portefeuille ni gain monétaire.
- Récompenses : XP, points, badges et classements virtuels non échangeables et non convertibles.
- Stack : Next.js + TypeScript pour le web ; Node.js avec NestJS pour l'API ; Socket.IO pour le temps réel ; PostgreSQL/Prisma ; Redis.

## Contenu

- `design-system/kopaka/MASTER.md` : Design System officiel, thèmes clair/sombre et règles de conception.
- `design-system/kopaka/preview.html` : catalogue visuel autonome à ouvrir dans un navigateur.
- `design-system/kopaka/tokens.css` : tokens CSS de marque, de thème et de composants.
- `CAHIER_DES_CHARGES.md` : cahier des charges fonctionnel et technique.
- `constitution.md` : principes non négociables du projet.
- `specs/001-platforme-kopaka.md` : spécification produit et exigences.
- `specs/002-domino.md` : périmètre fonctionnel du Domino.
- `plan.md` : architecture et plan de réalisation.
- `tasks.md` : backlog ordonné par sprint.
- `checklists/requirements.md` : contrôle qualité des exigences.
- `checklists/release.md` : contrôle avant bêta/lancement.
- `DECISIONS_ET_POINTS_A_VALIDER.md` : décisions actées, hypothèses et points à trancher.

## Utilisation avec Spec Kit

Depuis la racine du dépôt, intégrer les fichiers aux emplacements attendus par votre version de Spec Kit. En général :

1. `constitution.md` devient `.specify/memory/constitution.md`.
2. Le contenu de `specs/001-platforme-kopaka.md` sert de base à `/speckit.specify`.
3. Utiliser `plan.md` comme référence pour `/speckit.plan`.
4. Utiliser `tasks.md` comme base pour `/speckit.tasks`.

Ne lancez pas l'implémentation complète d'un seul coup. Commencez par Sprint 1, vérifiez les tests et la qualité, puis passez au sprint suivant.

## Règle de gestion des incertitudes

Tout point marqué « À VALIDER » est une décision produit à confirmer avant le développement de la fonctionnalité concernée. Ne pas transformer une hypothèse en règle métier sans validation.
