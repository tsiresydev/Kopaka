# Guide de validation — Sprint 1

État courant : Sprint 1 clôturé sur confirmation du propriétaire le 2026-11-03, 54/54 tâches cochées. La relecture malagasy a également été confirmée sans correction. Voir [development.md](../../docs/development.md) pour la procédure complète et [validation.md](validation.md) pour distinguer les résultats automatiques directement observés des validations confirmées par le propriétaire.

## Préconditions

Node 24.22.2 (plage autorisée ≥24.15 et <25), pnpm 10.8.0 figé dans packageManager, Docker avec Compose v2 ou supérieur, Git et PowerShell Windows. Versions figées, jamais latest. Env locaux depuis les exemples fournis, identifiants locaux sans valeur production. Ports 3000/3001 et données 5432/6379 loopback.

## Démarrage depuis une copie propre

Commandes séparées depuis la racine :

```powershell
pnpm install --frozen-lockfile
Copy-Item infra/docker/.env.example infra/docker/.env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
# Choisir un mot de passe local et aligner DATABASE_URL avant la suite.
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:migrate:status
pnpm dev
```

Le bootstrap initial crée le lockfile ; frozen-lockfile est obligatoire dans les clones suivants/CI. Scripts db utilisent Prisma 7 avec config explicite : génération client, application historique et statut. db:migrate:dev pour concevoir une nouvelle migration locale, jamais en CI.

Builds/lancements indépendants :

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

Attendu : 200 alive, 200 ready lorsque les données sont initialisées, 400 INVALID_REQUEST ; corps minimaux et no-store. Le shell affiche Disponible uniquement après une réponse ready valide. Voir [HTTP](contracts/http.md).

## Pannes et reprise réelles

Sur environnement local dédié :

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml stop redis
```

Live reste 200, ready devient 503. Le bouton Réessayer du navigateur doit afficher Indisponible.

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait redis
```

Après santé Docker positive, un nouveau contrôle ready doit retourner 200 et Réessayer doit rétablir Disponible sans reload. Refaire séparément avec postgres. Puis arrêter uniquement l'API dans son terminal : échec réseau ; relancer l'API et répéter le contrôle. Les pannes de données sont vérifiées sans mock par les tests isolés.

## Migration/persistance

Base test vide isolée : deploy, singleton version 1, second deploy sans changement ni doublon ; restart postgres préserve ligne/date. Pas de route d'écriture de fixture. Nettoyage seulement sur base identifiée du run ; aucun reset/down -v/flushall sur environnement courant.

## Qualité

```powershell
pnpm exec playwright install chromium firefox webkit
pnpm quality
```

Services/ports/données dédiés aux tests. E2E sur bundle production, vraie chaîne web/API/données pour normal/panne/reprise ; mocks identifiés pour timeout/JSON invalide/réponse tardive seulement. API tests sur JS ESM compilé avec metadata. Prouver échec CI par anomalie contrôlée en environnement de recette, retirée avant intégration.

## Recette UX

Vérifier cinq largeurs 320/375/768/1024/1440, portrait/paysage, clavier/focus, FR/MG et reload, stockage bloqué, thèmes clair/sombre/system explicitement choisi, zoom 200 %, expansion 40 %, reduced-motion. html lang suit la langue ; clair par défaut même sur OS sombre. Aucun warning d'hydratation.

Relecture des libellés MG attestée par un locuteur. Contrastes par état et thème ≥4,5:1 texte, ≥3:1 contrôle/focus. Réutiliser le script de contraste existant dans un contexte qui n'écrase pas ses rapports de référence. Consigner Chrome/Edge/Firefox/Safari, Android et Safari iOS réels ; WebKit Playwright seul ne suffit pas. Mesurer chargement/Core Web Vitals avec appareil/réseau consignés.

## Preuves attendues

Rapport futur : commit et versions exactes, commandes/résultats, pannes/reprise, installation par autre personne, recette mobile, MG et absence de secrets dans ressources/logs. Aucun bug critique introduit ni fonction hors périmètre. Réussite = fondations seulement, pas MVP Domino.
