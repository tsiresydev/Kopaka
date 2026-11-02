# Plan technique — Kopaka

## 1. Architecture cible
Monorepo pnpm + Turborepo avec application web Next.js, API NestJS, packages partagés et moteurs de jeu isolés.

```text
kopaka/
  apps/
    web/                    # Next.js, pages, composants, i18n
    api/                    # NestJS, REST, Socket.IO
  packages/
    ui/
    shared-types/
    validation/
    game-engine/
    game-engine-domino/
  prisma/
    schema.prisma
    migrations/
  infra/
    docker/
    scripts/
  docs/
  .specify/
    memory/constitution.md
    specs/
```

## 2. Flux applicatif
- Le navigateur s'authentifie par session invité ou compte.
- L'API REST gère identité, profil, catalogue et création de salle.
- Socket.IO gère présence, matchmaking et actions de partie.
- NestJS orchestre les parties et appelle le moteur de jeu.
- Le moteur valide et applique les actions ; le backend persiste les événements/résultats.
- Redis gère présence, files de matchmaking, verrous courts et état temporaire lorsque nécessaire.
- PostgreSQL conserve les données durables et l'historique nécessaire.

## 3. Principes d'architecture
- Monolithe modulaire au départ, pas de microservices prématurés.
- Contrats partagés typés et validation runtime.
- Moteur de jeu indépendant du transport.
- Serveur autoritaire.
- Événements idempotents et numérotés.
- Snapshot versionné à la reconnexion.
- Persistance transactionnelle des résultats.
- Observabilité dès les fondations.

## 4. Sprints proposés

### Sprint 0 — Cadrage (avant développement fonctionnel)
Livrables : constitution, spécifications, règles Domino validées, parcours, décisions d'authentification et politique d'abandon.

### Sprint 1 — Fondations
- Initialiser monorepo, pnpm, Turborepo et conventions.
- Créer Next.js et NestJS.
- Configurer TypeScript strict, lint, format et tests.
- Configurer Docker Compose PostgreSQL + Redis.
- Installer Prisma et première migration.
- Créer design tokens, shell responsive et structure i18n FR/MG.
- Ajouter healthcheck et CI.

### Sprint 2 — Identité invitée et lobby
- Créer session invitée sécurisée.
- Gérer pseudonyme et langue.
- Construire accueil, choix invité/compte et lobby.
- Afficher les modes Domino à 2 et à 4.
- Ajouter tests unitaires et E2E du parcours invité.

### Sprint 3 — Salles et présence
- Modèle salle et participants.
- Créer/rejoindre/quitter salle.
- Présence Socket.IO.
- Capacité et sièges.
- Nettoyage des salles expirées.

### Sprint 4 — Matchmaking et reconnexion
- File de matchmaking séparée par mode.
- Annulation de recherche.
- Synchronisation de présence.
- Reconnexion, snapshots et idempotence.
- Tests avec clients multiples.

### Sprint 5 — Moteur Domino
- Implémenter le moteur seulement après validation des règles.
- Tests unitaires, propriétés et cas limites.
- Versionner les règles.
- Générer les vues publiques et privées.

### Sprint 6 — Interface de jeu et résultats
- Table de jeu responsive.
- Affichage des pièces privées du joueur.
- Actions tactiles et feedback.
- Synchronisation temps réel.
- Résultats, historique minimal et revanche si validée.

### Sprint 7 — Compte facultatif et communauté de base
- Inscription/connexion selon méthode validée.
- Conversion invité vers compte.
- Profil, statistiques et amis selon priorité.
- Tests sécurité et confidentialité.

### Sprint 8 — Progression et administration minimale
- XP/badges non monétaires.
- Classement initial.
- Outils de modération et audit minimum.
- Anti-abus de base.

### Sprint 9 — Stabilisation et bêta
- Tests charge ciblés.
- Tests appareils réels et réseau lent.
- Audit sécurité.
- Sauvegarde/restauration.
- Bêta privée, collecte feedback et corrections.

## 5. Definition of Done
Une tâche est terminée lorsque :
- les critères d'acceptation sont satisfaits ;
- les tests pertinents passent ;
- lint, typecheck et build passent ;
- aucune donnée privée n'est exposée ;
- les états d'erreur et de chargement sont gérés ;
- l'interface fonctionne sur smartphone, tablette et desktop ;
- les traductions FR/MG sont présentes ;
- la documentation est mise à jour ;
- les changements sont relus et intégrés sans régression.

## 6. Stratégie de tests
- Unitaires : règles métier, validation, moteur de jeu.
- Intégration : API, Prisma, Redis, Socket.IO.
- E2E : visiteur, invité, lobby, salle, partie, résultat.
- Sécurité : contrôle d'accès, rejeu, abus, fuite d'informations privées.
- Performance : temps de réponse et connexions concurrentes réalistes.
- Manuels : Android/iOS navigateurs, tablette et desktop, réseau dégradé.

## 7. Déploiement
- Environnements distincts : local, staging, production.
- Secrets par environnement.
- Migrations contrôlées et réversibilité documentée.
- Logs structurés, métriques et alertes.
- Sauvegardes PostgreSQL et tests de restauration.
- Déploiement progressif et procédure de rollback.

## 8. Risques
- Les règles Domino non validées bloquent Sprint 5.
- La conversion invité/compte bloque les fonctions de persistance multi-appareil.
- Les politiques d'abandon et de reconnexion bloquent la recette complète.
- Toute fonction de monétisation est exclue de cette roadmap.
