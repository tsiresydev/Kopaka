# Contrat UI — page de fondation

Source : deux clarifications de [spec.md](../spec.md). Route / uniquement ; aucune route de compte, lobby ou jeu.

## Composition

Lien d'évitement ; header Kopaka avec langue/thème ; titre et mention explicite de page de fondation ; section disponibilité réelle ; cartes de démonstration des boutons, champs (label/aide/erreur), cartes, sélecteurs et messages chargement/vide/erreur/succès/disabled.

Les exemples sont identifiés comme démonstrations. Aucun faux compteur, joueur ou bouton promettant une partie. Les champs ne sont pas des pseudonymes, n'envoient rien et ne créent rien. Pas de modal sans besoin. Textes FR/MG à relire.

## Préférences et rendu

[Modèle](../data-model.md) pour clés et validation. FR/clair initial même sur OS sombre ; system seulement choisi explicitement, écoute matchMedia. Langue ne dépend pas du serveur. html lang et data-theme actualisés. Stockage refusé → fonctionnement mémoire.

Script local initial applique attributs sous CSP hash/nonce ; contenu SSR et premier rendu React cohérents, synchronisation providers après montage sans masquer la page. Aucun localStorage au rendu serveur ni erreur d'hydratation acceptée.

## Design et accessibilité

tokens.css importé une fois, aliases Tailwind/shadcn vers rôles Kopaka, pas de palette parallèle. Carte 28 px, contrôle 16 px, dialogue 32 px si présent. Polices système si fichiers locaux manquent.

Une colonne 320–767, grille lisible dès 768, max 1200 px ; gouttières 16/24/32 suivant MASTER. Zoom 200 % et texte +40 % ; pas de hauteur fixe bloquante. Corps 16 px, cibles 48×48 CSS px espacées de 8 px ; focus 3+3 px. Texte actif ≥4,5:1, contrôle/focus ≥3:1, en clair et sombre.

Labels persistants et erreurs reliées ; clavier complet, DOM cohérent ; sens doublé de texte/forme ; polite pour santé sans vol de focus. Reduced-motion supprime les déplacements. Contraste et clavier manuels complètent axe.

## Échange

L'indicateur réel suit [HTTP](http.md), séparé des exemples. La page reste lisible quand API ou données sont indisponibles ; réessai après reprise sans reload complet. Les tests simulés ne remplacent pas la chaîne réelle.
