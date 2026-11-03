# Spec 002 — Jeu de Domino à 2 et à 4 joueurs

**Statut :** cadrage fonctionnel ; règles détaillées à valider avant implémentation.  
**Priorité :** P0 pour le MVP.

## Objectif
Permettre des parties de Domino en temps réel à 2 ou 4 joueurs, avec moteur de règles autoritaire côté serveur.

## Modes
- Mode A : 2 joueurs.
- Mode B : 4 joueurs.

Le nombre de joueurs, les sièges, la distribution et les conditions de fin sont déterminés par une configuration de règles versionnée, validée avant développement.

## Exigences communes
- Créer ou rejoindre une salle correspondant exactement au mode choisi.
- Affecter les sièges sans doublon.
- Démarrer seulement lorsque le nombre de joueurs requis est présent et prêt.
- Distribuer les pièces côté serveur.
- Garder cachées les pièces des autres joueurs.
- Afficher uniquement les informations publiques nécessaires : pièces posées, extrémités de la chaîne, joueur actif, état du jeu, scores publics.
- Valider chaque action côté serveur.
- Refuser toute pièce non détenue, placement incompatible, action hors tour ou action répétée.
- Synchroniser les joueurs après chaque action acceptée.
- Gérer le joueur déconnecté selon la politique de délai de grâce validée.
- Calculer les scores et le résultat exclusivement côté serveur.
- Enregistrer la version des règles utilisée par chaque partie.

## Actions du joueur
Le contrat fonctionnel doit au minimum prévoir :
- jouer une pièce à une extrémité autorisée ;
- choisir l'orientation si les deux orientations sont possibles ;
- passer son tour lorsque les règles le permettent ;
- demander l'état synchronisé après reconnexion.

Les actions « piocher », « passer », « bloquer » et « terminer la manche » dépendent de la variante retenue et ne doivent pas être activées sans validation des règles.

## États de partie
- WAITING : salle en attente.
- READY : joueurs présents, démarrage possible.
- IN_PROGRESS : partie en cours.
- PAUSED/RECOVERING : interruption temporaire selon politique.
- FINISHED : résultat final calculé.
- CANCELLED : partie annulée selon règle d'abandon ou incident.

## Règles à formaliser impérativement
Le propriétaire du produit doit valider un document de règles précis pour chacun des modes :
1. Jeu de pièces utilisé (ex. double-six ou autre).
2. Nombre de pièces distribuées à chaque joueur.
3. Pièces restantes : pioche, réserve non utilisée ou autre.
4. Qui commence et comment le premier joueur est déterminé.
5. Conditions légales de pose et orientation.
6. Quand un joueur peut piocher et combien de pièces.
7. Quand un joueur peut passer.
8. Condition de fin de manche : joueur sans pièce, blocage, autre.
9. Calcul des points et pénalités.
10. Détermination du gagnant en cas de blocage ou égalité.
11. Structure de la partie : une manche ou plusieurs manches, score cible éventuel.
12. Particularités de la variante malgache, si elles existent.
13. Gestion d'un joueur qui abandonne, se déconnecte ou ne joue plus.
14. Conditions de revanche et de nouvelle partie.

## Critères d'acceptation
- Une partie à 2 ne peut jamais contenir 3 joueurs actifs.
- Une partie à 4 ne peut jamais contenir 5 joueurs actifs.
- Un joueur ne voit jamais les pièces privées des autres.
- Les tests couvrent chaque règle et chaque cas limite.
- Deux clients reçoivent le même état public et la même version après une action acceptée.
- Une action invalide ne modifie pas l'état.
- Une action dupliquée ne produit pas deux coups.
- Après reconnexion, le joueur retrouve son état privé autorisé et le même tour courant.
- Le résultat est reproductible à partir de la version du moteur et de l'historique des actions.

## Architecture du moteur
Le moteur Domino doit être un package indépendant, sans dépendance à React, Next.js, NestJS ou Socket.IO.
Il expose une interface conceptuelle :
- `createInitialState(config, players, seed)`
- `getPlayerView(state, playerId)`
- `validateAction(state, playerId, action)`
- `applyAction(state, playerId, action)`
- `isFinished(state)`
- `calculateResult(state)`

Les signatures définitives peuvent être adaptées à la stack, mais le moteur doit être déterministe, pur autant que possible, testable et versionné. Le générateur aléatoire et la distribution sont exécutés côté serveur.

## Tests
- Tests unitaires pour chaque règle.
- Tests de propriétés/invariants : nombre de pièces conservées, absence de pièce dupliquée, joueur actif valide, état cohérent.
- Tests de sécurité : tentative de jouer une pièce non détenue ou d'agir au tour d'un autre.
- Tests d'intégration Socket.IO à 2 et 4 clients.
- Tests de reconnexion, latence, duplication et abandon.
- Tests de non-régression sur les versions de règles.

## Dépendance bloquante
Aucun moteur Domino ne doit être considéré terminé tant que les règles des deux modes ne sont pas validées par le propriétaire du produit.


