# Contenus invités — formats et validations attendus

## État actuel

Le Sprint 2 commence par sa préparation. Aucun document juridique ni corpus de
modération de production n'est fourni ou approuvé par ce dépôt. Les exemples de
`apps/api/test/fixtures/guest-content/` servent exclusivement aux tests ; ils ne
peuvent ouvrir l'admission de production.

Les deux chaînes `TermeTestFR` et `TenyAndranaMG` sont des marqueurs synthétiques
de test de filtrage. Ce ne sont ni des insultes, ni un lexique approuvé. Les six
noms réservés obligatoires ne remplacent pas le corpus des catégories interdites.

## Ressources à fournir avant livraison (T074)

| Ressource                          | Informations attendues                                        | Validation                                 |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| Conditions d'utilisation FR/MG     | Contenu, version applicable, langue, type `conditions`        | Fournies et approuvées par le propriétaire |
| Politique de confidentialité FR/MG | Contenu, version applicable, langue, type `privacy`           | Fournie et approuvée par le propriétaire   |
| Politique des pseudonymes          | Noms réservés, corpus FR/MG des catégories validées, versions | Corpus et contre-exemples approuvés        |
| Textes d'interface nouveaux        | Clés FR/MG, aides et erreurs                                  | Relecture des nouveaux textes MG en T075   |

Pour chaque approbation, consigner auteur, date, référence explicite de
confirmation et version/empreinte dans
`specs/004-sprint-2-invite-lobby/validation.md`. Une déclaration dans un fichier
JSON ne constitue pas à elle seule une preuve d'approbation. La relecture MG et
la clôture du Sprint 1 ne valident pas ces nouveaux contenus.

## Format des documents

Une entrée contient `type` (`conditions` ou `privacy`), `locale` (`fr` ou `mg`),
`version`, `blocks`, `sha256` et `approvalReference`. Les exemples utilisent des
blocs `{ "type": "paragraph", "text": "..." }`, sans HTML arbitraire. L'empreinte
SHA-256 est calculée sur l'encodage UTF-8 de `JSON.stringify(blocks)` ; une même
version doit désigner un contenu immuable. Les versions et leur correspondance
entre langues seront celles fournies et approuvées par le propriétaire ; les
identifiants partagés des exemples ne fixent aucune politique juridique réelle.

La forme complète se trouve dans
`apps/api/test/fixtures/guest-content/documents.json`. L'enveloppe porte
`fixtureOnly: true` et `approvedForProduction: false`. Le schéma serveur et la
lecture de ressources approuvées seront réalisés en T030, pas dans cette phase.
Ne jamais présenter le contenu synthétique comme un engagement juridique réel.

## Format de la politique de modération

L'exemple `apps/api/test/fixtures/guest-content/moderation-policy.json` définit :

- `schemaVersion: 1` pour la structure du fichier ;
- `policyVersion` pour une publication immuable de la liste ;
- `normalizationVersion: "unicode-17-v1"` comme identifiant technique de la
  normalisation Unicode 17 prévue, à maintenir cohérent avec T028/T029 ;
- `reservedNames` et `forbiddenNames`, tableaux de chaînes ;
- `approvalReference`, ici `fixture-only:not-owner-approved`.

Les réservés minimaux sont Admin, Administrator, Support, Kopaka, System et
Moderator. Normalisation et comparaison suivent le contrat du sprint : casse,
accents, séparateurs et six substitutions exactes ; égalité entière seulement.
Pas de regex, sous-chaîne, assimilation entre alphabets, sanction rétroactive ou
écran d'administration ajouté.

Les catégories du corpus réel restent celles validées : insultes/vulgarité,
racisme/discrimination/haine, sexualité explicite, menaces et usurpation de
l'équipe. Le fichier `counterexamples.json` donne des variantes et noms permis
pour cette seule politique factice. Il ne prouve pas la couverture de ces
catégories dans les deux langues.

## Stockage et chargement prévus

Conserver les contenus et approbations de déploiement dans des chemins privés
externes au dépôt, au bundle web et aux sauvegardes remplacées lors d'une
restauration. Les variables privées correspondantes seront validées en T010 ;
aucune valeur de production, clé ou chemin réel n'est ajouté ici.

Les tests lisent explicitement leur répertoire de fixtures. Ne pas ajouter de
repli depuis une configuration de production manquante vers ces exemples. Au
déploiement, des ressources manquantes/non approuvées doivent fermer l'admission.
Les tests isolés devront injecter leur propre source de contenus, sans variable
publique permettant d'outrepasser ce contrôle.

En T029, une politique valide sera remplacée atomiquement ; une nouvelle liste
invalide ne remplacera pas le dernier snapshot valide. En T030/T040, les versions
des documents applicables seront revérifiées côté serveur au consentement. Aucun
chargeur métier, contrôle d'admission ou contenu de production n'est implémenté
par ce guide.
