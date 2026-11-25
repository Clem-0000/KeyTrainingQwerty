# ⌨️ QwertyLab — Entraîneur de frappe QWERTY hors-ligne

Trainer de dactylo au design néon, **100 % hors-ligne** (aucune ressource externe, aucun appel réseau) — parfait derrière un proxy d'entreprise.

## Lancer

Ouvre simplement `index.html` dans ton navigateur (`file://` fonctionne). Ou :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Fonctionnalités

- 🎓 **Cours progressifs** — 11 leçons, de la rangée de base (`asdf jkl;`) jusqu'aux phrases complètes, avec étoiles et meilleur WPM par leçon.
- ⚡ **Cadence ciblée** — génère automatiquement des mots contenant **tes touches les plus faibles**.
- 🔥 **Mots brûlants** — sprint de 30 s / 60 s / 2 min sur des mots aléatoires.
- 🤚 **Guide de placement** — schéma des mains : le doigt recommandé s'illumine pour chaque caractère.
- ⌨️ **Clavier virtuel** — la touche à presser s'illumine, code couleur par doigt, bosses F/J affichées.
- 📊 **Stats locales** — historique, courbe WPM/précision (SVG), classement des touches à retravailler. Tout reste dans `localStorage`.
- 🚗 **Piste de course** — barre de progression ludique pendant la frappe.

## Raccourcis

| Touche | Action |
|---|---|
| `Échap` | Quitter la session |
| `Tab` | Recommencer |
| `Entrée` (sur résultat) | Rejouer |

Aucune dépendance, aucun build. HTML/CSS/JS vanilla.
