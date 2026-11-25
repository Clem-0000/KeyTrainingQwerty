# ⌨️ KeyTrain — entraîneur de frappe QWERTY 100 % local

Un petit trainer de dactylo pour **clavier QWERTY**, pensé pour fonctionner **sans aucune connexion Internet** (idéal derrière un proxy d'entreprise) : tout est en HTML/CSS/JS vanilla, zéro dépendance externe, zéro appel réseau.

## 🚀 Lancer l'application

Aucune installation, aucun build :

- **Méthode 1 (la plus simple, 100 % hors-ligne)** : ouvrir directement `index.html` dans ton navigateur (double-clic, fonctionne en `file://`).
- **Méthode 2** : servir le dossier en local, par exemple :
  ```bash
  python3 -m http.server 8000
  # puis ouvrir http://localhost:8000
  ```

## 🌐 Version en ligne (GitHub Pages)

Le dépôt étant public, l'application peut être servie gratuitement par **GitHub Pages** :

1. Aller dans **Settings → Pages** du dépôt.
2. « Build and deployment » → Source : **Deploy from a branch**.
3. Branche : `vibe/keytrain-offline-cae9ad` (ou `main` après fusion de la PR), dossier : `/ (root)` → **Save**.

L'application est alors disponible à l'adresse :

👉 **https://clem-0000.github.io/KeyTrainingQwerty/**

(Toutes les ressources sont en chemins relatifs, donc le site fonctionne aussi sous ce sous-chemin. Le déploiement prend ~1 minute après chaque push sur la branche source.)


## 🎯 Fonctionnalités

### 🎮 Cours gamifié (façon TypingClub)
- **21 leçons progressives** sur la carte des niveaux : repères `F`/`J` → ligne de base → chaque doigt/rangée → chiffres → majuscules → ponctuation → phrases → sprint. Chaque leçon n'introduit que quelques nouvelles touches et **débloque la suivante** (1 ⭐ minimum).
- **Étoiles par leçon** : 3 ⭐ à ≥ 95 % de précision, 2 ⭐ à ≥ 85 %, 1 ⭐ à ≥ 70 %.
- **XP et niveaux de joueur** : chaque session rapporte de l'XP (caractères justes + bonus étoiles), barre de progression vers le niveau suivant dans le header, fanfare 🎉 au passage de niveau.
- **13 badges** à débloquer (Sans faute, Éclair 80 MPM, Diplômé, série de 7 jours…), avec toast de félicitation.
- **Série de jours 🔥** : nombre de jours d'entraînement consécutifs.
- Modale d'intro de leçon (nouvelles touches en couleur de doigt) + écran de résultats animé (étoiles, XP, badges, bouton « Leçon suivante ▶ »).

### 🏋️ Entraînement libre
- **4 modes** : 🎯 touches (ligne de base → tout le clavier), 📝 mots (facile/normal/difficile), 💬 phrases, ⏱️ chrono 30/60/120 s (texte infini).
- **Langue FR ou EN** (accents retirés à la génération pour rester tapables sur toute disposition).

### ⌨️ Clavier QWERTY virtuel codé par doigt
Chaque touche a la couleur du doigt qui doit la frapper ; la prochaine touche pulse et le doigt concerné s'illumine dans la légende. Repères sur `F` et `J`.

### 📊 Progression
- Métriques en direct : **MPM (WPM)**, précision %, erreurs, temps, barre de progression.
- Historique `localStorage` : graphique d'évolution, records, **carte de chaleur des erreurs** sur le clavier (tes touches faibles en rouge).
- Sons générés en WebAudio (aucun fichier), désactivables. Raccourcis : `Entrée` pour lancer, `Retour arrière` pour corriger.

## 🗂️ Structure

```
index.html          page unique (vues : Cours, Libre, Entraînement, Progression + modales)
css/style.css       thème sombre néon + couche gamification, 100 % local
js/words-fr.js      listes de mots/phrases FR
js/words-en.js      listes de mots/phrases EN
js/lessons.js       curriculum (21 leçons QWERTY) + 13 badges
js/app.js           logique : jeu (XP/étoiles/badges/série), génération, saisie, clavier, stats, sons
tests/              tests Node sans dépendance (logique + intégration DOM via shim)
```

## 🔒 Confidentialité

Rien ne quitte ta machine : pas de compte, pas de télémétrie, pas de requête externe. L'historique reste dans le `localStorage` de ton navigateur (bouton « Effacer mon historique » sur la page Progression).
