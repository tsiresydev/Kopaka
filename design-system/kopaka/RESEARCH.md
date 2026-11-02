# Recherches UI UX Pro Max

Le 2 novembre 2026 : lecture intégrale de SKILL.md en UTF-8, inventaire des scripts search/core/design_system/reasoning_contract/validate_data et tests ; consultation de `search.py --help`, examen du CLI et de sa persistance. Python disponible ; aucune installation. Stack Next.js/TypeScript identifiée dans README/constitution. Références locales lues : README, constitution, Spec 002 Domino, décisions produit.

Préfixe des commandes : `python .agents/skills/ui-ux-pro-max/scripts/search.py`.

| Requête et paramètres exécutés | Résultat et décision |
|---|---|
| `"online board game platform" --design-system -p Kopaka -f markdown` | Card & Board Game, Feature-Rich Showcase, vert/or, 3D & Hyperrealism, Inter. Catégorie adaptée, effets à revoir |
| `"multiplayer gaming platform" --domain product` | Gaming puis Card & Board Game ; second résultat plus pertinent, jeu au centre |
| `"domino game interface" --domain ux` | Aucun résultat ; une relance effectuée ci-dessous |
| `"domino touch selection" --domain ux` | Touch Spacing / Target Size / Touch Friendly ; 8px de séparation. Aucune règle spécifique Domino trouvée |
| `"social gaming lobby" --domain style` | Vibrant & Block-based, Pixel Art, Cyberpunk ; blocs retenus, néon/glitch exclus |
| `"mobile-first gaming UI" --domain color` | Gaming violet/rose ; alternative écartée |
| `"board game" --domain color` | Card & Board Game vert/or ; base retenue et adaptée jour/nuit |
| `"board game flat design" --design-system -p Kopaka -f markdown` | Toujours 3D ; une relance n'a pas résolu la contradiction, arbitrage documenté |
| `"playful modern" --domain typography` | Fredoka/Nunito et Baloo/Comic Neue trop enfantins ; Outfit/Work Sans pertinent |
| `"geometric modern" --domain typography` | Geometric Modern Outfit/Work Sans en premier, choix confirmé |
| `"dragging movements" --domain ux` | Alternative pointer simple et clavier |
| `"keyboard focus modal" --domain ux` | Focus visible et non masqué |
| `"theme fonts performance" --stack nextjs` | Polices locales/framework, variables, layout racine ; guide d'intégration |

Persistance utilisée après examen :

```powershell
python .agents/skills/ui-ux-pro-max/scripts/search.py 'online board game platform' --design-system --persist -p Kopaka --output-dir . -f markdown
```

MASTER généré lu intégralement, archivé dans `GENERATION-BRUTE.md`, puis édité pour Kopaka. Aucun design antérieur présent, aucune utilisation de `--force`. Précisions de page rédigées à la main pour éviter de réinjecter les recommandations génériques.

Les résultats BM25 sont des recommandations. Aucun résultat ne valide les règles de Domino. Les snippets bruts présentent une contradiction 3D et un contraste CTA insuffisant ; ils ne sont pas normatifs. Le choix de palette, le double thème et les interactions constituent la synthèse de conception de cette livraison. Aucun paquet 3D/GSAP ni service distant ajouté.
