// All app data - Levels, Items, Badges, etc.

export const LEVELS = [
  {
    id: 1,
    name: 'Fondations',
    icon: '🕌',
    desc: 'Les bases de ta pratique quotidienne',
    sections: [
      {
        title: 'Les 5 Prières',
        icon: '🕌',
        items: [
          { id: 'fajr', label: 'Fajr', sub: "Prière de l'aube", arabic: 'صَلَاةُ الْفَجْرِ', priority: 'fard', weight: 8 },
          { id: 'dhuhr', label: 'Dhuhr', sub: 'Prière du milieu du jour', arabic: 'صَلَاةُ الظُّهْرِ', priority: 'fard', weight: 8 },
          { id: 'asr', label: 'Asr', sub: "Prière de l'après-midi", arabic: 'صَلَاةُ الْعَصْرِ', priority: 'fard', weight: 8 },
          { id: 'maghrib', label: 'Maghrib', sub: 'Prière du coucher du soleil', arabic: 'صَلَاةُ الْمَغْرِبِ', priority: 'fard', weight: 8 },
          { id: 'isha', label: 'Isha', sub: 'Prière de la nuit', arabic: 'صَلَاةُ الْعِشَاءِ', priority: 'fard', weight: 8 },
        ]
      },
      {
        title: 'Dhikr & Récitation',
        icon: '📖',
        items: [
          { id: 'ayat_kursi', label: 'Ayat al-Kursi après prière', sub: 'Après chaque prière obligatoire — 1 fois', arabic: 'آيَةُ الْكُرْسِيّ', priority: 'sunnah', hasAudio: true, hasInfo: true, weight: 5 },
          { id: 'shukr', label: 'Remercier Allah', sub: 'Alhamdulillah — au moins 3 grâces du jour', arabic: 'الْحَمْدُ لِلَّهِ', hasInfo: true, weight: 3 },
          { id: 'basmala', label: 'Bismillah avant chaque action', sub: 'Manger, sortir, commencer — Bismillah', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', hasInfo: true, weight: 3 },
        ]
      },
      {
        title: 'Wird',
        icon: '📿',
        items: [
          { id: 'wird_matin', label: 'Wird du Matin', sub: 'Après Fajr · Al-Fatiha, Ayat al-Kursi, Muawwidhat…', type: 'wird', session: 'matin', priority: 'sunnah', weight: 6 },
          { id: 'wird_soir', label: 'Wird du Soir', sub: 'Après Asr · Al-Baqara 285-286, Al-Mulk…', type: 'wird', session: 'soir', priority: 'sunnah', weight: 6 },
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Approfondissement',
    icon: '📿',
    desc: 'Renforcer ta connexion spirituelle',
    locked: true,
    sections: [
      {
        title: 'Pratiques Avancées',
        icon: '📿',
        items: [
          { id: 'mosquee', label: 'Prière à la mosquée', sub: 'Au moins une prière en jamaâ', arabic: 'الصَّلَاةُ فِي الْمَسْجِدِ', weight: 7 },
          { id: 'istighfar', label: 'Istighfar ×100', sub: 'Demander pardon à Allah', arabic: 'أَسْتَغْفِرُ اللَّهَ', type: 'counter', target: 100, weight: 5 },
          { id: 'tasbih', label: 'Tasbih ×33', sub: 'SubhanAllah, Alhamdulillah, Allahu Akbar', arabic: 'سُبْحَانَ اللَّهِ', type: 'counter', target: 33, weight: 5 },
          { id: 'jeune_sunnah', label: 'Jeûne surérogatoire', sub: 'Lundi, Jeudi ou jours blancs', arabic: 'صِيَامُ التَّطَوُّعِ', optional: true, weight: 6 },
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Connaissance',
    icon: '📚',
    desc: 'Approfondir ton savoir',
    locked: true,
    sections: [
      {
        title: 'Apprentissage',
        icon: '📚',
        items: [
          { id: 'coran_page', label: 'Lire 1 page de Coran', sub: 'Lecture quotidienne', arabic: 'قِرَاءَةُ الْقُرْآنِ', weight: 6 },
          { id: 'hadith', label: 'Apprendre 1 hadith', sub: 'Mémorisation ou lecture', arabic: 'حَدِيثٌ', weight: 4 },
          { id: 'arabe', label: 'Étudier l\'arabe 10min', sub: 'Vocabulaire ou grammaire', arabic: 'اللُّغَةُ الْعَرَبِيَّةُ', optional: true, weight: 4 },
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Rayonnement',
    icon: '💚',
    desc: 'Partager et rayonner',
    locked: true,
    sections: [
      {
        title: 'Bonnes Actions',
        icon: '💚',
        items: [
          { id: 'sadaqa', label: 'Sadaqa du jour', sub: 'Même un sourire est une sadaqa', arabic: 'صَدَقَةٌ', weight: 5 },
          { id: 'salam', label: 'Passer le salam', sub: 'Saluer un frère/sœur', arabic: 'السَّلَامُ عَلَيْكُمْ', weight: 3 },
          { id: 'douaa_autrui', label: 'Douaa pour autrui', sub: 'Invoquer pour quelqu\'un en son absence', arabic: 'الدُّعَاءُ', weight: 4 },
          { id: 'dhikr_libre', label: 'Dhikr libre', sub: 'Méditer et se rappeler Allah', arabic: 'ذِكْرُ اللَّهِ', optional: true, weight: 3 },
        ]
      }
    ]
  }
];

export const WIRD_DATA = {
  matin: {
    title: 'Wird du Matin',
    icon: '🌅',
    sub: 'À réciter après Fajr',
    items: [
      { id: 'fatiha_m', name: 'Al-Fatiha', arabic: 'سُورَةُ الْفَاتِحَةِ', count: '×1' },
      { id: 'ayat_kursi_m', name: 'Ayat al-Kursi', arabic: 'آيَةُ الْكُرْسِيِّ', count: '×1' },
      { id: 'ikhlas_m', name: 'Al-Ikhlass', arabic: 'سُورَةُ الْإِخْلَاصِ', count: '×3' },
      { id: 'falaq_m', name: 'Al-Falaq', arabic: 'سُورَةُ الْفَلَقِ', count: '×3' },
      { id: 'nas_m', name: 'An-Nas', arabic: 'سُورَةُ النَّاسِ', count: '×3' },
    ]
  },
  soir: {
    title: 'Wird du Soir',
    icon: '🌙',
    sub: 'À réciter après Asr',
    items: [
      { id: 'baqara_285', name: 'Al-Baqara 285-286', arabic: 'آمَنَ الرَّسُولُ', count: '×1' },
      { id: 'ikhlas_s', name: 'Al-Ikhlass', arabic: 'سُورَةُ الْإِخْلَاصِ', count: '×3' },
      { id: 'falaq_s', name: 'Al-Falaq', arabic: 'سُورَةُ الْفَلَقِ', count: '×3' },
      { id: 'nas_s', name: 'An-Nas', arabic: 'سُورَةُ النَّاسِ', count: '×3' },
      { id: 'mulk', name: 'Sourate Al-Mulk', arabic: 'سُورَةُ الْمُلْكِ', count: '×1' },
    ]
  }
};

export const BADGES = [
  { id: 'first_day', emoji: '🌱', name: 'Premier Pas', desc: 'Ta première journée complétée', check: (s, h) => h.totalDays >= 1 },
  { id: 'streak_3', emoji: '🔥', name: 'Flamme Naissante', desc: '3 jours consécutifs', check: (s, h) => h.streak >= 3 || h.bestStreak >= 3 },
  { id: 'streak_7', emoji: '⭐', name: 'Semaine Bénie', desc: '7 jours consécutifs', check: (s, h) => h.streak >= 7 || h.bestStreak >= 7 },
  { id: 'streak_14', emoji: '🌟', name: 'Persévérance', desc: '14 jours consécutifs', check: (s, h) => h.streak >= 14 || h.bestStreak >= 14 },
  { id: 'streak_30', emoji: '👑', name: 'Mois Sacré', desc: '30 jours consécutifs', gold: true, check: (s, h) => h.streak >= 30 || h.bestStreak >= 30 },
  { id: 'level_2', emoji: '📿', name: 'Approfondissement', desc: 'Niveau 2 débloqué', check: (s, h) => (s._unlocked || []).includes(2) },
  { id: 'level_3', emoji: '📚', name: 'Connaissance', desc: 'Niveau 3 débloqué', check: (s, h) => (s._unlocked || []).includes(3) },
  { id: 'level_4', emoji: '💚', name: 'Rayonnement', desc: 'Niveau 4 débloqué', gold: true, check: (s, h) => (s._unlocked || []).includes(4) },
];

export const HADITHS = [
  { text: "Les actes ne valent que par les intentions.", ref: "Bukhari 1" },
  { text: "Ne sous-estime aucun acte de bonté, fût-ce un visage souriant.", ref: "Muslim 2626" },
  { text: "L'acte le plus aimé d'Allah est celui qui est régulier, même s'il est peu.", ref: "Bukhari 6464" },
  { text: "Certes, avec la difficulté vient la facilité.", ref: "Coran 94:5" },
  { text: "Allah est avec ceux qui sont patients.", ref: "Coran 2:153" },
  { text: "Celui qui croit en Allah et au Jour dernier, qu'il dise du bien ou qu'il se taise.", ref: "Bukhari 6018" },
  { text: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", ref: "Bukhari 5027" },
];

export const INTENTIONS = [
  { type: 'rapprochement', icon: '🌙', label: "Me rapprocher d'Allah", arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', sub: 'Les actes valent par leurs intentions' },
  { type: 'engagement', icon: '⚖️', label: 'Tenir mes engagements', arabic: 'أَحَبُّ الْأَعْمَالِ', sub: "L'acte aimé d'Allah est le plus régulier" },
  { type: 'reconstruction', icon: '🤲', label: 'Me reconstruire', arabic: 'التَّوَّابِينَ', sub: 'Allah aime ceux qui reviennent vers Lui' },
  { type: 'gratitude', icon: '✦', label: 'Être reconnaissant', arabic: 'لَئِن شَكَرْتُمْ', sub: "Si vous êtes reconnaissants, J'augmenterai" },
];

export const MEDITATION_PHRASES = [
  "Pose ton regard. Respire. Allah est proche.",
  "Laisse tes pensées passer comme des nuages.",
  "Chaque souffle est un don d'Allah.",
  "Dans le silence, trouve Sa présence.",
  "Ton cœur connaît le chemin.",
];