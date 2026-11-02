# Validation et limites

## Vérifications reproductibles

Refonte v2 du 2 novembre 2026 : vérification des contrastes étendue à l’accueil turquoise, aux décorations et aux avatars. Syntaxe JavaScript contrôlée. Le rapport `CONTRAST.md` donne le décompte actuel et les résultats exécutés. L’image annoncée n’était pas disponible ; la direction repose sur le brief textuel.

- `python design-system/kopaka/scripts/check_contrast.py` : contraste des tokens réellement utilisés, deux thèmes, textes, sémantique, hover/pressed, focus, contrôles, pièces et plateau. Résultats dans CONTRAST.md.
- `node --check design-system/kopaka/preview.js` : syntaxe du catalogue.
- Revue du code : contrôles natifs, focus visible, dialog modal, restauration du focus, choix du mode radio, nom accessible de chaque pièce, texte d'état live, aucune requête réseau ou dépendance externe, stockage local protégé si indisponible.

## À vérifier dans le navigateur avant intégration produit

Ces points sont des critères d'acceptation, pas des tests exécutés dans cette livraison :

- 320px, 375×667, 667×375, 768px, 1024px, 1440px ; pas de débordement de page, pas de texte masqué.
- Zoom 200%, taille de texte augmentée, noms très longs et expansion FR/MG de 40%.
- Navigation clavier du header jusqu'au footer, sélection/annulation des pièces, formulaire, Escape et restauration du focus des deux dialogues.
- Clair initial, choix système et sombre, persistance disponible/indisponible, changement de préférence système.
- Réduction des animations ; tous les retours restent compréhensibles sans mouvement.
- Lecteur d'écran : nom des pièces, état sélectionné, région de retour et structure des tableaux.
- Contraste des compositions réelles : anneaux de focus sur les différentes surfaces et pièces, limites de champs, scrim des dialogues.
- Avec les vraies fontes : métriques, accents, textes malagasy relus, absence de saut de mise en page.
- Dans l'application réelle : chaîne longue, 4 joueurs, latence, coup refusé, reconnexion, aucun double envoi ni exposition de main adverse.

Aucun navigateur automatisé n'est disponible dans l'environnement identifié. Le catalogue est un artefact de design, pas une certification WCAG ni une application multijoueur ; les exigences temps réel et i18n restent des contrats pour l'implémentation.
