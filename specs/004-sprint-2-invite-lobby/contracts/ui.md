# Contrat UI — Sprint 2

Conception fondée sur MASTER v2, composants Sprint 1 et recommandations UI UX Pro Max. Aucune maquette ou interface implémentée par ce document.

| Route | Contenu et comportement |
|---|---|
| / | Accueil expliquant le jeu gratuit, FR/MG, accès invité prioritaire ; entrée compte informative « Inscription / Connexion — Bientôt disponible ». Aucune action de compte fonctionnelle. |
| /invite | Champ pseudonyme avec label et aide 3–20 caractères ; liens conditions/confidentialité ; acceptation explicite non précochée ; bouton d'admission. Afficher chargement, erreurs contextualisées, indisponibilité et succès confirmé. |
| /lobby | Identité réelle restaurée ; déconnexion ; sélection radio accessible Domino 2 / Domino 4 avec nombre exact de participants. Seuls les faits validés et la limite de disponibilité sont présentés. Aucun bouton de création/recherche de partie active. |
| /conditions et /confidentialite | Documents approuvés, version et langue identifiables, navigation de retour préservant le formulaire sans conserver de secret. Sans contenu validé, informer de l'indisponibilité et empêcher l'admission. |
| /foundation | Démonstration publique Sprint 1 conservée avec ses composants et tests réadressés. Aucun accès invité nécessaire. |

## Parcours et synchronisation

Le clic validant le formulaire attend la réponse serveur, puis l'entrée explicite au lobby, avant d'annoncer la réussite. Une reprise réseau conserve sa clé d'idempotence. Rechargement après réponse perdue : récupération du contexte avant toute nouvelle création. Session valide à l'ouverture : montrer la possibilité de rejoindre le lobby ; la lecture initiale ne renouvelle rien.

Un onglet reçoit un signal de déconnexion, fait une lecture passive et quitte l'état invité si la suppression est confirmée. Une erreur réseau n'est pas une preuve de suppression. Désactiver les mutations périmées, préserver la saisie appropriée, ne pas afficher de succès anticipé. La déconnexion avertit clairement que l'identité sera supprimée et le nom libéré ; elle reste une action explicite, jamais un événement de fermeture du navigateur.

Aucune règle détaillée de Domino n'est fabriquée. La sélection 2/4 ne lance pas de partie, ne réserve aucun siège et ne crée aucun salon. Aucun compteur, présence ou adversaire fictif. Les termes jeu/chat dans les activités futures ne donnent pas lieu à de nouveaux écrans.

## Accessibilité, langues et préférences

- FR et MG pour textes, aides, codes d'erreur et statuts ; relecture MG du nouveau contenu distincte de celle terminée au Sprint 1. Ne pas remplacer les traductions approuvées existantes.
- Thème clair par défaut même si l'OS est sombre ; conserver les préférences existantes et l'initialisation sans flash. Langue/thème ne touchent jamais l'expiration.
- Palette turquoise/crème/vert profond ; cartes 28 px, contrôles 16 px ; CTA accueil hauteur minimale 56 px ; autres cibles au moins 48×48 px et espacements 8 px. Focus visible 3 px + décalage 3 px ; contraste texte 4,5:1, contrôles 3:1.
- Tester 320, 375, 768, 1024 et 1440 px, zoom 200 %, texte +40 %, clavier, lecteur d'écran et reduced-motion. Pas de défilement horizontal imposé pour ce parcours.
- Labels persistants, aria-describedby pour aides/erreurs ; statut asynchrone annoncé ; focus sur première erreur, puis titre de destination après navigation. Changer la langue ne perd ni focus ni saisie ni consentement déjà exprimé pour les mêmes versions.
- Réutiliser Field, Button, Card, Select, StatusMessage et providers existants ; pas de police ou ressource distante obligatoire. Les schémas privés et clés ne sont jamais importés dans le bundle web.

Les informations déjà chargées restent lisibles lors d'une coupure ; ne pas vider un catalogue valide au premier échec réseau. Distinguer absence de données initiales, réponse vide inattendue, chargement et erreur, sans substituer un format ou inventer un contenu. Aucune promesse de premier chargement hors ligne. Le choix du mode reste local au parcours, sans nouvelle persistance garantie. Une erreur asynchrone ne vole pas le focus ; le déplacement sur un champ concerne une soumission explicite invalide. Retour de l'entrée compte : accès invité et saisie conservés.

## Récupération et réponses reçues dans le désordre

Après rechargement ayant perdu le CSRF en mémoire, faire GET /guest/session passif ; si aucun accès n'est reconnu, le bootstrap retrouve le contexte existant. Son état recoverable fournit le CSRF du contexte consommé puis autorise recover. Ne jamais montrer le succès ni redemander une création sur la seule base de cet état intermédiaire. Une panne conserve le caractère indéterminé.

Si la récupération n'est plus disponible après sa fenêtre d'une heure, expliquer cette limite sans annoncer que l'identité ou son nom ont été supprimés. Si la preuve invitée est présente, sa reconnaissance normale reste disponible. Sinon, présenter une nouvelle entrée volontaire ; l'ancien pseudonyme peut rester réservé et ne récupère jamais l'accès. Le bouton de nouvelle entrée envoie intent:new_entry puis reprend le formulaire/consentement normal ; aucun replay automatique de l'ancienne demande. Ces messages sont à traduire et relire en FR/MG.

Toutes les mutations émettant un cookie partagent le verrou navigateur. Pour un même UUID reconnu, une réponse historique ne réduit pas l'échéance déjà confirmée affichée ; relecture passive pour retrouver l'état courant. Déconnexion/expiration confirmées réinitialisent ce contexte, même si un ancien cookie est appliqué après coup : le serveur doit toujours le refuser.
