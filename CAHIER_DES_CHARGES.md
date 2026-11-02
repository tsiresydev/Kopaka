# Cahier des charges fonctionnel et technique — Kopaka

**Version :** 1.0  
**Date :** 2 novembre 2026  
**Produit :** Kopaka — plateforme communautaire de jeux de société en ligne  
**Périmètre initial :** Domino à 2 et à 4 joueurs, gratuit.

---

## 1. Présentation du projet

Kopaka est une plateforme web permettant aux utilisateurs de Madagascar et, à terme, d'autres pays, de jouer en ligne à des jeux de société populaires. Le produit doit proposer une expérience simple, conviviale, rapide et adaptée aux smartphones, y compris sur des connexions mobiles modestes.

Le lancement se concentre sur le Domino à 2 et à 4 joueurs. L'architecture doit permettre d'ajouter de nouveaux jeux sans réécrire les fonctions communes de la plateforme.

### 1.1 Vision
Créer un espace de jeu en ligne accessible, fiable et convivial, favorisant les parties entre amis et les rencontres avec d'autres joueurs.

### 1.2 Objectifs
- Permettre de lancer rapidement une partie en mode invité.
- Permettre de créer facultativement un compte pour retrouver son profil et sa progression.
- Proposer des parties de Domino à 2 ou 4 joueurs en temps réel.
- Permettre de jouer avec des amis ou avec des joueurs trouvés automatiquement.
- Assurer la synchronisation fiable des parties et la reprise après une coupure réseau.
- Offrir une interface en français et en malagasy.
- Préparer l'ajout progressif de nouveaux jeux.

### 1.3 Hors objectifs du MVP
- Jeux d'argent, paris, mises, achats de crédits de jeu ou cash-out.
- Dépôts, retraits ou intégration Mobile Money pour des transactions de jeu.
- Récompenses ayant une valeur monétaire ou échangeables contre de l'argent ou des biens.
- Chat vocal/vidéo.
- Application native Android/iOS (le site doit toutefois être installable en PWA si cela est faisable sans compromettre le MVP).
- Catalogue complet des jeux envisagés à long terme.

---

## 2. Public cible et plateformes

### 2.1 Utilisateurs
- Visiteurs souhaitant jouer sans créer de compte.
- Joueurs disposant d'un compte facultatif.
- Joueurs souhaitant retrouver leurs amis, statistiques et progression.
- Administrateurs et modérateurs chargés de la sécurité et de la qualité de service.

### 2.2 Appareils
- Smartphone : priorité de conception.
- Tablette : interface adaptée aux écrans intermédiaires.
- Ordinateur : expérience complète.
- Navigateurs récents : Chrome, Edge, Firefox et Safari, sous réserve des tests de compatibilité.

### 2.3 Contraintes réseau
- Limiter les échanges réseau au strict nécessaire.
- Prévoir reconnexion automatique et reprise de session.
- Afficher un état clair en cas de réseau lent ou perdu.
- Éviter les animations lourdes et permettre de réduire les animations.
- Ne pas dépendre d'une connexion permanente pour afficher les écrans publics et les données déjà chargées.

---

## 3. Parcours utilisateur

### 3.1 Première visite
1. L'utilisateur arrive sur la page d'accueil.
2. Il choisit sa langue (français ou malagasy), avec une préférence mémorisée localement.
3. Il choisit « Jouer en invité » ou « Créer un compte / Se connecter ».
4. En mode invité, il saisit un pseudonyme et accepte les conditions d'utilisation et la politique de confidentialité.
5. Il accède au lobby et au catalogue des jeux disponibles.
6. Il choisit Domino à 2 ou Domino à 4.
7. Il choisit une partie rapide, une salle publique ou une salle privée.
8. Il rejoint une salle et attend les autres joueurs si nécessaire.
9. La partie commence lorsque les conditions de démarrage sont réunies.
10. À la fin, un écran de résultat présente le score et les récompenses virtuelles éventuelles.

### 3.2 Compte facultatif
Un visiteur peut créer un compte ou rattacher son identité invitée à un compte, si cette fonction est retenue après définition du mécanisme de récupération. Le compte permet notamment de conserver profil, amis, statistiques et progression sur plusieurs appareils.

**À VALIDER :** méthode d'authentification (email/mot de passe, lien magique, téléphone ou fournisseur externe), vérification de contact, récupération de compte et procédure de fusion d'un compte invité.

### 3.3 Jouer avec des amis
- Un joueur connecté peut créer une salle privée.
- Le système génère un code ou un lien d'invitation non devinable.
- Les invités peuvent rejoindre selon les règles d'accès définies.
- Le propriétaire peut démarrer la partie lorsque les places requises sont occupées.
- La salle peut être configurée pour 2 ou 4 joueurs selon le mode sélectionné.

### 3.4 Matchmaking
- Le joueur choisit le mode à 2 ou à 4.
- Le système cherche une salle compatible ou crée une nouvelle salle d'attente.
- Le joueur peut annuler sa recherche.
- Le serveur empêche qu'un joueur soit affecté simultanément à plusieurs parties actives.
- Le système informe le joueur de l'état : recherche, salle trouvée, attente des joueurs, partie en cours.

---

## 4. Exigences fonctionnelles

Priorités : **P0** indispensable au MVP ; **P1** utile pour la première version publique ; **P2** évolution.

### 4.1 Accueil et navigation
- FR-001 (P0) : afficher clairement la proposition de valeur et le bouton de jeu.
- FR-002 (P0) : proposer français et malagasy.
- FR-003 (P0) : permettre le mode invité sans création de compte.
- FR-004 (P0) : proposer l'inscription et la connexion sans les imposer.
- FR-005 (P0) : présenter les jeux disponibles et l'état « bientôt disponible » des jeux non encore livrés.
- FR-006 (P1) : afficher le nombre de joueurs en ligne, avec une valeur calculée côté serveur et une indication si elle est approximative.

### 4.2 Profil et identité
- FR-010 (P0) : attribuer un identifiant technique unique à chaque identité invitée.
- FR-011 (P0) : permettre de choisir un pseudonyme soumis à validation.
- FR-012 (P0) : filtrer les pseudonymes inappropriés et empêcher l'usurpation de noms réservés.
- FR-013 (P1) : permettre la création d'un compte facultatif.
- FR-014 (P1) : afficher avatar, pseudonyme, niveau et statistiques publiques.
- FR-015 (P1) : permettre la déconnexion et la suppression du compte selon la politique de conservation définie.

### 4.3 Lobby et catalogue
- FR-020 (P0) : afficher les jeux actifs.
- FR-021 (P0) : proposer Domino à 2 et Domino à 4 comme deux modes distincts.
- FR-022 (P0) : afficher les règles essentielles avant la partie.
- FR-023 (P1) : afficher les salles publiques disponibles et leurs places restantes.
- FR-024 (P1) : proposer filtres par jeu, format et type de salle.

### 4.4 Salles
- FR-030 (P0) : créer une salle publique compatible avec le mode choisi.
- FR-031 (P0) : rejoindre une salle disponible.
- FR-032 (P1) : créer une salle privée et générer un code/lien d'invitation.
- FR-033 (P0) : quitter une salle avant le début.
- FR-034 (P0) : empêcher le dépassement du nombre de joueurs autorisé.
- FR-035 (P0) : définir une politique d'expiration des salles inactives.
- FR-036 (P1) : permettre à l'hôte de fermer une salle ou de lancer la partie si les conditions sont réunies.

### 4.5 Partie en temps réel
- FR-040 (P0) : le serveur est l'autorité unique sur l'état de la partie.
- FR-041 (P0) : valider chaque action de jeu côté serveur.
- FR-042 (P0) : diffuser à chaque joueur uniquement les informations qu'il est autorisé à voir.
- FR-043 (P0) : rejeter les actions hors tour, invalides, dupliquées ou périmées.
- FR-044 (P0) : synchroniser l'état de la partie entre joueurs.
- FR-045 (P0) : gérer la déconnexion temporaire et la reconnexion.
- FR-046 (P0) : définir un délai de grâce avant de déclarer un joueur absent ou d'appliquer une règle de remplacement.
- FR-047 (P0) : conserver un historique minimal des actions pour audit et diagnostic.
- FR-048 (P0) : terminer la partie et calculer le résultat exclusivement côté serveur.
- FR-049 (P1) : proposer une revanche ou une nouvelle partie avec les mêmes joueurs.

### 4.6 Résultats et progression
- FR-050 (P0) : afficher le résultat, les joueurs et le score de la partie.
- FR-051 (P1) : enregistrer les statistiques des comptes.
- FR-052 (P1) : attribuer XP, points ou badges virtuels selon des règles transparentes.
- FR-053 (P1) : afficher un classement sans présenter les points comme une valeur monétaire.
- FR-054 (P1) : limiter les abus de farming, parties arrangées et automatisations.

### 4.7 Communauté
- FR-060 (P1) : rechercher un joueur par pseudonyme.
- FR-061 (P1) : envoyer, accepter et refuser une demande d'ami.
- FR-062 (P1) : afficher les amis en ligne et leur statut de disponibilité.
- FR-063 (P1) : inviter un ami dans une salle.
- FR-064 (P2) : notifications internes.
- FR-065 (P2) : chat textuel avec signalement, blocage, limitation de débit et modération.

### 4.8 Administration et modération
- FR-070 (P0) : disposer d'un espace d'administration protégé par rôles.
- FR-071 (P0) : consulter l'état des services, salles et parties actives.
- FR-072 (P1) : suspendre un compte ou une identité abusive.
- FR-073 (P1) : consulter les signalements et prendre une décision tracée.
- FR-074 (P1) : consulter les journaux d'événements techniques sans exposer les secrets.
- FR-075 (P1) : configurer les paramètres non sensibles des jeux sans redéploiement, si l'architecture le permet.

---

## 5. Règles métier transversales

1. Le mode invité est réellement jouable sans inscription.
2. Une identité invitée est liée à une session sécurisée ; un simple pseudonyme ne constitue pas une preuve d'identité.
3. Un joueur ne peut avoir qu'une seule partie active à la fois, sauf décision produit explicite contraire.
4. Le serveur valide l'ordre des tours, les actions, le score et la fin de partie.
5. Les clients ne peuvent jamais imposer un résultat ou modifier directement un score.
6. Les données privées d'un joueur ne sont jamais envoyées aux autres joueurs.
7. Les points et récompenses du MVP sont purement virtuels, non transférables, non convertibles et sans valeur monétaire.
8. Les règles exactes des variantes de Domino sont versionnées et documentées.
9. Toute action sensible (sanction, suppression, changement de rôle) est journalisée.
10. Les comportements en cas d'abandon, d'égalité, de blocage et de reconnexion doivent être définis avant la mise en production du jeu concerné.

---

## 6. Exigences UX/UI

- Design moderne, ludique et distinctif, sans surcharge visuelle.
- Approche mobile-first ; interface responsive smartphone, tablette et desktop.
- Navigation principale simple : Accueil, Jouer, Amis (si activé), Profil.
- Boutons d'action larges et faciles à toucher sur mobile.
- Contrastes accessibles et états de focus visibles.
- États de chargement, vide, erreur, succès, connexion perdue et reconnexion clairement conçus.
- Animations courtes et légères ; respect de `prefers-reduced-motion`.
- Écrans de jeu optimisés pour éviter les erreurs de toucher.
- Prévoir les textes français et malagasy sans texte tronqué.
- Prévoir une stratégie de traduction centralisée ; aucune chaîne UI importante codée en dur dans les composants.
- Palette indicative à valider : navy `#171B38`, violet `#6558E8`, turquoise `#16B8A6`, orange `#FFB547`, fond `#F5F6FA`. Les couleurs doivent être vérifiées pour le contraste.

---

## 7. Architecture technique cible

### 7.1 Stack
- Frontend : Next.js, React, TypeScript.
- UI : Tailwind CSS et shadcn/ui, avec composants métier propres à Kopaka.
- Backend : Node.js avec NestJS.
- Temps réel : Socket.IO.
- Base relationnelle : PostgreSQL.
- ORM/migrations : Prisma.
- Cache, présence et files temporaires : Redis.
- Tests : Vitest/Jest selon les packages ; Playwright pour les parcours navigateur.
- Environnement : Docker Compose en développement ; CI/CD avec lint, typecheck, tests et build.

### 7.2 Organisation recommandée
Monorepo pnpm + Turborepo :
- `apps/web` : application Next.js.
- `apps/api` : API NestJS et passerelle Socket.IO.
- `packages/game-engine` : contrats et moteur de jeu commun.
- `packages/game-engine-domino` : règles et moteur Domino versionnés.
- `packages/shared-types` : types partagés.
- `packages/validation` : schémas de validation partagés.
- `packages/ui` : composants UI communs.
- `prisma` ou `apps/api/prisma` : schéma et migrations.
- `infra` : Docker, Redis, scripts d'exploitation.
- `docs` : documentation fonctionnelle, architecture et règles.

### 7.3 Modules backend
- AuthModule : sessions invitées, inscription, connexion, récupération.
- UsersModule : profils et pseudonymes.
- GamesModule : catalogue et configuration des jeux.
- RoomsModule : création, admission et cycle de vie des salles.
- MatchmakingModule : recherche de partenaires.
- GameSessionsModule : orchestration des parties.
- RealtimeModule : événements Socket.IO et présence.
- FriendsModule : relations sociales.
- LeaderboardsModule : classements et progression.
- NotificationsModule : notifications internes.
- ModerationModule : signalements et sanctions.
- AdminModule : administration.
- HealthModule : readiness, liveness et métriques.

### 7.4 Modèle de données indicatif
- User : compte durable, email/téléphone éventuellement vérifié, statut, dates.
- GuestIdentity : identifiant invité, pseudonyme, dates d'expiration et de conversion.
- UserProfile : avatar, langue, préférences publiques.
- Game : code, nom, version de règles, statut.
- GameRoom : code, visibilité, mode, statut, propriétaire, expiration.
- RoomPlayer : joueur, siège, statut de connexion.
- GameSession : partie, version du moteur, état, début/fin.
- GameAction : action, séquence, acteur, horodatage, idempotency key.
- GameResult : score final et résultat validé.
- Friendship : demande et statut.
- Achievement / UserAchievement : récompenses virtuelles.
- Report / ModerationAction : signalements et décisions.
- AuditLog : actions administratives et événements sensibles.

Les données de jeu temporaires et la présence peuvent être conservées dans Redis, tandis que les résultats et données durables sont persistés dans PostgreSQL.

### 7.5 Contrat temps réel
Événements possibles :
- Client → serveur : `room:join`, `room:leave`, `matchmaking:join`, `matchmaking:cancel`, `game:action`, `game:reconnect`.
- Serveur → client : `room:updated`, `matchmaking:status`, `game:started`, `game:state`, `game:action-rejected`, `game:finished`, `player:disconnected`, `player:reconnected`.

Chaque commande doit contenir un identifiant de requête, un identifiant de salle/partie et, lorsque pertinent, la version d'état attendue. Le serveur répond de manière idempotente et refuse les versions périmées.

### 7.6 Sécurité
- Validation serveur de toutes les entrées.
- Sessions sécurisées ; cookies `HttpOnly`, `Secure`, `SameSite` lorsque l'authentification web le permet.
- Protection CSRF selon le mode d'authentification.
- Limitation de débit sur création de compte, pseudonymes, matchmaking et événements.
- Contrôle d'accès par rôle et par ressource.
- Secrets uniquement côté serveur et dans un gestionnaire de secrets.
- CORS restrictif, CSP et en-têtes de sécurité.
- Journalisation sans mots de passe, jetons ni données sensibles.
- Protection contre rejeu d'actions, usurpation de salle, triche et accès horizontal.
- Dépendances auditées et mises à jour régulières.
- Politique de sauvegarde et test de restauration.

---

## 8. Exigences non fonctionnelles et critères de qualité

- NFR-001 : interface utilisable sur écran mobile étroit sans défilement horizontal non voulu.
- NFR-002 : temps de chargement initial optimisé ; mesurer les Core Web Vitals sur appareils réels.
- NFR-003 : le serveur est la source de vérité pour chaque partie.
- NFR-004 : reconnexion avec restauration d'état sans rejouer une action déjà acceptée.
- NFR-005 : disponibilité et erreurs observables par logs structurés, métriques et alertes.
- NFR-006 : tests unitaires des règles de jeu et tests d'intégration des flux de partie.
- NFR-007 : tests E2E des parcours invité, matchmaking, salle privée et fin de partie.
- NFR-008 : traduction complète des parcours P0 en français et malagasy.
- NFR-009 : conformité aux bonnes pratiques de confidentialité et minimisation des données.
- NFR-010 : architecture permettant d'ajouter un jeu via un moteur/adapter sans modifier les modules communs.

---

## 9. Tests et recette du MVP

Le MVP est accepté lorsque :
1. Un visiteur peut entrer en invité, choisir un pseudonyme et rejoindre le lobby.
2. Il peut démarrer ou rejoindre une recherche Domino à 2 et une recherche Domino à 4.
3. Une salle ne dépasse jamais le nombre de sièges permis.
4. Les actions invalides ou hors tour sont refusées côté serveur.
5. Tous les clients voient un état cohérent après chaque action.
6. Une coupure réseau temporaire peut être suivie d'une reconnexion et d'une reprise cohérente.
7. Le résultat final est calculé côté serveur et persistant.
8. Les parcours principaux sont utilisables en français et en malagasy.
9. Le parcours fonctionne sur smartphone, tablette et ordinateur.
10. Aucun mécanisme de mise, dépôt, retrait ou gain monétaire n'est présent.
11. Les tests automatiques P0 passent et aucune vulnérabilité critique connue ne reste sans traitement.

---

## 10. Roadmap indicative

Estimation de cadrage pour une petite équipe expérimentée ; à réestimer après le plan technique détaillé.

| Phase | Sprints | Livrable |
|---|---|---|
| 0 — Cadrage | Sprint 0 | règles, parcours, architecture, décisions |
| 1 — Fondations | Sprints 1–2 | monorepo, CI, UI shell, API, DB, sessions invitées, i18n |
| 2 — Salles et temps réel | Sprints 3–4 | présence, salles, matchmaking, reconnexion |
| 3 — Domino | Sprints 5–6 | moteur à 2 et 4 joueurs, UI de jeu, scores, tests |
| 4 — Communauté | Sprint 7 | comptes facultatifs, profil, amis de base |
| 5 — Progression | Sprint 8 | statistiques, XP/badges/classements |
| 6 — Qualité et bêta | Sprint 9 | administration minimale, sécurité, observabilité, bêta |

Ne pas commencer Ludo avant que le Domino soit stable et que le système d'extension de jeux soit validé.

---

## 11. Risques et mesures

- Règles Domino ambiguës : produire un document de règles validé et des exemples de parties avant le moteur.
- Réseau instable : reconnexion, snapshots versionnés, commandes idempotentes et tests réseau dégradé.
- Triche : moteur autoritaire, validation stricte et journal d'actions.
- Complexité prématurée : limiter le MVP au Domino et aux fonctions communes nécessaires.
- Mode invité abusif : limites de débit, durée de session, contrôles anti-spam et mécanisme de conversion facultatif.
- Coûts d'exploitation : mesurer les connexions simultanées, optimiser Socket.IO/Redis et définir des limites de capacité.
- Cadre juridique : maintenir le MVP sans argent réel et faire vérifier les règles applicables à la plateforme, aux tournois et aux points virtuels par un juriste malgache avant toute évolution vers une monétisation.

---

## 12. Évolutions possibles après le MVP
- Ludo.
- Rami.
- Faritany.
- Jeux de Point.
- Tri.
- Loto gratuit.
- Tournois gratuits et événements communautaires.
- PWA et éventuellement applications natives.
- Chat textuel modéré.

Chaque jeu doit disposer de ses propres règles versionnées, tests de moteur et critères de recette.
