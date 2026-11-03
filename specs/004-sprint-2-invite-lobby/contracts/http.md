# Contrat HTTP — Invité et lobby

Contrat cible à implémenter. API Nest existante ; pas de proxy d'authentification Next ajouté. Les schémas Zod publics ne contiennent aucune configuration privée. Les réponses personnelles sont Cache-Control: no-store ; aucune preuve ni donnée personnelle dans les erreurs, URL ou journaux.

## Transport et preuves

- Production HTTPS, origines web/API du même site. CORS des routes invitées : origine web exacte, credentials=true, méthodes explicitement nécessaires, en-têtes Content-Type, X-Kopaka-Client, X-CSRF-Token, Idempotency-Key et X-Request-Id. Aucun wildcard. Rejeter Origin absent/inattendu sur les mutations.
- Cookies production `__Host-kopaka_guest` et `__Host-kopaka_entry` : HttpOnly, Secure, SameSite=Strict, Path=/, aucun Domain. Sur HTTP loopback uniquement : noms distincts `kopaka_guest_dev` et `kopaka_entry_dev`, Secure=false autorisé par configuration locale explicite. Utiliser systématiquement le même hôte pour web/API ; ne pas mélanger localhost et 127.0.0.1. Les cookies ne sont pas isolés par port.
- L'échéance d'autorisation est exclusivement expiresAt côté serveur. Admission, réponse d'activité confirmée (y compris reprise) et récupération autorisée réémettent le même cookie invité avec `Max-Age=2592000` secondes, sans attribut Expires absolu concurrent. La rotation du secret a lieu à l'admission uniquement. Cette durée du support navigateur est distincte de la validité serveur : une réception tardive peut laisser une preuve opaque après l'échéance, mais ne prolonge jamais l'identité ni sa réservation. Le serveur refuse et purge à expiresAt. Lecture passive valide : aucun Set-Cookie.
- Bootstrap anonyme JSON avec `X-Kopaka-Client: web-v1` et pré-vérification CORS. Les autres mutations exigent en plus un CSRF HMAC lié au secret du contexte ou de session et une clé serveur privée. Le jeton est retourné au client légitime et conservé seulement en mémoire ; il ne remplace pas le cookie HttpOnly.
- JSON strict, limite existante 16 KiB, aucun champ inattendu ; pas de formulaire URL-encoded accepté sur ces mutations. UUID de requête d'idempotence aléatoire par intention, réutilisé lors des reprises bornées. Aucun identifiant invité fourni par le client pour sélectionner une identité.
- `/health/live` et `/health/ready` conservent strictement leurs contrats Sprint 1, leurs CORS sans credentials et leur fetch credentials=omit. Les règles invitées sont scindées par route.

## DTO

`GuestView` : guestId UUID technique, displayName, expiresAt ISO UTC, csrfToken. Ces données décrivent exclusivement l'identité du cookie ; guestId et displayName ne prouvent rien. Aucun hash, clé normalisée, secret ou consentement d'autres invités.

`SessionView` : union stricte `{state:"anonymous"}` ou `{state:"active", guest:GuestView}`. Une panne n'est jamais présentée comme un état anonyme certain.

`BootstrapView` : union stricte de la variante active de SessionView, de `{state:"anonymous",entryCsrfToken}` et de `{state:"recoverable",entryCsrfToken}`. Le dernier état signifie seulement que le contexte prouvé possède un reçu utilisable ; il ne reconnaît pas encore une session invitée et ne révèle ni nom ni UUID.

`GuestError` : `{code}` ou `{code,field}` si applicable, field dans nickname|consent. Codes stables et traduction côté interface ; pas de message SQL, corps saisi, détail de corpus ou secret renvoyé.

## Routes

| Route | Entrée / preuve | Résultat et effet |
|---|---|---|
| POST /guest/bootstrap | `{}` par défaut ; `{intent:"new_entry"}` seulement après nouveau geste explicite ; Origin et X-Kopaka-Client, credentials=include | 200 BootstrapView selon les branches précisées ci-dessous. Réutiliser le contexte valide et restituer son CSRF même après admission consommée ; ne jamais le remplacer automatiquement. Aucune identité créée ni échéance prolongée. |
| POST /guest/session | Cookie contexte, CSRF, Idempotency-Key ; `{nickname, consentAccepted:true, termsVersion, privacyVersion}` | 201 première admission, 200 reprise identique ; GuestView et cookie invité. Validations serveur et transaction complète avant succès. Versions doivent être celles actuellement approuvées. |
| POST /guest/recover | Cookie contexte + CSRF ; `{}` | 200 GuestView et réémission du même cookie depuis le reçu encore valide, sans création ni prolongation. Reçu absent/expiré : 409 RECOVERY_UNAVAILABLE. Contexte absent/invalide : 401. |
| GET /guest/session | Cookie invité facultatif ; credentials=include | 200 SessionView. Sans cookie : anonymous. Preuve invalide/expirée : 401 SESSION_INVALID ou SESSION_EXPIRED, purge si nécessaire puis suppression cookie. Dépendance indisponible : 503, ne pas conclure à une déconnexion ni effacer la preuve. Aucune activité. |
| POST /guest/lobby-entry | Cookie invité + CSRF + Idempotency-Key ; `{}` | 200 GuestView. Une entrée demandée explicitement par le joueur renouvelle une seule fois les 30 jours. Une reprise identique restitue l'échéance de l'opération initiale sans nouvelle écriture des dates serveur ; cookie réémis selon la règle Max-Age ci-dessus. Expiration vérifiée avant le reçu : jamais de résurrection. |
| POST /guest/logout | Cookie invité + CSRF ; `{}` | 204 après intention durable puis suppression SQL confirmée, cookies expirés. CSRF lié au cookie peut être vérifié même si la ligne a déjà disparu : répétition valide sans effet, 204. Sans preuve requise : 401/403. Dépendances indisponibles : 503, aucun faux succès. |
| GET /guest/catalog | Session valide ; lecture passive | 200 `{modes:[{id:"domino-2",players:2},{id:"domino-4",players:4}], playAvailability:"not_implemented", rulesStatus:"pending_validation"}`. Pas de données de joueurs/salles. |
| GET /guest/documents?locale=fr\|mg | Public, credentials=omit | 200 versions approuvées et blocs textuels structurés de conditions/privacy pour la langue demandée. Aucun HTML arbitraire. 503 si ressources applicables manquantes ; admission fermée. |

### Bootstrap et récupération après rechargement

Ordre des branches du bootstrap, sous le verrou navigateur :

1. Cookie invité valide : retourner active via la reconnaissance passive, sans renouvellement ni nouveau contexte, même si intent=new_entry est demandé.
2. Avec `{}` et contexte existant non consommé encore valide : retourner anonymous avec le CSRF recalculé depuis la même preuve, sans remplacer le cookie ni repousser son échéance.
3. Avec `{}` et contexte consommé encore valide, reçu non expiré et identité valide non supprimée : retourner recoverable et le CSRF du même contexte. Aucun cookie invité émis à ce stade. Le client appelle ensuite POST /guest/recover, qui réémet la preuve originale ; aucune nouvelle identité ni activité.
4. Contexte consommé sans reçu utilisable : 409 RECOVERY_UNAVAILABLE. Contexte fourni mais inconnu/expiré : 401 ENTRY_INVALID. Dépendance indisponible : 503, aucune conclusion d'expiration. Ne remplacer ni le contexte ni une ancienne tentative automatiquement.
5. Sans preuve de contexte et sans session reconnue, créer un contexte anonyme. Après échec de récupération, seul un nouveau geste explicite et `{intent:"new_entry"}` autorisent un nouveau contexte anonyme ; cela n'efface ni ne récupère une identité inaccessible. Les étapes habituelles nom/consentement restent requises. Une preuve invitée expirée est traitée par la suppression commune avant toute nouvelle entrée ; une preuve invérifiable à cause d'une panne bloque cette transition.

Le jeton CSRF perdu au rechargement est donc réobtenu par le bootstrap protégé Origin/en-tête personnalisé, depuis le cookie HttpOnly de contexte encore présent. Ne pas le stocker dans le navigateur pour contourner ce protocole. L'affichage des documents ne vaut pas acceptation.

### Fin de la fenêtre de récupération

À l'heure exacte d'expiration du reçu (admission + une heure), aucune récupération depuis ce reçu n'est admise ; vérifier aussi l'expiration même si le nettoyage physique n'est pas encore passé. Avant l'échéance, le contexte consommé permet le protocole ci-dessus. Après celle-ci, signaler que la récupération de cette tentative n'est plus disponible, sans prétendre que l'identité a été supprimée. Si le cookie invité est encore utilisable, la reconnaissance passive reste possible normalement.

Si le cookie invité n'a jamais été reçu, l'identité déjà créée reste valide selon ses 30 jours et son nom reste réservé ; aucune suppression, réduction de durée ou récupération par nom n'est ajoutée. Proposer une nouvelle entrée explicite, sans rejouer l'ancienne charge ; le nom précédent peut être indisponible et doit recevoir l'erreur habituelle, sans divulgation d'identité. Aucun succès ni nouvelle identité automatiques.

## Idempotence et courses

La même paire contexte/clé et même empreinte de payload retourne l'identité originale, y compris après perte de Set-Cookie. Une charge différente : 409 IDEMPOTENCY_CONFLICT. Une autre admission sur un contexte consommé : 409 ENTRY_CONSUMED ; session déjà active : 409 ALREADY_ACTIVE et vérification passive du client. Aucun reçu ne récupère par pseudonyme.

Le navigateur prend le même Web Lock pour bootstrap, admission, récupération, entrée explicite au lobby et déconnexion, avant de relire passivement l'état serveur par GET /guest/session. Garder le verrou pendant la réception ou l'échec de la requête ; le relâcher après timeout ne permet pas de supposer que le serveur a annulé l'opération. BroadcastChannel transporte uniquement un signal de changement. Une réponse devenue obsolète ne change pas l'écran ni ne redirige ; même si son Set-Cookie tardif est appliqué par le navigateur, le serveur refuse la preuve supprimée. Après expiration du contexte, aucune relance automatique de POST /guest/session ou bootstrap suivie d'une vieille charge.

Entrée au lobby : appeler la mutation depuis le geste explicite, jamais depuis montage React, préchargement Next, polling, rechargement automatique ou notification d'onglet. Une réouverture restaure passivement l'identité. Cliquer ensuite pour entrer est une nouvelle interaction valide. Sélectionner le mode et consulter le catalogue sont des lectures locales/passives dans ce sprint ; aucun mécanisme générique permettant au client de déclarer arbitrairement une activité.

## Erreurs et bornes

| HTTP | Codes / interprétation |
|---|---|
| 400 | REQUEST_INVALID : structure/UUID invalide |
| 401 | ENTRY_INVALID, SESSION_INVALID, SESSION_EXPIRED |
| 403 | ORIGIN_FORBIDDEN, CSRF_INVALID |
| 409 | NICKNAME_TAKEN, DOCUMENT_VERSION_CHANGED, IDEMPOTENCY_CONFLICT, ENTRY_CONSUMED, ALREADY_ACTIVE, RECOVERY_UNAVAILABLE |
| 413 / 415 | REQUEST_TOO_LARGE / CONTENT_TYPE_UNSUPPORTED |
| 422 | NICKNAME_INVALID, NICKNAME_FORBIDDEN, CONSENT_REQUIRED |
| 429 | REQUEST_LIMITED, GUEST_BUSY ; Retry-After entier positif |
| 503 | GUEST_UNAVAILABLE ; conservation de la saisie et possibilité de reprise explicite |
| 500 | INTERNAL_ERROR générique, sans données privées |

Aucune promesse de disponibilité avant commit. Validation du corpus actuel et de l'unicité lors de chaque première admission ; une reprise restitue la décision déjà confirmée sans nouvelle admission. Les requêtes privées ne sont pas mises en cache par navigateur, Next ou CDN.

### Réponses tardives et durée du cookie

Le choix de Max-Age constant pour chaque émission de preuve empêche une ancienne réponse d'imposer une date absolue antérieure à celle d'une activité plus récente. Une relance d'activité réémet aussi le cookie : elle répare la perte de la première réponse sans renouveler de nouveau lastActivityAt/expiresAt. Une récupération ne modifie jamais ces dates, même si elle réémet le support de preuve. La présence d'un cookie ne dispense jamais du contrôle d'échéance et du registre serveur.

Pour une même identité, le client ne remplace pas une échéance déjà confirmée par une valeur historique inférieure provenant d'un reçu rejoué ; GET /guest/session fournit l'état courant sans activité. Changement d'identité ou suppression confirmée réinitialise cet état local. Les réponses obsolètes restent ignorées pour l'interface ; la garantie d'invalidation après suppression reste côté serveur, y compris si un ancien Set-Cookie est appliqué.

Recette impérative : activité A puis B, réponses reçues B puis A ; vérifier les dates SQL de B, cookie sans Expires absolu et Max-Age constant, aucune réduction de la durée de preuve, état UI non régressif et refus serveur à l'échéance réelle. Perdre la réponse A puis reprendre A ne crée aucune nouvelle activité mais remet le cookie ; les lectures passives n'en émettent aucun. Couvrir aussi une récupération reçue après une activité plus récente et une réponse tardive après logout.
