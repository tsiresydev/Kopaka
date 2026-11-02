# Composants et interactions

## Mise à jour visuelle v2

Les dimensions v2 remplacent celles du tableau historique : cartes 28px, boutons/champs 16px, dialogues 32px ; CTA d’accueil en pilule, hauteur 56px. Deux cartes radio illustrées distinguent Domino à 2 et à 4 avec un libellé visible et un contour sélectionné. Accueil turquoise, surfaces crème, menthe et corail décoratifs ; mangue pour Jouer. Les états et contrats d’interaction ci-dessous restent applicables. Les illustrations sont masquées aux lecteurs d’écran lorsque leur contenu est déjà décrit.

Spécification cible pour l'application ; le catalogue autonome illustre une sélection, sans backend. Tous les composants suivent le MASTER et ses thèmes.

| Composant | Anatomie / règles | États / interaction |
|---|---|---|
| Bouton | Min 48px, padding 12×20px, radius 12px ; icône 20px, gap 8px. Vert primaire, mangue Jouer, secondaire bordé, tertiaire, danger | Default/hover/pressed/focus/disabled/loading. Garder largeur, libellé Recherche…, aria-busy, bloquer doublons. Annuler séparé accessible |
| Carte | Surface, bordure décorative, radius 20px, padding 16/24px ; titre, description, métadonnées, action | Informative sans curseur cliquable. Choix via radio nommé : contour + texte, pas seulement couleur. Pas de boutons imbriqués dans un lien |
| Champ | Label visible, aide, hauteur 48px, bordure contrôle | Focus/invalide/readonly/disabled distincts ; blur/submit, erreur liée, saisie conservée. Résumé lié si plusieurs erreurs ; collage autorisé |
| Statut | Texte 14px, icône optionnelle 16px, fond sémantique | Prêt, En attente, En jeu, Déconnecté ; texte obligatoire |
| Alerte / toast | Cause et récupération, icône, région live adaptée | Sans vol de focus ; persistant si action requise. Pas d'erreur critique dans un toast fugace |
| Modale | Titre, contenu, fermer, annuler/action ; max 480px, padding 24px ; mobile largeur moins 32px | Dialog natif ou primitive accessible, focus contenu, Escape, arrière-plan inerte, retour au déclencheur. Sortie : focus initial Rester. Pas d'empilement |
| Header | Mot-symbole, Jouer/Classement/Profil, langue/thème ; min 72px, peut grandir | Lien d'évitement, aria-current + repère visuel ; menu mobile nommé |
| Landing | Promesse, illustration SVG décorative, CTA invité, trois étapes, règles | Compte secondaire ; pas de statistiques ou avis inventés |
| Lobby | Choix Domino 2/4 via radios, CTA, salles | Un seul jeu, création secondaire, disponibilité réelle |
| Carte Domino | Nom, illustration, modes exacts, disponibilité | Indisponibilité expliquée avec récupération |
| Salle d'attente | Nom/mode, places occupées/requises, sièges, joueurs prêts/connexion | Places vides visibles. Démarrage auto/manuel à valider ; aucune horloge arbitraire |
| Joueur | Initiales par défaut, pseudo, Vous, siège, statut | Noms repliables ; connexion jamais par point coloré seul |
| Profil | Pseudo, avatar, statistiques disponibles, XP, badges | Invité identifié ; conservation non promise avant validation |
| Classement | Table rang/joueur/points ; chiffres à droite ; Vous repéré par texte/contour | Tri bouton et aria-sort ; mode/période seulement si définis |
| XP | Progress natif + valeur/seuil si validé, couleur secondaire | Sinon XP brut ; aucun niveau inventé ; annonce après résultat serveur |
| Badge | Icône SVG, nom, description, acquis/verrouillé écrit | Critères uniquement après validation ; ni achat ni rareté artificielle |

## Plateau et pièces

Plateau vert constant, chaîne dominante. Pièces ivoire, points sombres, deux moitiés égales, proportions 1:2. Main : référence 48×96px, points 6px ; illustration 64×128px. Le jeu de pièces réel reste à valider : l'exemple ne définit pas un double-six. Nom accessible « Domino 3–5 » ; SVG points masqué si le nom existe.

| État | Aspect et sémantique |
|---|---|
| Repos | Bouton nommé, biseau léger |
| Jouable | Bordure + libellé si autorisé par serveur |
| Sélectionnée | Contour + coche/texte, aria-pressed ; sans déplacement du flux |
| Envoi | Envoi…, pièce conservée dans la main, action verrouillée |
| Acceptée | Pose après confirmation, annonce unique |
| Refusée | Message près des actions, sélection conservée si valide, focus stable |
| Adversaire | Dos ou compteur public autorisé ; aucune valeur privée dans le DOM |

Deux joueurs : adversaire en haut, vous en bas. Quatre : sièges autour sur desktop, trois adversaires regroupés au-dessus sur téléphone ; aucune équipe supposée. Tour marqué « À vous de jouer » / « Tour de [pseudo] » + contour. Horloge uniquement si les règles la prévoient.

Chaîne longue : vue d'ensemble non interactive, commandes zoom/recentrer/déplacement et liste textuelle équivalente. Pas de réduction des actions à de minuscules cibles. Pose par sélection de pièce, boutons Extrémité gauche/droite de 48px, confirmation et annulation. Aucune obligation de drag ou de paysage. Main en grille repliable, pas de chevauchement. Paysage court : commandes dans le flux défilant.

## Retours d'état obligatoires

| État | Message / récupération |
|---|---|
| Chargement | Skeleton statique dimensionné, Chargement des tables…, aria-busy |
| Matchmaking | Recherche en cours, mode choisi, Annuler ; aucun délai promis |
| Vide | Aucune table disponible pour ce mode ; créer une salle si disponible |
| Erreur | Cause compréhensible, Réessayer ; choix et pseudo conservés |
| Hors ligne | Connexion interrompue, actions suspendues ; aucune pose locale |
| Reconnexion | Synchronisation…, actions verrouillées jusqu'à nouvel état autoritaire |
| Coup invalide | Cause, action à reprendre ; focus stable, pas de flash seul |
| Salle pleine | État actualisé, retour tables/recherche ; aucun remplacement supposé |
| Annulée | Explication neutre et retour lobby ; pénalité si définie seulement |
| Terminée | Résultat/points/XP serveur ; compte facultatif, retour lobby |

Une seule annonce contextualisée par événement. Les confirmations serveur, jamais la fin d'une animation, déterminent l'état persistant. Disabled utilise attribut natif et tokens dédiés, pas une opacité seule.
