---
id: CB-001
titre: Installer le kit agent
statut: en cours            # ouvert | en cours | bloqué | terminé | abandonné
branche: kit-agent
créé: 2026-11-17
mis-à-jour: 2026-11-17
---
## Contexte

Partie 2 de l'atelier « votre application, puis votre skill » : poser le kit de départ dans le dépôt
pour que les agents des deux membres (Charlotte et Loïc) suivent les mêmes règles et tiennent leur état dans le dépôt.

## Critères d'acceptation

- [x] `.agents/`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `consignes/` et `docs/decisions/` sont à la racine du dépôt.
- [x] `AGENTS.md` contient le nom du projet, sa phrase de présentation et la table des commandes remplie.
- [ ] Le tableau du groupe contient le nom git et la partie de Loïc.
- [x] Les skills de `.agents/skills/` sont copiés dans `.claude/skills/`.
- [x] `docs/charlotte/` contient `STATUS.md`, `tickets/` et `journal/`.
- [ ] Une nouvelle session de Claude Code lit `AGENTS.md` et voit le skill `bureaucratie`.
- [ ] Le kit est fusionné dans `master` par une PR.

## Journal du ticket

- 2026-11-17 : créé. Kit copié sur la branche `kit-agent`, `AGENTS.md` rempli pour Charlotte, skills copiés dans `.claude/skills/`.
