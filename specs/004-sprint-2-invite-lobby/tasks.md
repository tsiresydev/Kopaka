# Tasks: Sprint 2 — Invité et lobby

**Input** : [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contrats](contracts/http.md) et [quickstart.md](quickstart.md).

**État** : généré le 2026-11-03 ; premier incrément T001–T005 terminé et vérifié. 5/80 tâches cochées, 75 restantes ; aucune fonctionnalité invitée encore livrée. Voir [validation.md](validation.md). Branche existante `main` conservée. T001–T080 sont locaux à cette fonctionnalité, distincts des identifiants Sprint 1.

**Tests** : explicitement requis par S2-FR20, S2-SC07 et les scénarios de la spécification. Écrire les tests ciblés avant la logique correspondante, constater leur échec pertinent puis les faire passer. Les fixtures ne prouvent pas une livraison en production.

**Organization** : `[US1]` à `[US6]` correspondent à S2-US01 à S2-US06. Toutes restent P0 (P0 pour l'entrée de US6), sans reclassification. Les prérequis partagés précèdent les stories. Les dépendances de bout en bout sont explicites plus bas.

## Format et conventions

`- [ ] Tnnn [P éventuel] [USn pour les stories] Action avec chemin de fichier`

Les chemins sont relatifs à la racine ; les nouveaux fichiers seront créés à l'implémentation. `[P]` permet un travail sur fichiers distincts après les prérequis de sa vague, jamais un lancement global. Les écritures dans un même fichier restent séquentielles.

Ne pas refaire le Sprint 1 ni installer une nouvelle stack. Aucun compte, salle, présence, matchmaking, chat ou jeu. Aucun contenu juridique ou corpus inventé présenté comme approuvé. Les tâches d'approbation restent ouvertes sans preuve du propriétaire ; poursuivre les travaux indépendants avec fixtures isolées.

## Phase 1: Setup — préparation commune

**But** : préparer l'extension du dépôt et ses preuves sans réinitialiser le socle.

- [X] T001 Établir l'état initial et la matrice de recette dans `specs/004-sprint-2-invite-lobby/validation.md` : référencer les acquis Sprint 1, relever les modifications existantes sans les écraser et lier chacun des 51 scénarios US01.1–US06.4 et chaque S2-FR/NFR/SC aux tâches et preuves futures ; séparer observé, confirmation propriétaire et non exécuté.
- [X] T002 [P] Préparer les fixtures déterministes dans `apps/api/test/fixtures/guest.ts` et `tests/e2e/fixtures/guest.ts` : dates contrôlées uniquement en test, visiteurs indépendants, noms Unicode/contre-exemples, documents et politique étiquetés non approuvés pour production ; nettoyage limité à la recette.
- [X] T003 [P] Documenter formats, références d'approbation et stockage privé dans `docs/guest-content.md`, avec exemples factices dans `apps/api/test/fixtures/guest-content/` : documents FR/MG, versions et corpus configurable ; aucun texte juridique ou lexique de production inventé.
- [X] T004 Adapter si nécessaire la découverte des nouveaux tests dans `apps/api/test/jest.config.mjs`, `vitest.config.ts` et `playwright.config.ts` : conserver ESM, trois navigateurs et tests existants ; bases isolées, sans changement de versions non nécessaire.
- [X] T005 Consigner les conventions dans `docs/development.md` : consulter `apps/web/AGENTS.md` et les guides Next locaux pertinents avant le code web, utiliser UI UX Pro Max pour les décisions UI, réutiliser MASTER v2 et les composants ; conserver CSP, préférences et diagnostic Sprint 1.

**Checkpoint** : environnement et preuves identifiés, fixtures séparées des ressources approuvées.

## Phase 2: Foundational — prérequis bloquants

**But** : contrats typés, stockage, preuves et suppression sûre avant les parcours.

- [ ] T006 [P] Définir les tests privés de configuration dans `apps/api/src/config/guest-config.spec.ts` : clés absentes, chemins invalides, HTTPS/local loopback, GUEST_ENABLED fermé, bornes et budget pool quatre ; aucune valeur privée dans les erreurs, valeurs de `contracts/operations.md` respectées.
- [ ] T007 [P] Définir les tests de DTO stricts dans `packages/validation/src/guest.spec.ts` : SessionView discriminée, BootstrapView active/anonymous/recoverable avec entryCsrfToken seulement dans les deux dernières variantes, bootstrap `{}` ou `{intent:"new_entry"}`, GuestView, refus des champs inattendus, consentAccepted:true, UUID d'idempotence et field limité à nickname|consent ; aucun secret/corpus exporté.
- [ ] T008 Ajouter dans `prisma/schema.prisma` et `prisma/migrations/0002_guest_identity/migration.sql` les contraintes exactes : GuestIdentity « UUID aléatoire ; displayName ; uniqueKey TEXT avec collation déterministe C et UNIQUE ; normalizationVersion ; moderationPolicyVersion ; createdAt ; lastActivityAt ; expiresAt ; termsVersion ; privacyVersion ; acceptedAt » ; GuestSession « UUID ; guestId UNIQUE ; tokenHash UNIQUE ; createdAt », « FK GuestIdentity ON DELETE CASCADE » ; GuestAdmissionContext « UUID ; tokenHash UNIQUE ; createdAt ; expiresAt ; consumed booléen ; guestId nullable », cascade après admission. Préserver migration 0001, PlatformBootstrap et schemaVersion=1.
- [ ] T009 Compléter `prisma/schema.prisma` et `prisma/migrations/0002_guest_identity/migration.sql` : GuestAdmissionReceipt « contextId UNIQUE ; guestId ; idempotencyHash ; payloadHash ; ciphertext ; nonce ; tag ; keyId ; createdAt ; expiresAt », « FK contexte et identité avec cascade », « Durée maximale une heure et suppression avec identité » ; GuestOperationReceipt « guestId ; kind=lobby_entry ; idempotencyHash ; payloadHash ; acceptedAt ; resultingExpiresAt ; expiresAt », « UNIQUE(guestId,kind,idempotencyHash), cascade invitée » et « Conservation technique de dix minutes maximum ; relance identique sans nouveau renouvellement ». Dates UTC, consentement uniquement sur l'identité active sans archive personnelle séparée.
- [ ] T010 Implémenter la configuration validée dans `apps/api/src/config/guest-config.ts`, `apps/api/src/config/config.module.ts` et `apps/api/.env.example` : clés CSRF/HMAC/AEAD privées, chemins externes, GUEST_ENABLED, origines/cookies locaux, limites et budget connexions ; exemples sans secrets réels, faire passer T006 sans changer la santé.
- [ ] T011 Implémenter les schémas dans `packages/validation/src/guest.ts`, exports `packages/validation/src/index.ts` et types `packages/shared-types/src/guest.ts` / `packages/shared-types/src/index.ts` ; garder les règles privées derrière `packages/validation/src/server.ts` et browser:null dans `packages/validation/package.json` ; faire passer T007.
- [ ] T012 Tester réellement migration, index UNIQUE, nullabilité et cascades dans `apps/api/test/guest-storage.integration-spec.ts` sur PostgreSQL isolé : toutes contraintes T008–T009, clés normalisées non limitées à 20 unités SQL, aucune acceptation après suppression et singleton Sprint 1 compatible ; corriger la migration avant de poursuivre.
- [ ] T013 [P] Implémenter et tester secrets opaques 32 octets, condensats de preuve, CSRF HMAC lié au cookie, cookies production __Host-/Secure/HttpOnly/SameSite=Strict/Path=/ sans Domain et mode local distinct dans `apps/api/src/guest/guest-crypto.ts` / `apps/api/src/guest/guest-crypto.spec.ts` ; cookie invité Max-Age=2592000 sans Expires absolu, durée du contexte distincte ; rotation à l'admission et reçu AEAD avec AAD lié au contexte/charge/version, aucune clé exposée.
- [ ] T014 [P] Implémenter et tester `apps/api/src/guest/deletion-ledger.ts` / `apps/api/src/guest/deletion-ledger.spec.ts` : « HMAC(UUID), deletedAt, reason=logout|expiry », stockage durable indépendant de PostgreSQL, « sans nom/session/consentement ; maximum 30 jours » ; fsync avant suppression, intention irrévocable, contrôle de continuité et échec fermé sans fuite de secret.
- [ ] T015 Implémenter transactions/suppression dans `apps/api/src/guest/guest-store.ts` / `apps/api/src/guest/guest-deletion.service.ts`, tests dans `apps/api/test/guest-deletion.integration-spec.ts` : verrou consultatif transactionnel commun non bloquant, clock_timestamp() après verrous, bornes/reprises configurées, registre durable avant DELETE/cascades/commit, purge du détenteur expiré avant réattribution ; intention durable prioritaire même après rollback SQL.
- [ ] T016 Implémenter et tester `apps/api/src/guest/guest-maintenance.service.ts` / `apps/api/test/guest-maintenance.integration-spec.ts` : rattrapage au démarrage, prochaine échéance, balayage de secours une seconde, purge opportuniste des identités/contextes/reçus et budget borné ; aucun délai métier de conservation, accès fermés si rattrapage non sûr, limite physique pendant arrêt explicitée.
- [ ] T017 Scinder HTTP dans `apps/api/src/common/configure-http.ts`, ajouter `apps/api/src/guest/guest-http.guard.ts`, `apps/api/src/guest/guest-exception.filter.ts` et `apps/api/test/guest-http.integration-spec.ts` : CORS par route, Origin exact, JSON strict <=16 KiB, bootstrap à en-tête personnalisé, CSRF, no-store et erreurs enum ; préserver CORS/schémas/credentials=omit des deux endpoints de santé.
- [ ] T018 Ajouter et tester `apps/api/src/guest/guest-limit.guard.ts` / `apps/api/src/guest/guest-limit.guard.spec.ts` : bootstrap 30/min/IP, admission 10/min/IP et contexte, activité 60/min/session, cache éphémère 4096 entrées, concurrence/budget pool, 429 Retry-After positif ; aucun log IP, sanction métier, réservation ou prolongation induite.
- [ ] T019 Assembler `apps/api/src/guest/guest.module.ts` dans `apps/api/src/app.module.ts`, tests `apps/api/test/guest-availability.integration-spec.ts` : garde fermé si configuration/contenus/registre non prêts, intentions de suppression contrôlées avant reconnaissance, dépendances privées injectables et santé Sprint 1 inchangée ; aucun module comptes/jeu.

**Checkpoint** : stockage/suppression vérifiés, secrets confinés et admission fermée sans ressources approuvées. Développement des stories autorisé sur fixtures isolées selon le graphe.

## Phase 3: User Story 1 — Comprendre l'accueil et choisir sa langue (P0)

**Goal** : accueil produit utilisable sans API invitée et préférences préservées.

**Independent Test** : ouvrir / sans identité puis API indisponible ; vérifier offre gratuite, CTA /invite, FR/MG, préférences et stockage refusé ; retrouver /foundation. Couvre US01.1–5 ; ouverture effective du formulaire sans création vérifiée avec US2.

### Tests

- [ ] T020 [P] [US1] Écrire `apps/web/tests/landing.test.tsx` : FR/clair initial, MG, noms accessibles, CTA invité, stockage indisponible et contenu lisible sans service d'identité ; aucun bootstrap/admission sur simple affichage de l'accueil.
- [ ] T021 [P] [US1] Écrire `tests/e2e/landing.spec.ts` : accueil /, destination du lien /invite, FR/MG, préférences, API coupée et clavier ; assertions autonomes avant disponibilité du formulaire, puis navigation réelle réexécutée après T033.

### Implémentation

- [ ] T022 [US1] Conserver la démonstration dans `apps/web/src/app/foundation/page.tsx` réutilisant `apps/web/src/features/foundation/foundation-page.tsx` ; réadresser ses assertions dans `tests/e2e/foundation.spec.ts`, `tests/e2e/preferences.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/health-real.spec.ts` et `tests/e2e/health-simulated.spec.ts` sans retirer de couverture Sprint 1.
- [ ] T023 [US1] Ajouter les textes centralisés FR/MG dans `apps/web/src/lib/i18n/guest.ts` et brancher `apps/web/src/lib/i18n/index.ts` : clés typées accueil/formulaire/documents/session/lobby/compte/erreurs ; nouvelles traductions à relire, langues sans drapeau, textes déjà approuvés conservés.
- [ ] T024 [US1] Créer `apps/web/src/features/landing/landing-page.tsx` et remplacer `apps/web/src/app/page.tsx` : providers/composants existants, MASTER v2, CTA >=56 px, SSR FR/clair et CSP conservés, aucun faux compteur ni création automatique de session.
- [ ] T025 [US1] Faire passer T020–T021 au niveau accueil et les tests foundation réadressés, consigner résultats dans `specs/004-sprint-2-invite-lobby/validation.md` ; ne pas prétendre valider le formulaire ou l'admission encore absents.

**Checkpoint** : accueil autonome démontrable ; l'accès invité réel n'est pas encore livré.

## Phase 4: User Story 2 — Choisir un pseudonyme et accepter les documents (P0)

**Goal** : règles exactes de nom, politique modifiable et consentement explicite avant admission.

**Independent Test** : normalisation/collision sur fixtures PostgreSQL, 2/3/20/21 graphèmes, corpus/contre-exemples, consultation/retour sans perte et refus sans création. Le succès d'admission réel est testé avec US3. Couvre US02.1–16.

### Tests

- [ ] T026 [P] [US2] Écrire `packages/validation/src/server/nickname.spec.ts` : exemples de `contracts/nickname.md`, limites 2/3/20/21 graphèmes après nettoyage, accents composés/décomposés, lettres/chiffres/espaces/tirets/underscores autorisés, contrôles/invisibles refusés ; Ad_m1n refusé pour Admin, Supporter et Admin123 non refusés pour ces seules entrées ; aucune substitution supplémentaire.
- [ ] T027 [P] [US2] Écrire `apps/api/test/guest-content.integration-spec.ts` et `apps/web/tests/guest-form.test.tsx` : documents absents/non approuvés, consentement non précoché, versions périmées, erreurs traduites liées aux champs, retour/langue sans perte des données non concernées ; aucune création au seul affichage.

### Implémentation

- [ ] T028 [US2] Implémenter les trois représentations dans `packages/validation/src/server/nickname.ts`, exporter via `packages/validation/src/server.ts` et versionner `packages/validation/src/server/unicode/CaseFolding-17.0.0.txt` avec provenance/licence : « affichage NFC », unicité sans casse/accent conservant séparateurs/chiffres, modération retirant seuls séparateurs admis puis 0→o,1→i,3→e,4→a,5→s,7→t ; égalité entière, Unicode 17, 3–20 graphèmes, aucune table privée dans le bundle web.
- [ ] T029 [US2] Implémenter/tester `apps/api/src/guest/moderation-policy.service.ts` / `apps/api/src/guest/moderation-policy.service.spec.ts` : « schemaVersion, policyVersion, normalizationVersion, reservedNames[], forbiddenNames[], référence d'approbation », six noms réservés minimaux, remplacement atomique, nouvelle configuration invalide rejetée et dernier snapshot valide gardé ; pas de fallback vide ni sanctions rétroactives.
- [ ] T030 [US2] Implémenter `apps/api/src/guest/guest-documents.service.ts` / `apps/api/src/guest/guest-documents.controller.ts` : GET /guest/documents public credentials=omit, « version, langue, type conditions|privacy, contenu structuré échappé, empreinte et référence d'approbation », FR/MG, 503 si ressource applicable manquante ; consulter ne vaut pas accepter.
- [ ] T031 [US2] Implémenter `apps/api/src/guest/guest-eligibility.service.ts` : règles T028–T029, consentement explicite et versions actuelles, erreurs sans echo privé ; contrôler uniqueKey dans la transaction d'admission et ne jamais promettre une réservation depuis une prévalidation.
- [ ] T032 [US2] Créer `apps/web/src/app/conditions/page.tsx`, `apps/web/src/app/confidentialite/page.tsx` et `apps/web/src/features/guest/legal-document.tsx` : blocs approuvés sans HTML arbitraire, version/langue, indisponibilité explicite et retour conservant le brouillon en mémoire sans secret/pseudonyme dans l'URL.
- [ ] T033 [US2] Créer `apps/web/src/app/invite/page.tsx`, `apps/web/src/features/guest/guest-form.tsx` et `apps/web/src/features/guest/guest-draft-provider.tsx`, intégration minimale dans `apps/web/src/app/layout.tsx` : label/aide, case non précochée, liens, erreurs, saisie/consentement conservés pendant navigation/langue pour mêmes versions ; pas de contact/mot de passe, callback admission raccordé en US3.
- [ ] T034 [US2] Ajouter `apps/api/test/guest-nickname.integration-spec.ts` : collision de noms équivalents, détenteur hors ligne toujours réservé, libération après expiration/suppression via primitive commune, aucun contexte privé hérité et politique modifiée ; utiliser stockage/fixtures pour la recette isolée puis réexécuter via admission après T042.
- [ ] T035 [US2] Ajouter et exécuter `tests/e2e/guest-form.spec.ts` : limites, refus sans identité, consultation/retour, versions modifiées, API coupée, FR/MG et saisie conservée ; transport contrôlé pour formulaire isolé puis API réelle après US3 ; réexécuter la navigation accueil → formulaire de T021.
- [ ] T036 [US2] Faire passer T026–T027/T034–T035 à leur niveau isolé et consigner US02.1–16 dans `specs/004-sprint-2-invite-lobby/validation.md` : distinguer tests serveur/stockage/formulaire et futurs tests d'admission réelle ; approbations de contenu toujours attendues, aucune livraison déduite de fixtures.

**Checkpoint** : règles et formulaire testables sans admission réelle ; leur recette complète est réunie avec US3.

## Phase 5: User Story 3 — Entrer réellement en invité (P0)

**Goal** : admission atomique, preuve sécurisée, reprise sans double identité.

**Independent Test** : admission API/PostgreSQL et arrivée au contexte lobby avec son nom, doubles clics/réponse perdue, récupération après rechargement et refus d'un visiteur connaissant seulement le nom. Couvre US03.1–5. Le catalogue complet arrive en US5.

### Tests

- [ ] T037 [P] [US3] Écrire `apps/api/test/guest-admission.integration-spec.ts` pour bootstrap/session/recover et GET /guest/session passif : 201 initial/200 reprise, atomicité, refus consentement/versions/proof/CSRF, clé identique/charge différente 409, contexte consommé, réponse recoverable et restitution CSRF après rechargement sans remplacement du contexte ; reçu juste avant/à/après une heure, 401/409 sans suppression ni doublon et new_entry explicite ; pas de secret en DTO/logs.
- [ ] T038 [P] [US3] Écrire `tests/e2e/guest-admission.spec.ts` : double activation, réponse perdue après commit puis rechargement perdant le CSRF en mémoire, bootstrap recoverable avec même cookie contexte puis récupération du même UUID ; reçu expiré avec cookie invité présent puis absent, nom toujours réservé si identité valide, nouvelle entrée uniquement explicite ; aucun succès anticipé ni accès par nom et panne distincte d'expiration.

### Implémentation

- [ ] T039 [US3] Implémenter GET /guest/session dans `apps/api/src/guest/guest-session.service.ts` / `apps/api/src/guest/guest-session.controller.ts`, puis bootstrap dans `apps/api/src/guest/guest-bootstrap.service.ts` / `apps/api/src/guest/guest-bootstrap.controller.ts` : GET sans écriture de dates ni Set-Cookie valide, 401 confirmé/503 indéterminé ; branches active/anonymous/recoverable, CSRF restitué sur même contexte consommé, TTL contexte une heure et cookie technique deux heures maximum depuis bootstrap ; enregistrer GET et bootstrap dans `apps/api/src/guest/guest.module.ts` dès cette tâche ; contexte inconnu 401 ou reçu inutilisable 409, aucune substitution automatique, intent:new_entry seulement par nouvelle action explicite.
- [ ] T040 [US3] Implémenter `apps/api/src/guest/guest-admission.service.ts` : revalider nom/versions, verrou commun, purge sûre du détenteur expiré, UUID/session à secret renouvelé/acceptation/reçu dans une transaction ; lastActivityAt=instant accepté, expiresAt=instant+30 jours ; contexte consommé, empreintes payload/clé, reçu AEAD une heure, commit avant réponse, UNIQUE arbitre final.
- [ ] T041 [US3] Implémenter `apps/api/src/guest/guest-recovery.service.ts` : preuve contexte/CSRF réobtenu via bootstrap, reçu/identité vérifiés à l'horloge serveur, secret original réémis avec Max-Age=2592000 sans nouvelle activité ; à expiration exacte du reçu 409, contexte absent/inconnu 401 ; ne pas supprimer une identité toujours valide ni libérer son nom au seul motif de récupération impossible ; intention de suppression prioritaire.
- [ ] T042 [US3] Exposer POST /guest/session et /guest/recover dans `apps/api/src/guest/guest-admission.controller.ts` / `apps/api/src/guest/guest-recovery.controller.ts` et câbler `apps/api/src/guest/guest.module.ts` : cookies/statuts/erreurs du contrat HTTP, no-store, aucune réservation hors transaction ; relancer T034 avec API réelle.
- [ ] T043 [US3] Créer `apps/web/src/lib/guest-client/index.ts` et `apps/web/tests/guest-client.test.ts` : credentials=include invités, omit documents/santé, BootstrapView/SessionView stricts, clés stables/reprises bornées, CSRF en mémoire ; rechargement → bootstrap existant → recover si recoverable ; 401/409 récupération ⇒ message sans conclure à une identité supprimée, bootstrap intent:new_entry uniquement par geste explicite sans ancienne charge ; aucune donnée personnelle en cache.
- [ ] T044 [US3] Créer `apps/web/src/features/guest/browser-coordination.ts` et `apps/web/tests/guest-coordination.test.ts` : même Web Lock bootstrap/admission/recovery/lobby-entry/logout, GET passif T039 sous verrou avant mutation, verrou jusqu'à réception ou timeout sans présumer annulation serveur ; BroadcastChannel signal seulement, réponses obsolètes ignorées et échéance non régressée par reçu historique pour même UUID ; aucun fingerprint ni secret dans le canal.
- [ ] T045 [US3] Raccorder `apps/web/src/features/guest/guest-entry.tsx`, `apps/web/src/features/guest/guest-form.tsx` et `apps/web/src/app/invite/page.tsx` : attente visible, intention réutilisée, recovery avant nouvelle création, aucune navigation de succès avant confirmation ; préserver saisie et différencier refus corrigeable, accès actif et preuve invalide.
- [ ] T046 [US3] Créer le contexte lobby minimal dans `apps/web/src/app/lobby/page.tsx` et `apps/web/src/features/guest/guest-session-provider.tsx` : relire GET /guest/session T039 au montage et accès direct, afficher uniquement sa propre identité vérifiée, panne indéterminée distincte d'accès absent ; aucune identité issue du nom local ni catalogue fictif ; entrée explicite et déconnexion complète raccordées en US4.
- [ ] T047 [US3] Exécuter T037–T038 avec courses PostgreSQL, deux onglets à froid, perte de réponse et ancien cookie/réponse après suppression ; instrumentation privée de test dans `apps/api/test/fixtures/guest.ts`, vérifier un seul UUID et secret tourné, aucune identité sur refus ; consigner `specs/004-sprint-2-invite-lobby/validation.md`.
- [ ] T048 [US3] Compléter/exécuter `tests/e2e/guest-admission.spec.ts` et la recette réelle US02/US03 dans `specs/004-sprint-2-invite-lobby/validation.md` : API en panne puis reprise, cookies HTTP local/HTTPS, absence de preuve dans localStorage/URL/bundle et aucune récupération par pseudonyme sur autre appareil.

**Checkpoint** : admission réelle testée ; pas de livraison de l'identité persistante avant US4 et suppression/restauration vérifiées.

## Phase 6: User Story 4 — Retrouver son identité et se déconnecter (P0)

**Goal** : restauration navigateur/onglets, activité explicite, expiration et suppression sans résurrection.

**Independent Test** : établir T, tester avant/à/après T+30 jours et entrée explicite avant échéance ; distinguer montage/polling/préférences, fermer/réouvrir, déconnecter dans un onglet, restaurer un dump antérieur sans réactivation. Couvre US04.1–15.

### Tests

- [ ] T049 [P] [US4] Écrire `apps/api/test/guest-session.integration-spec.ts` : lecture passive sans Set-Cookie/écriture, 401 confirmé vs 503 sans perte de preuve, échéance exacte après verrou, activité idempotente dix minutes ; activité/reprise réémettant Max-Age=2592000 sans Expires absolu, replay sans nouvelle date SQL, A puis B puis reprise A sans abaisser état courant ; logout répété avec CSRF valide, preuve supprimée refusée.
- [ ] T050 [P] [US4] Écrire `tests/e2e/guest-session.spec.ts` : identité après fermeture/réouverture et activité, aucune prolongation automatique, A puis B avec réponses B puis A et récupération tardive sans réduction de preuve ni régression UI ; perte de réponse de renouvellement puis reprise réémettant cookie sans retoucher SQL, cookie encore présent après échéance serveur pourtant refusé ; nouvel UUID après réattribution et ancienne réponse après logout sans résurrection.

### Implémentation

- [ ] T051 [US4] Compléter/vérifier la reconnaissance créée à T039 dans `apps/api/src/guest/guest-session.service.ts` / `apps/api/src/guest/guest-session.controller.ts` : frontières temporelles, registre/cascades, refus après échéance même si cookie encore présent, purge puis 401, aucune date/cookie renouvelés en lecture ; 503 sans suppression/nouvelle identité déduite de panne ; faire passer la reconnaissance de T049 sans recréer la route.
- [ ] T052 [US4] Implémenter POST /guest/lobby-entry dans `apps/api/src/guest/guest-activity.service.ts` / `apps/api/src/guest/guest-activity.controller.ts` : seule activité explicite Sprint 2, heure SQL après verrou, expiresAt=T+30 jours avant échéance seulement, reçu « kind=lobby_entry » et « UNIQUE(guestId,kind,idempotencyHash) » ; mêmes dates historiques au replay, cookie Max-Age=2592000 aussi au replay pour réparer réponse perdue, aucune nouvelle écriture temporelle ni Expires absolu ; expiration prioritaire, pas de touch générique.
- [ ] T053 [US4] Implémenter POST /guest/logout dans `apps/api/src/guest/guest-logout.controller.ts` : Origin/CSRF, suppression commune T015, 204 et cookies effacés après commit seulement, répétition valide sans effet, 503 sans faux succès si base/registre indisponible ; fermeture navigateur sans logout.
- [ ] T054 [US4] Raccorder `apps/web/src/features/guest/guest-session-provider.tsx`, `apps/web/src/features/guest/guest-entry.tsx` et `apps/web/src/app/lobby/page.tsx` : GET passif déjà disponible, entrée explicite sous verrou commun avec clé stable, échéance non régressée par reçu historique pour même identité et relecture serveur si nécessaire ; aucune mutation depuis montage, notification, préfetch, rechargement, langue, thème ou sélection de mode.
- [ ] T055 [US4] Créer `apps/web/src/features/guest/guest-logout.tsx` et intégrer `apps/web/src/features/guest/browser-coordination.ts` : avertissement suppression/libération, confirmation serveur avant sortie, autres onglets revalidés et mutations obsolètes interdites, erreurs réseau indéterminées ; aucune suppression annoncée avant commit.
- [ ] T056 [US4] Implémenter les opérations privées dans `scripts/guest-backup.mjs`, `scripts/guest-restore.mjs` et `docs/guest-operations.md` : sauvegardes chiffrées <=30 jours, registre/clé indépendants couvrant la fenêtre, vérification continuité, intentions/purge/cascades avant ouverture ; refuser dump trop ancien ou registre/clé manquant, préserver identités encore valides, aucun accès production ouvert automatiquement.
- [ ] T057 [US4] Ajouter `apps/api/test/guest-restore.integration-spec.ts` : dump avant suppression puis logout/expiry et restore fermé, fsync avant commit puis crash, SQL rollback après intention, ancien cookie refusé/nom libre et absence d'acceptation/reçu ressuscités ; identité valide non supprimée préservée, continuité perdue ⇒ échec fermé.
- [ ] T058 [US4] Implémenter rotation/contrôle dans `scripts/guest-retention.mjs`, `infra/docker/compose.yaml`, `docs/guest-operations.md` et tests `tests/operations/guest-retention.test.ts` : logs filtrés <=7 jours sur toutes destinations, backups/marqueurs <=30 jours, aucune marque retirée tant qu'un dump retenu l'exige ; inventaire collecteurs externes, limite Docker de taille insuffisante, aucun secret/UUID invité/pseudo/IP/jeton dans les journaux.
- [ ] T059 [US4] Exécuter T049–T050 et maintenance/restore/rétention ; vérifier les trois navigateurs sans ignorer l'absence de Web Locks, mesurer retard de purge et rattrapage après panne dans `specs/004-sprint-2-invite-lobby/validation.md` ; expliciter la limite physique pendant arrêt, aucune grâce métier ajoutée.
- [ ] T060 [US4] Consigner US04.1–15 dans `specs/004-sprint-2-invite-lobby/validation.md` : aucune archive personnelle d'acceptation, accès croisés refusés, logs <=7 jours, backups <=30 jours et restauration testée ; ne pas cocher une destination non inspectée ni une opération non exécutée.

**Checkpoint** : identité persistante testée avec suppression et restauration sûres.

## Phase 7: User Story 5 — Consulter le lobby et distinguer Domino 2/4 (P0)

**Goal** : deux formats réels, sélection accessible et états réseau honnêtes.

**Independent Test** : session valide, exactement Domino à 2 et à 4, bascule clavier, vide/erreur et coupure après chargement ; aucune salle/partie/recherche. Couvre US05.1–6.

### Tests

- [ ] T061 [P] [US5] Écrire `apps/api/test/guest-catalog.integration-spec.ts` : accès valide, lecture sans activité, exactement domino-2/2 et domino-4/4, playAvailability=not_implemented, rulesStatus=pending_validation ; aucun contexte d'autrui, présence, salon ou règle inventée.
- [ ] T062 [P] [US5] Écrire `tests/e2e/guest-lobby.spec.ts` : identité propre, radiogroupe clavier 2/4, mode inconnu non substitué, chargement/vide/erreur/réessai, contenu chargé conservé après coupure, aucune fonction future opérationnelle.

### Implémentation

- [ ] T063 [US5] Implémenter `apps/api/src/guest/guest-catalog.service.ts` / `apps/api/src/guest/guest-catalog.controller.ts` et câbler `apps/api/src/guest/guest.module.ts` : GET /guest/catalog protégé et passif, exactement deux formats et aucune table de partie.
- [ ] T064 [US5] Créer `apps/web/src/features/lobby/mode-selector.tsx` / `apps/web/src/features/lobby/lobby-page.tsx` et raccorder `apps/web/src/app/lobby/page.tsx` : radiogroupe, nombre exact, choix local sans nouvelle garantie de persistance, identité réelle et logout ; faits validés seulement, aucun compteur ou bouton de création de partie/salle.
- [ ] T065 [US5] Gérer les états dans `apps/web/src/features/lobby/catalog-state.tsx` / `apps/web/src/features/lobby/lobby-page.tsx` : chargement, vide inattendu, mode inconnu, panne/réessai et coupure ; informations déjà chargées lisibles, connexion explicite, aucune substitution/faux contenu ni prolongation de session par consultation/sélection.
- [ ] T066 [US5] Ajouter `apps/web/tests/lobby.test.tsx` et faire passer T061–T062 : états de transport simulés distingués du catalogue réel, FR/MG, clavier et aucune réussite d'action nécessitant le service après coupure.
- [ ] T067 [US5] Consigner US05.1–6 et entrée réelle → lobby → sélection dans `specs/004-sprint-2-invite-lobby/validation.md` : distinguer catalogue consultable et partie non livrée, sans valider de règle Domino future.

**Checkpoint** : parcours jusqu'à la sélection complet, sans partie jouable.

## Phase 8: User Story 6 — Comprendre la disponibilité future des comptes (P0 pour l'entrée)

**Goal** : alternative compte informative conservant l'accès invité, comptes au Sprint 7.

**Independent Test** : consulter/quitter l'information depuis accueil/formulaire/lobby ; invité prioritaire, identité/préférences/saisie conservées, aucune API/formulaire de compte ni promesse de conversion. Couvre US06.1–4.

### Tests

- [ ] T068 [P] [US6] Écrire `tests/e2e/account-availability.spec.ts` : Bientôt disponible FR/MG, invité prioritaire, retour sans perte d'accès/préférences/saisie, absence de formulaire actif, conversion, fusion, récupération ou progression promise.

### Implémentation

- [ ] T069 [US6] Créer `apps/web/src/features/account/account-availability.tsx` : information accessible « Inscription / Connexion — Bientôt disponible », aucun formulaire/appel compte, retour clavier/focus et possibilité de poursuivre en invité ; utiliser les clés T023.
- [ ] T070 [US6] Intégrer dans `apps/web/src/features/landing/landing-page.tsx`, `apps/web/src/features/guest/guest-form.tsx` et `apps/web/src/features/lobby/lobby-page.tsx` sans toucher session ni activité ; vérifier qu'aucune route backend de comptes n'a été ajoutée.
- [ ] T071 [US6] Exécuter T068 avec anonymes et invités réels et consigner US06.1–4 dans `specs/004-sprint-2-invite-lobby/validation.md` ; roadmap Sprint 7 et priorités FR-004 P0 / FR-013 P1 conservées.

**Checkpoint** : six stories couvertes, aucun système de compte anticipé.

## Phase 9: Polish & Cross-Cutting Concerns — recette et livraison

**But** : réunir les preuves et approbations ; aucune case cochée pour une simple préparation.

- [ ] T072 [P] Étendre `tests/e2e/guest-accessibility.spec.ts` : accueil/formulaire/documents/lobby/compte à 320/375/768/1024/1440, deux thèmes et FR/MG, axe/clavier, zoom 200 %, texte +40 %, reduced-motion, focus et absence de débordement horizontal ; conserver CSP et couverture Sprint 1.
- [ ] T073 [P] Effectuer la recette manuelle mobile/portrait-paysage/lecteur d'écran, contraste texte >=4,5:1 et contrôles >=3:1, cibles >=48×48/écart >=8, focus 3+3 et CTA accueil >=56 ; consigner appareil/navigateur dans `specs/004-sprint-2-invite-lobby/manual-validation.md`, sans remplacer les contrôles manuels par axe.
- [ ] T074 Intégrer uniquement documents/versions et corpus FR/MG fournis et approuvés, consigner références/dates/auteurs dans `docs/guest-content.md` et `specs/004-sprint-2-invite-lobby/validation.md` : contre-exemples et évolution sans code métier vérifiés, ressources privées hors Git ; si absents, tâche ouverte et admission production fermée.
- [ ] T075 Faire relire les nouveaux textes MG de `apps/web/src/lib/i18n/guest.ts` et informations applicables, corriger selon retour et consigner confirmation propriétaire dans `specs/004-sprint-2-invite-lobby/validation.md` ; relecture Sprint 1 distincte, aucune approbation inférée.
- [ ] T076 Auditer dans `specs/004-sprint-2-invite-lobby/security-validation.md` : cookies HTTPS, preuve/CSRF/Origin/CORS, isolation visiteurs, aucun secret dans bundle/logs/traces, registre durable et clés indépendants, Web Locks réel, rétention de toutes copies et absence de fonctions hors périmètre ; corriger sans élargir le produit.
- [ ] T077 Exécuter `pnpm quality` et recettes critiques hors agrégat, dont `tests/operations/guest-retention.test.ts`, migration/restauration PostgreSQL et HTTPS réel ; consigner commandes, résultats, environnement et corrections dans `specs/004-sprint-2-invite-lobby/validation.md`, sans retirer assertions Sprint 1 ni revendiquer un test non exécuté.
- [ ] T078 Faire réaliser par une autre personne invité → lobby → sélection 2/4 en FR et MG sans aide orale indispensable ; consigner étapes, durées observées, appareil/réseau et difficultés dans `specs/004-sprint-2-invite-lobby/usability-validation.md` ; corriger/revérifier les obstacles, aucun seuil de temps inventé.
- [ ] T079 Mettre à jour les procédures réellement exécutables dans `specs/004-sprint-2-invite-lobby/quickstart.md`, `docs/development.md`, `docs/guest-operations.md` et `README.md` : migration/serveur/recette, opérations privées effectivement créées, contenus et limites de panne ; conserver les instructions utiles Sprint 1.
- [ ] T080 Clore `specs/004-sprint-2-invite-lobby/validation.md` et les cases de `specs/004-sprint-2-invite-lobby/tasks.md` sur preuves uniquement : 51 scénarios, 20 S2-FR, huit S2-NFR et dix S2-SC, approbations et aucun défaut critique connu ; aucune livraison/ouverture GUEST_ENABLED sans contrôle requis, constitution/décisions/roadmap inchangées.

## Dependencies & Execution Order

### Graphe des phases et stories

```text
Setup T001–T005 → Fondations T006–T019
  → US1 T020–T025 : accueil autonome
  → US2 T026–T036 : nom/documents/formulaire (textes communs T023)
      → US3 T037–T048 : admission réelle, intégration accueil/formulaire
          → US4 T049–T060 : reconnaissance, activité, logout et restauration
              → US5 T061–T067 : catalogue et sélection intégrés
  → US6 T068–T071 : composant préparé après T023, intégration après US1/US2/US5
Toutes les stories + approbations → Recette finale T072–T080
```

Les phases suivent le parcours parmi des stories de même priorité. US1 et les règles/documents de US2 peuvent être préparés séparément après les fondations. Les tests isolés de formulaire/compte emploient un transport contrôlé explicitement signalé ; ils ne prouvent pas une session réelle. Les tests critiques US3–US5 utilisent l'API et PostgreSQL réels isolés.

### Dépendances internes

| Ensemble | Prérequis et ordre |
|---|---|
| Setup | T001 puis T002/T003 indépendantes ; T004 après T002 ; T005 sans écriture concurrente de documentation |
| Schéma/config/DTO | T006/T007 tests indépendants ; T008 → T009 → T012 ; T006 → T010 ; T007 → T011 |
| Sécurité/suppression | T010/T011 → T013/T014 ; T012–T014 → T015 → T016 ; T010/T011/T013 → T017 → T018 ; T012–T018 → T019 |
| US1 | T020/T021 avant logique ; T022 → T023 → T024 → T025 ; assertions de destination /invite autonomes, navigation effective revérifiée à T035 |
| US2 | T026/T027 avant logique ; T028 → T029 ; T030 indépendant de T028–T029 ; T029/T030 → T031 ; T023/T030 → T032 ; T023/T031/T032 → T033 ; T034 après T031 et fondations ; T035 après T033 ; T036 valide le niveau isolé, T048 réunit l'admission réelle |
| US3 | T037/T038 avant logique ; T039 (GET passif + bootstrap) → T040 → T041 → T042 avec T028–T031 requis à T040 ; T011 → T043 ; T039/T043 → T044 ; T033/T039/T042–T044 → T045 → T046 ; T047/T048 après UI/endpoints et réexécution US2 réelle |
| US4 | T049/T050 avant logique ; T039 → T051 (compléments de recette) → T052 → T053 ; T044–T046/T051–T053 → T054 → T055 ; T014–T016 → T056 → T057 ; T056 → T058 ; T059/T060 après ensemble, réexécuter les flux US3 raccordés à l'activité |
| US5 | T061/T062 avant logique ; T051 → T063 ; T023/T046/T054–T055/T063 → T064 → T065 → T066 → T067 |
| US6 | T068 avant logique ; T023 → T069 ; T024/T033/T064/T069 → T070 → T071 |
| Recette finale | T072/T073 après six stories ; T074/T075 attendent confirmations et peuvent être préparées en amont ; T076 après opérations et intégration ; T077 après corrections/ressources applicables ; T078 sur version candidate relue ; T079 après stabilisation commandes ; T080 dernier |

La première admission initialise l'échéance de 30 jours en US3 ; le raccordement de la mutation d'entrée explicite est effectué par T054, puis le parcours complet est revérifié. Aucun déploiement de cette tranche intermédiaire avant US4. GET /guest/session et la reconnaissance passive sont apportés dès T039 en US3, avant coordination T044, accès direct T046 et recette T047. T051 en US4 complète les frontières temporelles et leur recette, sans seconde route. US3 utilise une vraie relecture serveur sans dépendance anticipée vers US4.

Les points d'arrêt documentent les limites d'un incrément, sans présenter comme acquises les assertions dépendant d'une story suivante. Écrire les tests avant le code ; ne cocher leur recette qu'après exécution réussie au niveau annoncé.

### Parallel opportunities et exemples par story

Exemples d'organisation future ; aucune délégation ou agent lancé par la génération.

| Story | Fichiers pouvant être préparés en parallèle | Synchronisation |
|---|---|---|
| US1 | T020 `apps/web/tests/landing.test.tsx` et T021 `tests/e2e/landing.spec.ts` | Logique ensuite, exécution réelle après accueil |
| US2 | T026 tests normalisation et T027 tests documents/formulaire | Contrats stabilisés avant T028–T033 et admission réelle |
| US3 | T037 tests API et T038 tests navigateur | API/client raccordés avant recette réelle |
| US4 | T049 contrats session et T050 recette onglets | Ne pas modifier provider/coordination simultanément ; réunir la restauration avant clôture |
| US5 | T061 contrat API et T062 parcours lobby | T063–T065 avant validation réelle |
| US6 | T068 recette compte et préparation isolée T069 après T023 | Constat d'échec de T068 avant validation du composant ; intégrer T070 ensuite |

Autres vagues : T002/T003, T006/T007, T013/T014 et T072/T073. Les écritures dans `validation.md`, dictionnaire, module Nest ou une même page restent séquentielles. `[P]` ne signifie pas qu'un test réussit avant sa logique.

## Implementation Strategy

### MVP first et livraison incrémentale

1. Réutiliser les fondations terminées et établir stockage/sécurité/suppression avant parcours.
2. Première démonstration : US1 seule, accueil et préférences ; ce n'est pas le MVP fonctionnel d'accès invité.
3. Tranche fonctionnelle minimale recommandée : US1–US5 et information US6, incluant US4 et toutes les validations requises. Le sprint vise un accès réel jusqu'à sélection 2/4 ; aucune story P0 retirée du périmètre.
4. Vérifier chaque incrément indépendamment au niveau possible puis réunir les scénarios réels, sans livrer fixtures ou identité persistante sans suppression/restauration.
5. Réunir contrôles transversaux, approbations et preuves avant déclaration de livraison. La présente génération n'autorise ni déploiement ni ouverture de production.

### Répartition et points d'attention

Formats et contrats communs tôt ; modèles/contraintes avant services, services avant endpoints et intégration, preuves avant cases cochées. Des personnes distinctes peuvent préparer tests API/navigateur dans les fichiers indiqués après prérequis ; pas d'écriture simultanée dans les rapports/dictionnaires/fichiers communs.

Si documents, corpus ou relecture approuvés manquent : noter l'entrée précise attendue, laisser T074/T075 ouvertes et continuer les travaux techniques indépendants avec fixtures. Une panne ne vaut jamais expiration. Réponses tardives, anciennes preuves, reprises et sauvegardes ne réaniment rien. Aucun effacement physique garanti pendant arrêt total ; refus à échéance et purge avant reprise obligatoires.

## Couverture prévue

| Référence | Tâches principales |
|---|---|
| US01.1–5 ; S2-FR01–02 | T020–T025, T035, T072–T073 |
| US02.1–16 ; S2-FR03–05 | T026–T036, T040/T042/T048, T074–T075 |
| US03.1–5 ; S2-FR06–07 | T037–T048, T013/T017–T018 |
| US04.1–15 ; S2-FR08–10/18 | T014–T016, T049–T060, T076–T077 |
| US05.1–6 ; S2-FR11–15 | T061–T067, T054–T055 |
| US06.1–4 ; S2-FR16–17 | T068–T071 |
| S2-FR19 | T017–T018, T037/T049/T076 |
| S2-FR20 ; S2-SC07 | T001, recettes par story, T077/T080 |
| S2-NFR01–04/08 ; S2-SC05 | T022–T024, T072–T075/T079 |
| S2-NFR05–06 ; S2-SC02–03/10 | T013–T018, T037–T060, T076–T077 |
| S2-NFR07 | T021/T035/T048/T062/T065, observation réseau T078 |
| S2-SC01/04/06/08/09 | Respectivement T048, T067, T071, T078, T029/T034/T074 |

La matrice T001 puis T080 détaille chaque critère sans remplacer la spécification. La création de cette liste ne valait aucune approbation ni implémentation. Depuis le premier incrément, T001–T005 sont terminées ; les 75 autres tâches restent ouvertes et les approbations de contenu sont toujours attendues.

## Corrections issues de l'analyse — 2026-11-03

U1 : Max-Age constant, échéance serveur distincte, T013/T049–T052/T054 et tests de réponses perdues/désordonnées. U2 : BootstrapView recoverable et restitution CSRF du contexte consommé sans remplacement, T007/T037–T043. I1 : GET passif avancé à T039, utilisé par T044/T046, T051 devient complément. U3 : limites du reçu une heure, message explicite et nouvelle entrée volontaire sans suppression/récupération par nom, T037–T038/T041/T043. Identifiants, 80 tâches et six stories conservés lors de ces corrections documentaires, avant le premier incrément. Le statut courant des cases et validation.md décrivent désormais les réalisations.
