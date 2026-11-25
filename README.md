# ⌨️ KeyTrain — entraîneur de frappe QWERTY 100 % local

Un petit trainer de dactylo pour **clavier QWERTY**, pensé pour fonctionner **sans aucune connexion Internet** (idéal derrière un proxy d'entreprise) : tout est en HTML/CSS/JS vanilla, zéro dépendance externe, zéro appel réseau.

## 🚀 Lancer l'application

Aucune installation, aucun build :

- **Méthode 1 (la plus simple)** : ouvrir directement `index.html` dans ton navigateur (double-clic, fonctionne en `file://`).
- **Méthode 2** : servir le dossier en local, par exemple :
  ```bash
  python3 -m http.server 8000
  # puis ouvrir http://localhost:8000
  ```

## 🎯 Fonctionnalités

- **Clavier QWERTY virtuel codé par doigt** : chaque touche a la couleur du doigt qui doit la frapper ; la prochaine touche pulse et le doigt concerné est mis en évidence dans la légende. Les petits traits sur `F` et `J` rappellent la ligne de base.
- **4 modes d'exercice** :
  - 🎯 **Touches** : ligne de base `ASDF JKL;` puis rangée haute, puis tout le clavier.
  - 📝 **Mots** : mots aléatoires, niveaux facile / normal / difficile.
  - 💬 **Phrases** : phrases complètes (majuscules, ponctuation).
  - ⏱️ **Chrono** : sprint de 30 / 60 / 120 s avec génération de mots infinie.
- **Langue FR ou EN** (les accents français sont retirés à la génération pour rester tapables sur n'importe quelle disposition).
- **Métriques en direct** : vitesse en MPM (mots/min, = WPM), précision %, erreurs, temps, barre de progression.
- **Écran de résultats** : record personnel, courbe de vitesse pendant la session.
- **Progression sauvegardée localement** (`localStorage`) : historique des sessions, graphique d'évolution, et **carte de chaleur des erreurs** sur le clavier pour visualiser tes touches faibles.
- **Sons** générés en WebAudio (aucun fichier audio), désactivables.
- Raccourcis : `Entrée` pour lancer/rejouer, `Retour arrière` pour corriger.

## 🗂️ Structure

```
index.html          page unique (3 vues : accueil, entraînement, progression)
css/style.css       thème sombre néon, 100 % local
js/words-fr.js      listes de mots/phrases FR
js/words-en.js      listes de mots/phrases EN
js/app.js           logique : génération de texte, saisie, clavier, stats, sons
```

## 🔒 Confidentialité

Rien ne quitte ta machine : pas de compte, pas de télémétrie, pas de requête externe. L'historique reste dans le `localStorage` de ton navigateur (bouton « Effacer mon historique » sur la page Progression).
