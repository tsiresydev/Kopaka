# Recherche — Sprint 2 Invité et lobby

Date : 2026-11-03. Entrée : [spécification](spec.md). Recherche documentaire et inspection du Sprint 1 ; aucun code modifié. Trois recherches distinctes ont couvert session/idempotence, cycle de vie/restauration et normalisation/UX. Les décisions ci-dessous sont techniques et ne remplacent aucune règle métier validée.

## 1. Architecture et dépendances

**Décision.** Conserver le monorepo et les versions verrouillées : Node 24.22.2, pnpm 10.8.0, TypeScript 6.0.3, Next 16.4.4, React 19.3.1, Nest 12.3.2, Prisma 7.10.1, PostgreSQL 17 et Redis 7.4. Ajouter un module invité Nest, les écrans Next et les schémas partagés. Redis ne devient pas la source d'autorité des identités ; aucune présence ni Socket.IO à introduire sans communication temps réel dans ce sprint.

**Justification.** Le socle possède déjà configuration, pool PostgreSQL, journaux filtrés, santé, composants, traductions et tests. Les comptes, salles et moteurs ne sont pas nécessaires au lobby consultatif.

**Alternatives.** JWT autonome rejeté : révocation et suppression immédiates exigent une autorité serveur. Nouveau service d'authentification, BFF supplémentaire et architecture de jeu anticipée rejetés comme complexité sans besoin courant.

## 2. Session, CSRF et plusieurs onglets

**Décision.** Secret opaque aléatoire de 32 octets dans un cookie HttpOnly, Secure en production, SameSite=Strict, Path=/, sans Domain. Seul son condensat est conservé dans la session PostgreSQL. Production sous HTTPS avec web/API du même site et origines explicitement autorisées. Développement uniquement sur loopback avec un nom de cookie distinct et Secure désactivé explicitement. Préférer les primitives Express/Node existantes ; tout éventuel parseur ajouté devra être épinglé et audité à l'implémentation.

Les mutations imposent Origin exact, JSON et un jeton CSRF lié à la preuve du navigateur. Le bootstrap anonyme exige un en-tête personnalisé et une pré-vérification CORS ; il ne crée pas d'identité. Les appels invités utilisent credentials=include ; les contrats de santé restent inchangés. Web Locks sérialise bootstrap/admission/récupération/entrée explicite au lobby/déconnexion entre onglets du même contexte ; BroadcastChannel signale seulement qu'une vérification passive est nécessaire. Aucun secret dans localStorage, URL, canal ou journaux.

**Justification.** Fermeture/réouverture et partage entre onglets sans considérer le pseudonyme comme preuve. Sans cookie préalable, le serveur ne peut déduire que deux requêtes initiales viennent du même navigateur ; le verrou navigateur évite ce double bootstrap sans empreinte ni adresse IP persistante. Vérifier Web Locks sur les trois navigateurs cibles ; une absence donne une indisponibilité explicite, pas une garantie fictive.

**Alternatives.** Jeton accessible à JavaScript, fingerprint et preuve par pseudonyme rejetés. SameSite seul ne remplace pas CSRF et validation Origin.

Sources : [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Web Locks — W3C](https://www.w3.org/TR/web-locks/).

## 3. Réponse perdue et création unique

**Décision.** Contexte anonyme préalable, clé d'idempotence et empreinte de la charge utile. Une transaction crée identité, session, consentement et reçu ensemble. Le secret de session est renouvelé à l'admission. Un reçu de récupération garde ce secret chiffré par AEAD, clé hors base, pendant une heure au maximum et jamais au-delà de la suppression de l'identité. Son accès exige la preuve du contexte et CSRF. Une relance restitue le même résultat/cookie ; une autre charge sur le contexte consommé est refusée. Un endpoint de récupération traite le rechargement après réponse perdue sans recréer d'identité.

**Justification.** Un simple hash du secret ne permet pas de réémettre le cookie si Set-Cookie a été perdu. Les reçus ne prolongent pas la durée de l'identité. Après suppression/expiration du contexte, aucune relance automatique de création : nouvelle intention explicite requise.

**Alternatives.** Secret dérivé de la clé d'idempotence et réutilisation du secret pré-authentification rejetés ; ils mélangent preuve et identifiant de requête ou empêchent la rotation de session.

## 4. Unicité, temps et transactions

**Décision.** Index UNIQUE déterministe sur la clé normalisée ; suppression transactionnelle préalable du détenteur expiré. Horloge de la base après acquisition des verrous, contrôle expiresAt <= maintenant avant tout renouvellement. Sérialiser les mutations invitées par verrou consultatif transactionnel PostgreSQL, puis verrouiller les lignes concernées dans un ordre constant. Essai de verrou borné, réponse temporaire en cas de contention, relances bornées avec la même clé d'idempotence. Ce choix simple pour un premier déploiement privilégie la cohérence ; mesurer avant de remplacer par une coordination plus fine.

**Justification.** Une unicité dépendant directement de now() ne peut pas être exprimée par un index partiel temporel. L'heure de début de transaction peut être antérieure à l'attente d'un verrou. Le pool actuel est borné : maintenir un budget invité séparé et une place pour la santé.

**Alternatives.** Vérification applicative sans index rejetée pour les courses. TTL Redis seul rejeté pour les suppressions et consentements relationnels.

Sources : [PostgreSQL 17 CREATE INDEX](https://www.postgresql.org/docs/17/sql-createindex.html), [fonctions temporelles](https://www.postgresql.org/docs/17/functions-datetime.html), [verrous](https://www.postgresql.org/docs/17/explicit-locking.html), [transactions Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).

## 5. Expiration, suppression et restauration

**Décision.** Refuser toute identité expirée à chaque autorisation. Programmer la purge à la prochaine échéance, ajouter balayage périodique, purge opportuniste et rattrapage avant ouverture des accès invités au démarrage. Aucun délai de conservation métier après expiration. Supprimer en cascade session, consentement et reçus.

Une sauvegarde peut contenir une identité supprimée ensuite. Prévoir un registre durable de non-restauration indépendant des sauvegardes PostgreSQL : HMAC de l'UUID aléatoire, date de suppression et motif technique, sans pseudonyme, preuve ni consentement. Écrire et synchroniser l'intention irrévocable avant la suppression SQL ; si la transaction échoue ensuite, l'intention interdit toute réactivation et impose le rattrapage. Ce registre est pseudonymisé, pas anonyme ; son usage est limité à la purge/restauration et sa conservation maximale est de 30 jours, alignée sur les sauvegardes. Les clés sont hors sauvegarde applicative et maintenues sur cette fenêtre. Voir le [contrat d'exploitation](contracts/operations.md).

**Limite explicite.** Aucun processus ne peut effacer physiquement une ligne à l'instant exact si la base ou le serveur est arrêté. Cela ne crée aucune grâce de 30 jours supplémentaire : accès refusé à l'échéance, purge dès reprise avant réouverture et mesure du retard de purge. Ne pas revendiquer une garantie d'effacement physique instantané pendant une panne. Cette limite doit figurer dans la recette opérationnelle.

**Alternatives.** Restaurer puis ouvrir avant purge, ou conserver les marques de suppression uniquement dans la même sauvegarde, rejetés : résurrection possible. Exclure toutes les identités des sauvegardes rejeté : perte non autorisée des identités encore valides. Aucun archivage personnel des acceptations.

Source : [sauvegardes logiques PostgreSQL 17](https://www.postgresql.org/docs/17/backup-dump.html).

## 6. Unicode et modération

**Décision.** Trois représentations séparées : affichage NFC avec espaces nettoyés ; unicité par décomposition, case folding Unicode complet et suppression des marques d'accent ; modération issue de cette clé avec retrait des séparateurs autorisés et uniquement les six substitutions validées. Égalité entière pour toutes les entrées. Longueur 3–20 graphèmes étendus après nettoyage ; lettres Unicode, chiffres décimaux, accents attachés, espaces admis, tiret ASCII et underscore. Rejeter contrôles, caractères invisibles/bidi et marques isolées.

Figer les données Unicode 17, correspondant au runtime observé (ICU 78.3), et versionner l'algorithme. Les clés restent du texte sans limite de 20 unités SQL : le case folding peut développer une lettre. Les contrôles navigateur sont indicatifs ; le serveur tranche. Une future évolution Unicode exige analyse de collisions et migration explicite.

**Justification.** Préserver les accents visibles et les distinctions de Q2 tout en détectant les seuls contournements validés. Une politique externe validée et remplacée atomiquement permet de faire évoluer les listes sans modifier le code métier.

**Alternatives.** Sous-chaînes, regex, NFKC, translittération d'autres alphabets ou substitutions supplémentaires rejetés car ils changeraient les règles validées. Les fixtures ne sont pas un corpus de production approuvé.

Source : [Unicode 17 CaseFolding](https://www.unicode.org/Public/17.0.0/ucd/CaseFolding.txt).

## 7. UX et ressources préalables

**Décision.** Réutiliser les composants Sprint 1 et les recommandations UI UX Pro Max : labels persistants, erreurs liées aux champs, focus stable, statuts annoncés, sélection Domino 2/4 au clavier. Déplacer la démonstration existante vers /foundation et conserver sa couverture. Appliquer MASTER v2, FR/MG, clair par défaut, préférences existantes, sans appel d'activité lors des effets React.

**Alternatives.** Faux lobby avec joueurs ou salons fictifs et navigation vers des parties inexistantes rejetés. Aucun compte anticipé.

## Conclusion de recherche

Les choix techniques sont résolus. Les textes et versions juridiques, le corpus initial de modération avec contre-exemples, leur approbation et la relecture des nouvelles traductions MG restent des dépendances de livraison prévues par la spécification. Les contenus manquants ferment l'admission ; ils ne sont ni inventés ni remplacés par des fixtures. Aucun changement métier, code, migration ou tâche d'implémentation produit par cette recherche.

## Complément après analyse — 2026-11-03

**Décision.** Distinguer expiresAt d'autorisation serveur et durée du cookie de preuve. Émettre le cookie invité avec Max-Age constant de 2592000 secondes sur admission, récupération valide et réponse d'activité initiale/rejouée ; jamais sur une lecture passive, sans Expires absolu concurrent. Les dates SQL restent immuables sur reprise/récupération. Même verrou navigateur pour toutes ces mutations ; état UI non régressif pour même UUID, contrôlé par lecture passive.

**Justification.** Une échéance absolue historique reçue après une réponse récente pourrait raccourcir la preuve navigateur. Le délai relatif constant évite cette régression par ordre de réception ; il peut laisser un cookie opaque après la fin de l'autorisation, sans créer de droit ni conserver l'identité. Une reprise réémet la preuve pour réparer la perte de la première réponse. Le serveur refuse toujours après sa propre échéance. Ce choix suppose que le navigateur conserve les cookies ; il ne contourne aucune suppression volontaire de stockage.

**Alternatives.** Réémettre une ancienne date Expires rejeté pour régression possible ; ne jamais réémettre de cookie lors d'une reprise rejeté car une réponse de renouvellement perdue laisserait la preuve trop courte. La validité d'identité n'est pas calée sur la réception réseau.

Source : [RFC 6265, Max-Age et traitement des cookies](https://httpwg.org/specs/rfc6265.html).

**Récupération.** Le bootstrap protège sa réponse par Origin/en-tête personnalisé et reconnaît explicitement le contexte consommé encore valide : état recoverable et restitution CSRF, puis recover. À l'expiration du reçu, refus explicite sans supprimer l'identité ni libérer le nom. Une nouvelle entrée est une intention utilisateur distincte. GET /guest/session est implémenté dès l'admission pour fournir la relecture nécessaire à la coordination et à l'accès direct ; US4 complète son raccordement et les frontières temporelles.
