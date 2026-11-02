# Kopaka — Cahier des charges et dossier Spec Kit

Version : 1.0 — 2 novembre 2026  
Statut : base de référence pour le cadrage et le démarrage du développement.

## Décisions validées
- Nom : Kopaka.
- Jeux au lancement : Domino à 2 joueurs et Domino à 4 joueurs.
- Accès : mode invité utilisable sans inscription ; création de compte facultative.
- Langues : français et malagasy.
- Produit initial : jeux gratuits, sans mise, dépôt, retrait, portefeuille ni gain monétaire.
- Récompenses : XP, points, badges et classements virtuels non échangeables et non convertibles.
- Stack : Next.js + TypeScript pour le web ; Node.js avec NestJS pour l'API ; Socket.IO pour le temps réel ; PostgreSQL/Prisma ; Redis.

## Contenu
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
