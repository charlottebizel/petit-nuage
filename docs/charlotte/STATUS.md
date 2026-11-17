# État de Charlotte, mis à jour le 2026-11-17

## Où j'en suis

Petit Nuage marche (17 tests verts) ; `master` est publié sur GitHub.
Le kit agent est commité sur `kit-agent` ; le nuage triste est fait sur `nuage-triste` (partie de `kit-agent`), pas encore commité.
Ce qui bloque : il manque la ligne de Loïc dans `AGENTS.md`.

## Tickets ouverts

| Ticket | Sujet | Statut |
| --- | --- | --- |
| CB-001 | Installer le kit agent | en cours |
| CB-002 | Nuage triste si on quitte la page | en cours |

## Prochaine action

1. Tester `index.html?demo` à la main : lancer, changer d'onglet plus de 5 s, revenir : le nuage doit être triste.
2. Commiter `nuage-triste`, pousser les branches et ouvrir les PR vers `master`.
3. Compléter la ligne de Loïc dans `AGENTS.md`.
4. Partie 3 : écrire à la main la v1 du skill de stack (renommer `.agents/skills/ma-stack/`).
