# Tasks: Kopaka — Sprint 1, fondations

**Input** : `specs/003-sprint-1-fondations/` : plan.md, spec.md, research.md, data-model.md, contracts/ et quickstart.md ; constitution dans `.specify/memory/constitution.md`.

**Organisation** : US1 à US6 correspondent à S1-US01 à S1-US06. Leur ordre est une séquence technique et de recette, sans création de priorités P1/P2/P3 ni modification des P0/P1 existantes. Toutes sont nécessaires au Sprint 1.

**Tests** : explicitement requis par la spécification. Écrire les tests de chaque story avant son implémentation et constater leur échec pertinent ; les tests d'intégration utilisent des services dédiés. Les preuves humaines restent ouvertes tant qu'elles ne sont pas obtenues.

## Format et chemins

`- [ ] Tnnn [P?] [USn?] Action avec chemin exact`. `[P]` désigne des fichiers distincts exécutables ensemble après leurs prérequis. Tous les chemins applicatifs sont relatifs à la racine. Aucun fichier applicatif n'est créé par cette génération documentaire.

## Phase 1 : Setup — initialisation partagée

**But** : figer un environnement compatible avant le code fonctionnel ; préserver README, références et assets existants.

- [X] T001 Inventorier l'état réel et vérifier les releases corrigées/peer dependencies des baselines Node 24 ≥24.15, pnpm 10, Turbo 2, TypeScript 6, Next 16, React compatible, Nest 12, Prisma 7 et outils de tests ; consigner versions exactes et décisions dans docs/development.md, sans changement majeur implicite.
- [X] T002 Initialiser les manifests des apps et packages avec workspace:*, engines et packageManager exacts dans package.json, pnpm-workspace.yaml, apps/web/package.json, apps/api/package.json et packages/{shared-types,validation,ui}/package.json ; produire pnpm-lock.yaml sans latest/canary/RC.
- [X] T003 Configurer ESM, TypeScript strict, exports compilés et build ^build dans tsconfig.base.json, turbo.json, apps/api/tsconfig.json et packages/{shared-types,validation,ui}/tsconfig.json ; API NodeNext avec imports .js et metadata décorateurs, génération Prisma avant build API, dev persistant sans cache et tests données/E2E non cachés.
- [X] T004 [P] Configurer lint, format et restrictions d'import apps→apps et serveur→navigateur dans eslint.config.mjs, .prettierrc.json et .prettierignore ; scripts racine dans package.json après T003.
- [X] T005 [P] Protéger env, sorties générées et caches dans .gitignore et créer les exemples sans secret réel dans apps/api/.env.example, apps/web/.env.example et infra/docker/.env.example après T003.

## Phase 2 : Foundational — prérequis bloquants

**But** : permettre la compilation et les tests de toutes les stories ; pas de module métier vide.

- [X] T006 Créer les points d'entrée minimaux indépendants dans apps/api/src/main.ts, apps/api/src/app.module.ts, apps/web/src/app/layout.tsx et apps/web/src/app/page.tsx ; bind loopback, web 3000/API 3001, page statique lisible sans API, aucun import interne entre applications.
- [X] T007 Installer les harnais Vitest packages/UI, Jest/Supertest sur JS ESM précompilé tsc et Playwright/axe dans vitest.config.ts, apps/api/test/jest.config.mjs et playwright.config.ts ; exposer test:unit, test:integration et test:e2e dans package.json, sans cache données/E2E ni transpilation API esbuild seule.

**Checkpoint** : installation et compilation minimales réalisables ; toutes les stories nécessitent T001–T007. Les dépendances supplémentaires sont précisées en fin de document.

## Phase 3 : US1 — Prendre en main l'environnement

**But** : installation reproductible, applications indépendantes et données initialisées durablement.

**Test indépendant** : une autre personne suit docs/development.md depuis une copie propre ; builds séparés ; migration sur base vide puis deuxième deploy et redémarrage sans mutation du singleton ; configuration invalide sans fuite.

### Tests

- [X] T008 [P] [US1] Écrire les tests de configuration absente/invalide et diagnostic limité au nom de variable dans apps/api/src/config/config.spec.ts ; aucune valeur secrète dans l'erreur.
- [X] T009 [P] [US1] Écrire les tests de migration réelle sur base dédiée vide, deuxième deploy sans doublon et restart conservant ligne/date dans apps/api/test/migration.integration-spec.ts ; nettoyage limité aux ressources identifiées du run.

### Implémentation

- [X] T010 [US1] Créer PostgreSQL 17 et Redis 7.4 corrigés avec digests exacts, healthchecks, volume PostgreSQL nommé et ports 127.0.0.1 dans infra/docker/compose.yaml ; séparer ressources de recette des données courantes, sans flushall/down -v partagé.
- [X] T011 [US1] Créer PlatformBootstrap dans prisma/schema.prisma et prisma/migrations/0001_platform_bootstrap/migration.sql avec contraintes citées : id « PK, valeur sprint-1 », schemaVersion « version attendue 1 », initializedAt « non nulle, créée par migration » de type « date UTC » ; contraindre le singleton et insérer la ligne par migration, sans seed mutable ni modèle métier.
- [X] T012 [US1] Configurer Prisma 7 dans prisma/prisma.config.ts et package.json avec chargement env explicite, génération client hors frontend, scripts db:generate, db:migrate:dev, db:migrate:deploy et db:migrate:status ; jamais db push/reset en substitution de l'historique.
- [X] T013 [US1] Valider la configuration avec Zod dans apps/api/src/config/config.schema.ts et apps/api/src/config/config.module.ts : DATABASE_URL, REDIS_URL, WEB_ORIGIN, API_PORT, HEALTH_DEPENDENCY_TIMEOUT_MS, HEALTH_TOTAL_TIMEOUT_MS, HEALTH_RATE_LIMIT_PER_MINUTE, HEALTH_MAX_CONCURRENT et bornes de pool ; « Champ obligatoire invalide → arrêt sans valeur sensible dans l'erreur ».
- [X] T014 [US1] Implémenter PrismaClient unique adapter-pg/pool borné et client Redis unique dans apps/api/src/database/database.module.ts, apps/api/src/database/database.service.ts, apps/api/src/redis/redis.module.ts et apps/api/src/redis/redis.service.ts ; timeouts explicites, offline queue désactivée, backoff borné, fermeture propre et boot HTTP possible si données indisponibles.
- [X] T015 [US1] Rendre les commandes quickstart effectives dans package.json, apps/web/package.json et apps/api/package.json, y compris build/dev filtrés construisant leurs packages ; documenter installation frozen-lockfile, configuration, migrations, contrôle de persistance et dépannage dans docs/development.md.

**Checkpoint** : T008–T009 passent avec services dédiés ; recette copie propre consignée lors de US6.

## Phase 4 : US2 — Vérifier les échanges du socle

**But** : contrats communs stricts réellement utilisés et refus serveur des entrées invalides.

**Test indépendant** : schémas valides/invalides et frontières de packages ; requêtes malformées sur les vraies routes santé une fois US3 intégrée, sans route artificielle ni mutation.

### Tests

- [X] T016 [P] [US2] Écrire les tests objets stricts, statuts et codes autorisés, UUID canonique longueur 36 et champs additionnels refusés dans packages/validation/src/health.spec.ts suivant contracts/http.md.
- [X] T017 [P] [US2] Écrire les tests middleware query inconnue, corps GET/HEAD non vide, X-Request-Id invalide/absent et erreur sans secret dans apps/api/src/common/http-validation.spec.ts ; vérifier le refus avant toute sonde.

### Implémentation

- [X] T018 [US2] Définir types/constantes santé et erreurs dans packages/shared-types/src/health.ts et packages/shared-types/src/index.ts : alive, ready/not_ready et INVALID_REQUEST/METHOD_NOT_ALLOWED/RATE_LIMITED/INTERNAL_ERROR, sans dépendance framework.
- [X] T019 [US2] Implémenter les schémas Zod stricts et exports navigateur/serveur séparés dans packages/validation/src/health.ts, packages/validation/src/index.ts, packages/validation/src/server.ts et packages/validation/package.json ; le navigateur ne peut importer la configuration privée.
- [X] T020 [US2] Implémenter validation HTTP et erreurs génériques dans apps/api/src/common/http-validation.middleware.ts et apps/api/src/common/http-exception.filter.ts ; UUID sûr généré si absent/invalide, id en header réponse uniquement, 400 avant sondes et 405 avec Allow, limites transport/413, aucune stack/erreur driver publique.
- [X] T021 [US2] Brancher validation, filtre et CORS origine WEB_ORIGIN exacte dans apps/api/src/main.ts ; GET/HEAD/OPTIONS, X-Request-Id autorisé, sans wildcard/credentials, no-store/nosniff et trust proxy désactivé ; conserver les contrats réutilisables sans dépendance UI/Nest.

**Checkpoint** : T016–T017 passent ; la preuve HTTP réelle T023 complète cette story après US3.

## Phase 5 : US3 — Diagnostiquer une indisponibilité

**But** : vie indépendante et disponibilité réelle, bornée, récupérable et sans détail sensible.

**Test indépendant** : live 200 ; ready 200 avec singleton v1 et PONG, 503 si chaque dépendance tombe ou schéma absent/inattendu ; reprise au prochain contrôle ; logs filtrés.

### Tests

- [X] T022 [P] [US3] Écrire agrégation/deadlines, concurrence, non-accumulation, fermeture et filtrage de logs dans apps/api/src/health/health.service.spec.ts ; couvrir boot sans données, aucune dépendance pour live et aucun ancien succès caché.
- [X] T023 [P] [US3] Écrire les tests Supertest sur API et PostgreSQL/Redis réels dans apps/api/test/health.integration-spec.ts : GET/HEAD/OPTIONS, 200/503/400/405/429/500 générique, query/corps/header invalides, CORS permis/interdit, no-store, Allow, Retry-After et aucune fuite ; panne/reprise séparée, singleton absent/version incorrecte sur base isolée.

### Implémentation

- [X] T024 [US3] Créer les sondes dans apps/api/src/health/health.service.ts et apps/api/src/health/health.module.ts : lecture Prisma du singleton attendu ET Redis PONG ; valeurs internes postgres « up/down/timeout/schema_mismatch », redis « up/down/timeout », checkedAt « date UTC », durationMs « nombre ≥0 » ; aucune réparation ni histoire durable.
- [X] T025 [US3] Borner sondes concurrentes à 1 s chacune et budget global 2 s configurables dans apps/api/src/health/health.service.ts ; annuler autant que possible, libérer les ressources et garantir que les opérations expirées ne saturent pas le pool sans limite.
- [X] T026 [US3] Implémenter limite mémoire readiness 30/minute/IP et maximum 4 évaluations par instance configurables dans apps/api/src/health/health-limit.guard.ts ; 429 avec Retry-After positif sans nouvelle sonde, indépendant de Redis et sans limite dépendante des données pour live.
- [X] T027 [US3] Exposer /health/live et /health/ready dans apps/api/src/health/health.controller.ts et les composer dans apps/api/src/app.module.ts : réponses strictes status seulement, HEAD sans corps ; erreur de dépendance 503, défaut inattendu 500 générique.
- [X] T028 [US3] Produire les logs JSON normalisés dans apps/api/src/common/logger.ts : seulement timestamp, level, event enum, requestId « UUID optionnel », durationMs « nombre ≥0 », dependency « postgres/redis » et outcome normalisé ; aucune IP, corps, préférence, URL, secret ou header brut ; documenter catégories et diagnostic dans docs/development.md.

**Checkpoint** : tests réels T023 réussis y compris indisponibilité au boot, panne et reprise ; US2 est vérifiée sur HTTP.

## Phase 6 : US4 — Utiliser le shell sur tous les écrans

**But** : page de fondation accessible, thème local et indicateur réel distinct des démonstrations.

**Test indépendant** : cinq largeurs, clavier, contrastes, thème clair initial même OS sombre et réseau perdu ; serveur prêt/non prêt/injoignable puis Réessayer sans reload ni faux succès.

### Tests

- [X] T029 [P] [US4] Écrire les tests préférences thème et stockage dans apps/web/tests/theme.test.tsx : clé kopaka.theme.v1, valeurs « light, dark, system », « repli light ; system explicitement choisi », thème résolu « light, dark » « non persisté », matchMedia seulement system, clé invalide seule ignorée, stockage refusé et SSR/hydratation cohérents.
- [X] T030 [P] [US4] Écrire les tests health-client dans apps/web/tests/health-client.test.ts : 200 ready strict, 503, réseau/timeout/429/500/JSON incorrect, 3 s, abort démontage, un appel actif, réponse obsolète ignorée et invalidation de l'ancien succès au réessai.
- [X] T031 [P] [US4] Écrire les tests de composants/états dans packages/ui/src/components/components.test.tsx et apps/web/tests/health-status.test.tsx : noms/labels/aide/erreur, disabled, annonces polite uniques, focus stable, message localisable et démos distinctes.
- [X] T032 [P] [US4] Écrire les E2E production réels dans tests/e2e/health-real.spec.ts : web→API→données, arrêt/reprise isolés Redis, PostgreSQL puis API, contenu conservé et Réessayer ; isoler timeout/JSON invalide/réponse tardive/offline après chargement dans tests/e2e/health-simulated.spec.ts explicitement simulé.

### Implémentation

- [X] T033 [US4] Intégrer design-system/kopaka/tokens.css une seule fois via packages/ui/src/styles.css et apps/web/src/app/layout.tsx ; aliases sémantiques Tailwind/shadcn dans apps/web/src/app/globals.css, sources UI explicites, carte 28 px/contrôle 16 px, polices système sans asset distant ni palette parallèle.
- [X] T034 [US4] Créer boutons, champ label/aide/erreur, carte, sélecteur et message d'état dans packages/ui/src/components/button.tsx, field.tsx, card.tsx, select.tsx et status-message.tsx ; cibles 48×48, écart 8, focus 3+3, états textuels et reduced-motion, React peer sans dépendance serveur.
- [X] T035 [US4] Créer adaptateur local validé try/catch et thème dans apps/web/src/features/preferences/storage.ts, theme-provider.tsx et initial-preferences.ts ; « Stockage inaccessible → mémoire pour la visite ; aucune promesse de persistance », ignorer uniquement clé invalide, aucun cookie/id/transfert API, html data-theme actualisé, SSR FR/clair et providers réconciliés après montage sans masquer la page.
- [X] T036 [US4] Sécuriser script initial et ressources dans apps/web/src/app/layout.tsx et apps/web/next.config.ts avec CSP hash fixe ou nonce, frame-ancestors none, connect-src API configurée, nosniff/referrer-policy restrictive ; aucun unsafe-inline production, exceptions HMR en développement seulement.
- [X] T037 [US4] Implémenter fetch no-store sans credentials et états idle/loading/available/unavailable dans apps/web/src/lib/health-client/index.ts et apps/web/src/features/foundation/health-status.tsx ; un appel montage, réessai manuel verrouillé, timeout 3 s, annulation/réponse obsolète, aucun polling ni confiance dans navigator.onLine ; consommer schémas partagés et libellés dictionnaire FR centralisés.
- [X] T038 [US4] Composer / dans apps/web/src/app/page.tsx et apps/web/src/features/foundation/foundation-page.tsx avec lien d'évitement, header Kopaka, sélecteurs langue/thème, mention fondation, disponibilité réelle et démos identifiées ; créer tous les textes FR dans apps/web/src/messages/fr.json, sans faux parcours, compte, joueur ni envoi de champ.
- [X] T039 [US4] Adapter apps/web/src/app/globals.css et apps/web/src/app/error.tsx aux largeurs 320/375/768/1024/1440, colonne 320–767/grille dès 768/max 1200, gouttières 16/24/32, corps 16, zoom 200 %, textes +40 %, portrait/paysage et erreurs lisibles sans API ; aucun contenu utile tronqué ni défilement horizontal involontaire.

**Checkpoint** : page FR accessible et santé réelle testable ; le sélecteur bilingue devient complet avec US5. La recette humaine complète reste en phase finale.

## Phase 7 : US5 — Choisir sa langue

**But** : tous les libellés FR/MG et choix local sans compte ni dépendance API.

**Test indépendant** : changer la langue, vérifier html lang puis reload ; stockage refusé/corrompu sans blocage ; textes +40 % sans perte ; complétude et relecture MG attestées.

### Tests

- [X] T040 [P] [US5] Écrire les tests parité des clés, absence de libellé manquant et préférence dans apps/web/tests/i18n.test.tsx : clé kopaka.locale.v1, valeurs « fr, mg », « repli fr ; modifiable sans compte », stockage refusé/corrompu, changement sans API et hydratation sans warning.
- [X] T041 [P] [US5] Écrire les parcours langue/reload, thèmes, stockage refusé et expansion 40 % aux cinq largeurs dans tests/e2e/preferences.spec.ts ; html lang suit le choix, noms sans drapeau et contrôles accessibles après changement.

### Implémentation

- [X] T042 [US5] Compléter les dictionnaires centralisés de tous les textes, erreurs, états, noms accessibles et démonstrations dans apps/web/src/messages/fr.json et apps/web/src/messages/mg.json ; aucun texte MG déclaré relu sans attestation.
- [X] T043 [US5] Implémenter résolution typée et provider FR/MG dans apps/web/src/lib/i18n/index.ts et apps/web/src/features/preferences/locale-provider.tsx ; valider la clé locale via storage.ts, actualiser html lang et réconcilier après montage avec SSR/initial React FR cohérents, fonctionnement mémoire sans compte.
- [X] T044 [US5] Relier langue/thème et tous les textes de foundation-page.tsx, health-status.tsx et apps/web/src/app/error.tsx aux dictionnaires via apps/web/src/features/preferences/language-select.tsx ; choix modifiable, libellés Français/Malagasy sans drapeau et messages santé localisés même API coupée.
- [X] T045 [US5] Faire relire les textes MG par un locuteur compétent, corriger apps/web/src/messages/mg.json et consigner attestation/version et résultat dans specs/003-sprint-1-fondations/validation.md ; laisser la recette bilingue non acquise si le locuteur manque.

**Checkpoint** : parité automatique et persistance validées ; T045 est obligatoire pour déclarer la recette bilingue terminée.

## Phase 8 : US6 — Vérifier et transmettre le socle

**But** : contrôles reproductibles, échec détecté et prise en main transmissible.

**Test indépendant** : tous les contrôles passent ; anomalie temporaire contrôlée fait échouer la chaîne ; une autre personne installe sans explication orale.

### Tests et implémentation

- [X] T046 [P] [US6] Compléter tests/e2e/accessibility.spec.ts avec axe, clavier/focus/lien d'évitement, états et deux thèmes/langues, cinq largeurs, mouvement réduit et expansion ; conserver contraste manuel et zoom réel comme preuves distinctes.
- [X] T047 [P] [US6] Créer .github/workflows/ci.yml : Linux frozen-lockfile→Prisma/packages→lint/format/typecheck/unitaires→migrations/intégration PostgreSQL/Redis dédiés→build production/E2E navigateurs ; smoke install/build Windows, aucun dump env/cache données et conservation rapports/versions navigateurs.
- [X] T048 [US6] Finaliser scripts et filtres de contrôle dans package.json et turbo.json ; lancer lint, format:check, typecheck, test:unit, test:integration, build et test:e2e, corriger les échecs puis consigner commandes, commit et résultats dans specs/003-sprint-1-fondations/validation.md.
- [X] T049 [US6] Introduire une anomalie temporaire contrôlée dans packages/validation/src/health.spec.ts sur environnement de recette, constater contrôle fautif/global en échec, retirer l'anomalie et revérifier ; consigner les deux résultats dans specs/003-sprint-1-fondations/validation.md sans intégrer de test cassé.
- [X] T050 [US6] Mettre à jour README.md et docs/development.md avec prérequis exacts, env sans secret, builds/démarrages indépendants, migrations, tests isolés, pannes/reprise et dépannage ; faire suivre quickstart.md par une autre personne sur copie propre et consigner ses résultats dans specs/003-sprint-1-fondations/validation.md.

**Checkpoint** : résultats automatisés et transmission attestés ; aucun succès présumé lorsque services, personne ou appareils nécessaires manquent.

## Phase 9 : Polish et préoccupations transversales

- [X] T051 [P] Contrôler secrets dans dépôt livré, ressources navigateur, réponses et logs, frontières d'import et absence de fonctions hors sprint ; consigner surfaces et résultats dans specs/003-sprint-1-fondations/security-review.md, corriger les fichiers concernés sans créer auth/session/socket métier.
- [X] T052 [P] Réaliser recette manuelle composants réels en clair/sombre : texte ≥4,5:1, contrôle/focus ≥3:1, clavier/lecteur écran, zoom 200 %, toucher, portrait/paysage ; mesurer contrastes sans écraser design-system/kopaka/CONTRAST.md et consigner preuves dans specs/003-sprint-1-fondations/validation-accessibility.md.
- [X] T053 [P] Vérifier Chrome/Edge/Firefox/Safari récents et Android/Safari iOS réels, consigner appareils/versions et mesures chargement/Core Web Vitals/poids JS sur mobile avec réseau dans specs/003-sprint-1-fondations/validation-devices.md ; ne pas assimiler WebKit à Safari iOS ni inventer seuil de charge/SLA.
- [X] T054 Rejouer specs/003-sprint-1-fondations/quickstart.md sur candidat corrigé et compléter specs/003-sprint-1-fondations/validation.md avec matrice S1-FR01–13, S1-NFR01–11 et S1-SC01–09 vers preuves ; signaler validations humaines manquantes et décisions À VALIDER, aucun bug critique ouvert ni affirmation de MVP Domino livré.

## Dépendances et ordre d'exécution

```text
Setup T001–T005 → Fondations T006–T007
  ├─ US1 T008–T015 ─┐
  └─ US2 T016–T021 ─┴→ US3 T022–T028 → US4 T029–T039
                                               → US5 T040–T045
                            US1–US5 → US6 T046–T050 → Polish T051–T054
```

- US1 et US2 peuvent être préparées en parallèle après la phase 2 ; elles partagent main.ts uniquement via T021 après le squelette T006. US2 ne dépend pas d'identité ni de modèle métier ; sa preuve HTTP complète attend T023.
- US3 nécessite configuration/clients US1 et schémas/middleware US2. T024 précède T025, puis T026–T028 et validation réelle.
- US4 nécessite contrats US2 et API US3 pour recette réelle. Ses tests et composants statiques peuvent être préparés après les fondations ; T037 nécessite T019 et T035, T038 nécessite T033–T037, T039 suit la composition.
- US5 complète le shell US4 ; T042 précède T043–T044 puis T045. Les dictionnaires FR de T038 sont enrichis sans dupliquer les textes.
- US6 nécessite US1–US5 pour validation globale. Sa CI peut être préparée dès que les scripts sont connus, mais ne vaut pas preuve avant exécution réelle.
- Les tâches d'une phase sont séquentielles par défaut, sauf groupes `[P]` explicitement indiqués. Les preuves humaines peuvent être organisées tôt ; leur absence bloque la validation correspondante, pas les travaux techniques indépendants.

## Exemples d'exécution parallèle par story

| Story | Exemple sans conflit de fichiers | Condition |
|---|---|---|
| US1 | T008 config.spec.ts et T009 migration.integration-spec.ts | Phase 2 terminée ; tests écrits avant implémentation |
| US2 | T016 health.spec.ts et T017 http-validation.spec.ts | Phase 2 terminée |
| US3 | T022 health.service.spec.ts et T023 health.integration-spec.ts | US1/US2 disponibles ; services de test isolés |
| US4 | T029 thème, T030 client, T031 composants et T032 E2E | Contrats fixés ; fichiers de tests distincts ; recette réelle après US3 |
| US5 | T040 i18n et T041 parcours préférences | Shell US4 disponible |
| US6 | T046 accessibilité et T047 workflow CI | Scripts et parcours connus ; aucune édition commune |

T004/T005 et T051/T052/T053 peuvent également avancer ensemble après leurs prérequis. Les modifications de fichiers communs (package.json, main.ts, globals.css, dictionnaires, rapport validation.md) sont sérialisées. Ces exemples indiquent des possibilités d'organisation, sans lancer d'agents.

## Stratégie de réalisation

1. Livrer d'abord Setup + Fondations + US1 comme premier incrément technique démontrable : installation, builds indépendants, migration/persistance et configuration sûre. Ce n'est pas la livraison complète du Sprint 1.
2. Ajouter US2 et US3 ; valider contrats puis vraie santé avec panne et reprise de chaque dépendance.
3. Ajouter US4, puis US5 ; démontrer shell, disponibilité réelle, thèmes et langues, sans parcours de jeu.
4. Terminer US6 et la recette transversale avec preuves reproductibles. Ne cocher aucune validation humaine sans résultat effectif.

Les données de test Redis utilisent uniquement « kopaka:test:<runId>: », TTL courte et suppression par noms exacts. Pas de reset des bases courantes, de flush partagé, de déploiement public, de règle métier anticipée ou de Socket.IO actif au Sprint 1.
