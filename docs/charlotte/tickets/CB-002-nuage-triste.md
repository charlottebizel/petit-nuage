---
id: CB-002
titre: Le nuage devient triste si on quitte la page ou abandonne la session
statut: en cours            # ouvert | en cours | bloqué | terminé | abandonné
branche: nuage-triste
créé: 2026-11-17
mis-à-jour: 2026-11-17
---
## Contexte

Pousser l'utilisateur à rester concentré : pendant une session de travail en cours, quitter la page
ou abandonner le décompte rend le nuage triste et assombrit le ciel. Une session complète le console.

## Critères d'acceptation

- [x] Quitter l'onglet 5 s ou plus pendant le travail en cours rend le nuage triste et le ciel gris.
- [x] Une absence de moins de 5 s est pardonnée.
- [x] Quitter la page pendant une pause, ou minuteur arrêté, ne change rien.
- [x] « Pause » pendant le travail rend le nuage inquiet ; « Reprendre » le rassure.
- [x] « Recommencer » sur une session de travail commencée rend le nuage triste.
- [x] Le nuage reste triste en reprenant, et retrouve le sourire à la fin d'une session complète.
- [x] Un message explique pourquoi le nuage est triste, et la règle est écrite dans « Comment ça marche ? ».
- [ ] Testé à la main dans un vrai navigateur, en changeant vraiment d'onglet.
- [ ] Fusionné dans `master` par une PR.

## Journal du ticket

- 2026-11-17 : créé. Logique dans `timer.js` (6 tests), interface vérifiée par captures en Chrome headless
  (départ simulé avec `document.hidden`, pas un vrai changement d'onglet).
