# Petit Nuage

Minuteur de concentration : pendant que tu travailles, un petit nuage fait pleuvoir dans un verre.
Quand le verre est plein, c'est la pause.

## Brief

- **Pour qui :** un·e étudiant·e qui veut réviser sans se disperser.
- **Ce que l'app fait :**
  - minuteur travail / petite pause / grande pause, durées réglables (25 / 5 / 15 min par défaut) ;
  - grande pause toutes les 4 sessions (réglable) ;
  - démarrer, mettre en pause, recommencer ;
  - un nuage mignon remplit un verre de pluie pendant le travail ; pendant la pause il dort, le soleil sort
    et le verre se vide (arc-en-ciel pour la grande pause) ;
  - petite mélodie à la fin de chaque phase ;
  - compteur des verres remplis aujourd'hui, conservé après rechargement (remis à 0 le lendemain) ;
  - réglages conservés dans le navigateur ;
  - page qui s'explique d'elle-même (à quoi ça sert, comment commencer, règles et pourquoi).
- **Ce qu'elle ne fait pas :** pas de compte, pas de serveur, pas de liste de tâches, pas de statistiques
  sur plusieurs jours, pas de notifications système, pas d'appli mobile. Le minuteur en cours n'est pas
  conservé si on recharge la page. À la fin d'une phase, la suivante attend qu'on appuie sur « Démarrer ».
- **Stack :** HTML + CSS + JavaScript sans framework ni dépendance. Tests avec `node --test`.
- **Fini quand :** la page s'ouvre, un cycle complet marche en mode démo, les tests passent,
  et quelqu'un qui ne connaît pas l'app comprend quoi faire.

## Lancer

Ouvrir `index.html` dans le navigateur (double-clic).

**Mode démo** (1 minute = 1 seconde) : ajouter `?demo` à la fin de l'adresse, par exemple
`file:///.../index.html?demo`.

## Tester

```
npm test
```

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | la page, le dessin SVG du nuage et du verre, le texte d'explication |
| `style.css` | couleurs pastel par phase, animations (pluie, nuage, soleil) |
| `timer.js` | logique pure du minuteur (aucun accès à la page) |
| `app.js` | relie la logique à la page : boutons, son, sauvegarde, affichage |
| `timer.test.js` | tests de la logique |
