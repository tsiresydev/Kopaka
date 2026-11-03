# Implementation Plan: Sprint 2 — Invité et lobby

**Feature** : `004-sprint-2-invite-lobby` | **Date** : 2026-11-03 | **Spec** : [spec.md](spec.md)

**Branche Git effective** : `main`, conservée. Le champ BRANCH retourné par setup-plan désigne ici l'identifiant Spec Kit ci-dessus, pas une branche Git créée.

**Input** : `specs/004-sprint-2-invite-lobby/spec.md`. Sprint 1 terminé ; ses 54 tâches et acquis sont préservés. Plan documentaire limité aux phases 0 et 1 ; aucun code, migration, tâches ou déploiement exécuté.

## Summary

Préparer le parcours accueil → pseudonyme/acceptation → identité invitée sécurisée → lobby consultatif Domino 2/4. PostgreSQL reste l'autorité des identités, sessions, échéances et noms uniques. Cookies opaques HttpOnly, validation serveur, idempotence et coordination entre onglets assurent la continuité pendant 30 jours après activité valide. Expiration et déconnexion suppriment identité et acceptations, libèrent le nom et interdisent toute résurrection par sauvegarde.

Le frontend réutilise le socle Next et UI du Sprint 1, FR/MG et MASTER v2. Les comptes restent au Sprint 7 ; aucune salle, partie, présence ou discussion dans ce sprint. Textes juridiques, corpus de modération et nouvelles traductions requièrent leurs validations prévues avant livraison.

## Technical Context

**Language/Version** : TypeScript 6.0.3, Node 24.22.2 (Unicode 17 / ICU 78.3), pnpm 10.8.0.

**Primary Dependencies** : Next 16.4.4 / React 19.3.1, Nest 12.3.2 sur Express, Prisma 7.10.1 avec adapter-pg, Zod 4.6.7, composants locaux Tailwind/shadcn, Turbo 2.11.10. Versions existantes conservées ; aucune installation pour ce plan.

**Storage** : PostgreSQL 17, tables invitées additives avec cascades et index d'unicité ; Redis 7.4 conservé pour le socle sans devenir preuve d'identité. Registre durable privé de non-restauration indépendant du domaine de restauration PostgreSQL, marqueurs minimaux <=30 jours ; reçus de récupération chiffrés <=1 heure.

**Testing** : Vitest, Jest/API, intégration PostgreSQL réelle, Playwright Chromium/Firefox/WebKit et axe ; contrôles manuels mobile/lecteur d'écran et relecture MG. Réutiliser pnpm quality et la distinction entre preuves automatiques/manuelles.

**Target Platform** : web mobile/tablette/desktop, HTTPS en production, origines web/API du même site ; environnement HTTP loopback explicitement distinct. Web Locks vérifié sur les navigateurs cibles.

**Project Type** : monorepo web frontend/API avec packages partagés, sans nouveau service ni moteur de jeu.

**Performance Goals** : aucune charge cible ou SLA non validé ajouté. Mesurer latence, contention, débit de purge et budget de connexions. Limites techniques configurables et bornées ; échec explicite sans faux succès.

**Constraints** : 30 jours glissants uniquement sur interaction utilisateur autorisée ; aucune conservation métier d'identité expirée ; logs sans données invitées <=7 jours ; sauvegardes <=30 jours ; aucun archivage personnel des acceptations. Unicode versionné, modération par égalité entière et six substitutions exactes. Préserver CSP, santé, préférences et tests du Sprint 1.

**Scale/Scope** : six stories, 51 scénarios d'acceptation, 20 exigences fonctionnelles, huit non fonctionnelles et dix critères de succès de spec.md. Déploiement initial API monolithique, mutations invitées sérialisées ; pas de présence ni diffusion temps réel. Pas de chiffre d'utilisateurs inventé.

## Constitution Check

Gates évaluées avant recherche, puis après conception. Aucun écart constitutionnel identifié ; les conditions de livraison ci-dessous ne sont pas déclarées satisfaites par ce plan.

| Principe / gate | Avant recherche | Après conception / preuve documentaire |
|---|---|---|
| I — modularité et monorepo | PASS : socle inspecté | PASS : module invité Nest, schémas publics/privés séparés, composants réutilisés ; pas de nouveau service |
| II — autorité et sécurité serveur | PASS : invariant requis | PASS : cookie opaque, CSRF/Origin, validation, unicité SQL, révocation et reçus protégés ; contrat HTTP |
| III — qualité et non-régression | PASS : acquis Sprint 1 identifiés | PASS conception : matrice de recette et tests critiques prévus ; résultats Sprint 2 non encore exécutés |
| IV — cohérence, idempotence et confirmation | PASS : pas de partie dans le périmètre | PASS : admission/reprise atomiques et aucun succès avant commit ; Socket.IO différé faute de besoin temps réel actuel |
| V — UX, accessibilité, FR/MG | PASS : MASTER v2 et UI UX Pro Max pris en compte | PASS conception : contrat UI et recette aux cinq largeurs, focus/contraste/préférences ; relecture nouvelle MG avant livraison |
| VI — simplicité et MVP | PASS : Domino uniquement, comptes Sprint 7 | PASS : sélection 2/4 consultative, aucune règle de variante ni fonctionnalité future inventée |
| Protection des données | PASS : décisions de clarification conservées | PASS conception : cascade, aucune archive d'acceptations, rotation logs/sauvegardes et restauration fermée avec registre minimal |
| Gouvernance / roadmap | PASS : spécification clarifiée | PASS : pas de modification métier/constitution, pas d'implémentation anticipée ni nouveaux comptes |

**Limite opérationnelle explicite** : une base arrêtée ne peut effacer physiquement à l'instant d'expiration. Aucun délai métier n'est ajouté : refus d'accès à l'échéance et purge avant reprise. Ne pas présenter le plan comme garantissant l'effacement physique pendant une panne totale. Le [contrat d'exploitation](contracts/operations.md) rend ce point vérifiable et impose le fonctionnement fermé si restauration/purge non sûre.

**Prérequis de livraison** : contenus et versions juridiques approuvés ; corpus initial FR/MG et contre-exemples approuvés ; relecture MG nouvelle ; stockage indépendant/clé du registre et rétention de toutes les destinations effectivement configurés et testés. Ils n'autorisent pas à fabriquer les contenus. Pas de question technique de recherche laissée ouverte.

## Project Structure

### Documentation (this feature)

```text
specs/004-sprint-2-invite-lobby/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    http.md
    nickname.md
    ui.md
    operations.md
  checklists/requirements.md
```

`tasks.md` sera produit seulement par speckit-tasks. Les anciennes notes historiques du checklist de spécification ne sont pas réécrites ; ses marqueurs et l'état de préparation de spec.md font foi.

### Source Code (repository root)

Emplacements visés par les futures tâches, pas créés par ce plan :

```text
apps/api/src/
  guest/                   # admission, sessions, noms, catalogue, documents, purge
  common/                  # CORS par route, journalisation et erreurs existants
  config/                  # validation des paramètres privés
apps/web/src/
  app/                     # accueil, invite, lobby, conditions, confidentialite, foundation
  components/              # composants de parcours réutilisant packages/ui
  lib/                     # client API invité et coordination navigateur
packages/validation/src/   # DTO publics ; politique et règles serveur en entrée privée
packages/ui/src/           # socle conservé ; extensions seulement si nécessaires
prisma/
  schema.prisma
  migrations/              # 0001 conservée ; nouvelle migration additive à réaliser
scripts/                   # maintenance/recette opérationnelle à définir
infra/docker/              # configuration privée et rétention à compléter
apps/api/                  # tests unitaires et d'intégration selon conventions existantes
tests/                     # tests E2E et recettes d'accessibilité existants à étendre
```

**Structure Decision** : étendre les frontières du monorepo existant. Le registre d'exploitation et les contenus privés restent hors dépôt et hors bundle web ; seuls formats, exemples sans secrets et fixtures y sont versionnés. Les chemins précis de nouveaux fichiers seront matérialisés par les tâches selon les conventions locales ; pas de refonte du socle.

## Phase 0 — Recherche terminée

[research.md](research.md) consolide les trois recherches : preuve de session/CSRF/onglets/reprise ; horloge/transactions/purge/restauration ; Unicode/modération/UX. Chaque décision précise justification et alternatives. Sources techniques primaires liées dans le document, avec PostgreSQL 17, Prisma 7 et Unicode 17 explicitement ciblés.

## Phase 1 — Conception terminée

- [data-model.md](data-model.md) : entités, contraintes, cascades, états et transactions.
- [contracts/http.md](contracts/http.md) : cookies, origines, CSRF, admission/récupération, activité, logout, catalogue et documents.
- [contracts/nickname.md](contracts/nickname.md) : normalisation distincte, politique configurable, fixtures et limites du filtrage.
- [contracts/ui.md](contracts/ui.md) : routes, interactions, accessibilité et conservation du Sprint 1.
- [contracts/operations.md](contracts/operations.md) : suppression, rétention, restauration, configuration et limites opérationnelles.
- [quickstart.md](quickstart.md) : prérequis, commandes existantes et recette fonctionnelle/technique après implémentation.

Ordre de dépendance pour la future décomposition : schémas/politique et stockage → admission/session/suppression avec restauration sûre → parcours UI et catalogue → intégration, non-régression et recette opérationnelle. Les interfaces peuvent être préparées avec fixtures explicitement isolées ; aucune livraison ouverte sans les approbations de contenu.

## Complexity Tracking

Aucune violation constitutionnelle à justifier. Deux mécanismes techniques supplémentaires sont nécessaires : le reçu chiffré évite une double identité après perte de réponse ; le registre indépendant empêche la résurrection depuis une ancienne sauvegarde. Ils ne constituent ni compte, ni historique d'acceptation, ni fonctionnalité métier future. Le verrou global de mutation limite volontairement la complexité initiale ; sa contention doit être mesurée avant toute évolution.

## Ajustements après analyse — 2026-11-03

Les quatre constats U1/U2/I1/U3 ont des corrections documentaires et des recettes explicites : durée relative du cookie sans modification des 30 jours serveur, récupération CSRF depuis le même contexte consommé, reconnaissance passive disponible dès US3 et résultat de récupération après expiration du reçu. Le détail normatif est dans contracts/http.md ; modèle, recherche, UI, quickstart et tâches sont alignés.

Ordre précisé : T039 fournit GET /guest/session et bootstrap avant coordination T044 et accès direct T046 ; T051 complète la recette US4 sans nouvelle route. Les 80 tâches et leur priorité sont conservées. Aucun nouveau champ persistant, contenu métier, compte ou implémentation introduit. Les dépendances d'approbation et contrôles constitutionnels demeurent applicables.
