# Niyyah Daily - PRD

## Original Problem Statement
L'utilisateur avait une application HTML islamique "Niyyah Daily" (3070 lignes) avec 3 problèmes :
1. L'app ne fonctionne plus le lendemain (bug de persistance avec la date)
2. Les sons ne se lisent pas
3. Demande d'amélioration du design avec fond islamique attractif

## User Personas
- **Musulmans pratiquants** : Suivre leurs prières quotidiennes et dhikr
- **Nouveaux pratiquants** : Guide simple pour établir une routine spirituelle
- **Utilisateurs mobiles** : App PWA pour téléphone

## Core Requirements (Static)
- Checklist des 5 prières quotidiennes avec texte arabe
- Wird matin et soir avec liste de sourates
- Compteur Tasbih et Istighfar
- Boussole Qibla avec géolocalisation
- Horaires de prière par ville (API Aladhan)
- Système de streak et statistiques
- 4 niveaux de pratique (Fondations, Approfondissement, Connaissance, Rayonnement)
- Badges et récompenses
- Design islamique attractif
- Persistance des données (localStorage)
- Détection dynamique du changement de jour

## What's Been Implemented (Jan-Apr 2026)
- [x] **Bug fix - Date dynamique** : Vérification de la date chaque minute
- [x] **Onboarding** : 3 étapes (logo, niveaux, ville)
- [x] **Modal intention** : 4 choix avec icônes et texte arabe
- [x] **Page Accueil** : Streak, niveau, score, heatmap, hadith, stats
- [x] **Page Pratique** : 
  - 5 prières avec checkboxes et texte arabe
  - Dhikr (Ayat al-Kursi, Shukr, Basmala)
  - Wird matin/soir dépliables
  - Compteurs Istighfar ×100, Tasbih ×33
  - Section Qibla dépliable
- [x] **Mode Méditation** : Timer 3/5/10 min avec animation
- [x] **Tasbih plein écran** : Mode immersif 0-99
- [x] **Page Stats** : Streak, record, badges, calendrier semaine
- [x] **Horaires de prière** : API Aladhan avec entrée ville
- [x] **Design islamique** : Vert foncé, glassmorphism, amber accents
- [x] **API Backend complète** (Avril 2026):
  - Authentification JWT (register/login)
  - Synchronisation cloud des pratiques quotidiennes
  - Sauvegarde historique et statistiques
  - MongoDB pour persistance multi-appareils
  - Mode hors ligne avec localStorage
  - Documentation API complète

## Prioritized Backlog

### P0 - Critical
- [ ] Sons/audio pour récitations (Qari Alafasy)

### P1 - High Priority
- [ ] Niveaux 2, 3, 4 débloquables
- [ ] Mode Ramadan avec calendrier de jeûne
- [ ] Lecteur Coran avec sourates
- [ ] PWA Service Worker pour mode hors-ligne

### P2 - Medium Priority
- [ ] Notifications push pour rappels de prière
- [ ] Mode Tawba (retour après absence)
- [ ] Bilan hebdomadaire
- [ ] Système Freemium/Premium

### P3 - Nice to Have
- [ ] Sync cloud avec comptes utilisateurs
- [ ] Partage social des achievements
- [ ] Mode sombre/clair personnalisable

## Tech Stack
- Frontend: React 18 + Tailwind CSS + Framer Motion
- Storage: localStorage (client-side)
- API: Aladhan API pour horaires de prière
- Design: Glassmorphism, Playfair Display + Outfit fonts

## Architecture
```
/app/frontend/src/
├── App.js              # Main component (~750 lines)
├── App.css             # Custom styles
├── index.css           # Tailwind + global styles
├── lib/
│   ├── storage.js      # localStorage utilities
│   └── data.js         # Levels, Wird, Badges, Hadiths
```

## Test Results (Jan 7, 2026)
- Frontend: 100% pass
- Navigation: 100% pass
- User Interactions: 100% pass
- Data Persistence: 100% pass
- Design Implementation: 100% pass
