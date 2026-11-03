# Feature Specification: Kopaka — Sprint 2, invité et lobby

**Feature Branch**: aucune branche créée ; branche Git existante `main` inchangée.

**Created**: 2026-11-03

**Status**: Clarification terminée le 2026-11-03 ; décisions Q1–Q6 et Q7a–Q8b intégrées. Prête pour planification, avec documents applicables et corpus initial à fournir avant livraison des traitements concernés. Aucune implémentation commencée.

**Input**: Préparer le Sprint 2 « Invité et lobby » selon le cahier des charges, la constitution et les décisions validées, en tenant compte du Sprint 1 terminé ; définir périmètre, besoins utilisateurs, User Stories et critères d'acceptation, sans implémentation ni décision métier non validée.

## Contexte et périmètre

### Objectif et besoins

Permettre à un visiteur de comprendre Kopaka, choisir sa langue, obtenir un accès invité avec un pseudonyme validé et accéder au lobby sans inscription, email ni téléphone. Le lobby distingue les modes Domino à 2 et Domino à 4 et permet de sélectionner un format. Le Sprint 2 livre un accès invité réel et un catalogue consultable ; il ne livre pas encore de partie jouable.

| Acteur | Besoin | Résultat attendu |
|---|---|---|
| Nouveau visiteur | Comprendre l'offre et entrer sans compte | Gratuité, choix de langue et entrée invitée explicites |
| Candidat invité | Choisir un nom acceptable et comprendre les engagements | Règles de pseudonyme, documents consultables et acceptation explicite |
| Invité reconnu | Retrouver son propre contexte | Même identité tant que son accès reste valide |
| Invité au lobby | Distinguer les formats | Deux modes identifiables et sélection accessible |
| Visiteur intéressé par un compte | Comprendre la disponibilité future | Entrée informative « Inscription / Connexion — Bientôt disponible », invité prioritaire |

### Références et gouvernance

- [Constitution](../../.specify/memory/constitution.md), référence principale.
- [Cahier des charges](../../CAHIER_DES_CHARGES.md), §3.1–3.2, FR-001–005, FR-010–013, FR-020–022, règles transversales et UX.
- [Décisions actées et points ouverts](../../DECISIONS_ET_POINTS_A_VALIDER.md), notamment identité, comptes et durée de session.
- [Plateforme](../001-platforme-kopaka.md), US-001–004 et questions bloquantes ; [Domino](../002-domino.md), formats 2/4 uniquement.
- [Roadmap](../../plan.md), Sprints 2 à 7 ; [backlog racine](../../tasks.md), S2-01 à S2-08.
- [Clôture du Sprint 1](../003-sprint-1-fondations/validation.md), 54/54 tâches cochées, résultats directs et confirmations du propriétaire distingués.
- [Design System MASTER v2](../../design-system/kopaka/MASTER.md), [accueil](../../design-system/kopaka/pages/landing.md) et [lobby](../../design-system/kopaka/pages/lobby.md), références d'expérience et de marque. Leurs prototypes ne valident pas de nouvelles règles métier ni des fonctions futures.

Les identifiants S2-US/S2-FR/S2-NFR/S2-SC sont locaux. Aucune priorité P0/P1 des références n'est modifiée ; l'ordre des stories décrit le parcours, sans nouvelle classification P1/P2/P3.

### Décisions du propriétaire — clarification du 2026-11-03

Les règles ci-dessous sont désormais validées pour le Sprint 2 ; le libellé « règles proposées » de Q2 est interprété dans le contexte de la demande explicite de les respecter dans cette spécification.

**Q1 — Option C, identité invitée à expiration glissante.** L'identité est conservée valide pendant 30 jours après la dernière activité valide ; chaque nouvelle activité valide prolonge cette échéance. La validité est gérée et contrôlée côté serveur. Fermeture puis réouverture du navigateur retrouvent la même identité et le même pseudonyme tant que l'accès reste valide et que sa preuve est disponible. Plusieurs onglets partagent la même identité. Après 30 jours sans activité valide, l'identité expire et ne peut plus être utilisée. Activité et déconnexion sont précisées par Q4–Q5 validées ci-dessous ; une identité expirée ne peut pas être réactivée par une activité tardive.

**Q2 — Option A, pseudonyme unique parmi les identités valides.** Le pseudonyme contient de 3 à 20 caractères, avec lettres, chiffres, espaces, tirets et underscores autorisés. Les accents sont autorisés à l'affichage. Les espaces au début/à la fin sont retirés et les espaces multiples réduits. Le résultat nettoyé est celui présenté au visiteur et validé contre les limites. La comparaison des noms est insensible à la casse et aux accents : deux identités invitées encore valides ne peuvent pas utiliser le même pseudonyme normalisé, même si l'un des propriétaires n'est pas connecté. Les noms réservés comprennent au minimum Admin, Administrator, Support, Kopaka, System et Moderator avec leurs variantes ; les équivalences de casse/accent ne permettent pas de contourner l'interdiction. Le nom redevient disponible lorsque l'identité expire ou est supprimée. La modération et l'évolution des listes sont définies par Q6 validée ci-dessous.

**Q3 — Option A, comptes au Sprint 7.** Au Sprint 2, aucune inscription ni connexion de compte fonctionnelle n'est développée. Une entrée informative « Inscription / Connexion » avec la mention « Bientôt disponible » peut être présentée ; elle ne simule pas un formulaire opérationnel. L'accès invité reste clairement visible et prioritaire. Aucun changement de roadmap n'anticipe comptes, récupération ou conversion.

**Q4 — Activité valide, interaction réelle.** Sont concernées les véritables interactions utilisateur : rejoindre le lobby, créer/rejoindre une partie, effectuer une action de partie, envoyer un message dans un espace de discussion autorisé, ou une autre interaction significative. Les actualisations automatiques, requêtes en arrière-plan et pages ouvertes sans interaction ne prolongent jamais la validité. Seule une interaction effectivement valide et acceptée par le service peut prolonger une identité encore valide. Au Sprint 2, l'entrée volontaire au lobby est le cas explicitement applicable ; les autres interactions significatives devront être nommées dans la recette du parcours concerné. Les exemples de partie/discussion ne livrent ni jeu, ni salle, ni chat au Sprint 2.

**Q5 — Fermeture et déconnexion distinctes.** Fermer le navigateur conserve l'identité et son pseudonyme tant que la validité glissante n'est pas dépassée. Une déconnexion volontaire confirmée invalide la session, supprime l'identité invitée et libère le pseudonyme. Aucun onglet ne peut ensuite agir avec cette identité supprimée ; un nom réattribué ne restaure pas l'ancien contexte. La suppression d'identité n'est pas différée jusqu'à l'expiration de 30 jours. La conservation annexe est distincte et suit Q7b : aucune archive personnelle d'acceptation après suppression, journaux techniques sans identité/pseudonyme/jeton pendant 7 jours maximum, sauvegardes pendant 30 jours maximum ; toute restauration préserve les suppressions.

**Q6 — Modération configurable et évolutive.** Sont interdits les insultes/propos vulgaires, contenus racistes/discriminatoires/haineux, termes sexuels explicites, menaces et usurpations de l'équipe Kopaka ou des administrateurs. Les noms réservés comprennent au minimum Admin, Administrator, Support, Kopaka, System et Moderator, avec leurs variantes ; cette liste initiale n'est pas exhaustive. Une liste de mots interdits configurable et extensible est prévue, avec transformations Q8a et correspondance entière Q8b pour détecter les contournements. Son contenu et les noms réservés doivent pouvoir évoluer sans modifier le code métier, sans pour autant créer un écran d'administration ou un chat au Sprint 2. Le corpus initial FR/MG et ses contre-exemples doivent être fournis et approuvés avant livraison ; aucun mot supplémentaire n'est inventé.

**Cohérence avec les références.** Aucune contradiction avec la constitution : identité sécurisée, pseudonyme distinct d'une preuve d'identité, compte facultatif et validation de confiance sont préservés. FR-004 et US-003 plateforme décrivent l'objectif de compte du produit final ; l'entrée informative ne vaut pas satisfaction du parcours complet de création de compte. Q3 arbitre explicitement sa tranche Sprint 2, conformément au Sprint 7, sans modifier les priorités FR-004 P0 / FR-013 P1. La déconnexion invitée n'est pas une reconnexion de partie ni une politique d'abandon. FR-012 reste applicable : interdire les noms réservés ne remplace pas le filtrage des noms inappropriés.

### Acquis du Sprint 1 à préserver

Le socle de qualité et de diagnostic, les composants accessibles, le responsive, les préférences locales FR/MG et clair/sombre/système et les textes centralisés sont livrés et réutilisables. Le Sprint 2 ne réinitialise pas ces fondations. Une préférence locale n'est jamais une identité invitée.

Le Sprint 1 ne fournit pas déjà de session invitée, inscription, lobby métier, présence de joueurs ou jeu jouable. Sa clôture ne tranche pas les politiques d'identité, de conservation ou les règles Domino encore ouvertes. Les anciens marqueurs du backlog racine ne remplacent pas le rapport détaillé de clôture.

### Inclus

- Accueil produit expliquant la gratuité, l'accès invité et le choix de langue, dans la continuité du Design System.
- Entrée invitée : pseudonyme, consultation des conditions d'utilisation et de la politique de confidentialité, acceptation explicite avant création de l'accès.
- Identité invitée unique, distincte du pseudonyme, et reconnaissance sécurisée de son accès.
- Validation/réservation selon Q2 ; filtrage des catégories de contenus interdites et des noms réservés selon Q6, avec listes configurables/extensibles et détection des variantes sans changement de code métier.
- Identité valide 30 jours après une interaction utilisateur valide, réouverture et onglets partagés ; absence de prolongation automatique ; déconnexion volontaire invalidant la session, supprimant l'identité et libérant son nom selon Q4–Q5.
- Lobby présentant le contexte invité et les deux modes Domino 2/4 consultables et sélectionnables.
- Entrée compte facultative et informative avec « Bientôt disponible » ; aucune inscription/connexion de compte fonctionnelle et accès invité prioritaire.
- Chargement, refus, erreur, vide, perte réseau ; parcours FR/MG, accessibilité, protection des identités et recette de non-régression.

### Hors périmètre et limites

| Domaine | Limite du Sprint 2 |
|---|---|
| Salles et présence | Pas de création/admission/départ, sièges, invitations, salle publique/privée ou compteur de joueurs ; Sprint 3 et arbitrages associés |
| Matchmaking et reconnexion de partie | Pas de recherche, file, annulation, restauration de partie ni délai de grâce ; Sprint 4 |
| Jeu Domino | Pas de distribution, pose, pioche, passe, équipes, horloge, score, résultat ou moteur ; règles à valider avant Sprints 5–6 |
| Comptes durables | Inscription/connexion fonctionnelles, récupération et conversion/fusion au Sprint 7 ; aucune anticipation au Sprint 2, conformément à Q3 validée |
| Communauté et progression | Pas d'amis, statistiques durables d'invité, classement, XP/badges, avatar personnalisable, chat ou administration supplémentaire |
| Autres jeux et argent | Aucun jeu futur anticipé ni dépôt, retrait, mise, portefeuille ou récompense monétaire |

Les modes sont consultables/sélectionnables, sans être présentés comme des parties déjà jouables. Un mode du catalogue ne représente ni salle ouverte ni partie disponible. Aucun compteur, adversaire, salle ou résultat fictif n'est présenté comme réel. Une disponibilité technique ne prouve pas la présence de joueurs.

FR-022 reste une obligation produit : les règles essentielles approuvées devront être accessibles avant tout futur démarrage de partie. Au Sprint 2, seuls les faits validés (Domino, 2 ou 4 participants) peuvent être présentés ; aucune variante ni règle détaillée non validée n'est inventée.

## Clarifications

### Session 2026-11-03

- Q: Après 30 jours sans activité valide, faut-il supprimer l'identité invitée du stockage courant dès son expiration ? (Q7a) → A: Option A : supprimer l'identité du stockage courant dès son expiration, sans conservation de 7 ou 30 jours d'une identité expirée. Le pseudonyme est libéré ; cette réponse ne fixe pas la conservation des journaux, informations d'acceptation ou sauvegardes.
- Q: Quelle conservation souhaites-tu pour les informations d'acceptation des conditions, les journaux techniques et les sauvegardes après suppression d'une identité invitée ? (Q7b) → A: Option A : aucune archive personnelle d'acceptation après suppression ; journaux techniques sans identité, pseudonyme ni jeton conservés 7 jours maximum ; sauvegardes conservées 30 jours maximum. Une restauration préserve les suppressions déjà effectuées.
- Q: Quels contournements faut-il détecter automatiquement dans les pseudonymes interdits ou réservés ? (Q8a) → A: Option A : casse, accents, espaces/tirets/underscores insérés et substitutions ciblées 0→o, 1→i, 3→e, 4→a, 5→s, 7→t. Le cas Ad_m1n est une variante à refuser d'Admin ; aucun élargissement implicite aux ressemblances entre alphabets.
- Q: Faut-il refuser un pseudonyme seulement lorsqu'il correspond entièrement à un terme interdit après normalisation, ou aussi lorsqu'il contient ce terme ? (Q8b) → A: Option A : correspondance entière uniquement pour toutes les entrées interdites ou réservées. Aucune détection par sous-chaîne, globale ou configurable par entrée, n'est adoptée. Supporter n'est pas refusé pour la seule présence de Support ; les autres contrôles restent applicables.

Quatre questions posées et quatre réponses acceptées dans cette session. Revue finale : aucun marqueur de clarification restant ; checklist de qualité 13/16 → 16/16, trois critères nouvellement satisfaits et aucune régression. Seuls les marqueurs des trois cases concernées ont été modifiés dans la checklist ; ses notes de revue antérieure sont conservées conformément au workflow et décrivent l'état avant cette session, non le statut final.

## User Scenarios & Testing *(mandatory)*

Les tests indépendants sont des recettes ciblées. Les décisions Q1–Q6 et Q7a–Q8b sont acquises ; aucune question métier bloquante ne reste ouverte dans cette session. Documents applicables, corpus de filtrage validé et nouvelles traductions restent des dépendances de livraison, sans validation implicite de leur contenu.

### S2-US01 — Comprendre l'accueil et choisir sa langue (Priorité MVP : P0)

En tant que visiteur, je veux comprendre Kopaka et choisir ma langue afin d'entrer en invité sans devoir créer de compte.

**Why this priority**: FR-001–004 et US-001 plateforme ; point d'entrée du parcours.

**Independent Test**: ouvrir l'accueil sans identité, vérifier l'offre, l'action d'entrée et FR/MG, même lorsque le service d'identité ne répond pas.

**Acceptance Scenarios**:

1. **Given** une première visite sans préférence exploitable, **When** l'accueil s'affiche, **Then** les textes sont français, la gratuité et l'absence d'inscription obligatoire sont explicites, et le thème initial respecte le Sprint 1.
2. **Given** l'accueil, **When** le visiteur choisit Malagasy, **Then** tous ses textes, noms accessibles et messages sont en malagasy et la langue du document suit le choix.
3. **Given** une préférence reconnue, **When** le visiteur recharge et poursuit, **Then** langue et thème sont conservés si le stockage est accessible ; un stockage refusé ne bloque pas leur modification pendant la visite.
4. **Given** un visiteur sans identité, **When** il choisit l'entrée invitée, **Then** il accède au pseudonyme et aux documents à accepter sans création d'identité par la seule ouverture de l'étape.
5. **Given** l'accueil chargé et un service indisponible, **When** le visiteur le consulte, **Then** contenu et préférences restent utilisables sans annoncer une entrée réussie.

### S2-US02 — Choisir un pseudonyme et accepter les documents (Priorité MVP : P0)

En tant que candidat invité, je veux connaître les règles de pseudonyme et les documents à accepter afin de corriger ma saisie avant de demander l'accès.

**Why this priority**: FR-011–012, cahier §3.1.4 et S2-02. Q2 et Q6 fixent règles et catégories de modération ; Q8 précise le corpus et les variantes de recette. Documents applicables à fournir et valider.

**Independent Test**: vérifier 2/3/20/21 caractères après nettoyage, caractères permis/interdits, équivalences casse/accent, réservations valides même hors connexion, libération après expiration/suppression, puis consultation/acceptation des documents et refus sans identité créée.

**Acceptance Scenarios**:

1. **Given** le formulaire, **When** il s'affiche, **Then** le label et l'aide indiquent 3 à 20 caractères et les catégories autorisées : lettres avec accents, chiffres, espaces, tirets et underscores.
2. **Given** une saisie vide, hors limites, inappropriée ou réservée selon cette politique, **When** l'accès est demandé, **Then** une erreur compréhensible est reliée au champ et aucune identité/réservation ne reste créée par ce refus.
3. **Given** un nom admissible sans acceptation des documents, **When** l'entrée est demandée, **Then** l'accès n'est pas accordé ; une case précochée ou la seule navigation ne vaut pas acceptation.
4. **Given** le formulaire, **When** le visiteur consulte les documents applicables puis revient, **Then** ils sont lisibles et sa saisie n'est pas perdue.
5. **Given** deux demandes concurrentes de noms équivalents, **When** elles sont traitées, **Then** au plus une identité invitée valide obtient ce nom normalisé ; aucun double succès n'est annoncé.
6. **Given** un refus ou un changement de langue, **When** le visiteur corrige sa saisie, **Then** les données non concernées sont conservées et les messages suivent sa langue.
7. **Given** «  Élo   Rana  », **When** le pseudonyme est validé, **Then** sa présentation est « Élo Rana » et une autre identité valide utilisant « elo rana » empêche son attribution ; aucun accent n'est retiré du nom affiché au titre de la seule comparaison.
8. **Given** une saisie nettoyée de 2, 3, 20 ou 21 caractères autorisés, **When** elle est validée, **Then** 2 et 21 sont refusés et 3 et 20 sont acceptables sous réserve d'absence de collision, réservation ou caractère inapproprié.
9. **Given** Admin, Administrator, Support, Kopaka, System ou Moderator, ou une variante interdite selon la politique validée, **When** le nom est demandé, **Then** la demande est refusée comme nom réservé ; casse/accent ne contournent pas le contrôle.
10. **Given** une identité valide dont le propriétaire n'est pas actuellement connecté, **When** une autre identité demande son nom normalisé, **Then** il reste indisponible jusqu'à expiration ou suppression de l'identité détentrice.
11. **Given** une identité expirée ou supprimée, **When** son ancien nom est demandé, **Then** cette ancienne réservation n'empêche plus son attribution à une nouvelle identité ; aucune donnée ni preuve d'accès de l'ancienne n'est transmise à la nouvelle.
12. **Given** des exemples validés des catégories interdites en FR/MG, **When** ces pseudonymes ou leurs variantes reconnues sont demandés, **Then** ils sont refusés sans création d'identité, y compris en dehors de l'interface normale ; les contre-exemples autorisés du corpus ne sont pas refusés à tort.
13. **Given** une nouvelle entrée approuvée de la liste de mots interdits ou des noms réservés, **When** la configuration est mise à jour, **Then** une nouvelle demande correspondante est refusée sans modification du code métier ; le maintien des autres règles de pseudonyme est vérifié. Aucun effet rétroactif sur les identités existantes n'est supposé sans décision associée.
14. **Given** un terme interdit/réservé et une variante correspondant à casse, accents, espaces/tirets/underscores insérés ou aux substitutions 0→o, 1→i, 3→e, 4→a, 5→s, 7→t, **When** le pseudonyme est contrôlé, **Then** le refus pour cette entrée exige l'égalité des formes normalisées entières ; Ad_m1n est refusé comme variante d'Admin, sans recherche de sous-chaîne.
15. **Given** un pseudonyme admissible non interdit, **When** le contrôle utilise sa forme normalisée de filtrage, **Then** cette forme ne remplace pas l'affichage accentué nettoyé ni la règle d'unicité de Q2 ; aucune substitution supplémentaire ou assimilation entre alphabets n'est ajoutée implicitement.
16. **Given** Support dans les noms réservés, **When** Supporter est demandé, **Then** la seule présence de Support ne provoque pas le refus ; les autres contrôles de longueur, caractères, unicité et correspondance entière à une autre entrée restent applicables. Ajouter une entrée ne permet pas d'activer un mode sous-chaîne pour elle.

### S2-US03 — Entrer réellement en invité (Priorité MVP : P0)

En tant que visiteur, je veux obtenir un accès invité et rejoindre le lobby afin de consulter les modes sans inscription.

**Why this priority**: FR-003, FR-010–012 et US-002 plateforme ; cœur du sprint sur Q1–Q6 validées, documents applicables et corpus de modération à fournir.

**Independent Test**: réaliser une entrée réelle admissible puis accéder au lobby ; vérifier qu'un visiteur indépendant n'obtient pas cette identité en connaissant simplement son nom.

**Acceptance Scenarios**:

1. **Given** un candidat admissible sans accès valide, **When** il confirme l'entrée et que le service la valide, **Then** une identité dotée de son propre identifiant unique et un accès sécurisé sont établis ; son pseudonyme apparaît au lobby sans email, téléphone ni mot de passe demandés.
2. **Given** un envoi en cours, **When** le visiteur attend ou répète l'action, **Then** l'attente est visible, la même tentative ne produit pas plusieurs identités et aucun succès ne précède sa confirmation.
3. **Given** une erreur ou coupure avant confirmation, **When** le résultat échoue ou demeure inconnu, **Then** un message et un réessai sont proposés, sans considérer le nom comme preuve d'entrée réussie.
4. **Given** une réponse perdue après création, **When** la même tentative est reprise, **Then** elle retrouve un résultat cohérent sans double identité ni réservation contradictoire due au réessai.
5. **Given** un autre visiteur connaissant le nom, **When** il tente de récupérer cet accès, **Then** ce nom ne suffit pas et le contexte de l'autre invité ne lui est pas accordé.

### S2-US04 — Retrouver son identité et se déconnecter (Priorité MVP : P0)

En tant qu'invité, je veux retrouver mon identité dans les 30 jours suivant mon activité valide et pouvoir me déconnecter volontairement, sans confondre identité expirée, panne et nouvel accès.

**Why this priority**: session sécurisée et identité distincte du nom, cahier §5 ; Q1/Q4/Q5 fixent durée glissante, retour navigateur, onglets, activité et suppression à la déconnexion.

**Independent Test**: vérifier une dernière activité connue, une nouvelle activité valide avant échéance et l'expiration à 30 jours sans activité ; fermer/réouvrir, utiliser deux onglets et se déconnecter, puis contrôler les accès sans récupération par simple pseudonyme.

**Acceptance Scenarios**:

1. **Given** un contexte dont l'accès reste reconnu valide, **When** l'invité recharge ou revient au lobby, **Then** la même identité et son nom sont retrouvés sans nouvelle identité créée par ce seul rechargement.
2. **Given** un accès absent, altéré ou expiré, **When** le visiteur demande le contexte invité, **Then** ce contexte n'est pas présenté comme reconnu et une entrée explicite est proposée avec un message adapté.
3. **Given** un accès devenu invalide pendant la visite, **When** une action exige sa reconnaissance, **Then** elle n'est pas confirmée au nom de l'ancien invité et la situation est expliquée sans récupération fondée sur son nom.
4. **Given** un accès valide avant une panne, **When** sa vérification devient impossible, **Then** un état indéterminé/indisponible est distingué d'une expiration prouvée ; la panne seule ne déclenche pas de suppression ou de nouvelle identité automatique.
5. **Given** un autre appareil dépourvu de preuve d'accès, **When** le même nom y est saisi, **Then** aucune récupération multiappareil ou fusion n'est promise sans mécanisme validé.
6. **Given** une identité valide et sa preuve d'accès disponible, **When** le navigateur est fermé puis rouvert avant expiration, **Then** la même identité et le même pseudonyme sont retrouvés sans création d'un nouvel invité.
7. **Given** deux onglets du même contexte navigateur, **When** ils accèdent au lobby avec l'accès valide partagé, **Then** ils représentent la même identité invitée et le même pseudonyme, sans création d'une identité par onglet.
8. **Given** une dernière activité valide à l'instant T, **When** aucune autre activité valide n'intervient, **Then** l'identité est encore valide avant T + 30 jours ; à cette échéance, elle expire, est supprimée du stockage courant et son pseudonyme est libéré, selon l'heure de référence du serveur ; aucune conservation supplémentaire de l'identité expirée n'est prévue et une horloge de navigateur différente ne prolonge pas l'accès.
9. **Given** une identité encore valide avec une échéance E, **When** une nouvelle activité valide est acceptée à T avant E, **Then** sa nouvelle échéance devient T + 30 jours ; une activité après expiration ne ressuscite pas l'ancienne identité.
10. **Given** un invité reconnu, **When** sa déconnexion volontaire est confirmée, **Then** la session est invalidée, l'identité supprimée et son pseudonyme libéré ; aucun onglet ne peut poursuivre avec cette identité et la simple saisie du même nom ne restaure pas son ancien contexte.
11. **Given** une échéance connue et une page laissée ouverte, **When** seules des actualisations automatiques ou requêtes d'arrière-plan surviennent, **Then** l'échéance reste inchangée et l'identité expire au terme initial si aucune véritable interaction valide n'intervient.
12. **Given** une identité valide avant son échéance, **When** l'invité rejoint volontairement le lobby et que l'interaction est acceptée, **Then** l'échéance devient l'instant de cette activité valide + 30 jours ; une tentative refusée ne suffit pas.
13. **Given** une identité supprimée par expiration ou déconnexion, **When** les données courantes sont examinées, **Then** aucune archive personnelle de son acceptation des conditions n'est conservée après cette suppression.
14. **Given** des journaux techniques et des sauvegardes du Sprint 2, **When** leur conservation est vérifiée, **Then** les journaux ne contiennent ni identité invitée, pseudonyme ou jeton et ne dépassent pas 7 jours ; les sauvegardes ne dépassent pas 30 jours.
15. **Given** une sauvegarde contenant une identité supprimée depuis sa création, **When** elle est restaurée, **Then** la suppression est préservée : aucune identité ou archive personnelle d'acceptation supprimée n'est réintroduite dans les données courantes, aucun accès n'est réactivé et l'ancienne réservation ne réapparaît pas.

### S2-US05 — Consulter le lobby et distinguer Domino 2/4 (Priorité MVP : P0)

En tant qu'invité reconnu, je veux consulter les modes et choisir un format afin de comprendre les possibilités et leur disponibilité réelle.

**Why this priority**: FR-005, FR-020–022, S2-06–07 et tranche Sprint 2 d'US-004 plateforme. Transmission à une salle ou recherche dans les sprints suivants.

**Independent Test**: avec un accès valide, consulter le catalogue, sélectionner chaque format, puis vérifier vide et erreur sans démarrer de partie.

**Acceptance Scenarios**:

1. **Given** un invité reconnu et le catalogue normal, **When** il ouvre le lobby, **Then** il voit son statut invité et deux formats distincts « Domino à 2 » et « Domino à 4 » avec leurs nombres de participants exacts.
2. **Given** les deux choix, **When** il sélectionne l'un puis l'autre, **Then** le mode courant possède un libellé et un état de sélection accessibles, sans ambiguïté 2/4.
3. **Given** un mode sélectionné, **When** sa présentation est consultée, **Then** seuls les faits validés sont affichés et les étapes non livrées sont explicites ; aucune salle, recherche ou partie n'est créée.
4. **Given** un catalogue en chargement, vide ou indisponible, **When** le lobby l'affiche, **Then** cet état est explicite, un échec permet un réessai et aucun contenu fictif ne remplace les données réelles.
5. **Given** un catalogue chargé puis une coupure, **When** ses informations conservées sont consultées, **Then** elles restent lisibles avec un état de connexion explicite ; aucune action nécessitant le service n'est annoncée réussie.
6. **Given** une fonction future (salle, recherche, règle non validée, classement ou progression), **When** le lobby est parcouru, **Then** elle n'est pas présentée comme un parcours opérationnel, compteur ou résultat livré.

### S2-US06 — Comprendre que les comptes seront disponibles ultérieurement (Priorité MVP : P0 pour l'entrée)

En tant que visiteur intéressé par un compte, je veux comprendre que cette fonction arrive ultérieurement et pouvoir poursuivre en invité, sans rencontrer un faux parcours d'inscription.

**Why this priority**: FR-004 reste P0, FR-013 P1. Q3 valide une entrée uniquement informative au Sprint 2 ; les comptes complets restent au Sprint 7.

**Independent Test**: examiner l'accueil et son éventuelle entrée compte, vérifier la mention « Bientôt disponible », l'absence de formulaire/connexion fonctionnelle et la priorité de l'accès invité ; revenir au lobby sans perdre un accès valide.

**Acceptance Scenarios**:

1. **Given** l'accueil, **When** les choix sont examinés, **Then** l'accès invité reste clairement visible et prioritaire, sans inscription ou connexion de compte obligatoire.
2. **Given** une entrée « Inscription / Connexion » présentée au Sprint 2, **When** le visiteur la consulte, **Then** la mention « Bientôt disponible » est explicite ; aucun formulaire ni mécanisme d'inscription/connexion de compte fonctionnel n'est proposé. Si un contrôle est activable, il ne fait qu'expliquer cette disponibilité future.
3. **Given** un invité qui consulte puis quitte cette alternative, **When** il revient au lobby, **Then** son accès encore valide et ses préférences sont conservés ; un échec de compte ne détruit pas son identité invitée.
4. **Given** une conversion, récupération ou fusion non validée, **When** l'alternative est présentée, **Then** aucune garantie de récupération, progression conservée ou rattachement entre appareils n'est annoncée.

### Edge Cases

- Pseudonyme après nettoyage : 2/3/20/21 caractères, espaces seuls, caractères hors catégories autorisées, noms équivalents de casse/accent et noms réservés ; appliquer Q2, sans ajouter de restriction métier non validée.
- Noms réservés/inappropriés, collision et réservations simultanées : aucun résultat contraire à la politique ; un refus ne bloque pas durablement un nom sans règle validée.
- Double activation, réponse perdue et réessai : même tentative cohérente, sans multiplication d'identités.
- Accès altéré, expiré ou preuve perdue : aucun nom ou choix local ne remplace la preuve d'accès.
- Plusieurs onglets partagent la même identité ; fermeture/réouverture avant échéance la retrouve si sa preuve est disponible. Déconnexion volontaire : session invalidée, identité supprimée et nom libéré ; l'autre onglet ne peut continuer au nom de l'identité supprimée.
- Page ouverte, actualisations automatiques, contrôle de disponibilité et requêtes en arrière-plan : aucune prolongation des 30 jours sans interaction utilisateur valide.
- Mise à jour d'une liste de modération : demandes nouvelles évaluées avec la liste configurée ; aucune suppression/sanction rétroactive d'identités existantes inventée.
- Un nom contient un terme interdit/réservé sans lui être égal après normalisation : pas de refus fondé sur cette seule sous-chaîne. La couverture de nouvelles formes complètes relève du contenu approuvé des listes, pas d'un élargissement implicite de la règle.
- Restauration d'une sauvegarde antérieure à une suppression : conserver les effets de suppression, sans réactivation d'identité/accès ni reprise du pseudonyme déjà libéré ; ne pas recréer d'archive personnelle d'acceptation supprimée.
- Une ancienne identité expirée et une nouvelle utilisant le même pseudonyme restent distinctes ; aucune donnée ni preuve d'accès n'est héritée par la seule réutilisation du nom.
- Panne contre expiration : états distincts, sans création, réservation ou suppression déduite d'un échec réseau seul.
- Documents absents, inaccessibles ou non validés : entrée non déclarée prête à livrer ; aucun contenu légal provisoire présenté comme approuvé.
- Langue/thème modifiés pendant la saisie, préférence corrompue ou stockage refusé : parcours utilisable, saisie conservée pendant la visite ; préférence, acceptation et identité restent distinctes.
- Accès direct au contexte invité sans reconnaissance valide : entrée explicite, aucun contexte d'une autre identité affiché.
- Catalogue vide, mode inconnu/indisponible : état clair et aucun remplacement silencieux du format choisi.
- Écran étroit, noms longs, zoom, clavier et lecteur d'écran : contenu/actions essentiels utilisables, information non exclusivement colorée.

## Requirements *(mandatory)*

### Functional Requirements

| ID | Exigence testable | Recette / origine |
|---|---|---|
| S2-FR01 | L'accueil DOIT expliquer la gratuité et proposer l'entrée invitée sans inscription obligatoire. | US01.1, .4 ; FR-001/003 |
| S2-FR02 | Tout le parcours DOIT proposer FR/MG et préserver les préférences langue/thème du Sprint 1 sans compte. | US01.1–3, US02.6 ; FR-002 |
| S2-FR03 | L'entrée DOIT demander pseudonyme et acceptation explicite des documents applicables, sans nom civil, email, téléphone ni mot de passe. | US02.3–4, US03.1 ; cahier §3.1.4 |
| S2-FR04 | Le service de confiance DOIT nettoyer les espaces, vérifier 3–20 caractères/catégories autorisées et appliquer les listes réservées/interdites, même hors de l'interface. Filtrage configurable/extensible prenant en compte casse, accents, espaces/tirets/underscores insérés et substitutions 0→o, 1→i, 3→e, 4→a, 5→s, 7→t ; égalité entière des formes normalisées uniquement pour chaque entrée, aucune sous-chaîne ; affichage et unicité Q2 préservés. | US02.1–2, .7–9, .12–16 ; FR-011/012 ; Q2/Q6/Q8a–b |
| S2-FR05 | Un pseudonyme comparé sans casse ni accents DOIT être unique parmi les identités invitées valides, propriétaires connectés ou non ; concurrence sans double attribution, libération à expiration/suppression, aucun contexte privé transmis lors de réattribution. | US02.5, .7, .10–11 ; S2-02 ; Q1–Q2 validées |
| S2-FR06 | L'entrée réussie DOIT attribuer un identifiant unique et un accès sécurisé à l'identité invitée ; le pseudonyme seul NE DOIT PAS permettre de récupérer l'accès ou d'agir en son nom. | US03.1, .5, US04.5 ; FR-010 |
| S2-FR07 | Une tentative non confirmée NE DOIT PAS être présentée comme réussie ; répétition/réessai d'une même tentative DOIVENT être cohérents sans double identité. | US03.2–4 |
| S2-FR08 | L'identité DOIT rester valide 30 jours après sa dernière véritable interaction utilisateur valide acceptée côté serveur ; activité valide avant échéance repousse celle-ci à activité + 30 jours ; actualisation automatique, requête d'arrière-plan et page ouverte sans interaction NE DOIVENT PAS prolonger l'accès ; à l'expiration, identité supprimée du stockage courant et pseudonyme libéré, sans conservation supplémentaire ni réactivation de l'identité expirée. | US04.1–3, .8–9, .11–12 ; Q1/Q4/Q7a |
| S2-FR09 | Une impossibilité de vérification DOIT être distinguée d'une expiration et NE DOIT PAS seule entraîner suppression ou création d'identité. | US04.4 |
| S2-FR10 | Fermeture/réouverture avant expiration DOIT retrouver la même identité si sa preuve est disponible ; les onglets du même contexte DOIVENT partager l'identité ; déconnexion volontaire confirmée DOIT invalider la session, supprimer l'identité et libérer son nom, sans permettre aux autres onglets de continuer avec cet accès ; aucune promesse multiappareil ou conversion. | US04.2–10 ; Q1/Q5 |
| S2-FR11 | Le lobby DOIT présenter le contexte invité reconnu et le catalogue sans accès au contexte privé d'une autre identité. | US03.5, US05.1 |
| S2-FR12 | Le catalogue normal DOIT proposer Domino à 2 et Domino à 4, avec sélection accessible et nombre de participants exact. | US05.1–2 ; FR-020/021 |
| S2-FR13 | Consultation/sélection DOIVENT être distinguées des fonctions non livrées ; aucune salle, présence, recherche ou partie fictive présentée comme réelle. | US05.3, .6 ; limites Sprints 3–6 |
| S2-FR14 | Les règles présentées DOIVENT se limiter aux faits validés ; les règles essentielles approuvées devront être accessibles avant tout futur démarrage effectif. | US05.3 ; FR-022 |
| S2-FR15 | Chargement, vide, refus, erreur et coupure DOIVENT être compréhensibles ; un réessai ne doit pas exiger de ressaisir les données non concernées. | US01.5, US02.6, US03.3, US05.4–5 |
| S2-FR16 | Le Sprint 2 NE DOIT PAS développer d'inscription/connexion de compte fonctionnelle ; une entrée compte éventuellement présentée DOIT porter « Bientôt disponible », avec accès invité visible et prioritaire ; roadmap comptes Sprint 7 inchangée. | US06.1–2 ; Q3 validée ; FR-004 P0, FR-013 P1 |
| S2-FR17 | Consulter/quitter l'alternative compte ou son échec NE DOIT PAS détruire un accès invité valide ni promettre une conversion non validée. | US06.3–4 ; US-003 plateforme |
| S2-FR18 | Seules les informations nécessaires DOIVENT être collectées ; preuves d'accès/données privées non exposées aux autres visiteurs ou diagnostics. Après suppression, aucune archive personnelle d'acceptation ; journaux techniques sans identité/pseudonyme/jeton pendant 7 jours maximum, sauvegardes pendant 30 jours maximum ; restauration préservant suppressions, accès invalidés et pseudonymes libérés. | US03.5, US04.10, .13–15 ; constitution ; Q7b |
| S2-FR19 | Les tentatives abusives d'entrée/pseudonyme DOIVENT être refusées sans exposition privée, corruption des identités ou réservations sans borne ; paramètres de protection testés en planification, sans sanctions métier inventées. | US02–04 ; constitution |
| S2-FR20 | Parcours d'identité/catalogue, refus et non-régressions DOIVENT être vérifiés ; décisions et preuves consignées en distinguant confirmation du propriétaire et résultat directement observé. | S2-08 ; qualité héritée |

### Non-Functional Requirements

| ID | Résultat et vérification |
|---|---|
| S2-NFR01 — Responsive | Accueil, saisie et lobby utilisables à 320/375/768/1024/1440, portrait/paysage et zoom navigateur 200 %, sans défilement horizontal involontaire ni action essentielle perdue. |
| S2-NFR02 — Accessibilité | Cibles ≥48×48, écart ≥8, focus visible 3 avec décalage 3 ; labels persistants, erreurs reliées, clavier, lecteur d'écran et retours d'état sans vol de focus. Recette automatique et manuelle héritée. |
| S2-NFR03 — Lisibilité | Texte actif ≥4,5:1 ; contrôle/focus/icône utile ≥3:1. Clair/sombre et mouvement réduit conservés ; information non exclusivement colorée. |
| S2-NFR04 — Localisation | 100 % des textes, aides, informations applicables et erreurs nécessaires en FR/MG ; langues sans drapeau, textes +40 % sans perte et nouveaux textes relus. La relecture Sprint 1 ne valide pas les nouveaux textes. |
| S2-NFR05 — Fiabilité | Aucun succès avant confirmation ni substitution silencieuse d'identité/format ; panne et expiration distinguées, réessai/concurrence vérifiés. |
| S2-NFR06 — Confidentialité | Reconnaissance protégée, contrôle contre usurpation/accès croisés, collecte minimale ; après suppression aucune archive personnelle d'acceptation ; journaux techniques sans identité/pseudonyme/jeton au plus 7 jours, sauvegardes au plus 30 jours et suppressions préservées à la restauration. |
| S2-NFR07 — Sobriété/réseau | Informations chargées lisibles après coupure ; aucune promesse de premier chargement ou jeu hors ligne. Mesurer sur appareil/réseau documentés, sans seuil de temps ou charge arbitraire. |
| S2-NFR08 — Continuité | Marque, composants et préférences Sprint 1 réutilisés ; qualité et diagnostic préservés. Navigation détaillée et devenir de la démonstration à concevoir sans perte de couverture de recette. |

### Key Entities *(include if feature involves data)*

- **Visiteur** : personne sans accès invité reconnu ; aucun compte ou contact requis pour commencer.
- **Identité invitée** : identifiant distinct du nom, dernière interaction utilisateur valide et échéance glissante de 30 jours côté serveur ; suppression du stockage courant dès expiration ou lors de la déconnexion volontaire, avec libération du pseudonyme. Conservation annexe selon Q7b validée, sans réintroduction lors d'une restauration.
- **Accès invité / session** : preuve de reconnaissance permettant retour navigateur et partage entre onglets ; invalidée à la déconnexion volontaire avec suppression d'identité et libération du nom, sans récupération par le seul nom.
- **Pseudonyme et réservation** : forme affichée nettoyée de 3–20 caractères autorisés avec accents, comparaison sans casse/accent ; exclusivité parmi identités valides même hors connexion et libération à expiration/suppression ; catégories interdites et noms réservés selon Q6.
- **Politique de modération des pseudonymes** : catégories interdites, noms réservés et liste configurable/extensible ; filtrage tenant compte de casse, accents, espaces/tirets/underscores insérés et substitutions 0→o, 1→i, 3→e, 4→a, 5→s, 7→t, avec égalité entière des formes normalisées pour toutes les entrées et sans recherche de sous-chaîne. Présentation/unicité Q2 inchangées ; évolution du contenu sans changement de code métier, sans chat ou outil de sanctions supplémentaire au Sprint 2.
- **Documents et acceptation** : conditions/politique applicables et acceptation liée à l'entrée ; textes et versions à fournir/valider avant livraison, aucune archive personnelle d'acceptation conservée après suppression de l'identité. Cette règle ne supprime pas les documents publics eux-mêmes.
- **Mode du catalogue** : Domino à 2 ou à 4, état réel de consultation/disponibilité ; ni salle ni partie existante.
- **Choix du visiteur** : langue/thème hérités et mode courant identifiable ; aucune nouvelle promesse de persistance du mode ajoutée.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **S2-SC01** : 100 % des scénarios d'entrée admissibles atteignent le lobby avec pseudonyme, sans compte, email, téléphone ni mot de passe.
- **S2-SC02** : 100 % des cas de pseudonyme/accès respectent 3–20 caractères, nettoyage, comparaison sans casse/accent, catégories/noms interdits, réservation des identités valides même hors connexion et échéance glissante ; zéro double nom normalisé valide, prolongation purement automatique ou accès par le seul nom d'autrui. La déconnexion invalide l'accès, supprime l'identité et libère le nom dans tous les cas de recette.
- **S2-SC03** : 100 % des scénarios de répétition/réessai d'une même tentative terminent sans double identité, réservation contradictoire ni faux succès ; une panne de vérification ne vaut pas expiration certaine.
- **S2-SC04** : exactement deux formats confirmés, 2 et 4 participants, consultables et sélectionnables sans ambiguïté ni démarrage d'une fonction hors sprint.
- **S2-SC05** : 100 % des textes/états nécessaires présents et relus dans les deux langues ; cinq largeurs, deux thèmes, expansion +40 % et zoom 200 % sans perte d'action essentielle.
- **S2-SC06** : aucune inscription/connexion de compte fonctionnelle au Sprint 2 ; toute entrée compte présentée annonce « Bientôt disponible », 100 % des scénarios conservent l'accès invité prioritaire et valide, sans récupération/conversion non approuvée annoncée.
- **S2-SC07** : tous les scénarios critiques d'entrée, identité, catalogue, panne et non-régression passent ; aucun défaut critique connu introduit de confidentialité/usurpation ne reste ouvert.
- **S2-SC08** : une autre personne réalise invité → lobby → sélection des deux formats en FR et MG sans aide orale indispensable ; étapes, durée observée, appareil/réseau et difficultés consignés, sans seuil de temps inventé.
- **S2-SC09** : ajouter une entrée approuvée à la configuration suffit à faire refuser les nouvelles demandes dont la forme normalisée entière lui est égale, sans modification de code métier ni détection de sous-chaîne ; 100 % des variantes et contre-exemples du corpus approuvé donnent le résultat attendu, dont refus d'Ad_m1n pour Admin et absence de refus de Supporter pour la seule entrée Support.
- **S2-SC10** : 100 % des suppressions de recette ne laissent aucune archive personnelle d'acceptation dans les données courantes ; journaux techniques exempts d'identité/pseudonyme/jeton et conservés au plus 7 jours, sauvegardes au plus 30 jours ; tous les essais de restauration préservent les suppressions et ne réactivent aucun accès ni ancienne réservation.

## Assumptions

### Hypothèses et dépendances

- Le Sprint 1 est terminé selon son rapport détaillé et les confirmations du propriétaire ; Q1–Q6 du Sprint 2 sont validées séparément par ses deux réponses du 2026-11-03, sans extension aux règles non précisées.
- Seules les décisions actées sont acquises. Les exemples graphiques et « décisions par défaut proposées » ne valent pas validation métier.
- Le parcours principal suit le cahier §3.1 : accueil, entrée invitée, lobby, sélection. Les compositions graphiques suggérant une table avant le pseudonyme ne justifient pas seules de modifier cette séquence métier.
- Salles, présence, matchmaking et jeu appartiennent aux sprints suivants ; leur absence est explicitée sans imitation de fonction opérationnelle.
- Le propriétaire doit fournir et approuver les textes/versions applicables des conditions et de la politique de confidentialité avant livraison de l'entrée. La conservation annexe est fixée séparément par Q7b : aucune archive personnelle d'acceptation après suppression, journaux techniques sans identité/pseudonyme/jeton pendant 7 jours maximum, sauvegardes pendant 30 jours maximum et suppressions maintenues à la restauration. Aucun contenu légal ni autre obligation de conservation n'est supposé.
- Les nouveaux textes FR/MG nécessitent leur propre relecture ; les références graphiques ne fournissent pas des traductions métier approuvées.
- Choix techniques, écrans détaillés, mécanismes de reconnaissance, structures de données et paramètres de protection restent réservés à la planification ; aucun plan, contrat technique, nouvelle liste de tâches ou code produit ici.
- Effectif, durée du sprint et seuils de charge non fixés ; le Sprint 2 ne déclare ni le MVP jouable ni le cadrage Sprint 0 terminé.

### Clarifications

#### Session du 2026-11-03 — décisions Q1–Q3

- Q1 : option C ; 30 jours après dernière activité valide, prolongation à chaque activité valide, retour après réouverture, identité partagée entre onglets, expiration après 30 jours sans activité, déconnexion volontaire et gestion sécurisée côté serveur.
- Q2 : option A ; unicité parmi toutes les identités invitées encore valides, même hors connexion ; 3–20 caractères autorisés, nettoyage des espaces, accents affichés, comparaison sans casse/accent, interdiction des noms réservés cités et libération à expiration/suppression.
- Q3 : option A ; comptes complets au Sprint 7, entrée uniquement informative éventuellement présentée avec « Bientôt disponible », invité visible/prioritaire, aucune anticipation d'inscription/connexion fonctionnelle.

#### Session du 2026-11-03 — réponses complémentaires Q4–Q6

- Q4 : activités réelles de l'utilisateur, notamment rejoindre le lobby, créer/rejoindre une partie, agir dans une partie, envoyer un message autorisé ou autre interaction significative ; aucune prolongation par actualisation automatique, requête d'arrière-plan ou page laissée ouverte. Partie/chat restent hors Sprint 2 ; nouvelles interactions significatives nommées dans la recette de leur parcours.
- Q5 : fermeture navigateur conserve l'identité ; déconnexion volontaire invalide la session, supprime l'identité et libère le nom. L'identité partagée supprimée ne permet plus l'accès depuis les autres onglets.
- Q6 : insultes/vulgarité, racisme/discrimination/haine, sexualité explicite, menaces et usurpation équipe/administrateurs interdits ; liste réservée au minimum Admin, Administrator, Support, Kopaka, System, Moderator et variantes ; mots interdits configurables/extensibles, normalisation anti-contournement, évolution sans modifier le code métier. Liste initiale expressément non exhaustive.

Les décisions Q1–Q6 sont intégrées au périmètre, aux exigences, aux entités et aux scénarios. Le propriétaire a levé l'alternative déconnexion/invalidation seule : aucune conservation de l'identité active jusqu'à 30 jours après déconnexion n'est retenue. Les précisions ci-dessous n'annulent pas les décisions validées.

### Ambiguïtés résiduelles — résolues dans la session de clarification

**Q7a — Identité expirée : résolu.** Le propriétaire a choisi l'option A de la session de clarification : suppression de l'identité du stockage courant dès expiration, sans délai supplémentaire de conservation, et pseudonyme libéré.

**Q7b — Données annexes : résolu.** Le propriétaire a choisi l'option A : aucune archive personnelle d'acceptation après suppression ; journaux techniques sans identité, pseudonyme ni jeton pendant 7 jours maximum ; sauvegardes pendant 30 jours maximum. Une restauration préserve les suppressions déjà effectuées.

L'identité est supprimée du stockage courant à la déconnexion et dès expiration, l'accès invalidé et le nom libéré. Aucune conservation supplémentaire de l'identité expirée n'est retenue. Q7b fixe les règles annexes ci-dessus ; leur mise en œuvre et leur vérification seront définies en planification sans réactiver des données supprimées ni inventer de délai supplémentaire.

**Q8a — Transformations de filtrage : résolu.** Option A validée : casse, accents, espaces/tirets/underscores insérés et substitutions ciblées 0→o, 1→i, 3→e, 4→a, 5→s, 7→t. Ad_m1n est refusé comme variante d'Admin. Ces transformations servent à détecter les termes interdits/réservés ; elles ne remplacent pas l'affichage nettoyé accentué ni la règle d'unicité Q2. Aucun élargissement aux ressemblances entre alphabets ou à d'autres substitutions n'est adopté.

**Q8b — Mode de correspondance : résolu.** Option A validée : égalité de la totalité du pseudonyme normalisé avec la totalité d'une entrée interdite/réservée, pour toutes les entrées. Aucune détection de sous-chaîne ni activation d'une telle détection par entrée. Ainsi, Supporter n'est pas refusé pour la seule présence de Support ; Ad_m1n reste refusé après normalisation en Admin. Une absence de correspondance avec une entrée n'exempte pas des autres contrôles.

Les catégories interdites, les six noms réservés minimaux, les transformations Q8a, la correspondance entière Q8b et l'évolution des listes sont acquis. Le corpus initial FR/MG et ses contre-exemples sont une dépendance de livraison à approuver, distincte des mécanismes techniques à concevoir ; aucune entrée supplémentaire n'est inventée. Une éventuelle application rétroactive d'un ajout aux identités déjà créées relève d'une évolution ultérieure à arbitrer ; aucune sanction/suppression rétroactive automatique n'est livrée au Sprint 2.

### État de préparation

Clarification terminée : Q1–Q6 et Q7a–Q8b intégrées, aucun marqueur ouvert, périmètre compte au Sprint 7, aucune anticipation des parties ou du chat. Spécification prête pour la planification. Les documents applicables, le corpus initial FR/MG approuvé et les nouveaux textes relus restent des dépendances de livraison ; ils ne sont pas considérés comme fournis. Paramètres de protection/charge, mécanismes de sauvegarde/purge/restauration et détails de représentation des caractères relèvent du plan, dans les limites métier validées. Aucun code, plan technique ou fichier de tâches n'est créé par cette clarification.
