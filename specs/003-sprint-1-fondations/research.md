# Recherche — Sprint 1, fondations

Date : 2026-11-02. Recherche officielle et inspection locale, sans installation ni implémentation.

## R1 — Existant

**Décision** : nouveau socle apps/packages/prisma/infra, références conservées.
**Justification** : aucun package.json, lockfile ou application trouvé ; catalogue HTML de design existant non assimilé à une application réseau. Préserver les modifications README et éléments non suivis préexistants.
**Alternatives** : refonte du catalogue et modules métier vides rejetés.
**Sources** : constitution, cahier des charges, plan/backlog racine et spec clarifiée.

## R2 — Versions

**Décision** : baseline Node 24 LTS corrigé ≥24.15, Next 16, Nest 12, TypeScript 6 compatible outils, Prisma 7, pnpm 10, Turbo 2, Tailwind 4, PostgreSQL 17 et Redis 7.4 corrigés. Exact patches et digests à figer au bootstrap après vérification peer dependencies, sans latest/canary/RC.
**Justification** : documentation Nest actuelle cible Nest 12 ESM et son générateur exige une version Node supérieure au minimum runtime. Prisma 7 documente Node 24 et migrate dev/deploy. Ne pas mélanger avec commandes d'une autre majeure.
**Alternatives** : Node 20 non retenu ; maintenance Nest 11 non vérifiée ; Prisma 8 RC non retenu.
**Sources** : [Node releases](https://nodejs.org/en/about/previous-releases), [Nest migration](https://docs.nestjs.com/migration-guide), [Prisma 7 requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements), [Next installation](https://nextjs.org/docs/app/getting-started/installation), [pnpm installation](https://pnpm.io/installation).
**Limite** : pas de lockfile ni test d'installation réalisé. Une incompatibilité constatée devra être résolue avant code fonctionnel, sans downgrade silencieux.

## R3 — Packages/compilation

**Décision** : workspace:* ; shared-types sans framework ; validation Zod et exports navigateur/serveur séparés ; UI React isolée ; packages runtime compilés ESM. API tsc NodeNext avec metadata décorateurs ; tests API Jest sur JS compilé plutôt que transpilation esbuild seule.
**Justification** : résolution déterministe, pas d'import interne serveur depuis navigateur, injection Nest préservée.
**Alternatives** : TS brut runtime non exporté, double validation class-validator/Zod et état global frontend supplémentaire non nécessaires.
**Sources** : [pnpm workspaces](https://pnpm.io/workspaces), [Turbo structure](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository), [packages internes](https://turborepo.dev/docs/core-concepts/internal-packages), [Nest testing](https://docs.nestjs.com/fundamentals/testing).

## R4 — Santé HTTP

**Décision** : liveness indépendante ; readiness exige PostgreSQL initialisé et Redis PONG ; HTTP direct navigateur/API en local avec CORS exact, aucune donnée interne retournée. Délais bornés et réessai manuel.
**Justification** : satisfait la clarification validée sans connexion permanente. Le shell reste lisible quand API/données tombent.
**Alternatives** : Socket.IO/SSE/polling et BFF non nécessaires ; réponse brute de sonde rejetée pour éviter fuite.
**Sources** : [Nest health checks](https://docs.nestjs.com/recipes/terminus), [Nest CORS](https://docs.nestjs.com/security/cors), [Next server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components).
**Paramètres techniques** : 1 s par dépendance, 2 s API, 3 s navigateur ; débit 30/minute et 4 sondes concurrentes ; aucun délai de jeu ou SLA produit.

## R5 — Stockage minimal

**Décision** : Prisma 7 + adapter-pg, configuration et génération explicites ; migration initiale crée et remplit un singleton technique version 1. Readiness lit ce singleton. Redis sans données métier.
**Justification** : migration/persistance prouvables sans User/GuestIdentity prématurés ; pool pg avec timeouts explicites.
**Alternatives** : schéma métier complet rejeté ; base sans marqueur ne prouve pas l'initialisation ; db push seul ne remplace pas historique.
**Sources** : [Prisma 7 upgrade](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7), [Prisma 7 migrations](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production).

## R6 — Design et préférences

**Décision** : tokens existants importés une fois, aliases shadcn/Tailwind vers Kopaka ; FR/clair par défaut ; choix système explicite ; stockage versionné et fallback mémoire.
**Justification** : tokens/COMPONENTS concordent avec rayons v2. MASTER remplace explicitement v1 contradictoire. Foundation n'est pas landing/lobby.
**Alternatives** : nouvelle palette, thème OS automatique initial et polices/traductions distantes rejetés.
**Sources** : design-system/kopaka/MASTER.md, tokens.css, COMPONENTS.md ; [Tailwind theme](https://tailwindcss.com/docs/theme). UI UX Pro Max appliqué à focus/clavier/mobile/mouvement réduit, valeurs Kopaka prioritaires.

## R7 — Qualité

**Décision** : unitaires ciblés, vraie intégration données, E2E réel santé/panne/reprise et tests mockés séparés ; vrais appareils ; CI Linux et smoke Windows.
**Justification** : ne pas déclarer la chaîne fonctionnelle sur mocks ni Safari iOS sur WebKit seul.
**Alternatives** : tests entièrement mockés, tests Domino ou infrastructure de charge MVP anticipée rejetés.
**Sources** : constitution/spec ; [Playwright projects](https://playwright.dev/docs/test-projects), [Nest testing](https://docs.nestjs.com/fundamentals/testing).

## Résolution

Choix de conception résolus ci-dessus ; les exact patches, builds et appareils constituent des preuves futures de réalisation. Relecture MG et décisions métier « À VALIDER » restent explicitement non acquises, sans règle métier par défaut.
