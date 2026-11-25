# Keycraft QWERTY — Studio d’apprentissage tactile QWERTY & US-International

Application web conçue pour apprendre et maîtriser la frappe à 10 doigts sur un clavier **QWERTY**, avec un accompagnement dédié aux **francophones** (transition depuis l’AZERTY, programmation et accents français via la disposition **QWERTY US-International**).

## Fonctionnalités clés

- **Parcours progressif en 24 leçons (6 modules)** :
  1. Rangée de repos (*Home Row* — ancrage tactile `F` et `J`)
  2. Rangée supérieure (`QWERTYUIOP`)
  3. Rangée inférieure (`ZXCVBNM` + ponctuation directe)
  4. Déprogrammation des réflexes **AZERTY → QWERTY** (`Q/A`, `W/Z`, `M/;`, ponctuation)
  5. Majuscules au **Shift croisé**, chiffres directs `1–0` et crochets `() [] {}`
  6. Maîtrise Pro : opérateurs de code, shell, français fluide et **accents français US-International** (`é è ê à ç`)
- **Clavier mécanique ANSI 60% interactif (grille proportionnelle 60 colonnes)** :
  - Guidage biomécanique des 10 doigts + schéma des deux mains en temps réel
  - Indication automatique du **Shift de la main opposée** et des séquences de **touches mortes US-International** en 2 étapes
  - Option **Repères ex-AZERTY** (visualiser les touches déplacées)
  - Mode **Clavier muet (Aveugle)** pour valider sa mémoire musculaire sans tricher à l’écran
  - Mode **Forcer QWERTY (OS AZERTY)** traduisant les positions physiques (`event.code`) même si votre système est encore réglé en AZERTY
- **Drill adaptatif intelligent** : génère des exercices sur mesure à partir de vos touches les plus lentes (ms) ou sujettes aux fautes.
- **Carte thermique (Heatmap) & Confusions récurrentes** : analyse la précision et la latence par touche ainsi que vos inversions fréquentes (ex. *Attendu `Q` → Tapé `A`*).
- **Synthétiseur acoustique Web Audio** : sons mécaniques synthétisés localement (*Thock PBT*, *Switch Tactile*, *Machine à écrire* ou *Muet*), sans aucun fichier audio externe.

## Lancement local

Aucune étape de build ni dépendance lourde requise. Servez le dossier via n’importe quel serveur HTTP statique :

```bash
python3 -m http.server 4173
```

Puis ouvrez `http://localhost:4173`.
