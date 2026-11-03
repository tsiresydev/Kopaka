# Quickstart de validation — Sprint 2

Ce guide prépare la recette après implémentation. Les routes et entités décrites ne sont pas encore disponibles. Aucun résultat Sprint 2 n'est revendiqué ici.

## Prérequis

- Node 24.22.2, pnpm 10.8.0, Docker et navigateurs Playwright du dépôt ; PostgreSQL 17 et Redis 7.4 conformément au Sprint 1.
- Variables locales existantes configurées sans publier de secrets ; même hôte loopback pour web et API. Pour les vraies conditions de production, environnement HTTPS de même site et cookies Secure.
- Conditions/confidentialité et versions FR/MG approuvées ; corpus de modération approuvé avec contre-exemples ; nouvelles traductions MG relues. Les fixtures isolées des tests ne valent pas approbation de production.
- Répertoire durable de non-restauration indépendant, clés privées et politiques de rotation des logs/sauvegardes conformes au [contrat d'exploitation](contracts/operations.md).

## Installation et contrôles disponibles

Depuis la racine du dépôt, après implémentation :

```powershell
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:migrate:deploy
pnpm quality
pnpm dev
```

Les commandes Prisma supposent les variables privées chargées selon la configuration existante ; ne pas utiliser migrate reset. Appliquer la nouvelle migration seulement à une base locale/recette dédiée. Les services Docker s'utilisent selon la procédure existante du Sprint 1, sans remplacer leurs volumes. Si le serveur est déjà lancé, réutiliser son instance.

`pnpm quality` exécute lint, format, typage, unitaires, intégration, build et E2E. Garder les rapports et distinguer résultats automatiques, contrôles manuels et attestations. Les commandes spécialisées de purge/restauration seront définies pendant l'implémentation : aucune commande fictive n'est présentée ici comme disponible.

## Matrice de recette fonctionnelle

Chaque scénario numéroté des six stories de [spec.md](spec.md), y compris erreurs et cas limites, devra être relié à un test ou une preuve manuelle dans les futures tâches et le rapport. Cette matrice organise la couverture sans remplacer les 51 critères.

| Story | Manipulation de recette | Attendu |
|---|---|---|
| S2-US01 | Accueil en FR/MG, préférences, retour navigateur et mobile | Gratuité comprise, invité prioritaire, préférences Sprint 1 préservées |
| S2-US02 | Noms limites/Unicode/variantes, consentement absent, versions changées, documents indisponibles | Validations serveur conformes, saisie conservée, aucune identité créée avant succès |
| S2-US03 | Entrée réelle, double clic, requêtes concurrentes, perte de réponse puis récupération | Une seule identité/session et confirmation serveur ; aucune preuve par nom |
| S2-US04 | Fermeture/réouverture, deux onglets, activité réelle vs passive, échéance et déconnexion | Identité commune ; 30 jours glissants uniquement pour activité valide ; suppression/libération du nom |
| S2-US05 | Lecture catalogue et sélection clavier des deux modes | 2/4 participants exacts ; aucun faux joueur/salon ni démarrage de partie |
| S2-US06 | Entrée compte depuis accueil/formulaire | Bientôt disponible ; aucune inscription/connexion réelle ; invité accessible |

## Scénarios techniques impératifs

1. **Temps contrôlé.** Sur base de test isolée, fixer les dates par fixtures/horloge de test ; ne pas attendre 30 jours et ne pas ajouter d'endpoint public de changement d'heure. Tester juste avant, à et après expiresAt. Polling, santé, montage React, changement de langue/thème et page ouverte ne changent pas lastActivityAt/expiresAt ; entrée explicite oui. Aucun renouvellement après expiration.
2. **Concurrence réelle PostgreSQL.** Deux admissions de noms normalisés identiques ⇒ un succès ; détenteur hors ligne mais valide ⇒ collision ; détenteur expiré ⇒ purge et réutilisation. Tester concurrence purge/activité/logout, attente de verrou traversant l'échéance et absence de doublon après relance.
3. **Perte de réponse.** Couper la réponse après commit avant réception de Set-Cookie ; relancer même intention puis recharger et récupérer. Vérifier même UUID, un seul consentement et même secret réémis. Payload différent ⇒ conflit. Contexte supprimé ⇒ aucun replay automatique créant une identité.
4. **Navigateurs et onglets.** Chromium, Firefox, WebKit ; deux onglets ouverts à froid en parallèle, Web Locks réellement disponible, une identité partagée, notification puis lecture passive après logout. Vérifier fermeture/réouverture avec cookies persistés, cookies HTTP locaux et HTTPS réels. Une réponse tardive après logout ne réanime rien.
5. **Sécurité.** Sans cookie, nom seul, cookie forgé, Origin absent/hostile, CSRF absent/incorrect, formulaire cross-site, CORS avec credentials, corps trop gros et débit excessif. Attendre refus sans donnée privée. Vérifier no-store et absence de secrets dans bundle, localStorage, URL, canal et journaux. Rejouer les tests santé Sprint 1 avec credentials=omit.
6. **Normalisation.** Exécuter les fixtures [nickname](contracts/nickname.md), longueurs 2/3/20/21 graphèmes, accents composés/décomposés, variantes autorisées/interdites et contre-exemples approuvés FR/MG. Remplacer la politique sans changer le code métier ; configuration invalide ⇒ pas de fallback vide.
7. **Suppression/restauration.** Créer une identité et un dump, déconnecter ou expirer, restaurer le dump fermé au trafic, appliquer le registre puis tenter les anciens cookies et la réutilisation du nom. Aucune session/acceptation ressuscitée. Injecter crash après fsync avant commit, indisponibilité du registre et clé manquante ; rester fermé jusqu'au rattrapage sûr. Vérifier que les identités non supprimées restent utilisables.
8. **Rétention.** Avancer l'horloge de l'environnement de recette, vérifier élimination des logs >7 jours, sauvegardes/marqueurs >30 jours sur toutes les destinations, sans supprimer une marque encore nécessaire à une sauvegarde retenue. Les identités expirées n'ont aucun délai de grâce dans le stockage courant. Mesurer la purge en fonctionnement et vérifier rattrapage avant reprise après panne.
9. **UI et non-régression.** Les cinq largeurs, zoom 200 %, texte +40 %, FR/MG, clavier/lecteur d'écran, reduced-motion, contrastes et focus ; démo /foundation conservée ; CSP et initialisation clair/langue du Sprint 1 inchangées. Vérifier les liens juridiques et la conservation du formulaire.

## Condition de livraison

Tous les critères S2-FR, S2-NFR et S2-SC de la spécification doivent avoir une preuve ; aucune ressource juridique ou de modération non approuvée utilisée en production. Maintenir la distinction entre tests déjà réussis au Sprint 1 et nouveaux résultats Sprint 2. Aucun chiffre de performance inventé : mesurer durées, contention et retard de purge dans les limites opérationnelles documentées, puis consigner les résultats et limitations.

## Traçabilité des critères de succès

| Critères | Preuves à réunir |
|---|---|
| S2-SC01–03 | Stories US02–04, tests serveur admission/temps/concurrence, reprise de réponse et parcours E2E |
| S2-SC04 | US05, contrat exact du catalogue et sélection accessible des deux modes |
| S2-SC05 | Inventaire FR/MG, relecture nouvelle, deux thèmes et matrice responsive/accessibilité |
| S2-SC06 | US06, entrée informative et absence d'API de compte |
| S2-SC07 | pnpm quality et recettes critiques sans défaut bloquant, non-régression Sprint 1 |
| S2-SC08 | Une autre personne effectue invité → lobby → sélection 2/4 en FR et MG sans aide orale ; consigner appareil/réseau, durée observée et difficultés, sans seuil arbitraire |
| S2-SC09 | Chargement d'une nouvelle entrée approuvée sans changement métier, variantes et contre-exemples du corpus |
| S2-SC10 | Suppression, crash/restauration et inventaire des rétentions sur toutes les copies/destinations |

## Recettes ajoutées après analyse

- **U1 — durée de preuve et ordre réseau** : confirmer que chaque réponse d'activité initiale/rejouée réémet Max-Age=2592000 sans Expires absolu et qu'un GET passif ne réémet rien. Perdre la réponse initiale, rejouer la même clé : mêmes dates SQL, cookie remis. Faire A puis B et recevoir B puis A, puis une récupération tardive : pas de réduction de preuve ni régression d'échéance affichée. À expiresAt serveur, l'accès est refusé même si un cookie demeure ; une réponse après logout ne réanime rien.
- **U2 — CSRF perdu** : créer un contexte, perdre la réponse d'admission, recharger avec le seul cookie de contexte. GET passif puis bootstrap retournent l'état recoverable et le CSRF du même contexte consommé, sans nouveau cookie de contexte/identité ni prolongation. Recover rend la preuve du même UUID ; mauvais contexte/CSRF refusé. Aucun stockage de CSRF pour faire passer artificiellement le test.
- **I1 — ordre de construction** : dès fin de US3, exécuter accès direct/rechargement du lobby et deuxième onglet avec GET /guest/session réellement disponible via T039 ; pas de GET simulé pour masquer une dépendance future T051. En US4, compléter les frontières temporelles et le raccordement d'activité explicite.
- **U3 — frontière du reçu** : horloge de test juste avant/à/après admission + une heure, avec puis sans cookie invité. Après limite, receipt inutilisable même avant purge ; cookie invité valide encore reconnu normalement. Sans preuve, message de récupération indisponible, identité/acceptation non supprimées pour ce motif, nom encore réservé et aucune création automatique. Seul le bouton de nouvelle entrée envoie intent:new_entry ; ressaisir le même nom ne récupère rien et peut provoquer NICKNAME_TAKEN. Vérifier les messages FR/MG et panne 503 distincte de ces refus certains.

Ces recettes sont à exécuter à l'implémentation ; leur ajout documentaire ne vaut pas résultat de test.
