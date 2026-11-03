# Kopaka Constitution

## Core Principles

### I. Architecture modulaire et maintenable

- Organiser le projet en modules clairement séparés et réutilisables.
- Respecter l'architecture monorepo définie dans le cahier des charges.
- Séparer les responsabilités entre frontend, backend, moteur de jeu et packages partagés.
- Éviter la duplication de code et les dépendances inutiles.
- Ne pas ajouter de complexité sans justification fonctionnelle ou technique.

### II. Sécurité et autorité du serveur

- Le serveur est l'unique autorité concernant l'état des parties et les résultats des jeux.
- Toute action de jeu doit être validée côté serveur.
- Ne jamais faire confiance aux données envoyées par le client.
- Protéger les informations privées des joueurs et les sessions.
- Prévenir les actions répétées, les manipulations d'état et les comportements frauduleux.
- Ne jamais exposer de secrets ou de clés dans le frontend.

### III. Qualité du code et tests obligatoires

- Écrire du code lisible, typé et documenté lorsque nécessaire.
- Utiliser TypeScript pour les applications et les packages concernés.
- Ajouter des tests unitaires pour les règles métier et les moteurs de jeu.
- Ajouter des tests d'intégration pour les communications entre services.
- Tester les scénarios critiques avant de considérer une fonctionnalité comme terminée.
- Corriger les régressions sans supprimer les fonctionnalités existantes.

### IV. Temps réel et fiabilité des parties

- Utiliser Socket.IO pour les communications temps réel.
- Garantir la cohérence de l'état d'une partie entre les joueurs.
- Prévoir les déconnexions, reconnexions et reprises de partie.
- Utiliser des identifiants d'action et des mécanismes d'idempotence lorsque nécessaire.
- Gérer les délais d'attente et les abandons selon les règles validées.
- Ne jamais considérer une action comme réussie avant sa confirmation par le serveur.

### V. Expérience utilisateur et accessibilité

- Concevoir une interface moderne, ludique, intuitive et cohérente.
- Adopter une approche mobile-first.
- Garantir une expérience adaptée aux smartphones, tablettes et ordinateurs.
- Respecter les principes UI/UX et les recommandations du skill UI UX Pro Max.
- Prévoir les états de chargement, erreurs, notifications et confirmations.
- Optimiser les performances pour les appareils modestes et les connexions mobiles limitées.
- Prendre en charge le français et le malagasy.

### VI. Simplicité et évolutivité

- Prioriser un MVP stable avant d'ajouter de nouveaux jeux.
- Ne pas implémenter les jeux futurs avant la validation du Domino.
- Prévoir une architecture permettant d'ajouter de nouveaux jeux sans réécrire le cœur de la plateforme.
- Favoriser les solutions simples, éprouvées et maintenables.

## Technology and Product Constraints

### Stack technique

- Frontend : Next.js, React, TypeScript, Tailwind CSS et shadcn/ui.
- Backend : Node.js et NestJS.
- Communication temps réel : Socket.IO.
- Base de données : PostgreSQL avec Prisma.
- Cache et présence : Redis.
- Gestion du monorepo : pnpm et Turborepo.

Toute modification importante de cette stack doit être justifiée et documentée avant son adoption.

### Périmètre du MVP

- Le jeu principal est le Domino à 2 et à 4 joueurs.
- Les règles exactes des variantes doivent être validées avant leur implémentation.
- L'accès invité doit être disponible.
- L'inscription doit rester facultative.
- Les langues initiales sont le français et le malagasy.
- Les points, XP et badges sont exclusivement virtuels.
- Aucun argent réel, dépôt, retrait, mise ou portefeuille monétaire ne doit être intégré.

### Protection des données et performances

- Valider les données entrantes côté serveur.
- Appliquer des permissions adaptées à chaque fonctionnalité.
- Limiter les requêtes abusives et les actions automatisées.
- Éviter les transferts de données inutiles.
- Prévoir une gestion correcte des erreurs et des journaux techniques.
- Ne jamais exposer les données sensibles dans les logs.

## Development Workflow

### Développement par phases et sprints

- Respecter le découpage en phases et sprints défini dans le plan du projet.
- Ne pas commencer un sprint sans comprendre ses objectifs et ses critères d'acceptation.
- Implémenter uniquement le périmètre demandé pour le sprint en cours.
- Vérifier les dépendances avec les sprints précédents.
- Mettre à jour la documentation lorsque les décisions ou l'architecture évoluent.

### Validation des fonctionnalités

Une fonctionnalité est considérée comme terminée uniquement lorsque :

- Les critères d'acceptation sont satisfaits.
- Les tests nécessaires passent.
- Aucun bug critique connu n'est introduit.
- L'interface est responsive.
- Les erreurs sont correctement gérées.
- La documentation concernée est mise à jour.

### Utilisation des compétences Codex

- Utiliser les skills Spec Kit pour structurer les spécifications, plans, tâches et implémentations.
- Utiliser UI UX Pro Max pour les décisions de conception et d'expérience utilisateur.
- Analyser le code existant avant toute modification.
- Préserver les fonctionnalités déjà validées.
- Ne pas effectuer de refonte globale non demandée.

## Governance

Cette constitution est la référence principale pour les décisions techniques et fonctionnelles du projet Kopaka.

Toute modification doit être justifiée, documentée et cohérente avec le cahier des charges.

En cas de contradiction entre une demande ponctuelle et les règles fondamentales du projet, identifier explicitement le conflit et demander une clarification avant de prendre une décision irréversible.

**Version**: 1.0.0  
**Ratified**: 2026-11-02  
**Last Amended**: 2026-11-02
