# Guide de validation — Sprint 1

Commandes cibles APRÈS implémentation ; non exécutables sur l'état documentaire actuel. Aucun script applicatif créé ici.

## Préconditions

Node 24 LTS corrigé ≥24.15, pnpm exact futur packageManager, Docker Compose v2, Git et PowerShell Windows. Linux CI ; appareils réels de la spec. Versions figées, jamais latest. Env locaux depuis exemples futurs, identifiants locaux sans valeur production. Ports 3000/3001 et données 5432/6379 loopback.

## Démarrage depuis une copie propre

Commandes séparées depuis la racine :

```powershell
pnpm install --frozen-lockfile
docker compose -f infra/docker/compose.yaml up -d --wait
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:migrate:status
pnpm dev
```

Le bootstrap initial crée le lockfile ; frozen-lockfile est obligatoire dans les clones suivants/CI. Scripts db utilisent Prisma 7 avec config explicite : génération client, application historique et statut. db:migrate:dev pour concevoir une nouvelle migration locale, jamais en CI.

Builds/lancements indépendants à fournir :

```powershell
pnpm --filter @kopaka/web build
pnpm --filter @kopaka/api build
pnpm --filter @kopaka/web dev
pnpm --filter @kopaka/api dev
```

Les dépendances workspace sont construites par ces scripts/Turbo, aucun dist absent au runtime.

## Santé et validation

```powershell
curl.exe -i http://localhost:3001/health/live
curl.exe -i http://localhost:3001/health/ready
curl.exe -i "http://localhost:3001/health/ready?unexpected=1"
```

Attendu : 200 alive, 200 ready, 400 INVALID_REQUEST ; bodies minimaux et no-store. À http://localhost:3000, page fondation et indicateur Disponible, distinct des exemples. Voir [HTTP](contracts/http.md).

## Pannes et reprise réelles

Sur environnement local dédié :

```powershell
docker compose -f infra/docker/compose.yaml stop redis
```

Live reste 200, ready devient 503 ; Réessayer dans la page → Indisponible, contenu chargé conservé.

```powershell
docker compose -f infra/docker/compose.yaml start redis
```

Après santé Docker positive, Réessayer → Disponible. Refaire séparément avec postgres. Puis arrêter uniquement l'API dans son terminal : échec réseau ; relancer API et Réessayer sans reload complet. Ces scénarios ne sont pas mockés.

## Migration/persistance

Base test vide isolée : deploy, singleton version 1, second deploy sans changement ni doublon ; restart postgres préserve ligne/date. Pas de route d'écriture de fixture. Nettoyage seulement sur base identifiée du run ; aucun reset/down -v/flushall sur environnement courant.

## Qualité

```powershell
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm build
pnpm test:e2e
```

Services/ports/données dédiés aux tests. E2E sur bundle production, vraie chaîne web/API/données pour normal/panne/reprise ; mocks identifiés pour timeout/JSON invalide/réponse tardive seulement. API tests sur JS ESM compilé avec metadata. Prouver échec CI par anomalie contrôlée en environnement de recette, retirée avant intégration.

## Recette UX

Vérifier cinq largeurs 320/375/768/1024/1440, portrait/paysage, clavier/focus, FR/MG et reload, stockage bloqué, thèmes clair/sombre/system explicitement choisi, zoom 200 %, expansion 40 %, reduced-motion. html lang suit la langue ; clair par défaut même sur OS sombre. Aucun warning d'hydratation.

Relecture des libellés MG attestée par un locuteur. Contrastes par état et thème ≥4,5:1 texte, ≥3:1 contrôle/focus. Réutiliser le script de contraste existant dans un contexte qui n'écrase pas ses rapports de référence. Consigner Chrome/Edge/Firefox/Safari, Android et Safari iOS réels ; WebKit Playwright seul ne suffit pas. Mesurer chargement/Core Web Vitals avec appareil/réseau consignés.

## Preuves attendues

Rapport futur : commit et versions exactes, commandes/résultats, pannes/reprise, installation par autre personne, recette mobile, MG et absence de secrets dans ressources/logs. Aucun bug critique introduit ni fonction hors périmètre. Réussite = fondations seulement, pas MVP Domino.
