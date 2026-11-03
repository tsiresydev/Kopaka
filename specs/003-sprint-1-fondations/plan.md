# Implementation Plan: Kopaka — Sprint 1, fondations

**Branche Git réelle** : main, inchangée | **Identifiant Spec Kit** : 003-sprint-1-fondations | **Date** : 2026-11-02 | **Spec** : [spec.md](spec.md)

**Input** : spécification complète et deux clarifications validées. Le BRANCH retourné par Spec Kit identifie la fonctionnalité ; il ne prouve pas une création de branche Git.

## Summary

Monorepo pnpm/Turborepo : Next.js App Router et monolithe modulaire NestJS. La page de fondation présente les composants Kopaka, les langues, les thèmes et un indicateur réel de disponibilité. PostgreSQL/Prisma et Redis sont contrôlés côté serveur. Aucun invité, lobby, jeu ou argent réel.

Planification documentaire uniquement : aucune application, migration ou configuration exécutable créée ; aucun tasks.md. Références et priorités P0/P1 conservées.

## Technical Context

**Language/Version** : TypeScript strict ; Node 24 LTS corrigé ≥24.15 ; TypeScript 6 pour l'outillage Nest 12, sous contrôle des peer dependencies.

**Primary Dependencies** : Next.js 16 / React compatible avec sa release, Tailwind CSS 4, shadcn/ui adapté dans packages/ui, NestJS 12 avec Express, Prisma 7 et adapter-pg, client Redis officiel, Zod pour validation partagée, pnpm 10, Turborepo 2. Socket.IO reste retenu pour les futurs flux temps réel, sans gateway ni événement Sprint 1.

**Politique de versions** : baselines de conception, pas compatibilité déjà testée. À l'initialisation, vérifier les exigences des releases corrigées, puis figer leurs versions exactes dans les manifests, packageManager et lockfile ; images Docker corrigées avec digest. Pas de latest, canary ou RC. Une incompatibilité de peer dependency doit être résolue avant le code fonctionnel, sans changement majeur implicite. Voir [research.md](research.md).

**Storage** : PostgreSQL 17 corrigé avec volume nommé et singleton technique ; Redis 7.4 corrigé sans donnée métier. Ports liés à 127.0.0.1.

**Testing** : Vitest pour packages/UI ; Jest et Supertest sur sortie JavaScript ESM précompilée avec tsc pour l'API (metadata des décorateurs préservées, pas de transpilation esbuild seule) ; Playwright et axe pour E2E/a11y ; recette Safari iOS et Android réels. Versions des outils compatibles avec TypeScript et Node retenus à verrouiller.

**Target Platform** : Windows/PowerShell en local, Linux en CI et smoke build Windows ; Chrome, Edge, Firefox, Safari récents, mobile prioritaire.

**Project Type** : application web + API modulaire, sans microservices.

**Performance Goals** : une vérification au montage puis réessai manuel ; pas de polling. Sondes concurrentes, timeout 1 s chacune, budget API 2 s, navigateur 3 s. Valeurs techniques configurables, pas un SLA produit. Mesurer poids JS et chargement/Core Web Vitals sur mobile réel avec conditions consignées ; aucun seuil de charge MVP inventé.

**Constraints** : FR/MG, tokens Kopaka existants, cibles 48 CSS px, pas d'asset distant requis ; aucune décision métier « À VALIDER » convertie en règle.

**Scale/Scope** : une page, deux routes de santé, préférences locales et une table technique singleton ; une instance locale, sans objectif de concurrence de production.

## Constitution Check

Gates évaluées avant recherche et après conception :

| Principe | Avant | Après conception |
|---|---|---|
| I — Modularité | Conforme | Web/API/packages séparés ; monolithe Nest ; pas d'import apps → apps |
| II — Sécurité/autorité serveur | Conforme | Validation runtime ; disponibilité réelle serveur ; aucun score ou état de jeu client |
| III — Qualité/tests | Conforme | Types stricts, unitaires/intégration/E2E et build définis ; preuves à produire pendant réalisation |
| IV — Fiabilité/Socket.IO | Conforme au sprint | HTTP pour santé ponctuelle ; Socket.IO conservé pour les flux de partie futurs ; aucune reconnexion joueur anticipée |
| V — UX/accessibilité | Conforme | DS v2, clavier, contrastes, mobile-first, FR/MG et mouvement réduit |
| VI — Simplicité/évolution | Conforme | Aucun moteur vide, bus, microservice ou abstraction métier spéculative |
| Stack/périmètre/workflow | Conforme | Stack imposée et phases respectées ; pas de code ni de tâches ; décisions métier reportées |

Aucune violation. La validation de ce plan ne signifie pas que la recette ou les décisions Sprint 0 sont déjà acquises.

## Project Structure

### Documentation (this feature)

```text
specs/003-sprint-1-fondations/
  spec.md
  checklists/requirements.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    http.md
    ui.md
    realtime.md
```

### Source Code (repository root)

Structure cible, non créée par ce plan :

```text
apps/
  web/
    src/app/                  # layout, page fondation, globals, error
    src/features/foundation/
    src/features/preferences/
    src/lib/health-client/
    src/lib/i18n/
    src/messages/             # fr.json, mg.json
    tests/
  api/
    src/main.ts
    src/app.module.ts
    src/config/
    src/health/
    src/database/
    src/redis/
    src/common/               # logging, validation, errors
    test/
packages/
  shared-types/src/
  validation/src/
  ui/src/                     # composants, styles et aliases
prisma/                       # schema.prisma, migrations/, prisma.config.ts
infra/docker/compose.yaml
tests/e2e/
docs/development.md
.github/workflows/ci.yml
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
tsconfig.base.json
design-system/kopaka/          # référence existante conservée
```

**Structure Decision** : inspection sans application/package.json/lockfile existant ; dépôt documentaire et assets. Préserver les changements README et éléments préexistants. Réévaluer l'inventaire avant implémentation si le dépôt évolue. Aucun dossier game-engine, AuthModule ou RoomsModule vide nécessaire.

## Architecture technique

### Frontend et échange réel

Structure statique App Router côté serveur ; îlots client limités aux préférences, démos et HealthStatus. Le rendu HTML de la page ne dépend pas de la disponibilité API.

Le navigateur appelle directement l'API locale 3001, depuis web 3000, via NEXT_PUBLIC_API_BASE_URL, sans credentials. CORS allowlist exacte côté Nest. Pas de BFF/proxy supplémentaire ; aucune URL de données dans le bundle.

HealthStatus : une requête au montage, puis Réessayer ; une seule active ; abort au démontage/timeout ; réponses obsolètes ignorées. Pendant réessai, loading et bouton verrouillé, jamais ancien succès présenté comme actuel. 200 + schéma ready = disponible ; 503 = indisponible ; réseau/timeout/429/JSON incorrect = indisponible avec message localisé. Pas d'exception brute. Exemple simulé et indicateur réel sont distincts.

### API Nest

AppModule compose ConfigModule, DatabaseModule, RedisModule et HealthModule.

- Config : chargement explicite des variables et validation Zod ; configuration obligatoire invalide arrête le boot, en citant seulement le nom de variable.
- Database : PrismaClient unique et pool adapter-pg borné ; génération avant build ; fermeture propre ; timeouts de connexion et requête explicites.
- Redis : client unique, commande PING, offline queue désactivée, timeout et backoff de reconnexion bornés. Pas d'état joueur.
- Health : liveness sans dépendance ; readiness vérifie PostgreSQL via Prisma, singleton technique attendu et Redis PONG. Connexion indisponible au boot → HTTP vivant et non prêt ; pas de crash-loop pour simple panne de données.
- Common : logs JSON filtrés, erreurs génériques et validation HTTP sur routes réelles. Ne pas exposer les résultats détaillés de sondes.

Sondes à la demande et concurrence bornée ; opérations expirées annulées autant que possible et ressources libérées. Les limites du pool empêchent l'accumulation illimitée d'opérations. Pas de résultat ready ancien mis en cache.

### Packages et construction

shared-types : types et constantes sans framework. validation : Zod + shared-types, exports navigateur/serveur séparés ; configuration serveur non importable par le client. ui : React peer dependency, primitives shadcn nécessaires et styles Kopaka, sans Nest/Prisma/Redis.

workspace:* pour dépendances internes. Packages runtime compilés ESM avec exports explicites ; API tsc NodeNext, imports relatifs .js et metadata décorateurs. Next consomme les exports workspace ; sources Tailwind UI déclarées explicitement. Frontières contrôlées par lint/revue.

Turborepo : build dépend de ^build ; génération Prisma avant build API ; outputs explicites ; dev persistant sans cache ; migration/intégration/E2E non cachés. Les données ou secrets ne sont jamais outputs de cache.

## Données et migration initiale

Voir [data-model.md](data-model.md). Table technique PlatformBootstrap singleton : id sprint-1, version 1 et date UTC. Création et insertion par migration versionnée, sans seed mutable ni API d'écriture.

Prisma 7 : config et schéma sous prisma/, adapter-pg, variables explicitement chargées, client généré hors frontend. migrate dev uniquement pour concevoir localement ; migrate deploy pour appliquer l'historique en recette/CI ; génération client explicite. Pas de db push ou reset comme substitution à l'historique.

Readiness lit le singleton et refuse base vide/version inattendue sans réparation automatique. Redis n'a aucune donnée de présence ; tests avec clés préfixées et TTL, jamais flushall. Réapplication et redémarrage volume vérifiés sans créer de modèle métier.

## Contrats et temps réel

[HTTP](contracts/http.md) : deux routes, statuts, schémas stricts, erreurs et CORS.
[UI](contracts/ui.md) : composition, préférences et états.
[Temps réel](contracts/realtime.md) : aucun flux nécessaire, Socket.IO réservé aux futurs sprints.

Les entrées malformées sont testées via query/header des routes réelles, configuration et préférences ; aucun endpoint POST artificiel de validation.

## Sécurité

- Loopback pour web/API/données. HTTPS et stratégie de déploiement à définir avant exposition externe, non livrée ici.
- CORS origine web exacte, pas de wildcard/credentials ; GET/HEAD/OPTIONS pour santé. CORS n'est pas une authentification.
- Réponses santé publiques minimales status uniquement ; diagnostics normalisés dans logs locaux, pas de route de détail.
- Header X-Request-Id optionnel UUID borné validé ; absent → généré. Aucun header brut ou IP dans les logs.
- Validation stricte query/header et limites de transport ; erreur générique sans stack, URL de connexion ou message brut de driver.
- Readiness : 30 demandes/minute/IP et 4 évaluations concurrentes maximum par instance, configurables. Limites en mémoire, indépendantes de Redis ; trust proxy désactivé en local ; 429 avec Retry-After. Liveness sans limite fondée sur données.
- Logs stdout JSON : timestamp, level, event, requestId, durationMs, dependency enum et résultat ; pas de secrets, données de formulaire ou préférences. Rétention de production À VALIDER.
- Fichiers env ignorés, exemple sans secret réel, aucune clé secrète NEXT_PUBLIC, aucun dump d'environnement CI.
- Headers nosniff/referrer-policy restrictive ; CSP frame-ancestors none, scripts et assets locaux, connect-src API autorisée. Script initial de préférence protégé par hash fixe ou nonce, pas unsafe-inline en build production. HMR autorisé uniquement en développement.
- Aucun faux système d'authentification, de session ou de permission ajouté au Sprint 1.

## Design System, i18n et responsive

UI UX Pro Max appliqué aux choix d'accessibilité/mobile ; les valeurs Kopaka priment. MASTER v2, COMPONENTS et tokens concordent sur carte 28 px, contrôle 16 px et dialogue 32 px. Importer tokens.css existant une seule fois au layout via package UI ; aliases Tailwind/shadcn vers variables sémantiques ; aucun thème parallèle ni couleur brute dans les composants.

Page foundation sans page de référence dédiée ; landing/lobby/domino restent exclus. Pas de liens Jouer/Profil/Classement inopérants. Composants limités à bouton, champ avec aide/erreur, carte, sélecteur, message ; pas de modal sans besoin.

Une colonne 320–767, grille lisible dès 768, max 1200 dès 1024 ; gouttières 16/24/32 px. Corps 16 px, cibles 48 px, écart 8 px, focus 3+3 px. Textes +40 %, zoom 200 %, portrait/paysage. États textuels, clavier complet, région polite pour disponibilité, pas de vol de focus, reduced-motion.

Préférences versionnées et validées, fallback FR/clair, mémoire si stockage refusé. Script local initial applique lang/data-theme, puis providers synchronisés après montage ; contenu SSR et première hydratation FR/clair cohérents, aucun localStorage au rendu serveur ni page masquée. Système suit matchMedia seulement si explicitement choisi. Repli typographique système tant que les fontes locales/licenciées manquent ; aucun runtime distant. Textes MG relus avant recette.

## Tests et CI

| Niveau | Scénarios | Exigences |
|---|---|---|
| Unitaires contrats/config | schémas valides/invalides, enums, configuration sans fuite | US02, FR03, NFR07 |
| Unitaires API | agrégation, deadline, filtrage, concurrence et fermeture | US03, FR05–06 |
| Unitaires UI | storage refusé/corrompu, thème système explicite, états health et résultat obsolète | US04–05 |
| Intégration réelle | PostgreSQL/Redis, singleton, 200/503/400/429, CORS et headers | US01–03, SC06–07 |
| Migration | base dédiée vide, deuxième deploy sans doublon, redémarrage conserve ligne/date | FR04 |
| E2E réel | web → API → données sans mock ; panne Redis/PostgreSQL/API puis reprise et réessai | FR08, SC09 |
| E2E simulé identifié | timeout, JSON incorrect, réponse tardive, offline après chargement | US04.4 |
| E2E UX | FR/MG reload, thèmes, clavier, cinq largeurs, +40 %, zoom, mouvement réduit | SC03–05 |
| Manuel | Safari iOS, Android, Safari/Edge réels, contrastes par état, lecteur écran et mesure mobile | NFR01–06, NFR11 |

Playwright WebKit ne vaut pas preuve Safari iOS. axe ne remplace pas le clavier/contraste manuel. Pas de tests Domino hors périmètre ni seuil de couverture cosmétique.

CI : frozen-lockfile → génération Prisma/build packages → lint/format/typecheck/unitaires → migrations et intégration services dédiés → build production/E2E. Linux avec services et navigateurs, smoke installation/build Windows. Tests de données et E2E sans cache ; nettoyage isolé sans suppression des volumes courants. Rapports et versions des navigateurs conservés comme preuves de recette futures.

## Phases et dépendances

Phase 0 : [research.md](research.md), choix documentés avec alternatives et sources.
Phase 1 : modèle, contrats et [quickstart.md](quickstart.md).

Réalisation future : socle/outils → packages → données et API santé → shell/préférences → intégration réelle → CI et recette. Ce sont des dépendances d'architecture ; aucune liste de tâches détaillée créée.

## Risques et validations restantes

| Point | Conséquence |
|---|---|
| Versions exactes et peer dependencies | preuve d'installation/build à produire au bootstrap ; changement de majeure nécessite une décision technique documentée |
| Relecture MG et appareils réels | moyens de recette à confirmer ; ne pas déclarer bilinguisme/Safari iOS validés sans preuve |
| Sprint 0 et textes/composition | clarifications fixent le shell ; ne pas considérer toutes les décisions de cadrage acquises |
| Production/rétention | À VALIDER avant exploitation durable ; aucun SLA, déploiement ou conservation chiffrée créé ici |
| Métier | identité, comptes, salles, abandon, Domino, progression restent À VALIDER hors Sprint 1 |

Aucune décision métier ne bloque la conception du socle. Les preuves techniques et validations humaines ci-dessus restent nécessaires à la livraison.

## Complexity Tracking

Aucune violation constitutionnelle. Ni microservice, bus, BFF, moteur générique ou modèle d'identité anticipé. Le singleton technique suffit à prouver initialisation et persistance sans règle métier.
