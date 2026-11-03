# Modèle de données — Sprint 2

Modèle prévu, non implémenté. Les dates sont UTC, issues de PostgreSQL. Les tables invitées sont ajoutées par une migration additive après la migration 0001 ; PlatformBootstrap et schemaVersion=1 restent compatibles avec les contrôles Sprint 1.

## Entités persistantes

| Entité | Champs et contraintes | Relations / suppression |
|---|---|---|
| GuestIdentity | UUID aléatoire ; displayName ; uniqueKey TEXT avec collation déterministe C et UNIQUE ; normalizationVersion ; moderationPolicyVersion ; createdAt ; lastActivityAt ; expiresAt ; termsVersion ; privacyVersion ; acceptedAt | Racine. Consentement porté uniquement par cette identité active, sans archive séparée. |
| GuestSession | UUID ; guestId UNIQUE ; tokenHash UNIQUE ; createdAt | FK GuestIdentity ON DELETE CASCADE. Une preuve de session par identité ; aucun token brut en base. L'expiration vient de GuestIdentity. |
| GuestAdmissionContext | UUID ; tokenHash UNIQUE ; createdAt ; expiresAt ; consumed booléen ; guestId nullable | Avant admission : contexte technique sans identité. Après admission : FK invitée avec cascade. Un contexte consommé ne recrée jamais une identité. |
| GuestAdmissionReceipt | contextId UNIQUE ; guestId ; idempotencyHash ; payloadHash ; ciphertext ; nonce ; tag ; keyId ; createdAt ; expiresAt | FK contexte et identité avec cascade. Secret de session chiffré AEAD uniquement pour récupération. Durée maximale une heure et suppression avec identité. |
| GuestOperationReceipt | guestId ; kind=lobby_entry ; idempotencyHash ; payloadHash ; acceptedAt ; resultingExpiresAt ; expiresAt | UNIQUE(guestId,kind,idempotencyHash), cascade invitée. Conservation technique de dix minutes maximum ; relance identique sans nouveau renouvellement. |

Les reçus expirés sont purgés par maintenance et opportunément. Un reçu d'activité n'est pas un historique des usages. La durée de dix minutes délimite la fenêtre technique de reprise ; le client n'effectue pas de reprise automatique au-delà et exige une nouvelle action explicite.

## Éléments externes

- Registre de non-restauration : HMAC(UUID), deletedAt, reason=logout|expiry ; stockage durable indépendant de PostgreSQL, sans nom/session/consentement ; maximum 30 jours. Ce marqueur pseudonymisé sert exclusivement à empêcher la restauration. Aucune API publique d'accès.
- Politique de modération : schemaVersion, policyVersion, normalizationVersion, reservedNames[], forbiddenNames[], référence d'approbation. Configuration privée, chargement validé et remplacement atomique, pas de table d'administration.
- Documents : version, langue, type conditions|privacy, contenu structuré échappé, empreinte et référence d'approbation ; pas de contenu juridique généré.
- Catalogue statique : domino-2 / 2 participants et domino-4 / 4 participants. Aucun joueur, salon, statistique ni règle de variante non validée.

## Invariants et transitions

1. Un formulaire ouvert crée au plus un contexte technique, aucune GuestIdentity. La validation du nom, des versions et du consentement précède la transaction d'admission.
2. Admission confirmée : créer une seule identité, une session renouvelée, un reçu et les versions acceptées, puis consommer le contexte dans la même transaction. Première lastActivityAt = instant d'admission ; expiresAt = cet instant + 30 jours.
3. Identité valide : maintenant < expiresAt. Lecture passive, changement de langue/thème, polling et actualisation automatique ne modifient aucune date.
4. Entrée explicite au lobby : vérifier la preuve et l'échéance après verrou ; enregistrer l'opération idempotente ; lastActivityAt = instant accepté et expiresAt = cet instant + 30 jours. Même opération rejouée : mêmes dates.
5. À maintenant >= expiresAt : aucune activité ne réanime l'identité. Écrire l'intention durable de suppression, supprimer la racine et cascades, libérer uniqueKey.
6. Déconnexion volontaire : même procédure de suppression immédiate, cookies effacés après confirmation. Fermer le navigateur n'appelle pas cette procédure.
7. Suppression irréversible : une vieille réponse, un vieux cookie, un reçu ou une sauvegarde ne peut recréer l'identité. Aucun état métier « expiré conservé ».

Le contexte anonyme expire après une heure. À l'admission son échéance devient celle du reçu, une heure après admission. Le cookie technique du contexte dure au maximum deux heures depuis le bootstrap, couvrant cette récupération ; il n'accorde aucun accès invité. Nettoyer contexte/reçu à leur échéance ne supprime pas l'identité toujours valide.

## Transactions et concurrence

Toutes les mutations invitées prennent le même verrou consultatif transactionnel non bloquant, puis les lignes nécessaires. Les lectures passives restent sans écriture sauf détection d'expiration nécessitant la procédure de purge. La collision de nom expiré passe par cette même suppression, jamais un simple UPDATE de propriétaire. L'index UNIQUE reste l'arbitre final.

Utiliser clock_timestamp() après acquisition des verrous. Le journal externe est écrit avant DELETE ; une intention écrite reste autoritaire même si SQL échoue. Le rattrapage de ces intentions précède l'ouverture des accès invités. Les opérations sont bornées et les erreurs transitoires ne deviennent pas de faux succès. Voir [exploitation](contracts/operations.md).

## Validation des pseudonymes

Le [contrat de normalisation](contracts/nickname.md) définit les trois représentations et fixtures. Ni uniqueKey, ni identifiant UUID, ni nom affiché ne sont une preuve d'authentification. Aucune fusion, modification de pseudonyme ou récupération par nom ajoutée au sprint.

## Précisions après analyse — preuve navigateur et récupération

La durée du cookie n'est pas l'échéance d'autorisation. Les réponses d'admission, de récupération valide et d'activité confirmée/rejouée réémettent le même secret invité avec Max-Age=2592000, sans Expires absolu ; les lectures passives ne réémettent rien. Une ancienne réponse peut laisser une preuve opaque après expiresAt, mais la session est refusée/supprimée à cette échéance serveur. Aucun champ ni délai de conservation d'identité n'est ajouté.

GuestOperationReceipt.resultingExpiresAt reste le résultat historique de son opération ; son replay n'écrit ni lastActivityAt ni expiresAt. GuestIdentity.expiresAt reste l'état courant autoritaire. Ne pas confondre les deux lors du rendu d'une réponse reçue après une activité plus récente.

Un contexte consommé encore valide et son reçu utilisable permettent au bootstrap de restituer le CSRF du même contexte, puis à recover de réémettre la preuve originale. Ni création de contexte de remplacement ni renouvellement des dates par cette lecture. Les états HTTP anonymous/active/recoverable ne sont pas de nouvelles entités persistantes.

À admission + une heure, un reçu n'est plus utilisable, même avant sa purge physique. La suppression du reçu/contexte ne supprime pas l'identité toujours valide : si son cookie n'a jamais été reçu, elle reste inaccessible mais son nom demeure réservé jusqu'à sa suppression selon les règles existantes. Aucune récupération par nom ni réduction automatique des 30 jours. Le client explique la limite et propose une nouvelle entrée explicitement demandée, sans ancien payload. Voir le protocole complet dans contracts/http.md.
