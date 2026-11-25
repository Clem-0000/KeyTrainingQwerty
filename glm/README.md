# ⌨️ QwertyLab — apprends à taper vite, sans faute

Entraîneur de frappe QWERTY **gamifié à la TypingClub**, **100 % hors-ligne** (aucune ressource externe, aucun appel réseau — parfait derrière un proxy d'entreprise).

## Lancer

Ouvre `index.html` dans ton navigateur (`file://` fonctionne), ou :

```bash
python3 -m http.server 8000
```

## 🎮 Le parcours

8 unités, 26 leçons, déblocage progressif — de la rangée de base (`F J`) jusqu'aux phrases complètes :

1. **La rangée de base** — F/J, D/K, S/L, A/; puis révision `asdf jkl;`
2. **La rangée du haut** — Q/P, W/O, E/I, R T U Y, révision `qwerty uiop`
3. **La rangée du bas** — Z et /, X et ., C et ,, V et N, B
4. **Symboles courants** — tiret, crochets, apostrophe
5. **Les chiffres** — 1-5, 6-0
6. **Lettres majuscules** — Maj gauche/droite
7. **Mots entiers** — courts, courants, rapides
8. **Phrases** — le vrai terrain

## ✨ Gamification

- ⭐ **1 à 3 étoiles par leçon** : 1★ = 85 % de précision · 2★ = 92 % · 3★ = 95 % + objectif WPM
- 🚀 **Déblocage progressif** : la leçon suivante s'ouvre quand la précédente est validée
- 📈 **XP et niveaux** : barre d'expérience, +XP à chaque session
- 🔥 **Série quotidienne** (streak) : reviens chaque jour pour la garder vivante
- 🏅 **10 badges** à débloquer (Sans faute, Éclair, Habitude, Diplômé, Maître du clavier…), avec notifications toast
- 🎉 **Confettis** et sons (WebAudio générés, aucun fichier) quand tu décroches les 3★
- 🗺️ Carte « **Continuer** » : un bouton pour reprendre exactement où tu t'étais arrêté

## 🤚 Pédagogie visuelle

- **Clavier virtuel** : la touche à presser s'illumine, **code couleur par doigt**, bosses F/J repérées
- **Schéma des mains** : le doigt recommandé s'allume à chaque caractère
- **Écran d'intro par leçon** : nouvelles touches affichées en grand + conseil de placement
- **Erreur bloquante** : une faute n'avance pas le texte, la touche fausse clignote — tu corriges jusqu'à juste

## 📊 Progrès

WPM/précision en direct, historique, courbe d'évolution, et le top des **touches à retravailler**. Tout est stocké dans le `localStorage` du navigateur — rien ne sort de ta machine.

## Raccourcis

| Touche | Action |
|---|---|
| `Échap` | Quitter la leçon en cours |

Aucune dépendance, aucun build : HTML/CSS/JS vanilla.
