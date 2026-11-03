# Specification Quality Checklist: Kopaka — Sprint 2, invité et lobby

**Purpose**: Vérifier la qualité et la complétude de la spécification avant planification.
**Created**: 2026-11-03
**Feature**: [spec.md](../spec.md)

Cette checklist intégrée est maintenue par `speckit-specify` et `speckit-clarify`. Les cases décrivent la qualité des exigences, pas la réalisation du Sprint 2.

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

Revue après réponses Q1–Q6 du 2026-11-03 : **13 critères satisfaits / 16 ; 3 ouverts**, liés à deux précisions résiduelles Q7–Q8. Six stories, 45 scénarios, 20 exigences fonctionnelles, 8 exigences non fonctionnelles et 9 critères de succès. Les anciennes revues sont remplacées par ce présent état ; les marqueurs Q1–Q6 sont supprimés et leurs décisions intégrées, pas laissées conditionnelles.

Décisions acquises : 30 jours glissants prolongés par une véritable interaction valide, jamais par actualisation automatique ou arrière-plan ; réouverture navigateur et identité commune aux onglets ; déconnexion volontaire invalidant la session, supprimant l'identité et libérant son nom. Pseudonymes 3–20 caractères, catégories autorisées, nettoyage/équivalences, unicité des identités valides même hors connexion et libération à expiration/suppression. Catégories interdites et six noms réservés minimaux dont Moderator, variantes et listes configurables/extensibles sans modification de code métier. Comptes au Sprint 7, entrée informative au Sprint 2, invité prioritaire. Registre central synchronisé ; aucune anticipation des parties, discussions ou d'un écran d'administration.

Le périmètre est désormais délimité : aucune anticipation de compte au Sprint 2. Aucun conflit avec la constitution n'est identifié. FR-004 et US-003 plateforme restent des exigences du produit final ; une entrée informative ne constitue pas le parcours de création de compte complet. Les priorités sont conservées.

Les trois critères ouverts (absence de marqueurs résiduels, exigences entièrement non ambiguës, critères fonctionnels entièrement fixés) concernent deux précisions non fournies :

| Précision | Extrait de la spécification | Conséquence |
|---|---|---|
| Q7 — Données annexes/expiration | « Une durée d'archivage/purge ou une conservation des acceptations ne se déduit pas de la durée de validité. » | L'identité est bien supprimée à la déconnexion ; ne pas inventer le devenir de l'identité expirée ou des éventuelles acceptations, journaux et sauvegardes. |
| Q8 — Variantes et corpus | « Aucun terme supplémentaire, règle universelle de sous-chaîne ou assimilation de caractères n'est choisi sans corpus approuvé » | Catégories interdites et liste évolutive acquises ; compléter la recette avec variantes/contre-exemples FR/MG et contenu initial approuvés. |

Pour finaliser les règles concernées : préciser Q7–Q8 et refaire la revue. Les décisions Q4–Q6 ne sont pas redemandées. Les documents applicables, leurs versions, le corpus initial approuvé et les nouvelles traductions restent des dépendances de livraison. Chaque interaction significative supplémentaire sera explicitement nommée lors de la conception du parcours concerné ; aucune activité technique automatique n'est réintroduite par cette extension. Une éventuelle modération rétroactive des identités existantes reste à arbitrer avant cette évolution.

Les critères de succès sont mesurables et couverts par les parcours ; cela n'atteste pas leur réussite dans une implémentation inexistante. Le détail technique de représentation/comptage des caractères sera précisé en conception sans changer les bornes et équivalences métier validées.

Le template actif a été résolu par la pile de résolution Spec Kit (`resolve-template.ps1 spec-template -Json`) ; ses sections obligatoires et leur ordre sont conservés. Les priorités P0/P1 des références priment sur les exemples de classement P1/P2/P3 du template. Le Sprint 1 est pris en compte comme terminé selon sa clôture, sans requalifier les confirmations du propriétaire en essais directement observés.

État : **décisions Q1–Q6 intégrées ; Q7–Q8 signalées pour finalisation des traitements et recettes concernés**. Aucun plan technique, contrat, tasks.md ou code n'est créé pour le Sprint 2. Aucun hook avant/après enregistré : `.specify/extensions.yml` absent lors de l'exécution initiale.
