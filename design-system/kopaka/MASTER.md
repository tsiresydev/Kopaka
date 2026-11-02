# Kopaka — Design System officiel v2.0

## Nouvelle direction artistique — les bons moments se partagent

Cette section remplace les décisions visuelles v1 contradictoires ci-dessous. La v1 reste documentée pour les contrats d’accessibilité, réseau et métier toujours applicables. L’image annoncée dans le brief n’étant pas jointe, cette proposition interprète la description textuelle ; aucune fidélité à cette image n’est revendiquée.

L’accueil est turquoise `#41C9BA`, les surfaces crème `#FFF9ED` et blanc cassé `#FFFEF9`, les textes vert profond `#123E37`. La menthe `#A8E8CC` accompagne les illustrations ; la mangue `#FFBC66` porte « Jouer maintenant » ; le corail `#F18F7B` ponctue les compositions. Le vert d’action `#086B60` conserve une bonne lisibilité sur les surfaces claires. Ne pas utiliser le turquoise comme petit texte sur crème.

Le clair devient le thème initial, indépendamment du système. Système et sombre restent des choix explicites ; l’accueil conserve sa couleur turquoise avec son texte vert constant. Le plateau vert profond reste stable pour préserver la lecture des pièces. Les avatars menthe, mangue, corail et lilas sont toujours accompagnés de pseudo et siège : leur couleur seule ne porte aucune information.

Cartes à rayon 28px, contrôles à 16px, dialogues à 32px et CTA d’accueil en pilule de 56px minimum. Ombres diffuses, disques et étoiles géométriques décoratives, dominos ivoire en léger relief. La composition de l’accueil peut incliner les pièces ; les pièces manipulables restent droites, espacées et à 48×96px. Aucun asset distant ni moteur 3D requis.

Le display passe de 44 à 80px avec une composition en trois lignes ; Outfit / Work Sans restent les fontes cibles et le prototype utilise leur repli système tant que les fichiers locaux manquent. Mobile : une colonne ; à partir de 768px, accueil en deux colonnes et étapes en trois colonnes. Les modes s’affichent en cartes radio illustrées, empilées sous 600px. Les cibles demeurent de 48px minimum.

Accueil : promesse « Les dominos. Les amis. Les bons moments. », CTA « Jouer maintenant », trois étapes puis lobby. Communauté : joueurs autour de la table, progression, badges et classement ; ne pas ajouter de chat ou d’invitations sans validation produit. Le lobby propose les formats 2/4, l’accès invité et un état de présence explicite. Sans backend, aucun compteur de joueurs en ligne n’est inventé. Les données de démonstration sont annoncées avant les parcours.

Le prototype démontre sélection/annulation des pièces, modes, formulaire invité, dialogues et thèmes. Créer/rejoindre une salle réelle, poser une pièce et synchroniser les joueurs relèvent de l’application future. Pas de pioche, passe, équipes ou horloge activées avant validation des règles.

2 novembre 2026 · Référence de conception du MVP web mobile-first. Cette livraison définit la direction graphique demandée ; elle ne valide pas les règles métier encore ouvertes dans le dépôt.

Lire ce MASTER avant toute interface, puis `pages/<page>.md` si présent. Les précisions de page ne remplacent que les règles explicitement indiquées. `tokens.css` fournit les valeurs exécutables ; `COMPONENTS.md` les contrats ; `preview.html` un catalogue autonome à ouvrir dans un navigateur.

## Direction : une table ouverte à tous

Vert profond, ivoire, accent mangue, compositions aérées et dominos tactiles : une table de jeu contemporaine. Le caractère gaming vient du plateau, des adversaires et du tour actif. UI plane, relief discret réservé aux pièces, aucun habillage de dashboard administratif.

Le contexte malgache se traduit par le bilinguisme, le smartphone et les connexions modestes, sans folklorisme ni symboles culturels supposés. Le mot-symbole typographique reste une proposition ; aucun logo officiel existant n'a été fourni.

| Direction explorée | Décision |
|---|---|
| Vert table + ivoire + mangue | Retenue : chaleur, reconnaissance des jeux de société, cohérence jour/nuit |
| Violet électrique + rose, palette Gaming du skill | Écartée : trop proche des codes esports génériques |
| Réalisme 3D + bois sombre, premier résultat généré | Réduit au biseau CSS : coût et surcharge incompatibles avec le brief |

Aucun néon permanent, glitch, verre flouté généralisé, police pixel, effet casino ou jeu futur dans le MVP. Points, XP et badges virtuels, non convertibles ; aucune imagerie monétaire.

## Couleurs et thèmes

Thème initial système, repli clair. Choix « Système / Clair / Sombre » conservé localement sans compte. Le plateau conserve son vert profond dans les deux thèmes ; l'habillage suit le thème choisi. Une seule référence de valeurs : `tokens.css`, primitives `--ref-*` → sémantiques `--color-*` → composants `--button-*`, `--domino-*`. Aucun hexadécimal dans les composants applicatifs.

| Rôle | Clair | Sombre |
|---|---|---|
| Principale / sur principale | `#146B50 / #FFFFFF` | `#71DBB6 / #10251E` |
| Secondaire / sur secondaire | `#4F46A5 / #FFFFFF` | `#B7B0FF / #17132E` |
| Accent / sur accent | `#F4B544 / #241B0B` | identique |
| Fond | `#F6F5F0` | `#101B18` |
| Surface carte/champ/dialogue | `#FFFFFF` | `#182923` |
| Surface douce | `#EAF1EB` | `#21382F` |
| Texte | `#172D25` | `#EFF7F2` |
| Texte secondaire | `#52675D` | `#B0C5B9` |
| Bordure décorative | `#CDD9D0` | `#3A5448` |
| Bordure contrôle | `#72877A` | `#829D8D` |
| Focus | `#146B50` | `#9BF1D1` |
| Succès / fond | `#146B50 / #E4F3EB` | `#8DE5BC / #173D2D` |
| Erreur / fond | `#B42332 / #FDECEE` | `#FFADB4 / #48262C` |
| Avertissement / fond | `#805009 / #FFF2D6` | `#FFD482 / #44351D` |
| Information / fond | `#205EA6 / #EAF2FF` | `#A9D0FF / #20374C` |
| Plateau / texte | `#123E32 / #F0F8F2` | identique |
| Pièce / points | `#FFF8E7 / #172D25` | identique |

Principale pour la marque et les actions usuelles ; mangue réservée au CTA Jouer et à quelques récompenses ; secondaire violet pour progression/profil. Jamais de texte blanc sur mangue. Succès/erreur/avertissement/info accompagnés d'un libellé et d'une icône ou forme.

Cibles : texte actif ≥4,5:1 ; contrôle, icône utile et focus ≥3:1 contre leurs surfaces adjacentes. Bordures décoratives exclues de l'identification d'un contrôle. Hover/pressed fournis en CSS. Rapport reproductible : `python design-system/kopaka/scripts/check_contrast.py`, sortie `CONTRAST.md`. Le plateau utilise son focus clair propre ; les pièces ont un anneau intérieur vert et extérieur clair.

## Typographie

**Outfit** pour titres et mot-symbole, **Work Sans** pour corps et contrôles : paire Geometric Modern du skill. Personnalité sans aspect enfantin ; graisses 400/600/700. Repli immédiat `system-ui, sans-serif`. Chiffres tabulaires pour scores/durées.

| Rôle | Taille mobile → desktop | Interligne | Graisse |
|---|---|---|---|
| Display | 36 → 56px, fluide | 1,08 | 700 |
| H1 | 28 → 40px, fluide | 1,15 | 700 |
| H2 | 24 → 28px | 1,25 | 600 |
| H3 | 20px | 1,3 | 600 |
| Corps, champs, actions | 16px | 1,5 | 400/600 |
| Métadonnées | 14px | 1,5 | 400 |
| Annotations non essentielles | 12px | 1,5 | 600 |

Implémenter en rem, mesure maximale 65ch, casse phrase, sans justification. Instructions de jeu et erreurs à 16px. Titres équilibrés sans forcer les espaces insécables. Pseudonymes et badges repliables. Pour Next.js : polices WOFF2 locales via le mécanisme du framework, au layout racine, swap ; pas de chargement externe au runtime. Les fontes ne sont pas incluses ici : le catalogue montre explicitement le repli système. Vérifier les glyphes avec les textes FR/MG réels.

## Géométrie et profondeur

Espacements : **4, 8, 12, 16, 24, 32, 48, 64, 96px**. Minimum 8px entre cibles. Padding carte 16px mobile / 24px desktop. Sections applicatives 32–48px, marketing large 64–96px.

Rayons : 8px pièce, 12px bouton/champ, 20px carte, 24px dialogue, pilule pour statuts/avatars. Ombres : niveau 0 plateau, 1 cartes, 2 menus, 3 dialogue. En sombre, séparer surtout par surfaces/bordures. Relief statique des dominos via ombre CSS, aucune dépendance 3D.

Couches : base 0, tour actif 10, header 20, menu 40, dialogue natif top-layer.

## États et mouvement

Feedback de pression immédiat ; transition 120ms, sélection 180ms, pose confirmée 240ms maximum, dialogue entrée 180ms / sortie 120ms. Courbe `cubic-bezier(.2,.8,.2,1)`. Opacité et transform uniquement ; aucun changement de flux au hover. Deux mouvements simultanés maximum. Pas de clignotement, parallaxe ou récompense en boucle. Les animations sont interruptibles et ne déterminent jamais l'état métier. `prefers-reduced-motion` supprime les déplacements tout en conservant texte, focus et retour d'état.

## Mise en page responsive

| Largeur | Règle |
|---|---|
| 320–767px | Une colonne, gouttière 16px, cartes empilées, main repliée |
| 768–1023px | Deux colonnes si lisibles, gouttière 24px |
| ≥1024px | Max 1200px, gouttière 32px ; zone jouer dominante |
| ≥1440px | Conserver le max, ne pas densifier |

Navigation haute compacte avec Jouer / Classement / Profil, langue et thème ; menu mobile étiqueté, pas de sidebar administrative. Header peut grandir avec le texte. Un CTA dominant par écran. En partie, retour au lobby toujours accessible ; confirmation si sortie effective. Pas d'obligation de paysage ni de défilement horizontal de page. Textes et noms longs se replient. Respecter safe areas pour commandes fixes si l'application en utilise, et réserver leur place.

## Parcours

Landing : « Votre prochaine partie commence ici. », illustration vectorielle, CTA Jouer en invité, trois étapes, règles, compte secondaire. Aucune preuve sociale inventée.

Lobby : un jeu Domino avec deux modes 2/4 ; choisir avant matchmaking. Trouver une partie dominant, création de salle secondaire. Pas de carte de futur jeu ni de faux compteur de présence.

Attente : sièges, joueurs prêts et connexion. Partie : adversaires, tour, chaîne publique, main privée, actions légales. Résultat : résultat serveur, points et XP distincts, retour lobby ; revanche seulement si validée produit.

## Accessibilité, FR/MG et réseau

Cible de confort Kopaka web : **48×48 CSS px**, distincte des unités natives pt/dp. Focus 3px avec offset 3px ; clavier complet, lien d'évitement, boutons natifs, labels persistants, ordre DOM cohérent. Couleur doublée de texte/forme. Une région live polite pour tour/dernier coup ; ne pas annoncer une horloge chaque seconde.

Pose : sélectionner une pièce → choisir une extrémité autorisée → confirmer, annuler avant envoi. Le glisser n'est jamais obligatoire. Ne pas accepter visuellement un coup avant confirmation serveur. En reconnexion, conserver une vue signalée comme en synchronisation, verrouiller les poses et restaurer l'état autoritaire ; aucune pièce adverse privée dans le DOM.

Français convivial, tutoiement dans les consignes, infinitif dans les boutons, erreurs sans blâme et avec récupération. Dictionnaires centralisés, langue de document actualisée, formatage localisé, 40% de marge d'expansion. Afficher Français / Malagasy sans drapeau. Traductions métier malagasy à relire par un locuteur avant publication ; aucune traduction inventée ici. Le catalogue français ne constitue pas l'application bilingue.

## Gouvernance et limites

`RESEARCH.md` trace les recherches. `GENERATION-BRUTE.md` est l'archive non normative du MASTER persisté par le skill : ses recommandations 3D contredisent ses anti-patterns, et son exemple blanc sur orange contredit son on-accent noir. Le présent MASTER arbitre ces écarts ; ne pas copier le CSS brut.

Importer les tokens une fois dans l'application. Versionner documentation, tokens et catalogue ensemble. Le catalogue n'est pas un moteur réseau. Ses pièces et chiffres sont illustratifs, sans définir une variante Domino.

Restent à valider : distribution, pioche/passe, équipes à quatre, scores, XP, durée de reconnexion, abandon, démarrage, authentification, conservation du profil invité. Se reporter à `DECISIONS_ET_POINTS_A_VALIDER.md`. Aucun jeu futur n'est implémenté.
