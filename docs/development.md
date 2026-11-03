# Développement Kopaka

## État livré

US1 à US5 fournissent le monorepo, les contrats HTTP, PostgreSQL/Redis, la santé et une page de fondation FR/MG avec thèmes. La relecture MG a été confirmée par le propriétaire le 2026-11-03 sans correction. US6 ajoute la chaîne qualité et la CI ; ses preuves sont dans [validation.md](../specs/003-sprint-1-fondations/validation.md). Aucun compte, invité, lobby, jeu ou Socket.IO actif n'est livré au Sprint 1.

## Prérequis

- Git, Node **24.22.2** (fichier `.node-version`, plage autorisée ≥24.15 et <25) et pnpm **10.8.0** (`packageManager`). Les dépendances et images sont figées ; ne pas remplacer par `latest`.
- Docker avec Compose v2 ou supérieur et moteur Linux démarré. Versions locales vérifiées : Docker 29.9.2 et Compose 5.6.1. Windows PowerShell est supporté ; la CI prévoit Linux et une installation/build Windows.
- Ports locaux libres : web 3000, API 3001, PostgreSQL 5432 et Redis 6379. Les services écoutent sur loopback.

Vérifier `node --version`, `pnpm --version`, `docker version` et `docker compose version`. Si Docker Desktop est installé par utilisateur sous Windows et absent du PATH :

```powershell
$env:PATH = "$env:LOCALAPPDATA/Programs/DockerDesktop/resources/bin;$env:PATH"
```

Ce changement ne concerne que le terminal courant.

## Installation depuis une copie propre

Depuis la racine du dépôt :

```powershell
pnpm install --frozen-lockfile
Copy-Item infra/docker/.env.example infra/docker/.env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

Choisir un mot de passe **local** et remplacer la valeur d'exemple dans `infra/docker/.env` et dans `DATABASE_URL` de `apps/api/.env`. Utiliser la même valeur, encodée dans l'URL si elle contient des caractères réservés. Ne pas réutiliser de secret de production. Ne pas écraser des fichiers env déjà configurés. Les exemples sont suivis, les fichiers env réels sont ignorés.

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:migrate:status
pnpm dev
```

Ouvrir <http://localhost:3000>. L'API écoute sur <http://localhost:3001>. Arrêter les processus dev avec Ctrl+C. La page reste lisible si l'API ou les données sont indisponibles.

Prisma et Nest chargent explicitement `apps/api/.env` ; Compose lit son propre fichier env. Les variables du processus priment. La génération Prisma ne contacte pas la base et ne nécessite pas de secret. Les migrations demandent une URL valide ; `db:migrate:dev` sert uniquement à concevoir une nouvelle migration. Ne pas utiliser `db push` ou `reset` à la place de l'historique.

## Configuration

| Variable                                        | Usage et défaut                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                                  | URL PostgreSQL privée obligatoire, API/Prisma uniquement                        |
| `REDIS_URL`                                     | URL Redis privée obligatoire                                                    |
| `WEB_ORIGIN`                                    | Origine web exacte obligatoire, normalement `http://localhost:3000`             |
| `API_PORT`                                      | Port API, 3001                                                                  |
| `NEXT_PUBLIC_API_BASE_URL`                      | Origine HTTP(S) publique de l'API, sans chemin ni identifiants, 3001 par défaut |
| `HEALTH_DEPENDENCY_TIMEOUT_MS`                  | Délai par sonde, 1000 ms                                                        |
| `HEALTH_TOTAL_TIMEOUT_MS`                       | Budget API, 2000 ms                                                             |
| `HEALTH_RATE_LIMIT_PER_MINUTE`                  | Readiness par IP/instance, 30                                                   |
| `HEALTH_MAX_CONCURRENT`                         | Évaluations concurrentes, 4                                                     |
| `PG_POOL_MAX`                                   | Connexions maximum, 4                                                           |
| `PG_CONNECT_TIMEOUT_MS` / `PG_QUERY_TIMEOUT_MS` | Connexion/requête SQL, 1000 ms                                                  |

Zod valide les valeurs et bornes. Une configuration invalide bloque le démarrage en citant uniquement les noms de variables. Ne pas publier de dump d'environnement ; seules les origines publiques sont autorisées dans les variables `NEXT_PUBLIC_*`.

## Applications indépendantes

```powershell
pnpm --filter @kopaka/web build
pnpm --filter @kopaka/api build
```

Puis lancer chaque commande dans un terminal séparé :

```powershell
pnpm --filter @kopaka/web dev
pnpm --filter @kopaka/api dev
```

En production locale, après build, remplacer `dev` par `start`. Les wrappers construisent les packages workspace nécessaires, même sans `dist` préexistant. L'API est compilée avec tsc NodeNext et les métadonnées Nest ; le client Prisma est généré avant compilation. Les applications restent indépendantes, sans import apps→apps.

## Santé, diagnostic et persistance

```powershell
curl.exe -i http://localhost:3001/health/live
curl.exe -i http://localhost:3001/health/ready
curl.exe -i "http://localhost:3001/health/ready?unexpected=1"
```

Attendu : 200 `alive` sans accès aux données ; 200 `ready` si le singleton PostgreSQL `sprint-1` version 1 est présent et Redis répond PONG ; sinon 503 `not_ready`. Query/header/corps interdits donnent 400 avant sondes. HEAD conserve statut et headers sans corps. Les contrats stricts, CORS, 405/429 et erreurs génériques sont décrits dans [http.md](../specs/003-sprint-1-fondations/contracts/http.md).

Readiness lance deux sondes concurrentes bornées, sans cache de succès ni réparation de données. Redis annule autant que possible ; les opérations Prisma expirées conservent leur place jusqu'à leur fin réelle et restent bornées par les limites de concurrence et de pool. Le quota en mémoire ne dépend pas de Redis ; `Retry-After` est positif en cas de 429 et `trust proxy` reste désactivé.

Les logs JSON stdout n'exposent que `timestamp`, `level`, `event`, `requestId` UUID optionnel, `durationMs`, `dependency` optionnelle et `outcome` normalisé. Événements : `http_request`, `dependency_check`, `readiness_check`, `shutdown`. Les pannes et délais sont warn, les défauts inattendus error. Aucune URL privée, IP, stack, préférence ou erreur brute de driver ; conservation durable à définir avant production.

Pour vérifier la persistance, ouvrir psql sur un environnement dédié :

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml exec postgres psql -U kopaka -d kopaka
```

Relever `SELECT * FROM "PlatformBootstrap";`, réappliquer `pnpm db:migrate:deploy`, redémarrer normalement PostgreSQL et comparer id/version/date. Le singleton est créé par migration, sans seed mutable. Aucun reset ni suppression de volume.

## Panne et reprise sur environnement dédié

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml stop redis
# Vérifier live 200, ready 503 et Indisponible après Réessayer.
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait redis
# Réessayer doit redonner Disponible sans recharger la page.
```

Refaire séparément pour PostgreSQL. Arrêter puis relancer uniquement l'API : le contenu reste présent et un réessai après reprise rétablit l'état. Ne pas provoquer ces pannes sur un environnement partagé. Les tests automatisés utilisent exclusivement leurs projets Compose.

## Contrôles qualité

Installer les navigateurs une fois :

```powershell
pnpm exec playwright install chromium firefox webkit
pnpm quality
```

La commande exécute, dans l'ordre : `lint`, `format:check`, `typecheck`, `test:unit`, `test:integration`, `build`, `test:e2e`. Chaque commande reste disponible séparément. Une erreur donne un code global 1, identifie le contrôle fautif et marque les suivants `skipped` ; aucune réussite n'est supposée. `quality-results/summary.json` contient les résultats et durées, sans environnement ni secret. Un filtre explicite permet un contrôle ciblé :

```powershell
pnpm quality --only lint,format:check,typecheck
pnpm test:e2e tests/e2e/accessibility.spec.ts --project=chromium
```

Un filtre ne prouve que les contrôles sélectionnés. Les tests API Jest s'exécutent sur le JS ESM précompilé ; Vitest couvre packages/UI et préférences. Données et E2E restent sans cache. Les artefacts générés sont ignorés par Git, ESLint et Prettier.

| Recette   | Projet/base isolés                                  | Ports                                               |
| --------- | --------------------------------------------------- | --------------------------------------------------- |
| Migration | `kopaka-test-<runId>` / `kopaka_test`               | 15432, 16379                                        |
| Santé API | `kopaka-health-test-<runId>` / `kopaka_health_test` | 15433, 16380                                        |
| E2E       | `kopaka-web-test-<runId>` / `kopaka_web_test`       | web 13010, API 13011, PostgreSQL 15434, Redis 16381 |

Un seul run par recette à la fois ; Playwright utilise un worker et des navigateurs séquentiels. Mot de passe éphémère généré par run, filtré des logs E2E. Les conteneurs/réseaux de test sont retirés en fin de run, les volumes conservés. Aucun `down -v`, `flushall`, `flushdb` ou accès à la base courante.

Les E2E construisent la production dans `.next-e2e` (`KOPAKA_E2E_BUILD=1`, réservé à la recette), distinct de `.next` et des ports de développement. `health-real.spec.ts` couvre la vraie chaîne et les pannes ; `health-simulated.spec.ts` identifie les réponses/délais/offline simulés. `preferences.spec.ts` couvre FR/MG et persistance. `accessibility.spec.ts` couvre axe, clavier/focus, états, deux thèmes/langues, cinq largeurs, mouvement réduit et expansion de texte. `foundation.spec.ts` conserve CSP, contrastes calculés et zoom CSS.

Les rapports HTML sont dans `playwright-report/`, JUnit, traces d'échec et pièces jointes dans `test-results/`. Chaque test porte l'annotation `browser-version` (moteur, version, OS, architecture et Node). Lire le rapport avec `pnpm exec playwright show-report`. WebKit automatisé ne vaut pas Safari iOS réel ; axe et zoom CSS ne remplacent pas les preuves manuelles de contrastes, lecteur d'écran, zoom navigateur et appareils de T052–T053.

WebKit 27.2 émet un avertissement CSP connu sur les sélecteurs natifs ([Playwright #43497](https://github.com/microsoft/playwright/issues/43497)). Le test existant n'excepte que ce message exact et cette version, en consignant le nombre d'occurrences. Les autres erreurs restent bloquantes et les handlers inline non autorisés sont vérifiés comme interdits. La CSP produit n'est pas assouplie.

## CI GitHub Actions

`.github/workflows/ci.yml` s'exécute sur push, pull request ou lancement manuel : Linux réalise tous les contrôles et les trois navigateurs avec services Docker dédiés ; Windows vérifie installation figée, types et builds sans fichier env local. Actions épinglées par SHA, Node/pnpm exacts, permissions lecture seule, aucun cache de données ou dump env. Rapports qualité/navigateurs conservés 14 jours, y compris après échec.

Sources de configuration : [GitHub Actions Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs), [Playwright CI](https://playwright.dev/docs/ci-intro). Le propriétaire a confirmé globalement les validations finales, dont la CI distante ; aucun lien de run n'a été transmis à l'agent. Cette confirmation est consignée dans validation.md, distinctement des résultats locaux.

## Shell, préférences et sécurité navigateur

Tous les textes viennent des dictionnaires FR/MG. `kopaka.locale.v1` accepte `fr`/`mg` et se replie sur `fr`. `kopaka.theme.v1` accepte `light`/`dark`/`system` et se replie sur `light`, même sur OS sombre. Le système n'est suivi que sur choix explicite. Stockage inaccessible : mémoire pour la visite, sans promesse de persistance ; une clé invalide ne supprime pas les autres.

Le serveur et le premier rendu React sont FR/clair ; les providers se réconcilient après montage et mettent à jour `html lang`, `data-theme` et le titre. Changer de langue ne relance pas la santé, ne perd pas les champs et n'envoie pas les préférences au serveur. Le navigateur fait un appel au montage puis uniquement sur Réessayer, sans credentials/polling, avec timeout 3 s et annulation des réponses obsolètes. Le réessai invalide l'ancien résultat et conserve le focus.

Tokens Kopaka importés une fois via `@kopaka/ui/styles.css`, polices système immédiates et aucun asset distant nécessaire. La CSP de production utilise un nonce par requête, sans `unsafe-inline`/`unsafe-eval`, avec `frame-ancestors 'none'`, `nosniff`, `no-referrer` et origine API explicite. Le proxy Next ajoute les headers sans relayer l'API. Exceptions HMR limitées au développement.

## Dépannage et transmission

- Docker introuvable : ajouter le chemin ci-dessus au terminal, puis vérifier le moteur Linux et Compose. Ne pas substituer des mocks à la recette réelle.
- `Run E2E through pnpm` : utiliser `pnpm test:e2e`, pas `pnpm exec playwright test`, car le harnais réutilise `npm_execpath` pour les builds.
- Port occupé : identifier le processus ; ne pas arrêter une instance inconnue. Ajuster ensemble les ports et URL de l'environnement concerné.
- Erreur de configuration : vérifier le nom indiqué et le fichier chargé ; ne pas copier les valeurs privées dans le rapport.
- `dist` ou client Prisma absent : utiliser les scripts workspace documentés ou `pnpm db:generate`, pas une exécution directe sur des sources TS.
- API vivante mais non prête : vérifier données, migrations et logs normalisés ; aucune réparation automatique du singleton.
- Échec qualité : lire le premier contrôle `failed` et ses logs, corriger, puis rejouer la commande appropriée. Des contrôles `skipped` ne sont pas validés.

Pour T050, une personne autre que l'auteur suit ce guide depuis une copie propre, sans aide orale indispensable. Consigner dans `specs/003-sprint-1-fondations/validation.md` : personne, date, OS/versions, version du code, étapes, résultats et difficultés. Le propriétaire a confirmé cette réalisation le 2026-11-03 et T050 est cochée sur sa déclaration ; les informations détaillées non transmises ne sont pas supposées.

## Sprint 2 — premier incrément : préparation (T001–T005)

Cette phase ajoute des fixtures et prépare la recette ; elle ne fournit encore
aucune identité invitée, migration, route /guest, page de lobby ou compte. La
spécification, les contrats et la liste de travail sont dans
`specs/004-sprint-2-invite-lobby/`. Le rapport `validation.md` de ce dossier
sépare les acquis Sprint 1, les confirmations et les nouveaux résultats observés.

### Conventions à suivre avant les changements produit

Avant d'écrire dans `apps/web`, lire `apps/web/AGENTS.md` puis les guides
pertinents de `apps/web/node_modules/next/dist/docs/` pour la version installée
(App Router, formulaires, authentification et cache selon le changement). Ne pas
supposer qu'une convention d'une ancienne version reste correcte. Pour les
choix UI, utiliser `.agents/skills/ui-ux-pro-max/SKILL.md`, MASTER v2 et ses
références accueil/lobby ; les prototypes ne valident pas des fonctionnalités
métier futures.

Réutiliser Field, Button, Card, Select, StatusMessage, LocaleProvider et
ThemeProvider. Préserver le clair/FR initial, préférences, CSP/nonce, qualité et
santé du Sprint 1. Les nouvelles routes /invite, /lobby, /conditions et
/confidentialite et le déplacement de la démonstration vers /foundation sont à
implémenter dans leurs tâches ; ils n'existent pas du fait de ce guide.

Conserver les frontières web/API et exports publics/serveur. Aucun secret,
configuration privée ou preuve d'accès en localStorage/URL/bundle. Au Sprint 2,
seule une entrée utilisateur explicite au lobby peut renouveler l'identité ;
montage React, préchargement, contrôle passif, langue et thème ne sont pas des
activités. Lire les corrections de contrat cookie/CSRF/récupération avant T039.
Les comptes restent au Sprint 7 ; aucune salle, partie ou présence anticipée.

### Fixtures et isolation

- `apps/api/test/fixtures/guest.ts` fournit une horloge locale injectable aux
  tests, des cas de noms et un garde de cible. Aucun Date global modifié,
  variable de production ou endpoint public de changement d'heure.
- Avant tout futur nettoyage invité, appeler `assertGuestTestDatabase` avec
  l'URL et le nom attendu : loopback, port 15435 et base dédiée
  `kopaka_guest_test_<8 caractères hexadécimaux>` propre au run. Le garde ne
  connecte pas la base et ne supprime rien ; il ne remplace pas la création
  d'un projet/base isolé ni les permissions PostgreSQL. Ne pas utiliser la base
  courante, migrate reset, down -v ou un nettoyage global Redis.
- `readGuestContentFixture` exige explicitement le répertoire des données de
  test ; aucun chemin de déploiement par défaut. Formats et approbations attendus
  dans [guest-content.md](guest-content.md). Aucun des exemples n'est approuvé
  pour production ; ne jamais les charger en repli d'une configuration privée.
- `tests/e2e/fixtures/guest.ts` étend le harnais existant sans l'exécuter au simple
  import. `firstGuest` et `independentGuest` sont deux contextes sans cookies
  partagés. Pour deux onglets d'une même identité, appeler deux fois
  `firstGuest.newPage()`. Les contextes de test sont fermés en finally ; aucun
  stockage de navigateur externe ou fichier de session persistant modifié.
- Ce harnais réutilise les ports isolés web/API 13010/13011 et PostgreSQL/Redis
  15434/16381 du Sprint 1 ; il n'utilise pas le serveur de développement. Le port
  15435 est réservé au futur harnais API invité distinct. Ne pas lancer les deux
  recettes d'une même catégorie simultanément.

### Découverte et contrôles de tests

Les versions installées et la chaîne ESM sont conservées. Jest découvre les
unitaires compilés de `src` et ceux de `test/fixtures`; le mode intégration
reste exclusivement `**/*.integration-spec.js`. Vitest conserve les suites
packages/web et découvre aussi `tests/operations/**/*.test.ts`. Un futur test
opérationnel Node doit porter `// @vitest-environment node` ; ne pas changer le
environnement jsdom des composants existants.

Playwright conserve ses trois projets Chromium, Firefox et WebKit, un worker
et la découverte existante dans `tests/e2e`. Les helpers de fixtures ne sont
pas des tests ; aucun scénario produit vide ou ignoré n'est créé pour annoncer
une couverture fictive.

```powershell
pnpm test:unit
pnpm --filter @kopaka/api test:integration
pnpm exec vitest list --filesOnly
pnpm test:e2e --list
```

Les deux commandes list ne prouvent que la découverte, pas une recette exécutée.
La première phase peut être vérifiée sans démarrer de navigateur ou toucher une
base : compilation des tests API, tests unitaires, lint/format et liste des
scénarios E2E. Les recettes de migration, réponses perdues, horloge, cookies
HTTPS et restauration restent à construire/exécuter selon les tâches suivantes.

T074/T075 restent des dépendances de livraison. Ne pas ouvrir l'admission réelle
sans contenus/corpus approuvés, nouvelles traductions relues et contrôles
opérationnels. Les durées Sprint 2 sont celles des contrats : logs techniques
sans données invitées au plus 7 jours, sauvegardes au plus 30 jours. La rétention
historique des artefacts CI Sprint 1 décrite plus haut ne constitue pas une
validation de ces futures règles ; les destinations invitées seront adaptées et
vérifiées dans T058/T076 avant livraison.
