# Backlog de tâches — Kopaka

Les tâches sont ordonnées par sprint. L'agent doit implémenter uniquement le sprint explicitement demandé par le propriétaire du produit.

## Sprint 0 — Cadrage
- [ ] S0-01 Confirmer les règles Domino à 2 joueurs.
- [ ] S0-02 Confirmer les règles Domino à 4 joueurs.
- [ ] S0-03 Définir la méthode d'authentification facultative.
- [ ] S0-04 Définir conversion invité vers compte et récupération.
- [ ] S0-05 Définir durée de session invité.
- [ ] S0-06 Définir abandon, délai de grâce et reprise.
- [ ] S0-07 Valider wireframes mobile-first.
- [ ] S0-08 Valider les textes FR/MG prioritaires.

## Sprint 1 — Fondations
- [ ] S1-01 Inspecter le dépôt existant avant toute modification ; préserver les conventions et composants utiles.
- [ ] S1-02 Initialiser/adapter le monorepo pnpm et Turborepo.
- [ ] S1-03 Configurer TypeScript strict, ESLint et Prettier.
- [ ] S1-04 Créer l'application Next.js.
- [ ] S1-05 Créer l'API NestJS.
- [ ] S1-06 Ajouter les packages shared-types et validation.
- [ ] S1-07 Configurer Docker Compose PostgreSQL et Redis.
- [ ] S1-08 Configurer Prisma et migration initiale.
- [ ] S1-09 Ajouter healthcheck API.
- [ ] S1-10 Créer tokens UI et composants de base.
- [ ] S1-11 Créer structure i18n français/malagasy.
- [ ] S1-12 Configurer CI lint/typecheck/test/build.
- [ ] S1-13 Documenter démarrage local et variables d'environnement.

## Sprint 2 — Invité et lobby
- [ ] S2-01 Concevoir et implémenter session invitée.
- [ ] S2-02 Valider et réserver les pseudonymes.
- [ ] S2-03 Créer écran d'accueil et choix de langue.
- [ ] S2-04 Créer parcours « Jouer en invité ».
- [ ] S2-05 Créer entrée inscription/connexion facultative (selon méthode validée).
- [ ] S2-06 Créer lobby et catalogue.
- [ ] S2-07 Afficher Domino à 2 et Domino à 4.
- [ ] S2-08 Ajouter tests API et E2E.

## Sprint 3 — Salles et présence
- [ ] S3-01 Modéliser salles et participants.
- [ ] S3-02 Implémenter création et admission.
- [ ] S3-03 Implémenter sortie et expiration.
- [ ] S3-04 Ajouter présence Socket.IO.
- [ ] S3-05 Gérer capacité et attribution des sièges.
- [ ] S3-06 Tester concurrence de plusieurs admissions.

## Sprint 4 — Matchmaking et reconnexion
- [ ] S4-01 Créer files par mode Domino.
- [ ] S4-02 Implémenter rejoindre/annuler matchmaking.
- [ ] S4-03 Empêcher inscriptions multiples.
- [ ] S4-04 Ajouter snapshots d'état versionnés.
- [ ] S4-05 Ajouter idempotency keys et protection anti-rejeu.
- [ ] S4-06 Implémenter reconnexion et délai de grâce validé.
- [ ] S4-07 Tester clients multiples et réseau dégradé.

## Sprint 5 — Moteur Domino
- [ ] S5-01 Écrire règles formelles versionnées à partir des décisions validées.
- [ ] S5-02 Implémenter initialisation et distribution.
- [ ] S5-03 Implémenter vues privées et publiques.
- [ ] S5-04 Implémenter validation des actions.
- [ ] S5-05 Implémenter application déterministe des actions.
- [ ] S5-06 Implémenter fin de manche et calcul des scores.
- [ ] S5-07 Ajouter tests unitaires et invariants.
- [ ] S5-08 Ajouter tests de non-régression.

## Sprint 6 — Interface de jeu
- [ ] S6-01 Concevoir table Domino mobile-first pour 2 joueurs.
- [ ] S6-02 Concevoir table Domino mobile-first pour 4 joueurs.
- [ ] S6-03 Afficher main privée et chaîne publique.
- [ ] S6-04 Connecter actions UI au serveur.
- [ ] S6-05 Gérer erreurs, tour courant et reconnexion.
- [ ] S6-06 Afficher résultat et historique minimal.
- [ ] S6-07 Réaliser tests E2E complets à 2 et 4 clients.

## Sprint 7 — Comptes et communauté
- [ ] S7-01 Implémenter méthode de compte validée.
- [ ] S7-02 Convertir identité invitée vers compte sans perte autorisée.
- [ ] S7-03 Créer profil et préférences.
- [ ] S7-04 Ajouter recherche d'amis et demandes.
- [ ] S7-05 Ajouter invitations privées.
- [ ] S7-06 Tester contrôle d'accès et confidentialité.

## Sprint 8 — Progression et administration
- [ ] S8-01 Définir règles XP/badges sans valeur monétaire.
- [ ] S8-02 Enregistrer statistiques.
- [ ] S8-03 Créer classement initial.
- [ ] S8-04 Créer administration minimale.
- [ ] S8-05 Ajouter signalements et sanctions de base.
- [ ] S8-06 Ajouter protections anti-abus.

## Sprint 9 — Bêta
- [ ] S9-01 Tests multi-appareils.
- [ ] S9-02 Tests réseau lent et coupures.
- [ ] S9-03 Tests charge ciblés.
- [ ] S9-04 Audit sécurité.
- [ ] S9-05 Vérifier sauvegardes/restauration.
- [ ] S9-06 Corriger les défauts P0/P1.
- [ ] S9-07 Déployer bêta privée et recueillir les retours.
