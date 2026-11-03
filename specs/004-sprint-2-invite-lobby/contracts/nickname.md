# Contrat — pseudonymes et modération

## Pipeline normatif

1. Accepter une chaîne JSON ; NFC ; convertir les espaces Unicode Zs admis en espace ASCII, supprimer les espaces de bord, réduire les espaces multiples.
2. Vérifier 3–20 graphèmes étendus avec Intl.Segmenter du runtime serveur figé Unicode 17 / ICU 78.3. Accepter lettres Unicode, accents attachés, chiffres décimaux, espaces, tiret ASCII et underscore. Rejeter contrôles, invisibles, bidi, ponctuations non admises et marques isolées.
3. Conserver ce displayName, avec casse et accents.
4. Construire uniqueKey par décomposition canonique, case folding Unicode complet (données 17, statuts C/F, non turc spécifique), retrait des marques d'accent et recomposition. Conserver espaces internes, chiffres, tirets et underscores. Comparaison exacte avec index déterministe ; aucune collation locale implicite.
5. Construire moderationKey depuis uniqueKey : supprimer espaces/tirets/underscores, puis appliquer uniquement 0→o, 1→i, 3→e, 4→a, 5→s, 7→t.
6. Appliquer ce même pipeline aux entrées des listes, puis comparer la chaîne entière. Aucun contains, préfixe, suffixe, regex ou mapping d'homoglyphes. Aucun changement de uniqueKey par la modération.

## Politique configurable

Format externe privé, validé par schéma : schemaVersion, policyVersion, normalizationVersion, reservedNames, forbiddenNames, approvalReference. Réservés minimaux : Admin, Administrator, Support, Kopaka, System, Moderator. Leurs variantes sont détectées par le pipeline, sans nouvelle règle implicite.

Le corpus FR/MG couvre les catégories validées : insultes/vulgarité, racisme/discrimination/haine, sexualité explicite, menaces et usurpation de l'équipe. Il doit être fourni et approuvé avec des noms autorisés de contrôle ; les six noms réservés seuls ne satisfont pas cette obligation. Les fixtures de tests sont clairement séparées des données de production.

Changement sans code métier : publier une configuration validée, remplacer atomiquement le snapshot. Rejeter une nouvelle configuration invalide ; garder le dernier snapshot valide. Au premier démarrage sans configuration approuvée, admission indisponible. Aucun bannissement rétroactif ni renommage d'identités existantes n'est inventé.

## Exemples obligatoires

| Entrée / comparaison | Résultat attendu |
|---|---|
| `  Rana   Rivo  ` | Affichage `Rana Rivo` |
| `Élo` / `Élo` / `elo` | Même clé d'unicité ; 3 graphèmes |
| `Rana1` / `Ranai` | Unicité distincte, même forme de modération possible |
| `Rana-Rivo` / `Rana Rivo` / `Rana_Rivo` | Clés d'unicité distinctes |
| `Ad_m1n`, `Àd-mïn`, `A d m i n` | Refus : égalité normalisée avec Admin |
| `Supporter` | Pas de refus du seul fait de Support |
| `Admin123` | Pas de refus du seul fait de Admin |
| Contrôle bidi / caractère invisible | Refus de caractère non admis |

Un refus ne renvoie pas le corpus ni le pseudonyme dans les journaux. Les erreurs présentées sont traduites à partir de codes stables ; la disponibilité n'est définitivement acquise qu'au commit d'admission.
