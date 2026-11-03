# Contrat d'exploitation et de confidentialité

Cible d'implémentation et de déploiement, pas une procédure déjà disponible. Complète le [modèle](../data-model.md) et le [contrat HTTP](http.md).

## Configuration et disponibilité

Réutiliser les variables privées DATABASE_URL, REDIS_URL, WEB_ORIGIN et les origines publiques existantes. Ajouter une configuration privée validée pour les clés CSRF, HMAC du registre et AEAD des reçus, le répertoire durable du registre, les chemins des documents approuvés et de la politique de modération, et le mode cookies local/HTTPS. Aucune clé sous NEXT_PUBLIC_* ; ne jamais inclure de valeurs réelles dans les exemples ou rapports.

GUEST_ENABLED permet le déploiement fermé avant recette ; l'ouverture exige ressources approuvées, registre disponible et rattrapage effectué. La santé Sprint 1 garde son contrat exact : sa disponibilité ne certifie pas la validation des ressources invitées. Un garde invité refuse explicitement les mutations tant que les préconditions ne sont pas réunies.

Valeurs techniques initiales proposées, configurables et bornées : deux opérations invitées concurrentes, un travailleur de purge, une place réservée à la santé dans le pool de quatre ; attente de transaction 1 s et durée 2 s ; deux relances maximales sur conflit transactionnel. Une limite de capacité produit une indisponibilité temporaire, aucun nouveau délai métier. Les mesures de charge pourront ajuster ces valeurs sans modifier les 30 jours.

Limiter les requêtes par catégories : bootstrap 30/minute par IP, admission 10/minute par IP et contexte, activité 60/minute par session ; stockage anti-abus éphémère borné à 4096 entrées et expiré, sans journalisation des IP ni liste de sanctions. Conserver trust proxy=false en local ; toute terminaison proxy impose une liste de proxies de confiance explicite avant d'utiliser l'IP transmise. Aucune limite ne permet de supprimer ou prolonger une identité.

## Expiration et suppression

Horloge PostgreSQL autoritaire. Contrôler l'expiration avant toute autorisation/activité ; échéance exacte à lastActivityAt + 30 jours. Planifier la prochaine purge à la plus proche échéance, balayage de secours toutes les secondes, traitement opportuniste et rattrapage au démarrage. La cadence technique n'est pas une autorisation de conserver après expiration. Mesurer le retard et fermer les accès invités si le rattrapage ne peut être garanti.

Procédure commune logout/expiry : verrou transactionnel ; vérifier l'état et l'heure ; écrire et fsync l'intention dans le registre indépendant ; supprimer GuestIdentity et cascades ; commit ; seulement alors répondre au logout/effacer les cookies. Une intention est irrévocable : crash après fsync et avant commit ⇒ preuve refusée et suppression rattrapée avant réouverture. Échec d'écriture du registre ⇒ pas de succès, accès invité fermé jusqu'à récupération sûre. Pas de fenêtre post-commit d'outbox qui permettrait une restauration sans marque de suppression.

Le registre contient uniquement HMAC(UUID aléatoire), horodatage et motif. Il reste une donnée pseudonymisée protégée, non un journal technique ni un profil. Conservation maximum 30 jours ; élimination d'une marque uniquement quand aucune sauvegarde retenue ne peut précéder la suppression. Aucun nom, secret ou acceptation archivé. Contrôler les accès et la durabilité indépendante ; ne pas placer le registre dans le répertoire remplacé lors d'une restauration PostgreSQL.

L'arrêt de la base empêche l'effacement physique à la milliseconde d'échéance. Ne pas masquer cette limite ; aucune autorisation n'est accordée après l'échéance et le nettoyage précède la reprise du service invité. Si une exigence d'effacement physique pendant un arrêt total était ajoutée, elle nécessiterait une clarification et ne serait pas garantie par ce plan.

## Sauvegardes et restauration

Sauvegardes privées chiffrées, rétention maximale 30 jours, inventaire des copies et des clés ; aucun dump dans Git ou artefact public. La rotation doit s'appliquer à toutes les copies. Le registre indépendant et ses clés doivent conserver une continuité sur toute la fenêtre de sauvegarde.

Restauration obligatoire hors trafic invité :

1. Vérifier âge de sauvegarde <= 30 jours, intégrité et continuité du registre couvrant l'instant du dump jusqu'à la reprise.
2. Restaurer PostgreSQL dans un environnement fermé ; ne pas ouvrir les routes invitées.
3. Appliquer toutes les intentions pertinentes du registre par HMAC des UUID restaurés ; supprimer racines et cascades. Purger aussi les identités désormais expirées selon l'heure réelle.
4. Vérifier absence des identités, sessions, reçus et consentements supprimés ; vérifier libération des clés d'unicité et conservation correcte des identités encore valides.
5. Exécuter la recette avec anciens cookies puis ouvrir les accès invités seulement si tous les contrôles passent.

Registre ou clé manquant, fenêtre non couverte, dump trop ancien : restauration non validable, rester fermé. Ne jamais recréer des preuves depuis un pseudonyme. La rotation des clés ne peut rendre les marques nécessaires illisibles pendant les 30 jours.

## Journaux et preuves de recette

Conserver le TechnicalLogger à liste blanche du Sprint 1 : événements enum, requestId technique, durée, dépendance, résultat. Aucun UUID invité, pseudonyme, cookie, CSRF, IP, corps, hash de preuve ni contenu juridique accepté dans les logs. Éviter également les captures réseau/traces de test contenant ces données hors environnement de fixtures.

Rétention maximale des journaux techniques : sept jours sur stdout capturé, fichiers, collecteurs et artefacts de recette concernés. Une simple limite de taille Docker n'est pas une limite d'âge ; prévoir rotation et suppression par âge sur chaque destination, vérifiées avant publication. Les rapports publics ne contiennent que résultats agrégés et références non personnelles.

Le registre indépendant ne permet aucun historique des acceptations ; ces données restent uniquement sur l'identité active et disparaissent en cascade. Les trois durées sont distinctes : activité 30 jours glissants ; logs <=7 jours ; sauvegardes et marqueurs de non-restauration <=30 jours.
