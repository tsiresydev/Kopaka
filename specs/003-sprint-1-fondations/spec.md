# Feature Specification: Kopaka — Sprint 1, fondations

**Feature Branch**: aucune branche créée ; identification indépendante de la branche Git.

**Created**: 2026-11-02

**Status**: Spécification fonctionnelle formalisée sur le périmètre validé ; réalisation non commencée.

**Input**: Formaliser le Sprint 1 de Kopaka à partir de la proposition validée, sans implémentation, plan technique ni liste de tâches.

## Contexte et périmètre

### Objectif

Livrer un socle reproductible et vérifiable, comprenant les applications web et serveur, les services de données locaux, les contrats communs, un shell responsive bilingue et les contrôles qualité. Il doit permettre de commencer le parcours invité au Sprint 2 sans reconstruire les fondations.

Le shell est une structure d'interface de fondation destinée à la recette et à la réutilisation. Il ne constitue ni l'accueil produit complet, ni un lobby, ni une plateforme jouable.

Le livrable visible est une page de fondation clairement identifiée, avec en-tête Kopaka, choix de langue et de thème, exemples des composants essentiels et de leurs états. Elle ne propose aucun parcours de jeu. Les exemples sont annoncés comme démonstrations de recette, jamais comme données ou opérations réelles.

### Références et gouvernance

- [Constitution](../../.specify/memory/constitution.md), référence principale.
- [Cahier des charges](../../CAHIER_DES_CHARGES.md).
- [Décisions et points à valider](../../DECISIONS_ET_POINTS_A_VALIDER.md).
- [Plateforme](../001-platforme-kopaka.md) et [Domino](../002-domino.md).
- [Plan existant](../../plan.md) et [backlog existant](../../tasks.md), uniquement comme références du périmètre Sprint 1.
- [Design System MASTER](../../design-system/kopaka/MASTER.md).

Les identifiants S1-FR/S1-NFR/S1-US sont locaux à cette spécification et ne remplacent pas les identifiants des références. Aucune priorité P0/P1 n'est modifiée. Les stories de fondation sont toutes nécessaires au Sprint 1 ; leur ordre décrit une séquence de recette, pas une nouvelle classification produit.

### Inclus

- Environnement commun de développement et conventions de qualité.
- Applications web et serveur démarrables et vérifiables séparément.
- Contrats communs et validation des échanges du socle.
- Services de données locaux et initialisation minimale versionnée.
- Contrôles de vie, de disponibilité et diagnostic technique.
- Shell responsive, composants essentiels et intégration du Design System existant.
- Dictionnaires FR/MG, changement de langue et préférence locale.
- Vérifications automatisées et documentation de prise en main.

### Exclus

- Sessions invitées, pseudonymes, accueil produit complet, comptes et lobby.
- Catalogue fonctionnel, sélection de mode liée à une salle, salles, présence et matchmaking.
- Reconnexion de partie, commandes de jeu, moteur Domino et résultats.
- Amis, invitations, statistiques, progression, classements, administration et modération.
- Jeux futurs, chat, tournois, PWA et applications natives.
- Tout argent réel, mise, achat de crédits, portefeuille, dépôt, retrait ou récompense convertible.

Les obligations P0 du MVP restent dues aux sprints concernés : le healthcheck ne vaut pas livraison de FR-070/071 et le shell bilingue ne vaut pas achèvement de tous les parcours P0 FR/MG. Aucun modèle métier ou comportement de jeu n'est validé par cette spécification.

## Clarifications

### Session 2026-11-02

- Q: Quel contenu doit présenter le shell livré au Sprint 1 ? → A: Une page de fondation clairement identifiée, avec en-tête Kopaka, langue, thème et exemples des composants et de leurs états ; aucun parcours de jeu.
- Q: La page de fondation doit-elle afficher la disponibilité réelle du serveur ? → A: Afficher un état minimal réel « disponible / indisponible », avec chargement, erreur et nouvelle tentative ; aucun détail interne exposé.

## User Scenarios & Testing *(mandatory)*

### S1-US01 — Prendre en main l'environnement

En tant que développeur, je veux installer, démarrer et vérifier le projet avec une procédure commune afin de disposer d'un environnement reproductible.

**Priorité et valeur** : fondation indispensable aux P0, correspondant au périmètre S1-01 à S1-08 et S1-13 existant ; aucune nouvelle priorité produit.

**Independent Test** : une personne autre que l'auteur suit la documentation depuis une copie propre avec les prérequis déclarés.

**Acceptance Scenarios**:

1. **Given** une copie propre et les prérequis installés, **When** la personne suit la procédure, **Then** les applications et services requis démarrent sans étape non documentée.
2. **Given** les applications configurées, **When** chacune est construite séparément, **Then** chaque construction réussit sans dépendance au code interne de l'autre application.
3. **Given** un stockage durable vide, **When** l'initialisation versionnée est appliquée, **Then** elle réussit et son état est vérifiable ; un contrôle ultérieur ne réapplique pas une initialisation déjà enregistrée.
4. **Given** une donnée technique de recette enregistrée, **When** les services sont arrêtés puis redémarrés normalement, **Then** cette donnée durable est conservée.
5. **Given** une configuration obligatoire absente ou invalide, **When** le service démarre, **Then** le diagnostic identifie la configuration concernée sans révéler de valeur secrète et ne déclare pas le service prêt.

### S1-US02 — Vérifier les échanges du socle

En tant que développeur, je veux utiliser des contrats communs et une validation effective afin d'éviter des échanges incohérents entre applications.

**Priorité et valeur** : fondation de validation serveur, périmètre S1-06 ; les règles de jeu restent exclues.

**Independent Test** : soumettre des données techniques valides et invalides à un contrat effectivement utilisé par le socle, sans identité joueur ni partie.

**Acceptance Scenarios**:

1. **Given** une entrée conforme au contrat, **When** elle est validée, **Then** elle est acceptée avec un résultat conforme au contrat commun.
2. **Given** une entrée malformée, **When** elle est reçue côté serveur, **Then** elle est rejetée sans mutation ni exposition de détails internes.
3. **Given** les dépendances du projet, **When** leur séparation est vérifiée, **Then** les contrats communs ne nécessitent pas d'importer les composants d'interface ou l'orchestration serveur.

### S1-US03 — Diagnostiquer une indisponibilité

En tant que personne chargée de l'exploitation, je veux distinguer un service actif d'un service prêt afin de localiser les incidents du socle.

**Priorité et valeur** : fondation d'observabilité, périmètre S1-09 ; aucun espace d'administration livré.

**Independent Test** : examiner les contrôles et journaux lorsque tout fonctionne, puis arrêter séparément chacune des dépendances requises.

**Acceptance Scenarios**:

1. **Given** un processus serveur actif et ses dépendances disponibles, **When** les contrôles sont consultés, **Then** vie et disponibilité sont positives.
2. **Given** une dépendance requise indisponible, **When** les contrôles sont consultés, **Then** le processus peut rester vivant mais la disponibilité est négative et un événement technique permet le diagnostic.
3. **Given** cette dépendance rétablie, **When** un nouveau contrôle est effectué, **Then** la disponibilité reflète son état rétabli.
4. **Given** une erreur technique, **When** les réponses et journaux sont examinés, **Then** ils ne contiennent ni secret, ni identifiant de connexion sensible, ni trace interne présentée au visiteur.

### S1-US04 — Utiliser le shell sur tous les écrans

En tant que visiteur ou personne chargée de la recette, je veux parcourir une interface lisible et accessible afin de vérifier les fondations visuelles de Kopaka.

**Priorité et valeur** : préparation de NFR-001 et des exigences UX, périmètre S1-10 ; aucun parcours de jeu livré.

**Independent Test** : parcourir le shell et ses composants essentiels sur les largeurs définies, au toucher et au clavier.

**Acceptance Scenarios**:

1. **Given** chacune des largeurs 320, 375, 768, 1024 et 1440 CSS px, **When** le shell est parcouru, **Then** aucun contenu utile n'est tronqué et aucun défilement horizontal de page involontaire n'apparaît.
2. **Given** une navigation au clavier, **When** tous les contrôles sont parcourus, **Then** leur nom et leur focus sont perceptibles, l'ordre est cohérent et aucun piège clavier ne bloque la progression.
3. **Given** les états chargement, vide, erreur, succès et désactivation des composants présents, **When** ils sont affichés en recette, **Then** leur sens est identifiable sans dépendre uniquement d'une couleur.
4. **Given** une perte réseau après chargement du shell, **When** un échange échoue, **Then** le contenu déjà chargé reste lisible, l'échec est explicite et une nouvelle tentative est possible sans faux succès.
5. **Given** la préférence de mouvement réduit, **When** le shell est utilisé, **Then** les déplacements animés sont supprimés sans perte de message ou de focus.
6. **Given** un premier affichage sans préférence de thème, **When** le shell apparaît, **Then** il utilise le thème clair v2 ; les choix explicites clair/sombre/système prévus par le Design System restent utilisables et mémorisés localement si le stockage est disponible.
7. **Given** la page de fondation, **When** elle est ouverte, **Then** son rôle de démonstration est explicite et elle présente l'en-tête Kopaka, les choix de langue et de thème, ainsi que les exemples de composants et d'états, sans parcours de jeu.
8. **Given** la page de fondation, **When** la disponibilité du serveur est consultée, **Then** un échange réel affiche un chargement puis « disponible » uniquement si le serveur est prêt ; un serveur non prêt ou injoignable affiche « indisponible » avec un message approprié et une nouvelle tentative possible, sans détail interne. Cet indicateur réel est distingué des exemples de composants.

### S1-US05 — Choisir sa langue

En tant que visiteur, je veux choisir Français ou Malagasy et retrouver mon choix afin de lire le shell dans la langue choisie sans créer de compte.

**Priorité et valeur** : préparation de FR-002 (P0), NFR-008 et US-001 existante ; périmètre S1-11 limité au shell.

**Independent Test** : changer la langue puis recharger le shell, avec et sans stockage local disponible.

**Acceptance Scenarios**:

1. **Given** le shell chargé, **When** une langue est choisie, **Then** tous ses libellés et la langue du document sont actualisés, et le choix reste modifiable.
2. **Given** une préférence mémorisée, **When** le shell est rechargé, **Then** cette langue est réutilisée.
3. **Given** un stockage local inaccessible, **When** la langue est changée, **Then** le changement fonctionne pour la visite courante sans erreur bloquante ; la persistance n'est pas promise.
4. **Given** des textes longs ou une expansion de 40 %, **When** le shell est affiché sur mobile, **Then** les textes se replient sans masquer les contrôles.
5. **Given** les dictionnaires livrés, **When** leur complétude et leur relecture sont contrôlées, **Then** aucun libellé du shell ne manque et les textes malagasy ont été relus par un locuteur compétent.

### S1-US06 — Vérifier et transmettre le socle

En tant que membre de l'équipe, je veux des vérifications automatiques et une documentation à jour afin de détecter les régressions et reprendre le projet.

**Priorité et valeur** : qualité constitutionnelle, périmètre S1-12 et S1-13.

**Independent Test** : lancer l'ensemble des contrôles, vérifier leur échec sur une anomalie contrôlée et suivre la procédure de démarrage.

**Acceptance Scenarios**:

1. **Given** une version candidate, **When** la chaîne qualité s'exécute, **Then** elle vérifie conventions, types, tests pertinents et construction, avec un résultat explicite par contrôle.
2. **Given** un contrôle en échec, **When** la chaîne termine, **Then** le résultat global est en échec et le contrôle fautif est identifiable.
3. **Given** la documentation livrée, **When** une autre personne réalise la prise en main, **Then** elle trouve prérequis, configuration, démarrage, initialisation, contrôles et dépannage sans échange oral indispensable.

### Edge Cases

- Dépendance indisponible au démarrage ou pendant le fonctionnement : disponibilité négative, diagnostic sans secret, récupération constatée au prochain contrôle réussi.
- Processus arrêté : aucune absence de réponse ne peut être interprétée comme un état sain.
- Entrée invalide : refus explicite, sans mutation ni confiance accordée au client.
- Préférence locale absente, non reconnue ou inaccessible : shell utilisable ; sans langue reconnue, repli français documenté comme convention du shell, modifiable sans compte.
- Traduction manquante : anomalie bloquant la recette bilingue, jamais validée comme traduction complète.
- Police locale absente : repli système lisible ; aucune police distante nécessaire.
- Réseau perdu après chargement : contenu chargé conservé, erreur explicite ; aucun support hors ligne au premier chargement ni reprise de partie promis.
- Libellés longs, zoom du navigateur à 200 %, clavier et mouvement réduit : contrôles accessibles, sans perte de contenu essentiel.
- Fonction métier non livrée : aucune donnée fictive présentée comme réelle, aucun bouton prétendant démarrer une partie ou ouvrir un compte fonctionnel.

## Requirements *(mandatory)*

### Functional Requirements

| Identifiant | Exigence | Vérification de recette |
|---|---|---|
| S1-FR01 | Le projet DOIT proposer une procédure commune d'installation, démarrage et vérification, préservant les éléments existants utiles. | S1-US01.1 et S1-US06.3 ; revue de non-régression |
| S1-FR02 | Les applications web et serveur DOIVENT être démarrables et vérifiables séparément. | S1-US01.1–2 |
| S1-FR03 | Les échanges du socle DOIVENT utiliser des contrats communs et rejeter les entrées invalides côté serveur. | S1-US02.1–3 |
| S1-FR04 | Les services locaux de données DOIVENT être initialisables sur environnement vide avec un état d'initialisation vérifiable et un stockage durable préservé au redémarrage normal. | S1-US01.3–4 |
| S1-FR05 | Le socle DOIT exposer des contrôles distincts de vie et de disponibilité tenant compte des dépendances requises. | S1-US03.1–3 |
| S1-FR06 | Les erreurs et événements techniques DOIVENT permettre le diagnostic sans révéler de données sensibles. | S1-US01.5 et S1-US03.4 |
| S1-FR07 | Le shell DOIT être une page de fondation responsive clairement identifiée, avec en-tête Kopaka, choix de langue et de thème et exemples des composants essentiels (bouton, champ avec label/erreur, carte, sélecteur, message d'état) et de leurs états, sans parcours de jeu. | S1-US04.1–3 et S1-US04.7 |
| S1-FR08 | Le shell DOIT afficher les états applicables et un indicateur de disponibilité issu d'un échange réel avec le serveur : chargement, puis « disponible » si le serveur est prêt, sinon « indisponible » avec message et nouvelle tentative. L'indicateur DOIT être distingué des exemples de recette et ne révéler aucun détail interne. | S1-US04.3–4 et S1-US04.8 |
| S1-FR09 | Le visiteur DOIT pouvoir choisir Français ou Malagasy, sans compte, avec préférence locale et langue du document actualisée. | S1-US05.1–3 |
| S1-FR10 | Tous les textes du shell DOIVENT provenir de dictionnaires centralisés et être disponibles dans les deux langues. | S1-US05.4–5 |
| S1-FR11 | Le shell DOIT appliquer le thème clair initial v2 et les choix de thème explicites du Design System. | S1-US04.6 ; mêmes règles de dégradation locale que S1-US05.3 |
| S1-FR12 | La chaîne qualité DOIT détecter et signaler les échecs des contrôles requis. | S1-US06.1–2 |
| S1-FR13 | La documentation DOIT permettre une prise en main autonome et décrire la configuration sans secret réel. | S1-US06.3 et S1-US01.5 |

### Non-Functional Requirements

| Identifiant | Exigence et méthode de vérification |
|---|---|
| S1-NFR01 — Responsive | Recette aux cinq largeurs de S1-US04, portrait et paysage sur mobile ; aucun défilement horizontal involontaire. Couvre les fondations de NFR-001. |
| S1-NFR02 — Accessibilité | Cibles ≥48×48 CSS px, espacement minimal 8 px, focus visible 3 px avec décalage 3 px, navigation clavier et lien d'évitement ; labels persistants, information non exclusivement colorée. Vérification manuelle et automatisée pertinente. |
| S1-NFR03 — Contraste | Texte actif ≥4,5:1 ; contrôles, icônes utiles et focus ≥3:1 contre leurs surfaces adjacentes, dans les thèmes livrés. Mesure sur les composants réels. |
| S1-NFR04 — Design System | Réutiliser les tokens et contrats existants. MASTER v2 prime explicitement sur v1 contradictoire : thème initial clair, direction turquoise/crème/vert profond, rayons carte 28 px, contrôle 16 px, dialogue 32 px si présent. Aucun redessin de marque. |
| S1-NFR05 — Localisation | 100 % des libellés du shell en FR/MG ; marge d'expansion de 40 %, noms de langues sans drapeau et relecture malagasy attestée avant recette. |
| S1-NFR06 — Sobriété | Pas d'asset distant ni de moteur 3D nécessaire ; repli typographique immédiat, absence de texte invisible pendant le chargement, mouvement réduit respecté. Mesurer le chargement du shell sur appareil mobile réel et consigner les conditions ; aucun seuil de charge concurrente du MVP n'est inventé ici. |
| S1-NFR07 — Sécurité | Aucun secret dans le dépôt livré, les ressources navigateur, réponses ou logs ; validation serveur des entrées ; configuration invalide signalée sans valeur sensible. Vérification des ressources et scénarios négatifs. |
| S1-NFR08 — Fiabilité et diagnostic | Aucune indisponibilité d'une dépendance requise ne doit produire un état prêt positif. Journaux structurés et contexte d'erreur vérifiables par S1-US03. |
| S1-NFR09 — Maintenabilité | Responsabilités web, serveur et contrats séparées ; aucune règle de jeu dans le shell ni dépendance des contrats à l'interface ou à l'orchestration serveur. Contrôle des frontières et revue. |
| S1-NFR10 — Qualité | Contrôles de conventions, types, tests et construction réussis ; tests de validation, intégration des services, santé et parcours navigateur de langue ; aucun bug critique connu introduit. |
| S1-NFR11 — Compatibilité | Vérifier le shell dans Chrome, Edge, Firefox et Safari récents disponibles pour la recette ; consigner versions et appareils, dont navigateur mobile Android et Safari iOS. Toute incompatibilité bloquant le shell interdit sa validation. |

Ces exigences décrivent les résultats attendus. Les choix de réalisation restent soumis à la stack et aux contraintes déjà fixées par la constitution et le cahier des charges ; aucune alternative technique ni architecture détaillée n'est introduite ici.

### Key Entities

- **Préférence de langue** : choix Français/Malagasy local au navigateur, modifiable sans identité ; persistance au mieux lorsque le stockage est accessible. Ne constitue pas une session invitée.
- **Préférence de thème** : clair/sombre/système, locale et facultative ; sans préférence exploitable, thème clair v2.
- **État de santé** : résultat de vie et de disponibilité, avec état des dépendances requises sans détail sensible.
- **Événement technique** : catégorie, contexte de diagnostic et horodatage, sans secret ni donnée de joueur. La durée de conservation reste À VALIDER ; aucun historique métier n'est créé.
- **État d'initialisation** : suivi technique versionné du stockage durable, indépendant des règles métier futures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **S1-SC01** : une personne autre que l'auteur réalise 100 % des étapes documentées de prise en main depuis un environnement propre, sans étape orale supplémentaire.
- **S1-SC02** : 100 % des contrôles qualité requis réussissent pour la version candidate ; un échec contrôlé rend la vérification globale négative.
- **S1-SC03** : aucun contenu essentiel ou contrôle n'est perdu sur les cinq largeurs de recette, en FR et MG, avec expansion de 40 % et zoom à 200 %.
- **S1-SC04** : 100 % des libellés du shell sont présents dans les deux langues ; changer de langue et recharger conserve le choix lorsque le stockage est disponible.
- **S1-SC05** : 100 % des contrôles interactifs du shell sont accessibles au clavier et respectent les dimensions et contrastes définis.
- **S1-SC06** : les scénarios normal, panne de chaque dépendance et rétablissement donnent tous le diagnostic attendu, sans faux état prêt.
- **S1-SC07** : aucun secret n'est trouvé dans les surfaces contrôlées ; aucune anomalie critique connue introduite ne reste ouverte à la recette.
- **S1-SC08** : aucune fonctionnalité hors périmètre n'est présentée comme opérationnelle ; la démonstration permet de constater le shell bilingue, les états d'erreur et la reproductibilité du socle.
- **S1-SC09** : l'indicateur réel de la page affiche le résultat attendu dans chacun des cas serveur prêt, serveur non prêt et serveur injoignable ; une nouvelle tentative après rétablissement affiche « disponible », sans rechargement complet de la page ni exposition de détail interne.

## Assumptions

- Le périmètre des fondations précédemment proposé est validé par le propriétaire du produit ; cela ne valide pas les règles métier encore ouvertes.
- Le contenu du dépôt doit être inspecté avant toute implémentation future. La présente spécification ne prétend pas que le socle technique existe déjà.
- Le français est le repli du shell en l'absence de préférence exploitable. Cette convention ne définit ni langue de compte ni détection géographique.
- Les services de stockage durable et temporaire locaux constituent les dépendances requises de la recette de disponibilité.
- La relecture FR/MG et les appareils nécessaires à la recette doivent être disponibles. L'effectif, la durée du sprint et la capacité d'engagement restent À VALIDER sans changer le périmètre fonctionnel.
- Les seuils de charge du MVP, la disponibilité de production et l'infrastructure de déploiement ne sont pas fixés par cette spécification de fondations locales.

### Dépendances et points À VALIDER

| Point | Statut et conséquence |
|---|---|
| Validations du Sprint 0 | À VALIDER : les cases du backlog ne prouvent pas leur réalisation. Confirmer la structure minimale du shell et les textes avant leur recette ; ne pas prétendre le Sprint 0 terminé. |
| Relecture malagasy | À VALIDER : identifier un locuteur et faire relire les libellés ; condition de recette bilingue, sans traduction supposée validée. |
| Écarts éventuels MASTER/tokens | À VALIDER si une divergence non arbitrée est constatée ; appliquer la priorité v2 explicitement documentée sans modifier les références à cette étape. |
| Durée de vie invité, politique de pseudonymes et conservation des données | À VALIDER avant les parcours d'identité ; aucun défaut métier n'est choisi ici. |
| Méthode de compte, récupération et conversion/fusion | À VALIDER avant réalisation. Clarifier FR-004 P0 (entrée inscription/connexion) et FR-013 P1 (création de compte), sans changer leurs priorités. |
| Salles privées, expiration et démarrage | À VALIDER aux sprints concernés, notamment la place du privé dans le MVP décrite différemment par les références. |
| Grâce, abandon et remplacement | À VALIDER avant les flux de reconnexion et de jeu. |
| Variantes Domino à 2/4 | À VALIDER : pièces, distribution, premier joueur, pose, pioche/passe, blocage, scores, égalités, manches, équipes éventuelles et revanche. Aucune implémentation autorisée par cette spécification. |
| XP, badges, classement et anti-farming | À VALIDER avant progression ; aucune valeur monétaire. |
| Conservation des journaux et historiques | À VALIDER avant exploitation durable ; pas de politique chiffrée inventée dans les fondations. |

Les décisions métier reportées ne bloquent pas les travaux indépendants du Sprint 1. Elles ne peuvent pas être utilisées comme exigences confirmées. Cette spécification ne crée ni plan technique ni nouvelle liste de tâches.
