# Modèle de données — Sprint 1

Conception seulement ; aucune migration ou modèle Prisma livré. Référence : [spec.md](spec.md). Aucune identité, salle ou partie.

## Préférences locales

| Élément | Clé | Valeurs | Règles |
|---|---|---|---|
| Langue | kopaka.locale.v1 | fr, mg | repli fr ; modifiable sans compte |
| Thème choisi | kopaka.theme.v1 | light, dark, system | repli light ; system explicitement choisi |
| Thème résolu | non persisté | light, dark | déduit du choix ; matchMedia seulement si system |

Chaînes validées, lecture/écriture try/catch. Stockage inaccessible → mémoire pour la visite ; aucune promesse de persistance. Ignorer uniquement la clé invalide, ne pas vider tout le stockage. Aucun cookie, id joueur ou transfert API. html lang et data-theme actualisés ; rendu SSR FR/clair lisible et hydratation initiale cohérente, providers réconciliés après montage.

## PlatformBootstrap — singleton PostgreSQL

| Champ | Type | Contrainte |
|---|---|---|
| id | chaîne courte | PK, valeur sprint-1 |
| schemaVersion | entier positif | version attendue 1 |
| initializedAt | date UTC | non nulle, créée par migration |

Table et ligne créées par migration initiale versionnée ; singleton contraint par la migration. Aucune relation métier ni endpoint public de lecture détaillée/écriture. Pas de seed mutable.

Cycle : base vide → migration et version 1 → données prêtes. Table/ligne absente ou version inattendue → not_ready. Healthcheck jamais réparateur. Deuxième application de l'historique → sans mutation. Test de redémarrage relit ligne/date identiques. Fixture éventuelle sur base test isolée, sans route d'écriture.

## Métadonnées de migration

Historique géré par Prisma 7, distinct du singleton. Statut consultable en CLI de recette, pas exposé au navigateur. Pas de modèles de comptes anticipés.

## Santé éphémère

| Champ interne | Valeurs | Diffusion |
|---|---|---|
| live | booléen | status alive minimal |
| postgres | up/down/timeout/schema_mismatch | logs serveur |
| redis | up/down/timeout | logs serveur |
| ready | booléen | status ready/not_ready |
| checkedAt | date UTC | interne |
| durationMs | nombre ≥0 | logs |

Sans historique durable ni ancien succès caché. Readiness = PostgreSQL version attendue ET Redis PONG. Liveness n'appelle aucune dépendance.

## État UI

idle → loading au montage ou réessai → available sur 200 conforme, sinon unavailable. Réessai invalide l'état précédent ; demandes obsolètes ignorées ; démontage annule. Exemples de composants indépendants de l'indicateur réel.

## Logs

Champs autorisés : timestamp, level, event enum, requestId UUID optionnel, durationMs, dependency enum postgres/redis, outcome normalisé. Pas de corps, IP, URL de connexion, secret ou préférence. stdout sans table de logs ; conservation durable À VALIDER.

## Redis

PING en fonctionnement, aucune clé métier. Tests : préfixe kopaka:test:<runId>:, TTL courte et nettoyage par noms exacts ; jamais flushall/flushdb partagé. Panne Redis ne supprime pas données PostgreSQL.

## Configuration

API privée : DATABASE_URL, REDIS_URL, WEB_ORIGIN, API_PORT, HEALTH_DEPENDENCY_TIMEOUT_MS, HEALTH_TOTAL_TIMEOUT_MS, HEALTH_RATE_LIMIT_PER_MINUTE, HEALTH_MAX_CONCURRENT ; paramètres de pool explicitement bornés. Web : NEXT_PUBLIC_API_BASE_URL, origine publique seulement. Local : 3000/3001, données 5432/6379 loopback. Champ obligatoire invalide → arrêt sans valeur sensible dans l'erreur.
