# Validation — Sprint 2 Invité et lobby

## Premier incrément — phase 1 (2026-11-03)

Périmètre de cette exécution : T001–T005 uniquement. Préparation des tests, formats de contenus et conventions ; aucune route invitée, migration, identité réelle ou interface métier livrée. Les recettes fonctionnelles ci-dessous restent non exécutées.

### Origine des preuves

- **Observé dans cette exécution** : checklist requirements.md 16/16, versions Node 24.22.2/pnpm 10.8.0 et inspection des scripts/configurations ; contrôles supplémentaires consignés en fin de document après exécution.
- **Historique directement observé au Sprint 1** : son rapport mentionne 123 tests unitaires, 12 intégrations et 54 E2E réussis. Ces chiffres ne sont ni une nouvelle exécution ni des résultats Sprint 2.
- **Confirmation du propriétaire** : clôture Sprint 1 et relecture MG du Sprint 1 confirmées le 2026-11-03, selon [le rapport précédent](../003-sprint-1-fondations/validation.md). Aucune approbation implicite des nouveaux contenus.
- **À obtenir avant livraison** : documents/versions juridiques FR/MG, corpus initial avec contre-exemples approuvés, relecture nouvelle MG, recettes humaines et exploitation réellement validée. Fixtures sans valeur juridique ou approbation de production.

### État initial du dépôt

Branche `main` conservée. Avant toute modification de cette phase, quatre fichiers suivis étaient déjà modifiés : `DECISIONS_ET_POINTS_A_VALIDER.md`, `README.md`, `specs/003-sprint-1-fondations/quickstart.md`, `specs/003-sprint-1-fondations/tasks.md`.

Également non suivis : les configurations racine Node/qualité/ignore, `.github/`, `apps/`, `packages/`, `docs/`, `infra/`, `prisma/`, `scripts/`, `tests/`, les rapports de clôture Sprint 1 et `specs/004-sprint-2-invite-lobby/`. Cet état préexistant n'est pas imputé au nouvel incrément. Aucun nettoyage, commit, changement de branche ou reset effectué. Ne pas écraser ces fichiers sous prétexte qu'ils ne sont pas encore suivis.

Les contenus privés `.env` n'ont pas été lus ni reproduits. Les instances locales et volumes existants sont préservés. Vérification des ignore files exigée par speckit-implement : compléter uniquement les motifs critiques manquants ; packages privés, aucune publication npm, aucun Terraform/Helm détecté.

## Matrice des 51 scénarios

Référence normative : [spec.md](spec.md). Chaque ligne désigne exactement le scénario numéroté de la story. Les tâches citées prévoient la construction et la preuve, sans résultat présumé ; les tests avec transport simulé devront être distingués de la recette API/PostgreSQL réelle.

| Scénario | Tâches et preuves prévues | État fonctionnel |
|---|---|---|
| US01.1 | T020–T025 | Non exécuté |
| US01.2 | T020–T025/T072 | Non exécuté |
| US01.3 | T020–T025 | Non exécuté |
| US01.4 | T021/T033/T035/T048 | Non exécuté |
| US01.5 | T020–T021/T025 | Non exécuté |
| US02.1 | T027/T033 | Non exécuté |
| US02.2 | T026–T031/T035/T040 | Non exécuté |
| US02.3 | T027/T031/T033/T037 | Non exécuté |
| US02.4 | T027/T030/T032–T035 | Non exécuté |
| US02.5 | T034/T037/T040/T047 | Non exécuté |
| US02.6 | T027/T033/T035 | Non exécuté |
| US02.7 | T026/T028/T034 | Non exécuté |
| US02.8 | T026/T028/T035 | Non exécuté |
| US02.9 | T026/T029/T034 | Non exécuté |
| US02.10 | T034/T040 | Non exécuté |
| US02.11 | T015/T034/T040/T050 | Non exécuté |
| US02.12 | T026/T029/T034/T074 | Non exécuté |
| US02.13 | T029/T034/T074 | Non exécuté |
| US02.14 | T026/T028–T029 | Non exécuté |
| US02.15 | T026/T028/T034 | Non exécuté |
| US02.16 | T026/T029/T034 | Non exécuté |
| US03.1 | T037–T048/T067 | Non exécuté |
| US03.2 | T037–T038/T043–T048 | Non exécuté |
| US03.3 | T038/T043–T048 | Non exécuté |
| US03.4 | T037–T041/T047–T048 | Non exécuté |
| US03.5 | T037–T038/T048/T076 | Non exécuté |
| US04.1 | T039/T046/T049–T051/T054 | Non exécuté |
| US04.2 | T039/T049–T051/T054 | Non exécuté |
| US04.3 | T049–T054 | Non exécuté |
| US04.4 | T043/T049/T051/T054 | Non exécuté |
| US04.5 | T048/T050/T076 | Non exécuté |
| US04.6 | T050/T054/T059 | Non exécuté |
| US04.7 | T044/T047/T050/T054–T055 | Non exécuté |
| US04.8 | T015–T016/T049–T052/T059 | Non exécuté |
| US04.9 | T049–T052/T054 | Non exécuté |
| US04.10 | T049–T055/T060 | Non exécuté |
| US04.11 | T049–T052/T054 | Non exécuté |
| US04.12 | T049–T052/T054 | Non exécuté |
| US04.13 | T012/T015/T057/T060 | Non exécuté |
| US04.14 | T058/T060/T076 | Non exécuté |
| US04.15 | T056–T057/T060 | Non exécuté |
| US05.1 | T061–T064/T067 | Non exécuté |
| US05.2 | T062/T064/T066 | Non exécuté |
| US05.3 | T062–T067 | Non exécuté |
| US05.4 | T062/T065–T066 | Non exécuté |
| US05.5 | T062/T065–T066 | Non exécuté |
| US05.6 | T062–T067 | Non exécuté |
| US06.1 | T068–T071 | Non exécuté |
| US06.2 | T068–T071 | Non exécuté |
| US06.3 | T068–T071 | Non exécuté |
| US06.4 | T068–T071 | Non exécuté |

Révision Git observée au départ : `24b8629d1c31e04335483de00764c08bf6798476`. Les fichiers non suivis du socle ne sont pas contenus dans ce commit ; ce SHA seul ne reconstitue donc pas l'état de travail.

## Matrice des 38 exigences et critères

| Référence | Tâches et preuves prévues | État |
|---|---|---|
| S2-FR01 | T020–T025 | Non exécuté |
| S2-FR02 | T023/T033/T072/T075 | Non exécuté |
| S2-FR03 | T027/T030–T033/T040 | Non exécuté |
| S2-FR04 | T026–T031/T034/T074 | Non exécuté |
| S2-FR05 | T008/T015/T034/T040/T047 | Non exécuté |
| S2-FR06 | T013/T037–T048/T076 | Non exécuté |
| S2-FR07 | T037–T048 | Non exécuté |
| S2-FR08 | T015–T016/T049–T054/T059 | Non exécuté |
| S2-FR09 | T039/T043/T049/T051/T054 | Non exécuté |
| S2-FR10 | T044/T050–T055/T059 | Non exécuté |
| S2-FR11 | T039/T046/T051/T061–T064 | Non exécuté |
| S2-FR12 | T061–T067 | Non exécuté |
| S2-FR13 | T062–T067 | Non exécuté |
| S2-FR14 | T063–T067 | Non exécuté |
| S2-FR15 | T027/T035/T043–T045/T062/T065 | Non exécuté |
| S2-FR16 | T068–T071 | Non exécuté |
| S2-FR17 | T068–T071 | Non exécuté |
| S2-FR18 | T014–T016/T056–T060/T076 | Non exécuté |
| S2-FR19 | T017–T018/T037/T049/T076 | Non exécuté |
| S2-FR20 | T001/T077–T080 | Non exécuté |
| S2-NFR01 | T072–T073 | Non exécuté |
| S2-NFR02 | T072–T073 | Non exécuté |
| S2-NFR03 | T072–T073 | Non exécuté |
| S2-NFR04 | T023/T074–T075 | Non exécuté |
| S2-NFR05 | T037–T060 | Non exécuté |
| S2-NFR06 | T013–T018/T056–T060/T076 | Non exécuté |
| S2-NFR07 | T021/T035/T048/T062/T065/T078 | Non exécuté |
| S2-NFR08 | T022–T025/T077/T079 | Non exécuté |
| S2-SC01 | T048/T067 | Non exécuté |
| S2-SC02 | T026–T060 | Non exécuté |
| S2-SC03 | T037–T048 | Non exécuté |
| S2-SC04 | T061–T067 | Non exécuté |
| S2-SC05 | T072–T075 | Non exécuté |
| S2-SC06 | T068–T071 | Non exécuté |
| S2-SC07 | T077/T080 | Non exécuté |
| S2-SC08 | T078 | Non exécuté |
| S2-SC09 | T029/T034/T074 | Non exécuté |
| S2-SC10 | T056–T060/T076–T077 | Non exécuté |

Les matrices sont des engagements de couverture. Même si T001 est terminée, S2-FR20 ne sera satisfait qu'avec les preuves finales ; une tâche de préparation ne coche pas un scénario fonctionnel.

## Suivi de la première phase

| Tâche | Réalisation | Preuve |
|---|---|---|
| T001 | État initial et matrice complète | 51 scénarios et 38 exigences/critères reliés individuellement ; héritage Sprint 1 distingué |
| T002 | Fixtures API et contextes navigateur | Horloge locale, garde de base isolée et cas Unicode ; neuf tests de sécurité/horloge réussis, typage des fixtures navigateur réussi |
| T003 | Formats et exemples non approuvés | docs/guest-content.md et quatre JSON factices ; quatre couples type/langue, quatre SHA-256 et marqueurs de non-approbation vérifiés |
| T004 | Découverte et isolation | Jest ESM étendu aux tests de fixtures, intégration inchangée ; Vitest étendu aux opérations ; Playwright inchangé, 54 scénarios listés sur trois moteurs |
| T005 | Conventions documentées | docs/development.md complété : guides Next locaux, UI UX Pro Max/MASTER v2, frontières, tests, isolation et dépendances de contenu |

Les contrôles ci-dessous sont terminés : T001–T005 cochées, 5/80 ; les 75 tâches suivantes restent ouvertes.

## Contrôles directement observés — premier incrément

| Commande / contrôle | Résultat et portée |
|---|---|
| `pnpm exec tsc -p apps/api/tsconfig.test.json --noEmit` avant le garde | Échec attendu TS2305 : assertGuestTestDatabase absent ; constat avant ajout du garde |
| `pnpm test:unit` après implémentation | PASS : 60 tests Vitest (6 fichiers) et 72 tests API Jest (5 suites), soit 132 ; neuf nouveaux tests de fixtures, 123 tests existants toujours réussis |
| Compilation API incluse dans les unitaires | PASS : JS ESM et tests compilés, client Prisma généré ; aucune migration ou connexion de recette PostgreSQL exécutée par cette génération |
| Typage ciblé TypeScript | PASS pour tests/e2e/fixtures/guest.ts, playwright.config.ts et vitest.config.ts ; options strictes et résolution Bundler, aucun code Next produit modifié |
| `pnpm lint` | PASS |
| `pnpm format:check` | PASS ; fichiers nouveaux explicitement formatés avec Prettier, dont docs/guest-content.md |
| `pnpm exec vitest list --filesOnly` | Six fichiers existants découverts ; les nouveaux tests d'opérations seront apportés en T058, aucun fichier vide ajouté |
| `pnpm test:e2e --list` | 54 tests dans cinq fichiers, Chromium/Firefox/WebKit conservés ; découverte seulement, aucune exécution navigateur |
| Vérification JSON via Node assert/crypto | PASS : quatre fichiers parseables, non-approbation explicite, quatre documents FR/MG/type et SHA-256 exacts ; six réservés et données synthétiques/counterexamples cohérents |

Le typage ciblé a été lancé avec `pnpm exec tsc --noEmit --target ES2023 --module ESNext --moduleResolution Bundler --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --esModuleInterop --skipLibCheck --types node tests/e2e/fixtures/guest.ts playwright.config.ts vitest.config.ts`.

### Fichiers et limites

Ajouts : `apps/api/test/fixtures/guest.ts`, `apps/api/test/fixtures/guest.spec.ts`, quatre JSON dans `apps/api/test/fixtures/guest-content/`, `tests/e2e/fixtures/guest.ts`, `docs/guest-content.md` et ce rapport. Ajustements : découverte Jest/Vitest, docs/development.md, ignore files Docker/ESLint/Prettier et cases T001–T005. Le fichier playwright.config.ts est conservé : ses paramètres existants couvrent déjà les trois moteurs et le worker isolé.

Aucune version/dépendance changée, aucun contenu de production approuvé, aucun serveur de développement arrêté/démarré ni volume nettoyé. Les sources produit web/API et la migration 0001 ne sont pas modifiées. Les unitaires compilent le socle et génèrent des artefacts ignorés ; cela ne constitue pas un déploiement.

Les suites d'intégration PostgreSQL et E2E ne sont pas exécutées pour ce changement de préparation. Le pipeline complet pnpm quality, les scénarios invités, Web Locks réel, cookies HTTPS, expiration/purge/restauration et les approbations restent à prouver aux tâches concernées. Les 51 scénarios fonctionnels de la matrice restent donc non exécutés, sans confusion avec les neuf tests de fixtures réussis.

Prochaine phase : fondations T006–T019, en commençant par les tests de configuration/contrats puis le modèle et la migration additive. Cette première exécution est volontairement limitée à la phase 1 demandée ; elle ne clôture pas le Sprint 2.
