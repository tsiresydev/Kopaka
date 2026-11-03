# Validation — Sprint 1

## Clôture du Sprint 1 — 2026-11-03

**54/54 tâches cochées.** Confirmation du propriétaire reçue le 2026-11-03 dans cette conversation : « Merci,tu peux valider tous,c'est fait ». Validation enregistrée sur cette déclaration, sans nouveau contrôle exécuté par l'agent. Les identités, appareils/versions, mesures et pièces justificatives non fournis ne sont pas inventés. T050 à T054 sont clôturées après la présentation détaillée de leur contenu.

| Tâche | Validation enregistrée |
|---|---|
| T050 | Prise en main indépendante depuis une copie propre confirmée |
| T051 | Revue de sécurité confirmée : [rapport](security-review.md) |
| T052 | Accessibilité manuelle confirmée : [rapport](validation-accessibility.md) |
| T053 | Appareils réels et mesures mobiles confirmés : [rapport](validation-devices.md) |
| T054 | Recette finale confirmée ; matrice ci-dessous |

La confirmation globale couvre la vérification de la CI distante évoquée dans la liste des travaux restants. Aucun lien de run ni résultat détaillé n'a été transmis : il s'agit de la confirmation du propriétaire, pas d'un run observé par l'agent. Les résultats directement observés restent ceux d'US6 : 123 tests unitaires, 12 intégrations et 54 E2E réussis. Aucun test n'est relancé pour cette mise à jour documentaire.

### Matrice finale exigences → preuves

Les références automatiques renvoient aux résultats US1–US6 conservés ci-dessous ; les validations humaines renvoient à la confirmation ci-dessus et aux rapports associés.

| Exigence | Preuves et validation |
|---|---|
| S1-FR01 | Guide, installation propre automatique US6 et prise en main T050 confirmée |
| S1-FR02 | Builds indépendants web/API et commandes du guide |
| S1-FR03 | Contrats partagés, unitaires US2 et intégration HTTP réelle US3 |
| S1-FR04 | Migration, second deploy et persistance après restart, intégration US1 |
| S1-FR05 | Liveness/readiness et dépendances réelles, US3 |
| S1-FR06 | Tests configuration/erreurs/logs US1–US3 et T051 confirmée |
| S1-FR07 | Shell/composants US4 et E2E accessibilité US6 |
| S1-FR08 | E2E santé réelle, panne/reprise et réessai |
| S1-FR09 | Tests langue, stockage et reload US5 |
| S1-FR10 | Parité/localisation US5 et relecture T045 confirmée |
| S1-FR11 | Tests thème clair/sombre/système US4–US6 |
| S1-FR12 | Quality réussi, échec contrôlé T049 ; CI distante confirmée par le propriétaire |
| S1-FR13 | README, development, quickstart et prise en main T050 confirmée |
| S1-NFR01 | Cinq largeurs/expansion automatisées ; portrait/paysage T052–T053 confirmés |
| S1-NFR02 | Axe/clavier/focus/cibles automatisés ; lecteur d'écran/toucher T052 confirmés |
| S1-NFR03 | Contrastes automatisés et T052 confirmée ; mesures détaillées non transmises |
| S1-NFR04 | Tokens et contrats Kopaka v2 réutilisés, US4 |
| S1-NFR05 | Parité FR/MG, expansion, langues sans drapeau et relecture T045 confirmée |
| S1-NFR06 | Ressources locales/reduced-motion ; mesures mobiles T053 confirmées sans chiffres transmis |
| S1-NFR07 | Validation serveur et erreurs/logs normalisés ; revue T051 confirmée |
| S1-NFR08 | Intégration et E2E réels normal/panne/reprise, sans faux ready |
| S1-NFR09 | Apps/packages séparés, lint/frontières et T051 confirmée |
| S1-NFR10 | Lint/format/types/unitaires/intégration/build/E2E réussis ; recette finale confirmée |
| S1-NFR11 | Trois moteurs automatisés ; navigateurs et Android/Safari iOS réels T053 confirmés, versions non transmises |
| S1-SC01 | Prise en main indépendante T050 confirmée |
| S1-SC02 | Sept contrôles quality réussis, anomalie T049 détectée et CI distante confirmée |
| S1-SC03 | Responsive/expansion automatisés ; zoom navigateur/appareils T052–T053 confirmés |
| S1-SC04 | Parité FR/MG et persistance, E2E US5 |
| S1-SC05 | Clavier/cibles automatisés et recette manuelle T052 confirmée |
| S1-SC06 | Intégration et E2E réels normal/panne/reprise |
| S1-SC07 | Revue T051 et recette finale T054 confirmées |
| S1-SC08 | Shell bilingue sans parcours métier, guide et T054 confirmée |
| S1-SC09 | E2E santé prêt/non prêt/injoignable et reprise sans reload |

La clôture concerne les fondations du Sprint 1. Elle ne valide pas les décisions métier encore « À VALIDER », les tâches du Sprint 0 ou les fonctionnalités des sprints suivants. Les sections suivantes sont historiques : leurs mentions de tâches ouvertes ne représentent plus le statut courant.


## US6 du 2026-11-03 — vérifier et transmettre le socle

Périmètre : T046 à T050 uniquement. T001 à T045 sont conservées, dont la confirmation de relecture MG. Les audits manuels et appareils T051 à T054 restent hors de cet incrément. Les sections US5 et antérieures ci-dessous sont historiques.

### Livrables

- T046 : `tests/e2e/accessibility.spec.ts` ajoute axe WCAG A/AA, navigation effective Tab/Shift+Tab/Entrée, lien d'évitement, focus 3+3, cibles 48×48, états disabled/erreur/chargement, région polite unique, FR/MG, clair/sombre, cinq largeurs et expansion 40 %. Les scans axe sont joints aux résultats ; contraste manuel, lecteur d'écran et zoom navigateur réel restent des preuves distinctes.
- T047 : `.github/workflows/ci.yml` configure Linux avec installation frozen, génération Prisma/packages, contrôles complets, PostgreSQL/Redis dédiés via les harnais existants et trois moteurs Playwright ; Windows vérifie installation/types/build sans env local. Actions épinglées par SHA vérifiés sur les dépôts officiels, Node 24.22.2/pnpm 10.8.0, permissions lecture, aucune mise en cache de données ou impression d'environnement. Rapports conservés 14 jours après succès ou échec. **Workflow créé et commandes vérifiées localement ; aucun run GitHub Actions n'est prétendu exécuté.**
- T048 : `pnpm quality` séquence lint → format → types → unitaires → intégration → build → E2E ; bilan explicite par contrôle, arrêt après premier échec et suivants marqués skipped, code global 1 sur échec. Filtre `--only` documenté ; il valide uniquement sa sélection. Rapport `quality-results/summary.json` et résumé GitHub. Les contrôles individuels restent disponibles ; données/E2E non cachés.
- Les E2E utilisent `.next-e2e` et des ports/projets dédiés ; le serveur dev demandé précédemment conserve ses ports 3000/3001. Le build E2E et sa variable sont inclus dans le graphe/cache Turbo. Versions des moteurs/OS/Node annotées dans chaque test ; rapports HTML et JUnit ajoutés, traces d'échec conservées. Les artefacts sont ignorés par Git, ESLint, Prettier et Docker.
- T050 : README, guide de développement et quickstart actualisés (versions, env, migrations, commandes indépendantes, contrôles, pannes/reprises, ports et dépannage). La prise en main par une autre personne reste à attester, donc T050 reste décochée malgré la documentation et la répétition automatique.

### Résultats automatiques

`pnpm quality` terminé avec **code 0**, les sept contrôles passed :

| Contrôle | Résultat |
|---|---|
| lint | Réussi |
| format:check | Réussi, inclut workflow CI et tests E2E |
| typecheck | Réussi sur les cinq apps/packages |
| test:unit | 60 Vitest (6 suites) + 63 Jest API (4 suites), soit 123 tests |
| test:integration | 12 tests / 2 suites, données PostgreSQL/Redis réelles, migration/persistance et santé/pannes/reprise |
| build | Cinq apps/packages construits, builds production web/API réussis |
| test:e2e | 54/54 parcours réussis (18 par moteur), dont 15 nouveaux tests d'accessibilité ; durée E2E 15 minutes |

Rapport global : `quality-results/summary.json` ; HTML `playwright-report/index.html`, JUnit `test-results/e2e.xml`, pièces jointes axe et annotations de versions dans le rapport HTML. Moteurs relevés dans ces annotations : **Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2**, Windows x64, Node 24.22.2. Il s'agit de moteurs automatisés, pas d'une preuve Safari iOS/Android réels. L'avertissement natif WebKit 27.2 connu conserve l'exception étroite déjà documentée, sans changement de CSP.

T046–T049 sont cochées. **49/54 tâches Sprint cochées ; T050 reste ouverte uniquement pour sa prise en main indépendante, documentation livrée.** T051–T054 ne sont pas réalisées par cet incrément. Contrôle final de non-régression des services locaux : web 3000 HTTP 200, API 3001 readiness HTTP 200 `ready`, PostgreSQL et Redis courants healthy ; seuls ces deux conteneurs locaux restent démarrés après le nettoyage des tests. Aucun fichier de traduction modifié.

### T049 — échec contrôlé dans une copie isolée

Une copie de sources sans fichiers env réels, node_modules, sorties générées ni caches a été créée sous `%TEMP%/kopaka-us6-1793705766706`. Installation `pnpm install --frozen-lockfile --offline --store-dir <cache-local>` réussie : 712 paquets réutilisés, aucun téléchargement, pnpm 10.8.0. Ce test atteste une installation sans anciens dist ni secrets ; il utilise un cache déjà disponible et ne prouve pas un téléchargement vierge ni une recette humaine indépendante.

Dans la copie uniquement, l'assertion de liveness dans `packages/validation/src/health.spec.ts` attend temporairement `status: 'wrong'`. La chaîne entière `pnpm quality` passe lint/format/types puis échoue sur test:unit, code global 1 ; intégration/build/E2E sont marqués skipped. Rapport `quality-results/rehearsal-negative.json` et log `rehearsal-negative.log`. La source est restaurée octet pour octet dans un bloc finally ; aucun test cassé n'est intégré au projet courant.

Après restauration, `pnpm quality --only "test:unit,build"` réussit dans cette copie propre : 60 tests Vitest et 63 tests Jest, builds des cinq apps/packages réussis, code global 0. Rapport `quality-results/rehearsal-restored.json`, log `rehearsal-restored.log`. SHA-256 du test restauré et du fichier courant identiques : `33648A78F0338341633D50AE46118C804F3CD2E327753ADBDED1DBBD4228BE8F`. T049 cochée.

Le premier essai négatif a également rencontré un dépassement du délai d'attente du test UI `health-status` pendant les exécutions concurrentes ; il ne s'est pas reproduit dans le run restauré ni dans la chaîne principale. Une confirmation ciblée `pnpm quality --only test:unit` avec la même anomalie reproduit **exactement 1 test en échec et 59 réussis**, sur l'assertion volontaire `alive` contre `wrong` (code global 1). Après nouvelle restauration, les **27 tests de contrats passent**, code 0. Preuves : `quality-results/rehearsal-negative-confirmation.{json,log}` et `quality-results/rehearsal-contract-restored.log`. Aucun changement de code produit ni assouplissement d'assertion pour obtenir ces résultats.
### Transmission et limites

La demande de recette indépendante a été adressée au propriétaire dans cette conversation. Aucun résultat de prise en main par une autre personne n'a été reçu à ce stade. Pour T050, consigner personne, date, OS/versions, version du code, étapes suivies et difficultés ; ne pas substituer la copie automatisée à cette attestation. Les relectures MG déjà confirmées ne sont pas remises en cause.

Base Git : `24b8629d1c31e04335483de00764c08bf6798476`, branche main, modifications préexistantes conservées et aucun commit créé. Versions : Node 24.22.2, pnpm 10.8.0, Docker 29.9.2, Compose 5.6.1. Les services locaux et leurs volumes ne sont pas supprimés. Les projets de tests sont nettoyés sans `down -v` ni flush partagé. `.specify/extensions.yml` absent : aucun hook avant/après enregistré. Aucun déploiement, publication ou push n'est réalisé.

## US5 du 2026-11-03 — choix Français / Malagasy

Périmètre : US5 uniquement, après T001–T039 déjà cochées. Fonctionnalité bilingue livrée et relecture malagasy confirmée par le propriétaire le 2026-11-03, sans correction demandée. **T040 à T045 cochées : US5 terminée, 45/54 tâches du Sprint cochées.** US6 et les preuves humaines finales ne sont pas déclarées réalisées. Les sections suivantes sont historiques.

### Réalisation et preuves automatiques

- Dictionnaires FR/MG avec parité des clés et chaînes non vides ; tous les textes du shell, thèmes, états de santé et page d'erreur passent par le provider typé.
- Préférence `kopaka.locale.v1` validée (`fr`, `mg`), repli FR ; stockage refusé en mémoire et clé corrompue isolée. Aucun compte, cookie ou transfert API. `html lang` et le titre suivent le choix ; champs saisis et thème conservés.
- Premier rendu serveur/React FR cohérent, réconciliation après montage ; script initial localise les attributs avant hydratation sous la CSP existante.
- TDD T040 : échec initial de `pnpm exec vitest run apps/web/tests/i18n.test.tsx` sur modules absents, puis réussite. Les 8 tests i18n couvrent parité, stockage, SSR/hydratation sans warning, absence de nouvel appel santé au changement, erreur localisée et script initial.
- `pnpm exec vitest run` : **6 suites, 60 tests réussis**, dont les tests US4 existants.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check` : réussis.
- `pnpm test:e2e tests/e2e/preferences.spec.ts --project=chromium` : **4/4 réussis**, build production web/API et migration sur données dédiées. Persistance langue et trois thèmes, focus conservé, contenu saisi conservé, changement hors connexion et santé localisée, stockage refusé/corrompu, expansion des textes de 40 % en FR/MG aux largeurs 320/375/768/1024/1440 et contrôles nommés ≥48×48.
- `pnpm test:e2e tests/e2e/preferences.spec.ts --project=firefox --project=webkit` : **8/8 réussis**. Total US5 : **12/12 parcours** sur Chromium, Firefox et WebKit. Builds production réussis ; nettoyage des services dédiés terminé sans suppression de volume. Ces résultats précèdent la confirmation de relecture T045 ; le dictionnaire est inchangé.

Les premiers essais `pnpm exec playwright test` ont échoué avant les scénarios : Docker absent du PATH, puis `npm_execpath` absent avec `pnpm exec`. Reprise avec le PATH Docker temporaire documenté et le script `pnpm test:e2e`, sans modification permanente du système. Les projets Compose de recette sont isolés ; nettoyage sans suppression des volumes. Aucun volume courant n'est réinitialisé.

Base Git : `24b8629d1c31e04335483de00764c08bf6798476` avec modifications locales préexistantes conservées. Aucun commit créé. `.specify/extensions.yml` absent : aucun hook avant/après à exécuter.

### T045 — relecture malagasy confirmée

Attestation reçue du propriétaire dans cette conversation le 2026-11-03 : « La relecture de la tractuction malagasy est faite,c'est bon ,sans modification a faire pour le moment,tu peux checker le T045 ». Résultat : traduction acceptée en l'état, aucune correction demandée ; T045 cochée sur cette confirmation. Le nom du relecteur et ses qualifications ne sont pas précisés ; aucune identité ni compétence supplémentaire n'est supposée.

Version validée : `apps/web/src/messages/mg.json`, SHA-256 `78FE46A2BF2ACB476AA2051385E7824C8E26791AEC1C9CEE2131FA8B5AB054C0`, identique à la version testée. Aucun code ni dictionnaire modifié ; les tests ne sont pas relancés pour cette mise à jour documentaire. Les preuves de dispositifs réels et d'accessibilité manuelle restent US6/Polish ; WebKit ne vaut pas Safari iOS réel.

## US4 du 2026-11-03 — T029 à T039 réalisées

État courant : **T001 à T039 cochées, soit 39/54 tâches terminées**. Cet incrément réalise uniquement US4. Les tâches T040 à T054 restent ouvertes : US5, US6 et recette finale. Le sélecteur de langue est Français et désactivé ; aucun dictionnaire MG ni provider bilingue n'a été commencé. Les sections suivantes conservent les résultats historiques des incréments précédents.

### Réalisations

- T029–T032 : tests écrits avant les modules correspondants. Échecs initiaux constatés sur imports absents et sur l'ancienne page sans fondation. Tests de thème/stockage, client santé, composants accessibles et scénarios navigateur réels/simulés séparés.
- T033–T034 : primitives partagées adaptées au Design System (bouton, champ, sélecteur natif, carte et message). Un seul import de `tokens.css` par le package UI ; aliases Tailwind préfixés sans cycle avec les variables sémantiques. Carte 28 px, contrôle 16 px, cible 48 px, écarts 8 px, focus 3+3 et mouvement réduit. Versions CVA/clsx/tailwind-merge vérifiées puis figées dans le lockfile ; React reste une peer dependency du package UI.
- T035 : choix clair initial, sombre et système explicitement choisi, clé `kopaka.theme.v1` validée. Repli mémoire si lecture/écriture interdites, y compris quota d'écriture avec ancienne valeur encore lisible ; aucune suppression globale du stockage. Script avant hydratation, premier rendu React FR/clair puis réconciliation après montage. Seul l'attribut HTML volontairement changé avant hydratation utilise la suppression ciblée d'avertissement ; les erreurs d'hydratation restent testées.
- T036 : nonce par requête et CSP restrictive, sans `unsafe-inline`/`unsafe-eval` en production, frame-ancestors none, nosniff et no-referrer. Structure rendue dynamiquement pour le nonce, sans dépendre de l'API. Le proxy Next pose uniquement des headers et ne relaie aucun appel API. Exceptions HMR limitées au développement.
- T037 : échange direct no-store sans credentials, schéma strict partagé, délai de 3 s comprenant lecture JSON, annulation, un appel actif et rejet des réponses obsolètes. Un appel au montage puis réessai manuel, aucun polling. L'ancien succès disparaît pendant le réessai, le bouton reste focalisable et son activation est verrouillée. Une seule région polite atomique, messages sans détail interne.
- T038–T039 : page française de fondation, texte et métadonnées centralisés, lien d'évitement, thèmes, disponibilité réelle et exemples explicitement distincts. Aucun parcours de jeu ni envoi du champ. Une colonne mobile, grille dès 768, max 1200 et gouttières 16/24/32. Erreur générique et contenu lisible même sans API. Lien d'évitement explicitement tabulable sous WebKit.

### Vérifications effectives

| Commande / vérification | Résultat |
|---|---|
| Prérequis Spec Kit et checklist requirements.md | Documents présents ; 16 cochées, 0 ouverte ; marqueurs inchangés |
| `pnpm test:unit` | **52 tests Vitest + 63 tests Jest API réussis**, soit 115 tests |
| `pnpm test:e2e --project=webkit` | **9/9 réussis** après corrections clavier ; exception moteur précise ci-dessous |
| `pnpm test:e2e --project=chromium --project=firefox` | **18/18 réussis** sur la version finale |
| `pnpm build` | Réussi pour les cinq packages/apps ; build local reconstruit après les ports de recette |
| `pnpm typecheck` | Réussi pour les cinq packages/apps |
| `pnpm lint`, `pnpm format:check`, `pnpm exec prettier --check tests/e2e`, `git diff --check` | Réussis ; avertissements Git LF/CRLF seulement |
| Smoke du build local sur port temporaire 13012, API absente, largeur 320 | HTML 200, état Indisponible, contenu visible, aucun débordement ; CSP/nosniff/no-referrer présents ; capture inspectée |

Moteurs réellement lancés sous Windows : Chromium **156.0.8078.4**, Firefox **157.0**, WebKit **27.2**, via Playwright **1.64.1**. Les 27 cas correspondent à neuf scénarios par moteur, validés par les deux commandes finales ci-dessus. Les premiers passages en échec ne sont pas présentés comme réussis : résolution d'imports Next, typage strict d'une propriété optionnelle, liaison du fetch natif, encodage UTF-8 des tests et hypothèses de focus au clic ont été corrigés. Une attente UI trop courte sous compilation concurrente a échoué ; le script complet final passe sans augmenter le budget client de 3 s.

### Recette réelle et sécurité des données

Le harnais emploie les builds de production, un projet Compose isolé `kopaka-web-test-<runId>`, la base `kopaka_web_test`, PostgreSQL 15434, Redis 16381, API 13011 et web 13010. Il exécute `docker version`, Compose `up -d --wait`, le build API, `node scripts/db.mjs migrate deploy`, le build web et les démarrages de production. Chaque moteur vérifie arrêt/reprise successifs de Redis, PostgreSQL et de l'API : Indisponible pendant la panne, texte saisi conservé, retour Disponible uniquement après Réessayer. JSON invalide, 429, délai/réponse tardive et offline après chargement sont explicitement simulés dans un autre fichier.

Les secrets du run sont aléatoires, jamais transmis au build web, filtrés des logs ignorés. Le nettoyage retire uniquement les processus, conteneurs et réseaux du run, avec `compose down` **sans suppression de volumes**. Un passage interrompu a nécessité le même nettoyage ciblé du seul projet `kopaka-web-test-a415e8ae`, sans toucher aux données. Les services locaux ordinaires restent healthy. Aucune migration ni règle métier n'a été modifiée ; les 12 tests d'intégration API/persistance du rapport US3 ne sont pas revendiqués comme réexécutés dans cet incrément.

### Avertissement moteur et limites restantes

WebKit 27.2 produit un avertissement CSP pour les styles internes des sélecteurs natifs : [régression Playwright #43497](https://github.com/microsoft/playwright/issues/43497). Reproduction locale confirmée avec une page HTML ne contenant qu'un select et une CSP stricte, sans Next.js ni Kopaka. Le test n'excepte que le message exact sur cette version du moteur, annote le résultat et joint le nombre d'occurrences. Les autres erreurs CSP/hydratation restent bloquantes. Les contrôles fonctionnent, axe ne relève aucune violation et le handler inline non autorisé est effectivement bloqué. **La CSP du produit reste intacte**, aucun hash élargi ni unsafe-inline ajouté.

Les captures clair/sombre et mobile indisponible ont été inspectées. Les contrôles automatisés couvrent 320/375/768/1024/1440, cibles, bordures/icônes contrastées, focus, expansion +40 %, zoom CSS 200 %, paysage, stockage bloqué et axe. Ils ne remplacent pas les mesures et validations humaines de T052–T053 : zoom navigateur réel, lecteur d'écran, toucher, Chrome/Edge/Safari installés et Android/Safari iOS réels, réseau mobile et performances. Les captures/logs dans `test-results` sont ignorés et renouvelés par les runs.

Les choix métier, la conservation durable des logs, l'attestation MG et les autres points À VALIDER ne sont pas tranchés. Aucun hook d'extension n'est configuré. Documentation de développement et quickstart actualisés pour ce périmètre ; aucune tâche US5/US6 cochée.

## Historique US3 du 2026-11-03 — T022 à T028 réalisées

État à la fin d'US3 : T001 à T028 étaient cochées, soit **28/54 tâches terminées**. T029 à T054 restaient ouvertes. À cette étape, aucun travail US4 à US6 n'avait été commencé ; aucun frontend, règle métier ou valeur « À VALIDER » n'avait été modifié.

### Réalisation et séquence de tests

- T022 : tests écrits avant l'implémentation ; échec constaté sur l'import du service de santé absent. Les tests couvrent agrégation concurrente, délais, absence d'ancien succès, saturation par des opérations expirées, annulation, fermeture, quota et logs filtrés.
- T023 : nouveau test Supertest sur les contrôleurs réels et PostgreSQL/Redis réels, avec projet Compose isolé `kopaka-health-test-<runId>`, base `kopaka_health_test` et ports 15433/16380. La recette HTTP complète reportée depuis US2 est maintenant acquise.
- T024/T025 : lecture Prisma du singleton `sprint-1` version 1 et Redis PONG, avec résultat interne éphémère et réponses publiques strictes. Délais configurables 1000 ms par dépendance et 2000 ms au total par défaut. Les opérations expirées restent comptabilisées jusqu'à leur fin réelle, avec des capacités bornées par la concurrence et le pool ; Redis reçoit les signaux d'annulation et PostgreSQL conserve ses timeouts de connexion/requête/statement.
- T026 : quota mémoire de 30 demandes readiness/minute/IP et quatre évaluations concurrentes par défaut, sans dépendance à Redis, avec 429/Retry-After et sans nouvelle sonde au-delà des limites. Fenêtre de 60 secondes ancrée au premier appel ; adresses obtenues par socket, aucune confiance dans X-Forwarded-For. Table temporaire bornée à 4096 entrées, jamais journalisée. Une place de concurrence est libérée une seule fois à finish/close.
- T027 : `/health/live` répond 200 alive sans sonde ; `/health/ready` répond 200 ready ou 503 not_ready. HEAD ne transmet aucun corps. Un défaut de programmation est propagé au filtre 500 générique, distinct des pannes d'IO. Un test supplémentaire a d'abord reproduit la classification incorrecte d'un TypeError en panne, puis a réussi après correction et annulation des autres sondes.
- T028 : journaux stdout JSON avec uniquement les champs autorisés, UUID validé, durée non négative et diagnostics normalisés ; aucun message brut, corps, IP, URL ou secret. Catégories et procédure de diagnostic documentées dans `docs/development.md`.

### Résultats effectifs sur la version finale

| Commande / vérification | Résultat |
|---|---|
| Checklist requirements.md | 16 cochées, aucune ouverte ; marqueurs inchangés |
| `pnpm test:unit` | **27 tests Vitest + 63 tests Jest API réussis**, soit 90 tests |
| `pnpm test:integration` | **2 suites / 12 tests réussis**, incluant la persistance US1 et 11 tests de santé réels |
| `pnpm typecheck` | Réussi pour les cinq packages/apps |
| `pnpm build` | Réussi, avec génération Prisma avant build API |
| `pnpm lint`, `pnpm format:check`, `git diff --check` | Réussis ; avertissements Git LF/CRLF seulement |
| API de production, port temporaire 13001 | Live 200/alive, ready 200/ready avec services locaux réels, HEAD sans corps, query invalide 400 et logs normalisés des deux sondes |
| État des services locaux après la recette | PostgreSQL et Redis toujours démarrés et healthy |

### Scénarios Docker et absence de faux succès

1. Boot HTTP sur base isolée non migrée : live positif, ready 503 et table toujours absente ; application de la migration versionnée puis ready 200.
2. GET/HEAD/OPTIONS, réponses strictes, CORS exact permis/interdit, no-store/nosniff, UUID sûr, Allow, Retry-After et absence de cookies/credentials vérifiés.
3. Query, header et corps interdits refusés avant appel au service de santé ; aucune sonde en aval.
4. Singleton de version incorrecte ou ligne absente : 503 sans réparation automatique. Les mutations de fixture sont limitées à la nouvelle base du run et la ligne est rétablie par le test.
5. Arrêt réel puis reprise de Redis, séparément de PostgreSQL : live reste 200, ready passe à 503 puis revient à 200 sans redémarrer l'API.
6. Deux demandes autorisées sur une instance configurée pour un quota de deux, puis 429 sans nouvelle évaluation ; un header de forwarding falsifié ne contourne pas le quota et live reste accessible.
7. Quatre évaluations réellement bloquées par verrou SQL, puis cinquième demande 429 sans cinquième évaluation. Un autre scénario maintient le verrou pendant deux expirations, vérifie le budget HTTP et le nombre de requêtes SQL en attente, puis confirme le rétablissement après libération du verrou.
8. Injection explicitement identifiée d'un défaut inattendu sur la méthode du contrôleur réel : 500 générique, sans détail sensible ; aucune route artificielle ajoutée.
9. Inspection des logs JSON réels : champs autorisés uniquement, diagnostics de schéma et de panne présents, aucun secret du run ni donnée injectée dans les headers/corps.
10. Boot d'une nouvelle instance API avec les deux dépendances déjà arrêtées : HTTP vivant, readiness 503 ; reprise des services et nouvelle disponibilité positive.

Les tests n'ont arrêté que leurs services isolés ; leurs conteneurs/réseaux sont retirés par le nettoyage existant, **sans suppression de volume**. Les volumes des runs sont conservés. Aucun reset, db push, flush ou suppression de données locales n'a été utilisé. Le processus de smoke a été arrêté après vérification.

Aucun hook d'extension n'est configuré. Aucun blocage propre à US3 ne subsiste. L'indicateur navigateur, les préférences, la recette UX et les autres travaux d'US4 à US6 restent hors périmètre. La conservation durable des journaux et les décisions métier restent À VALIDER.

## Historique US2 du 2026-11-03 — T016 à T021 réalisées

Cette section décrit l'état à la fin d'US2, avant US3. Les sections Docker et premier incrément ci-dessous conservent les résultats historiques de leurs périmètres respectifs. À cette étape, T001 à T021 étaient cochées ; T022 à T054 restaient ouvertes.

### Changements et limites

- T016/T017 : tests écrits avant les modules correspondants ; échecs constatés sur les imports de schémas et middleware absents, puis réussite après implémentation. Les tests de requêtes comptent explicitement les appels aval pour prouver leur absence en cas d'entrée invalide.
- T018 : types et constantes santé/erreurs dans `packages/shared-types/src/health.ts`, sans framework.
- T019 : schémas Zod stricts pour alive, ready/not_ready et les quatre codes d'erreur. Validation query/UUID dans le sous-chemin `@kopaka/validation/server`, interdit sous condition navigateur ; aucune configuration privée n'est exportée. Le UUID canonique de 36 caractères accepte les hexadécimaux majuscules et les normalise en minuscules.
- T020 : middleware sur les chemins santé, refus de query inconnue/header invalide/corps GET ou HEAD, UUID sûr généré, 405 avec Allow, borne de corps 16 Kio, attente de fin chunked bornée à une seconde et filtre d'erreurs génériques sans message/stack/cause sensibles. Ces bornes sont techniques, sans règle métier ni SLA ajouté.
- T021 : branchement depuis `main.ts` via `configure-http.ts`, CORS d'origine exacte sans credentials, GET/HEAD/OPTIONS, X-Request-Id autorisé, validation avant réponse au preflight, no-store/nosniff et trust proxy désactivé.
- Harnais : compilation des packages workspace avant tests et exclusion des fichiers de tests des exports compilés. Les versions et dépendances restent inchangées ; installation frozen-lockfile vérifiée hors ligne.

Aucun contrôleur, sonde, limite de débit ou résultat de santé réel n'est implémenté dans US2. Les GET valides de santé restent à 404 ; les requêtes malformées sont déjà refusées et OPTIONS répond sans corps. Les serveurs de test sans contrôleur vérifient la couche HTTP, sans endpoint POST de démonstration ajouté au produit. La recette des vraies routes 200/503 et des pannes/reprises avec PostgreSQL/Redis demeure T023 en US3.

### Vérifications effectives

| Commande / contrôle | Résultat |
|---|---|
| Checklist requirements.md | 16 cochées, 0 ouverte ; aucun marqueur modifié |
| `pnpm test:unit` | **27 tests Vitest de schémas + 44 tests Jest API réussis**, dont les 18 tests API antérieurs |
| Tests HTTP | Query inconnue, UUID absent/invalide/multiple, GET/HEAD avec corps, 413, 405/Allow, chunked vide/non vide/inachevé, erreurs filtrées, CORS permis/interdit, preflight validé, absence de credentials et trust proxy false |
| Résolution Node avec `--conditions=browser` | Import de `@kopaka/validation/server` refusé avec ERR_PACKAGE_PATH_NOT_EXPORTED ; entrée publique limitée aux trois schémas de réponse |
| `pnpm test:integration` | **1 suite / 1 test Docker de migration/persistance réussi** ; non-régression d'US1, sans suppression de volume |
| `pnpm typecheck` | Réussi sur les cinq packages/apps |
| `pnpm build` | Réussi sur les cinq packages/apps, génération Prisma avant build API |
| `pnpm install --frozen-lockfile --offline --store-dir .pnpm-store` | Réussi, lockfile cohérent et inchangé |
| `pnpm lint`, `pnpm format:check`, `git diff --check` | Réussis ; seulement avertissements Git LF/CRLF sur fichiers préexistants |
| Processus API de production, port temporaire 13001 | GET valide 404 attendu ; query invalide 400 avec CORS exact/no-store ; POST santé 405 avec Allow ; UUID invalide 400 et header sûr, sans détail injecté dans le corps |

Le processus de smoke a été arrêté après vérification. Aucun frontend, donnée métier, règle « À VALIDER » ou volume existant n'a été modifié par cette story. Aucun hook d'extension n'est configuré. Aucun blocage technique propre aux six tâches US2 ne subsiste ; la preuve HTTP complète reportée à T023 reste explicitement non acquise.

## Reprise Docker / Prisma du 2026-11-03 — T009 à T012 validées

Cette reprise remplace le blocage Docker décrit dans l'historique ci-dessous. T009, T010, T011 et T012 sont maintenant cochées après réussite effective. T001 à T015 sont donc cochées ; T016 à T054 restent ouvertes. Aucune autre User Story n'a été commencée et aucun code applicatif, script ou fichier Compose n'a été modifié pendant cette reprise.

### Environnement et configuration

- Docker Desktop est installé dans `%LOCALAPPDATA%/Programs/DockerDesktop`. Son dossier `resources/bin` a été ajouté uniquement au PATH des commandes de cette session, sans changement permanent du système.
- Client et moteur Docker : 29.9.2 ; Docker Compose : v5.6.1 ; contexte `desktop-linux`, moteur Linux. Le premier démarrage a dépassé le délai de 40 secondes, puis le moteur est devenu accessible sans intervention manuelle.
- Aucun conteneur ni volume n'était présent lors de l'inventaire initial du moteur accessible.
- `infra/docker/.env` et `apps/api/.env` étaient absents. Ils ont été créés exclusivement à partir des exemples existants, avec un mot de passe local aléatoire commun à PostgreSQL et DATABASE_URL, sans affichage de sa valeur. Aucun fichier existant n'a été écrasé. Les deux fichiers sont ignorés par Git.
- Configuration API validée par le schéma Zod existant ; cohérence contrôlée entre URL, ports, base et identifiants Compose/API, sans afficher de secret.
- Images conservées avec leurs digests existants : PostgreSQL 17.11 et Redis 7.4.12 observés à l'exécution. Ports limités à `127.0.0.1:5432` et `127.0.0.1:6379`.

### Commandes exécutées et résultats

| Commande / vérification | Résultat |
|---|---|
| `docker --version`, `docker compose version`, `docker context show`, `docker info --format '{{.ServerVersion}} {{.OSType}}'` | Client, Compose et moteur Linux accessibles après démarrage de Desktop |
| `docker desktop start --timeout 40` puis `docker desktop start --timeout 50` | Premier délai expiré ; second appel confirme Desktop démarré |
| `docker compose -f infra/docker/compose.yaml config --quiet` avant configuration | Refus attendu : POSTGRES_PASSWORD absent |
| Même commande après chargement en mémoire des variables de `infra/docker/.env` | Réussite ; sortie résolue volontairement non affichée pour protéger le secret |
| `git check-ignore infra/docker/.env apps/api/.env` | Les deux fichiers locaux sont ignorés |
| `docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait` | Téléchargement des images figées, création des services et healthchecks positifs |
| `docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml ps` | PostgreSQL et Redis `healthy`, ports loopback uniquement |
| `docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml exec -T postgres pg_isready -U kopaka -d kopaka` | Accepte les connexions |
| `docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml exec -T redis redis-cli ping` | `PONG` |
| `pnpm db:generate` | Génération Prisma Client 7.10.1 réussie |
| `pnpm exec prisma validate --config prisma/prisma.config.ts` | Schéma valide |
| `pnpm db:migrate:deploy` | Migration `0001_platform_bootstrap` appliquée avec succès sur la base locale |
| `pnpm db:migrate:status` | Une migration présente, schéma à jour ; résultat confirmé en fin de reprise |
| Lecture SQL du singleton, seconde exécution de `node scripts/db.mjs migrate deploy`, nouvelle lecture | `sprint-1`, version 1, ligne et date strictement identiques ; le script est celui de `db:migrate:deploy` |
| `pnpm test:integration` avec le dossier Docker ajouté au PATH du processus | **1 suite / 1 test réussis**, 24,431 secondes |

### Persistance et isolation réellement vérifiées

Le test existant `apps/api/test/migration.integration-spec.ts` a utilisé le projet `kopaka-test-59a8ff47`, la base `kopaka_test` et le port 15432, distincts du projet local. Ses assertions ont confirmé :

1. Absence initiale de la table sur la base isolée vide.
2. Création d'une seule ligne `sprint-1`, version 1 et date initialisée par migration.
3. Deuxième application de l'historique sans doublon ni mutation de la ligne/date.
4. Redémarrage normal PostgreSQL suivi d'une relecture strictement identique.
5. Refus SQL d'un autre identifiant de singleton et d'une version non positive.

Le nettoyage prévu par ce test a arrêté et retiré uniquement ses conteneurs/réseau via `compose down`, **sans option de suppression des volumes**. Le volume `kopaka-test-59a8ff47_postgres-data` est conservé. Le volume local `docker_postgres-data` et le volume anonyme créé par l'image Redis sont également conservés. Aucun volume ni aucune donnée existante n'a été supprimé ; aucun reset, db push, flush ou `down -v` n'a été utilisé.

### État final et limites

Les services locaux `docker-postgres-1` et `docker-redis-1` restent démarrés et `healthy`. Aucun blocage ne subsiste pour T009 à T012. Aucune correction de code ou d'architecture n'a été nécessaire. Seuls les quatre marqueurs correspondants de tasks.md et ce rapport ont été mis à jour, en plus des fichiers env locaux ignorés.

La recette du poste propre par une autre personne demeure US6/T050 ; les validations des autres stories restent hors périmètre. Les résultats antérieurs ci-dessous sont conservés comme historique et ne décrivent plus l'état Docker actuel.

## Historique — validation initiale avant installation de Docker

Date : 2026-11-03. P?rim?tre : T001?T015 seulement. Aucun travail US2?US6 commenc? ; aucun endpoint de sant? ou fonctionnalit? m?tier.

## R?alisations

Monorepo priv? pnpm 10.8.0/Turbo 2 avec versions exactes et lockfile ; Next 16 / React 19, Nest 12 ESM / TypeScript 6 ; packages ? entr?es minimales sans contrats ni composants fonctionnels. Page statique FR/clair bas?e sur tokens existants, aucun asset distant. Configuration Zod, clients singleton Prisma/Redis, arr?t de ressources, Prisma 7 et migration SQL versionn?e ; Compose loopback et images v?rifi?es par digest.

Sources de versions et contraintes : docs/toolchain-versions.json et docs/docker-images.json. La g?n?ration Prisma centralis?e requiert @prisma/client dans l'outillage racine en plus de la d?pendance API. Le build API reste non cach? pour ne jamais omettre la g?n?ration apr?s installation propre. Le graphe utilise la t?che compile avec ^compile ; les scripts build filtr?s d?l?guent au graphe sans r?cursion.

## R?sultats obtenus

| Contr?le | R?sultat |
|---|---|
| Installation initiale avec peers stricts | R?ussie ; versions exactes, aucun changement majeur implicite |
| pnpm install --frozen-lockfile --offline --store-dir .pnpm-store | R?ussi avec le cache t?l?charg? ; ce n'est pas une recette ind?pendante depuis un autre poste |
| Build web filtr? | R?ussi ; route / pr?rendue |
| Build API filtr? | R?ussi ; packages construits et g?n?ration Prisma explicite |
| pnpm lint | R?ussi |
| pnpm format:check | R?ussi |
| pnpm typecheck | R?ussi sur les cinq packages/apps |
| pnpm test:unit | 2 suites Jest, 18 tests r?ussis ; aucune suite UI existante ? ce stade |
| TDD configuration | ?chec avant impl?mentation : config.schema.js absent, puis passage apr?s ajout |
| Boot Nest sans donn?es / fermeture | Test r?ussi avec connexions loopback injoignables ; PING refus? sans blocage du boot |
| Configuration invalide sur processus API compil? | Code 1, diagnostic DATABASE_URL, valeur inject?e absente de stderr |
| Smoke API production | HTTP 404 attendu sur / au port d?di? 13001, donn?es indisponibles ; aucune fausse route de sant? |
| Smoke web production sans API | HTTP 200 et contenu Kopaka au port d?di? 13000 |
| Dev web filtr? | D?marrage Next et HTTP 200 sur / |
| Dev API filtr? | Construction, observation tsc sans erreur, HTTP 404 sur / |
| pnpm db:generate | R?ussi, Prisma 7.10.1 |
| prisma validate --config prisma/prisma.config.ts | Sch?ma valide |
| Migration sans DATABASE_URL | Refus attendu sans valeur sensible |
| pnpm test:integration | BLOQU?/?CHEC : spawnSync docker ENOENT ; aucun deploy r?el ex?cut? |

## T?ches et preuves manquantes

T001?T008 et T013?T015 sont coch?es apr?s v?rification de leur r?alisation. T009?T012 restent ouvertes par prudence : test d'int?gration ?crit, Compose et migration cr??s, CLI/g?n?ration configur?es, mais aucun Docker disponible pour v?rifier l'ensemble deploy/statut/persistance. Ces t?ches ne doivent pas ?tre interpr?t?es comme valid?es uniquement parce que leurs fichiers existent.

Reprise : installer/d?marrer Docker avec Compose v2, configurer les env selon docs/development.md, relancer pnpm test:integration puis db:migrate:deploy et db:migrate:status dans l'environnement local. Le test utilise son propre projet/base/ports ; aucun volume de d?veloppement n'est supprim?. Comparer singleton et horodatage apr?s deuxi?me deploy et red?marrage normal. Cocher les t?ches restantes seulement apr?s r?ussite effective.

La recette par une autre personne sur copie propre reste US6/T050. Relecture MG, appareils r?els, accessibilit? compl?te, CSP, contrats HTTP et panne/reprise de sant? restent hors de cet incr?ment. Le Sprint 1 complet n'est pas d?clar? livr?.

Les limites connues d'analyse restent applicables aux stories suivantes : d?pendance T013?T021, recette HTTP US2 apr?s US3, CSP production ? v?rifier et candidat fig? pour audits parall?les. Aucune d?cision m?tier ? ? VALIDER ? n'a ?t? transform?e en r?gle.
