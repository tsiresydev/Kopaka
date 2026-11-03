# Décisions actées et points à valider — Kopaka

## Décisions actées
- Nom : Kopaka.
- Modes de lancement : Domino à 2 et Domino à 4.
- Accès : invité et inscription facultative.
- Langues : français et malagasy.
- Stack cible : Next.js/TypeScript, NestJS/Node.js, Socket.IO, PostgreSQL/Prisma, Redis.
- Produit initial gratuit ; points, XP et badges purement virtuels.
- Priorité UX : mobile-first et responsive.

### Identité invitée et entrée compte — validées le 2026-11-03

Source : réponses explicites Q1–Q6 puis Q7a–Q8b du propriétaire lors de la préparation et clarification du [Sprint 2](specs/004-sprint-2-invite-lobby/spec.md).

- Identité invitée sécurisée gérée côté serveur, valide 30 jours après la dernière activité valide ; chaque activité valide prolonge cette durée. Expiration après 30 jours d'inactivité.
- Clarification Q7a validée : identité supprimée du stockage courant dès expiration, pseudonyme libéré, sans conservation supplémentaire de 7 ou 30 jours d'une identité expirée. La conservation éventuelle des données annexes reste distincte.
- Clarification Q7b validée : après suppression, aucune archive personnelle d'acceptation ; journaux techniques sans identité/pseudonyme/jeton pendant 7 jours maximum ; sauvegardes pendant 30 jours maximum. Une restauration préserve les suppressions déjà effectuées, sans réactivation d'identité/accès ou de réservation libérée.
- Activité valide : interaction utilisateur réelle, dont rejoindre le lobby, créer/rejoindre une partie, agir dans une partie, message dans un espace autorisé ou autre interaction significative ; aucune prolongation par actualisation automatique, requête d'arrière-plan ou page ouverte sans interaction. Partie et discussion ne sont pas anticipées au Sprint 2.
- Même identité et même pseudonyme retrouvés après fermeture/réouverture tant que l'accès est valide et sa preuve disponible ; plusieurs onglets partagent la même identité. Déconnexion volontaire : session invalidée, identité supprimée et pseudonyme libéré ; les autres onglets ne peuvent continuer avec l'identité supprimée.
- Pseudonyme unique parmi les identités invitées encore valides, même lorsque leur propriétaire n'est pas actuellement connecté ; libération à expiration ou suppression de l'identité.
- Pseudonyme de 3 à 20 caractères : lettres, chiffres, espaces, tirets et underscores ; accents autorisés à l'affichage ; espaces en début/fin supprimés et espaces multiples réduits ; comparaison insensible à la casse et aux accents.
- Insultes/vulgarité, racisme/discrimination/haine, termes sexuels explicites, menaces et usurpation équipe Kopaka/administrateurs interdits. Noms réservés au minimum Admin, Administrator, Support, Kopaka, System, Moderator et variantes ; liste initiale non exhaustive.
- Liste de mots interdits configurable/extensible et évolution sans modification du code métier. Q8a validée : casse, accents, espaces/tirets/underscores insérés et substitutions 0→o, 1→i, 3→e, 4→a, 5→s, 7→t pour le filtrage ; Q8b validée : correspondance entière uniquement pour toutes les entrées, sans détection de sous-chaîne globale ou par entrée. Ad_m1n refusé pour Admin ; Supporter non refusé pour la seule présence de Support. Affichage/unicité Q2 inchangés ; pas d'élargissement aux ressemblances entre alphabets. Corpus initial FR/MG à approuver avant livraison, aucune liste supplémentaire inventée.
- Comptes complets maintenus au Sprint 7. Au Sprint 2, aucune inscription/connexion de compte fonctionnelle ; entrée informative « Inscription / Connexion — Bientôt disponible » éventuellement présentée, accès invité clairement visible et prioritaire. Roadmap et priorités P0/P1 inchangées.
- Q4–Q6 résolues par les précisions complémentaires ; Q7a, Q7b, Q8a et Q8b résolues par les options A. Clarification fonctionnelle terminée ; corpus initial FR/MG et documents applicables à fournir/valider avant livraison. Les 30 jours de validité de l'identité et les 30 jours maximum des sauvegardes sont distincts. Une modération rétroactive des identités existantes est une évolution ultérieure, pas une fonction livrée au Sprint 2.

## À valider avant les sprints concernés

### Règles Domino
- Jeu de pièces : double-six ou autre.
- Distribution exacte à 2 et à 4.
- Pioche ou absence de pioche.
- Premier joueur.
- Règles de pose et d'orientation.
- Règles de passe.
- Fin de manche et blocage.
- Calcul des points et égalités.
- Partie en une manche ou plusieurs manches.
- Particularités de la variante locale souhaitée.

### Identité et comptes
- Authentification : email, téléphone, lien magique ou autre.
- Récupération de compte.
- Conversion d'une identité invitée en compte.
- Durée, activité réelle et suppression à la déconnexion/dès expiration validées ; conservation annexe validée en Q7b (aucune archive personnelle d'acceptation après suppression, journaux techniques sans identité/pseudonyme/jeton au plus 7 jours, sauvegardes au plus 30 jours, suppressions préservées à la restauration).
- Catégories de modération, liste réservée minimale, transformations Q8a et correspondance entière Q8b validées ; corpus FR/MG à fournir/approuver avant livraison. Application rétroactive d'évolutions à décider avant la fonction concernée, hors Sprint 2.
- Conservation des statistiques d'un invité.

### Salles et abandon
- Salle publique/privée dès MVP ou en phase ultérieure.
- Durée de grâce après déconnexion.
- Conséquence d'un abandon volontaire.
- Démarrage automatique ou manuel.
- Remplacement éventuel d'un joueur absent.

### Progression
- Barème XP et badges.
- Classement par mode ou global.
- Mesures anti-farming.
- Conservation des historiques.

## Décisions par défaut proposées (non confirmées)
Pour avancer sans bloquer la conception, on peut proposer :
- salles privées après la première version jouable ;
- authentification email ou téléphone à choisir selon facilité d'accès locale ;
- délai de reconnexion configurable ;
- pas de chat textuel dans le premier MVP ;
- pas de tournois avant stabilisation du Domino.

Ces propositions ne deviennent des exigences qu'après validation du propriétaire du produit.
