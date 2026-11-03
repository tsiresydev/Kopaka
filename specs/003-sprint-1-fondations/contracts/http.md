# Contrat HTTP — Sprint 1

Version 1 ; API locale http://localhost:3001, web http://localhost:3000. Contrat à réaliser, aucune API déjà implémentée.

## Conventions

GET/HEAD ; OPTIONS pour preflight. HEAD : statut/en-têtes de GET, corps absent. JSON UTF-8, Cache-Control no-store, nosniff ; aucun cookie/credentials. Query inconnue ou corps GET non vide → 400 avant sondes.

X-Request-Id optionnel : UUID canonique de longueur 36 validé ; absent → générer serveur. Invalide → 400 et nouvel id sûr. Repris dans header réponse uniquement, jamais log brut. CORS : origine web configurée exacte, X-Request-Id autorisé, aucune wildcard/credentials ; origine interdite sans permission CORS.

Schémas objets stricts sans propriétés additionnelles. Codes indépendants de langue, messages traduits côté web. Ni hostname, version, stack ou détail de dépendance dans réponses.

## GET /health/live

200 si HTTP fonctionne : {"status":"alive"}. Aucune dépendance consultée. Processus arrêté = échec réseau, pas réponse synthétique. Erreur interne inattendue = 500 générique.

## GET /health/ready

200 : {"status":"ready"} uniquement si PostgreSQL répond via Prisma, singleton PlatformBootstrap version 1 présent, ET Redis PONG.

503 : {"status":"not_ready"} si panne, timeout ou initialisation manquante. Les détails restent dans logs normalisés.

Sondes concurrentes : timeout 1 s chacune, budget global 2 s ; pool/commandes bornés, opérations expirées annulées autant que possible. Pas de ready ancien caché.

Limites initiales configurables : 30 demandes/minute/IP et 4 évaluations concurrentes par instance ; mémoire indépendante de Redis, trust proxy désactivé local. Dépassement → 429 et Retry-After positif en secondes, sans lancer une nouvelle sonde.

## Erreurs strictes

| HTTP | Corps | Déclencheur |
|---|---|---|
| 400 | {"code":"INVALID_REQUEST"} | query, header contractuel ou corps interdit |
| 405 | {"code":"METHOD_NOT_ALLOWED"} | autre méthode ; header Allow |
| 429 | {"code":"RATE_LIMITED"} | limite readiness ; Retry-After |
| 500 | {"code":"INTERNAL_ERROR"} | défaut inattendu, jamais erreur brute |

413 de transport possible si corps trop volumineux. Erreurs connues de dépendances = 503, pas 500. GET sans mutation ; aucune route POST d'essai ou diagnostic détaillé.

## Client

Fetch no-store sans credentials, URL fixe configurée, timeout 3 s ; un appel montage puis action manuelle, un seul actif. navigator.onLine n'est pas une preuve de disponibilité.

200 + objet ready strict → Disponible ; 503 not_ready → Indisponible ; réseau/timeout/429/500/JSON invalide → Indisponible avec récupération localisée. Réessai : loading, ancien résultat invalidé, bouton disabled, focus stable, annonce polite unique. Réponse hors ordre ignorée. Processus vivant mais non prêt reste indisponible.
