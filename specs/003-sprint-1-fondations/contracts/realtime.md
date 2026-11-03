# Contrat temps réel — Sprint 1

Aucun échange temps réel nécessaire. Santé réelle par HTTP à la demande. Aucun namespace, gateway, heartbeat applicatif, événement ou client Socket.IO actif au Sprint 1.

Socket.IO reste la technologie imposée pour les sprints présence/matchmaking/parties. Ne pas ouvrir un socket uniquement pour démonstration. Aucun contrat room:join, game:action ou player:* défini ici.

Sessions, autorisations de ressource, version d'état, idempotence et reprise de partie seront spécifiées dans les sprints concernés. Le request id HTTP santé n'est ni un coup de jeu ni une garantie d'idempotence métier. Reconnexion technique Redis n'est pas une reconnexion joueur ni un délai de grâce.
