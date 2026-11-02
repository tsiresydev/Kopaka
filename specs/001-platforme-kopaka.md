# Spec 001 — Plateforme Kopaka

**Statut :** Ready for planning, sous réserve des points marqués À VALIDER.  
**Priorité :** MVP.

## Contexte
Kopaka est une plateforme web bilingue de jeux gratuits. Le MVP fournit un lobby et le Domino à 2 ou 4 joueurs. Les utilisateurs peuvent jouer en invité ; un compte est facultatif.

## Objectif utilisateur
En tant que visiteur, je veux lancer une partie rapidement sans devoir créer un compte, afin de jouer au Domino avec d'autres personnes. En tant que joueur qui le souhaite, je veux créer un compte pour retrouver mon profil et ma progression.

## Parcours principal
1. Ouvrir Kopaka.
2. Choisir français ou malagasy.
3. Choisir le mode invité ou compte.
4. En invité, choisir un pseudonyme.
5. Accéder au lobby.
6. Choisir Domino à 2 ou Domino à 4.
7. Choisir partie rapide, salle publique ou salle privée (selon disponibilité de la phase).
8. Rejoindre la partie.
9. Jouer selon les règles validées.
10. Voir le résultat et revenir au lobby.

## User stories et critères d'acceptation

### US-001 — Choisir la langue
En tant qu'utilisateur, je veux choisir français ou malagasy.
- Given la page d'accueil, when je sélectionne une langue, then les libellés du parcours sont affichés dans cette langue.
- La préférence est conservée lors des visites suivantes, sans bloquer le changement de langue.
- Les textes ne sont pas tronqués sur mobile.

### US-002 — Jouer en invité
- Given un visiteur, when il choisit « Jouer en invité » et fournit un pseudonyme valide, then une identité invitée et une session sécurisée sont créées.
- Le visiteur accède au lobby sans fournir d'email ou de numéro.
- Le pseudonyme est filtré et soumis aux limites de longueur documentées.
- Un invité ne peut pas récupérer sa session sur un autre appareil sans mécanisme de liaison explicitement défini.

### US-003 — Inscription facultative
- Le visiteur peut continuer en invité sans pression ni blocage.
- Un parcours de création de compte est accessible.
- Les modalités de conversion d'identité invitée sont documentées avant réalisation.
- L'échec de création de compte ne détruit pas la session invitée active.

### US-004 — Choisir un mode Domino
- Le lobby présente deux choix : Domino à 2 et Domino à 4.
- Le mode sélectionné est transmis au matchmaking et à la salle.
- Un joueur ne rejoint jamais une salle d'un autre mode par erreur.

### US-005 — Trouver une partie
- Le joueur peut rejoindre et annuler une file de matchmaking.
- Le serveur affecte uniquement des joueurs compatibles.
- Une même identité ne peut être inscrite plusieurs fois dans la même file.
- L'interface présente les états de recherche, salle trouvée, attente et erreur.

### US-006 — Rejoindre une salle
- Le serveur vérifie la capacité et les droits d'accès.
- Une salle complète refuse toute nouvelle admission.
- Un joueur déjà dans une partie active reçoit une réponse claire.
- Une salle privée nécessite un code/lien valide.

### US-007 — Reconnexion
- Une reconnexion authentifiée retrouve la partie active.
- Le serveur renvoie un snapshot autorisé et sa version.
- Les actions déjà traitées ne sont pas appliquées une seconde fois.
- Le client affiche clairement l'état de reconnexion.

### US-008 — Résultat
- Le serveur calcule le résultat final.
- Le résultat est stocké pour les comptes ; la politique de conservation des résultats invités est à définir.
- Les récompenses sont purement virtuelles et non monétaires.

## Exigences de données
Les identités invitées, comptes, profils, salles, participants, sessions de jeu, actions, résultats, relations d'amitié, récompenses, signalements et journaux d'audit sont modélisés séparément. Les données temporaires de présence peuvent être stockées dans Redis.

## Exigences de sécurité
- Pas de confiance accordée aux données de score ou d'état fournies par le client.
- Autorisation par joueur, salle et partie.
- Validation de schéma de tous les événements.
- Limitation de débit.
- Protection des sessions et secrets.
- Journalisation des actions administratives.

## Exigences UX
Mobile-first, responsive, FR/MG, états de chargement/erreur/hors ligne/reconnexion, contrôles tactiles adaptés, animations légères.

## Hors périmètre
Argent réel, achats de crédits, dépôts/retraits, chat vocal/vidéo, Ludo et autres jeux avant validation du MVP Domino.

## Questions ouvertes bloquantes
- Méthode de compte et récupération : À VALIDER.
- Conversion invité vers compte et fusion des données : À VALIDER.
- Durée de vie des sessions invitées : À VALIDER.
- Durée de conservation des parties et journaux : À VALIDER.
- Limites et politique de pseudonymes : À VALIDER.
- Politique de joueur qui abandonne ou reste déconnecté : À VALIDER.
