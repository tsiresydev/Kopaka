# Checklist — Qualité des exigences Kopaka

## Produit
- [ ] Le périmètre MVP est limité au Domino à 2 et 4 joueurs.
- [ ] Mode invité sans inscription obligatoire.
- [ ] Inscription facultative clairement définie.
- [ ] Français et malagasy couverts sur les parcours P0.
- [ ] Aucun argent réel, mise, dépôt, retrait ou gain monétaire.
- [ ] Les récompenses virtuelles sont non transférables et non convertibles.

## Règles de jeu
- [ ] Règles à 2 joueurs formalisées et validées.
- [ ] Règles à 4 joueurs formalisées et validées.
- [ ] Distribution, premier joueur, pioche, passe et blocage définis.
- [ ] Score, égalité et fin de partie définis.
- [ ] Abandon et déconnexion définis.
- [ ] Exemples de parties et cas limites disponibles.

## Technique
- [ ] Le serveur est autoritaire.
- [ ] Le moteur est indépendant de l'UI et du transport.
- [ ] Les événements sont validés et idempotents.
- [ ] Les vues privées ne divulguent pas les mains des autres.
- [ ] Reconnexion et snapshots versionnés sont définis.
- [ ] Les tests couvrent règles, sécurité et concurrence.

## UX
- [ ] Mobile-first smartphone/tablette/desktop.
- [ ] États vide, chargement, erreur et hors ligne conçus.
- [ ] Contrastes et tailles tactiles vérifiés.
- [ ] Traductions FR/MG vérifiées.
- [ ] Animations légères et réduction du mouvement respectée.
