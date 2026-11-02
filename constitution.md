# Constitution du projet Kopaka

Version : 1.0

Ces principes sont obligatoires pour toute spécification, conception, implémentation et revue de code.

## Article 1 — Produit gratuit au lancement
Kopaka démarre comme une plateforme de jeux gratuits. Aucun pari, mise, dépôt, retrait, portefeuille de jeu ou gain monétaire ne doit être développé dans le MVP. Les points, XP et badges sont virtuels, non transférables et non convertibles.

## Article 2 — Mobile-first et accessibilité
Toute fonctionnalité doit être pensée d'abord pour smartphone, puis adaptée à la tablette et au desktop. Les interfaces doivent rester utilisables avec une connexion lente et respecter les préférences de réduction des animations.

## Article 3 — Bilinguisme
Les parcours P0 doivent être disponibles en français et en malagasy. Les chaînes UI doivent passer par un système i18n centralisé ; aucune traduction métier ne doit être dispersée dans les composants.

## Article 4 — Mode invité prioritaire
Un utilisateur doit pouvoir jouer sans inscription. L'inscription est facultative et doit apporter une valeur claire (sauvegarde du profil, amis, progression multi-appareil). La session invitée doit être sécurisée et ne pas reposer uniquement sur le pseudonyme.

## Article 5 — Serveur autoritaire
Pour tout jeu multijoueur, le serveur est la source de vérité. Le client ne décide jamais de la validité d'un coup, du score, du tour ou du résultat. Toute action est validée, séquencée et journalisée selon les besoins.

## Article 6 — Séparation des moteurs de jeu
Les règles d'un jeu sont isolées dans un moteur indépendant des composants UI et des transports réseau. Les règles sont versionnées, testables et documentées. L'ajout d'un jeu ne doit pas fragiliser les jeux existants.

## Article 7 — Sécurité et confidentialité
Validation côté serveur, contrôle d'accès par ressource, limitation de débit, secrets hors du client, logs sans secrets, minimisation des données et protection contre la triche sont obligatoires.

## Article 8 — Fiabilité temps réel
Les événements temps réel doivent être idempotents lorsque nécessaire, versionnés et résistants aux duplications et à la reconnexion. Un joueur ne doit pas pouvoir effectuer deux actions concurrentes dans une même séquence de tour.

## Article 9 — Qualité logicielle
Chaque fonctionnalité doit avoir des critères d'acceptation et des tests adaptés. Lint, format, typecheck, tests et build doivent passer en CI. Aucun sprint ne se termine avec une régression P0 connue non traitée.

## Article 10 — UX cohérente
Les états vide, chargement, erreur, succès, hors ligne et reconnexion sont conçus explicitement. Les contrôles tactiles sont suffisamment grands, les retours d'action sont clairs et les animations restent légères.

## Article 11 — Évolutivité pragmatique
Privilégier une architecture modulaire simple. Ne pas introduire de microservices, de complexité d'infrastructure ou de fonctionnalités sociales avancées sans besoin démontré.

## Article 12 — Décisions explicites
Toute hypothèse métier non confirmée est marquée « À VALIDER ». L'agent de développement ne doit pas inventer les règles locales du Domino, les politiques de sanction, les seuils de score ou les méthodes d'authentification.

## Gouvernance des changements
Toute dérogation à un article doit être documentée avec justification, impact, risques et validation explicite du propriétaire du produit.
