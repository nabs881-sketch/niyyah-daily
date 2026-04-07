# Niyyah Daily - PRD

## Original Problem Statement
L'utilisateur avait une application HTML islamique de pratique spirituelle quotidienne (Niyyah Daily). Problèmes signalés :
1. L'app ne fonctionne plus le lendemain (bug de persistance avec la date)
2. Les sons ne se lisent pas
3. Demande d'amélioration du design avec fond islamique attractif

## User Personas
- **Musulmans pratiquants** : Cherchent à suivre leurs prières quotidiennes et dhikr
- **Nouveaux pratiquants** : Veulent un guide simple pour établir une routine spirituelle
- **Utilisateurs mobiles** : Principalement sur téléphone, ont besoin d'une app PWA

## Core Requirements (Static)
- Checklist des 5 prières quotidiennes (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Wird matin et soir avec liste de sourates
- Compteur Tasbih (0-99)
- Boussole Qibla
- Horaires de prière par ville
- Système de streak et statistiques
- Design islamique attractif
- Persistance des données (localStorage)
- Détection dynamique du changement de jour

## What's Been Implemented (Jan 2026)
- [x] **Bug fix - Date dynamique** : Vérification de la date chaque minute
- [x] **Bug fix - Tasbih** : Compteur fonctionne correctement
- [x] **Nouveau design** : Fond vert foncé islamique avec glassmorphism
- [x] **5 prières** : Checkboxes avec animations et texte arabe
- [x] **Dhikr** : Section avec 3 éléments (Ayat al-Kursi, Alhamdulillah, Bismillah)
- [x] **Wird matin/soir** : Listes complètes avec progression
- [x] **Tasbih** : Compteur interactif jusqu'à 99
- [x] **Qibla** : Boussole avec direction vers La Mecque
- [x] **Stats** : Streak, heatmap 14 jours, score quotidien
- [x] **Modal intention** : Choix d'intention au démarrage
- [x] **Hadith du jour** : Citation spirituelle quotidienne

## Prioritized Backlog

### P0 - Critical
- [ ] Sons/audio : Implémenter les récitations audio

### P1 - High Priority
- [ ] Mode Méditation : Timer avec sons ambiants
- [ ] Lecteur Coran : Sourates avec audio Alafasy
- [ ] PWA Service Worker : Mode hors-ligne complet

### P2 - Medium Priority
- [ ] Système Premium : 4 niveaux débloquables
- [ ] Mode Tawba : Retour après absence
- [ ] Bilan hebdomadaire : Résumé de la semaine
- [ ] Onboarding : Écrans d'introduction

### P3 - Nice to Have
- [ ] Notifications : Rappels de prière
- [ ] Sync cloud : Sauvegarde des données
- [ ] Thèmes : Mode clair/sombre personnalisable

## Tech Stack
- Frontend: React 18 + Tailwind CSS + Framer Motion
- Storage: localStorage (client-side)
- API: Aladhan API pour horaires de prière
- Design: Glassmorphism, Playfair Display + Outfit fonts

## Architecture
```
/app/frontend/src/
├── App.js              # Main component with all views
├── App.css             # Custom styles
├── index.css           # Tailwind + global styles
├── lib/
│   ├── storage.js      # localStorage utilities
│   └── prayers.js      # Prayer data and API calls
```
