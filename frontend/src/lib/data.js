// Complete app data matching original HTML app

export const isFriday = () => new Date().getDay() === 5;

export const LEVELS = [
  {
    id: 1, 
    name: 'Fondations',
    icon: '🕌',
    desc: 'Les bases de ta pratique quotidienne',
    sections: [
      { 
        icon: '🕌', 
        title: 'Les 5 Prières', 
        items: [
          { id: 'fajr', label: 'Fajr', sub: "Prière de l'aube", arabic: 'صَلَاةُ الْفَجْرِ', priority: 'fard', weight: 8, hadith: '"Celui qui prie Fajr est sous la protection d\'Allah toute la journée" — Muslim 657' },
          { id: 'dhuhr', label: 'Dhuhr', sub: 'Prière du milieu du jour', arabic: 'صَلَاةُ الظُّهْرِ', priority: 'fard', weight: 8 },
          { id: 'asr', label: 'Asr', sub: "Prière de l'après-midi", arabic: 'صَلَاةُ الْعَصْرِ', priority: 'fard', weight: 8, hadith: '"Celui qui manque Asr, c\'est comme s\'il avait perdu sa famille et ses biens" — Bukhari 552' },
          { id: 'maghrib', label: 'Maghrib', sub: 'Prière du coucher du soleil', arabic: 'صَلَاةُ الْمَغْرِبِ', priority: 'fard', weight: 8 },
          { id: 'isha', label: 'Isha', sub: 'Prière de la nuit', arabic: 'صَلَاةُ الْعِشَاءِ', priority: 'fard', weight: 8, hadith: '"Celui qui prie Isha en jamaah a la récompense de prier la moitié de la nuit" — Muslim 656' },
          ...(isFriday() ? [{ id: 'jumua', label: 'Jumua ✦', sub: 'Prière du vendredi — obligation spéciale', arabic: 'صَلَاةُ الْجُمُعَةِ', priority: 'fard', weight: 10, isFriday: true }] : []),
        ]
      },
      { 
        icon: '📖', 
        title: 'Dhikr & Récitation', 
        items: [
          { id: 'ayat_kursi', label: 'Ayat al-Kursi après prière', sub: 'Après chaque prière obligatoire — 1 fois', arabic: 'آيَةُ الْكُرْسِيّ', priority: 'sunnah', weight: 5, hasAudio: true, audio: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3', hadith: '"Celui qui la récite après chaque prière, rien ne l\'empêche d\'entrer au Paradis sauf la mort" — Nasa\'i' },
          { id: 'shukr', label: 'Remercier Allah', sub: 'Alhamdulillah — au moins 3 grâces du jour', arabic: 'الْحَمْدُ لِلَّهِ', weight: 3, hadith: '"Si vous êtes reconnaissants, J\'augmenterai Mes bienfaits pour vous" — Coran 14:7' },
          { id: 'basmala', label: 'Bismillah avant chaque action', sub: 'Manger, sortir, commencer — Bismillah', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', weight: 3, hadith: '"Tout acte important qui ne commence pas par Bismillah est coupé de sa bénédiction" — Abu Dawud' },
        ]
      },
      { 
        icon: '📿', 
        title: 'Wird',
        desc: 'Invocations quotidiennes tirées du Coran et de la Sunnah',
        items: [
          { id: 'wird_matin', label: 'Wird du Matin', sub: 'Après Fajr · Al-Fatiha, Ayat al-Kursi, Muawwidhat…', arabic: 'وِرْدُ الصَّبَاحِ', type: 'wird', session: 'matin', weight: 6 },
          { id: 'wird_soir', label: 'Wird du Soir', sub: 'Après Asr · Al-Baqara 285-286, Al-Mulk…', arabic: 'وِرْدُ الْمَسَاءِ', type: 'wird', session: 'soir', weight: 6 },
        ]
      }
    ]
  },
  {
    id: 2, 
    name: 'Approfondissement',
    icon: '📿',
    desc: 'Renforcer ta connexion spirituelle',
    sections: [
      { 
        icon: '🕌', 
        title: 'Prière & Mosquée', 
        items: [
          { id: 'mosquee', label: 'Prière à la mosquée', sub: 'Au moins une prière en jamaah', arabic: 'صَلَاةُ الْجَمَاعَةِ', optional: true, weight: 7, hadith: '"La prière en jamaah vaut 27 fois plus que la prière seul" — Bukhari 645' },
          { id: 'sunnah_fajr', label: 'Sunnah Fajr', sub: '2 rakaat avant Fajr — la plus recommandée', arabic: 'سُنَّةُ الْفَجْرِ', priority: 'sunnah', weight: 5, hadith: '"Les 2 rakaat de l\'aube valent mieux que le monde" — Muslim 725' },
        ]
      },
      { 
        icon: '🌙', 
        title: 'Prière nocturne', 
        items: [
          { id: 'tahajjud', label: 'Qiyam al-Layl', sub: 'Prière nocturne — le dernier tiers de la nuit', arabic: 'قِيَامُ اللَّيْلِ', optional: true, weight: 8, hadith: '"Notre Seigneur descend chaque nuit au tiers final" — Bukhari 1145' },
          { id: 'witr', label: 'Prière Witr', sub: 'Minimum 1 rakaa — avant de dormir', arabic: 'صَلَاةُ الْوِتْرِ', priority: 'sunnah', weight: 5, hadith: '"Allah est impair et Il aime l\'impair" — Bukhari 998' },
        ]
      },
      { 
        icon: '📿', 
        title: 'Compteurs', 
        items: [
          { id: 'istighfar', label: 'Istighfar ×100', sub: 'Astaghfirullah · Je demande pardon à Allah', arabic: 'أَسْتَغْفِرُ اللَّهَ', type: 'counter', target: 100, weight: 5 },
          { id: 'tasbih', label: 'Tasbih complet', sub: 'SubhanAllah ×33 · Alhamdulillah ×33 · Allahu Akbar ×33', arabic: 'سُبْحَانَ اللَّهِ', type: 'counter', target: 99, weight: 5, hadith: '"Les péchés sont effacés même s\'ils sont comme l\'écume" — Muslim 597' },
        ]
      },
      {
        icon: '🎧',
        title: 'Écoute',
        items: [
          { id: 'coran_ecoute', label: 'Écouter le Coran', sub: 'Choisis une sourate et écoute', arabic: 'تِلَاوَةُ الْقُرْآنِ', optional: true, weight: 4, coranPicker: true }
        ]
      }
    ]
  },
  {
    id: 3, 
    name: 'Connaissance',
    icon: '📚',
    desc: 'Approfondir ton savoir',
    sections: [
      { 
        icon: '📚', 
        title: 'Étude islamique', 
        items: [
          { id: 'hadith1', label: '1er Hadith du jour', sub: 'Riyad as-Salihin ou autre recueil', arabic: 'حَدِيثٌ', weight: 4 },
          { id: 'hadith2', label: '2ème Hadith du jour', sub: 'Méditer sa signification', weight: 3 },
          { id: 'hadith3', label: '3ème Hadith du jour', sub: "L'appliquer dans la journée", weight: 3 },
          { id: 'sira', label: 'Vie du Prophète ﷺ', sub: '10 min · Série Seerah', arabic: 'السِّيرَةُ النَّبَوِيَّةُ', weight: 4 },
          { id: 'quran_read', label: 'Lecture du Coran', sub: 'Au moins 1 page avec le sens', arabic: 'قِرَاءَةُ الْقُرْآنِ', weight: 5 },
          { id: 'arabic', label: "Apprentissage de l'arabe", sub: '10 min · Vocabulaire ou grammaire', arabic: 'تَعَلُّمُ الْعَرَبِيَّةِ', optional: true, weight: 4 },
        ]
      },
      {
        icon: '🎙️',
        title: 'Contenus & Sunnah',
        items: [
          { id: 'podcast', label: 'Podcast islamique', sub: 'Islam Simplement ou autre contenu', weight: 3 },
          { id: 'sunnah_prieres', label: 'Prières surérogatoires', sub: 'Rawatib : 12 rakaat supplémentaires', arabic: 'السُّنَنُ الرَّوَاتِبُ', optional: true, weight: 4, hadith: '"Celui qui prie 12 rakaat par jour, Allah lui bâtit une maison au Paradis" — Muslim 728' },
          { id: 'sunnah_jejune', label: 'Jeûne sunnah', sub: 'Lundi ou jeudi — sunnah du Prophète', arabic: 'صَوْمُ الِاثْنَيْنِ', optional: true, weight: 6, hadith: '"Les actes sont présentés à Allah le lundi et jeudi" — Tirmidhi 747' },
        ],
        links: [
          { label: 'Vie du Prophète ﷺ', sub: 'L\'Islam Simplement · YouTube', url: 'https://www.youtube.com/@lislamsimplement', icon: '▶' },
          { label: 'Islam Simplement', sub: 'Podcast · Spotify', url: 'https://open.spotify.com/search/islam%20simplement', icon: '🎙' },
          { label: "L'Arabe Simplement", sub: 'Arabe coranique', url: 'https://www.youtube.com/@larabesimplement', icon: '📖' },
          { label: 'Sunnah.com', sub: 'Hadiths authentiques', url: 'https://sunnah.com/riyadussalihin', icon: '📚' },
        ]
      }
    ]
  },
  {
    id: 4, 
    name: 'Rayonnement',
    icon: '💚',
    desc: 'Partager et rayonner',
    sections: [
      { 
        icon: '💚', 
        title: 'Bonnes actions', 
        items: [
          { id: 'sadaqa', label: 'Aumône (Sadaqa)', sub: "Même un sourire est une aumône", arabic: 'الصَّدَقَةُ', weight: 5 },
          { id: 'maruf', label: 'Inviter au bien', sub: 'Partager une parole utile ou rappeler Allah', arabic: 'الْأَمْرُ بِالْمَعْرُوفِ', weight: 4, hadith: '"La meilleure aumône est de transmettre un savoir" — Ibn Majah' },
          { id: 'salam', label: 'Donner le Salam', sub: 'As-salamu alaykum à au moins 3 personnes', arabic: 'السَّلَامُ عَلَيْكُمْ', weight: 3 },
          { id: 'silaturahm', label: 'Maintenir les liens familiaux', sub: "Appeler ou voir un proche", arabic: 'صِلَةُ الرَّحِمِ', weight: 5, hadith: '"Celui qui veut que sa rizq soit élargie, qu\'il maintienne les liens familiaux" — Bukhari 5986' },
          { id: 'kind_act', label: 'Acte de bonté', sub: "Aider quelqu'un concrètement", weight: 4 },
        ]
      },
      { 
        icon: '🤲', 
        title: 'Douâas personnels', 
        items: [
          { id: 'doua1', label: 'Douâa pour tes parents', sub: 'Rabbi irhamhuma kama rabbayani saghira', arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', weight: 4, hasAudio: true, audio: 'https://everyayah.com/data/Alafasy_128kbps/017024.mp3' },
          { id: 'doua2', label: 'Douâa pour toi-même', sub: 'Rabbi inni lima anzalta ilayya min khayrin faqir', arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', weight: 4, hasAudio: true, audio: 'https://everyayah.com/data/Alafasy_128kbps/028024.mp3' },
          { id: 'doua3', label: 'Douâa pour ta famille', sub: 'Rabbana hab lana min azwajina wa dhurriyyatina...', arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', weight: 4, hasAudio: true, audio: 'https://everyayah.com/data/Alafasy_128kbps/025074.mp3' },
          { id: 'doua_morts', label: 'Douâa pour les défunts', sub: 'Rabbana ighfir lana wa li ikhwanina...', arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', weight: 4, hasAudio: true, audio: 'https://everyayah.com/data/Alafasy_128kbps/059010.mp3' },
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
      { id: 'fatiha_m', name: 'Al-Fatiha', arabic: 'سُورَةُ الْفَاتِحَةِ', count: '×1', audio: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3' },
      { id: 'ayat_kursi_m', name: 'Ayat al-Kursi', arabic: 'آيَةُ الْكُرْسِيِّ', count: '×1', audio: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3' },
      { id: 'ikhlas_m', name: 'Al-Ikhlass', arabic: 'سُورَةُ الْإِخْلَاصِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3' },
      { id: 'falaq_m', name: 'Al-Falaq', arabic: 'سُورَةُ الْفَلَقِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3' },
      { id: 'nas_m', name: 'An-Nas', arabic: 'سُورَةُ النَّاسِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3' },
    ]
  },
  soir: {
    title: 'Wird du Soir',
    icon: '🌙',
    sub: 'À réciter après Asr',
    items: [
      { id: 'baqara_285', name: 'Al-Baqara 285-286', arabic: 'آمَنَ الرَّسُولُ', count: '×1', audio: 'https://everyayah.com/data/Alafasy_128kbps/002285.mp3' },
      { id: 'ikhlas_s', name: 'Al-Ikhlass', arabic: 'سُورَةُ الْإِخْلَاصِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3' },
      { id: 'falaq_s', name: 'Al-Falaq', arabic: 'سُورَةُ الْفَلَقِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3' },
      { id: 'nas_s', name: 'An-Nas', arabic: 'سُورَةُ النَّاسِ', count: '×3', audio: 'https://everyayah.com/data/Alafasy_128kbps/114001.mp3' },
      { id: 'mulk', name: 'Sourate Al-Mulk', arabic: 'سُورَةُ الْمُلْكِ', count: '×1', audio: 'https://everyayah.com/data/Alafasy_128kbps/067001.mp3' },
    ]
  }
};

export const BADGES = [
  { id: 'first_day', emoji: '🌱', name: 'Premier Pas', desc: 'Première journée complétée', check: (s, h) => h.totalDays >= 1 },
  { id: 'streak_3', emoji: '🔥', name: 'Flamme Naissante', desc: '3 jours consécutifs', check: (s, h) => h.streak >= 3 || h.bestStreak >= 3 },
  { id: 'streak_7', emoji: '⭐', name: 'Semaine Bénie', desc: '7 jours consécutifs', check: (s, h) => h.streak >= 7 || h.bestStreak >= 7 },
  { id: 'streak_14', emoji: '🌟', name: 'Persévérance', desc: '14 jours consécutifs', check: (s, h) => h.streak >= 14 || h.bestStreak >= 14 },
  { id: 'streak_30', emoji: '👑', name: 'Mois Sacré', desc: '30 jours consécutifs', gold: true, check: (s, h) => h.streak >= 30 || h.bestStreak >= 30 },
  { id: 'streak_100', emoji: '💎', name: '100 jours', desc: 'Centenaire spirituel', gold: true, check: (s, h) => h.streak >= 100 || h.bestStreak >= 100 },
  { id: 'level_2', emoji: '📿', name: 'Approfondissement', desc: 'Niveau 2 débloqué', check: (s, h) => (s._unlocked || []).includes(2) },
  { id: 'level_3', emoji: '📚', name: 'Connaissance', desc: 'Niveau 3 débloqué', check: (s, h) => (s._unlocked || []).includes(3) },
  { id: 'level_4', emoji: '💚', name: 'Rayonnement', desc: 'Niveau 4 débloqué', gold: true, check: (s, h) => (s._unlocked || []).includes(4) },
  { id: 'ramadan_start', emoji: '🌙', name: 'Ramadan Mubarak', desc: 'Premier jour de Ramadan', check: (s, h) => ((h.ramadan?.totalFasts) || 0) >= 1 },
  { id: 'ramadan_10', emoji: '⭐', name: '10 Jours de Jeûne', desc: '10 jours de jeûne accomplis', check: (s, h) => ((h.ramadan?.totalFasts) || 0) >= 10 },
  { id: 'ramadan_full', emoji: '🥇', name: 'Ramadan Complet', desc: '30 jours — Allahu Akbar !', gold: true, check: (s, h) => ((h.ramadan?.totalFasts) || 0) >= 30 },
];

export const HADITHS = [
  { text: "Les actes ne valent que par les intentions.", ref: "Bukhari 1" },
  { text: "Ne sous-estime aucun acte de bonté, fût-ce un visage souriant.", ref: "Muslim 2626" },
  { text: "L'acte le plus aimé d'Allah est celui qui est régulier, même s'il est peu.", ref: "Bukhari 6464" },
  { text: "Certes, avec la difficulté vient la facilité.", ref: "Coran 94:5" },
  { text: "Allah est avec ceux qui sont patients.", ref: "Coran 2:153" },
  { text: "Celui qui croit en Allah et au Jour dernier, qu'il dise du bien ou qu'il se taise.", ref: "Bukhari 6018" },
  { text: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", ref: "Bukhari 5027" },
  { text: "Celui qui prend un chemin pour acquérir un savoir, Allah lui facilite un chemin vers le Paradis.", ref: "Muslim 2699" },
  { text: "Aucun de vous ne sera croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.", ref: "Bukhari 13" },
  { text: "Souris à ton frère, c'est une aumône.", ref: "Tirmidhi 1956" },
];

// Hadiths spécifiques sur l'intention (Niyyah) qui défilent
export const NIYYAH_HADITHS = [
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    text: "Les actes ne valent que par les intentions, et chacun n'aura que ce qu'il a eu l'intention de faire",
    ref: "Bukhari 1"
  },
  {
    arabic: "مَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ",
    text: "Celui dont l'émigration est pour Allah et Son Messager, son émigration est vraiment pour Allah et Son Messager",
    ref: "Bukhari 1"
  },
  {
    arabic: "نِيَّةُ الْمُؤْمِنِ خَيْرٌ مِنْ عَمَلِهِ",
    text: "L'intention du croyant est meilleure que son acte",
    ref: "Tabarani"
  },
  {
    arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ",
    text: "Allah ne regarde ni vos apparences ni vos corps, mais Il regarde vos cœurs et vos intentions",
    ref: "Muslim 2564"
  },
  {
    arabic: "مَا أَخْلَصَ عَبْدٌ لِلَّهِ أَرْبَعِينَ يَوْمًا",
    text: "Celui qui purifie son intention pour Allah pendant 40 jours, des sources de sagesse jaillissent de son cœur",
    ref: "Abu Nu'aym"
  },
  {
    arabic: "الدُّنْيَا مَلْعُونَةٌ",
    text: "Ce monde est maudit sauf le rappel d'Allah et ce qui est fait avec une intention sincère pour Lui",
    ref: "Tirmidhi 2322"
  },
  {
    arabic: "مَنْ صَلَّى الْفَجْرَ فَهُوَ فِي ذِمَّةِ اللَّهِ",
    text: "Celui qui accomplit Fajr avec l'intention sincère est sous la protection d'Allah toute la journée",
    ref: "Muslim 657"
  }
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
  "الله أكبر — Allah est plus Grand que tout souci.",
  "Inspire la paix, expire les soucis.",
];

export const FRIDAY_ITEMS = [
  { id: 'sourate_kahf', label: 'Lire Sourate Al-Kahf', arabic: 'سُورَةُ الْكَهْفِ', sub: 'Protection entre deux vendredis', audio: 'https://everyayah.com/data/Alafasy_128kbps/018001.mp3' },
  { id: 'salawat', label: 'Salawat sur le Prophète ﷺ', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', sub: 'Multiplier les bénédictions' },
  { id: 'doua', label: "Douâa de l'heure exaucée", arabic: 'سَاعَةُ الْإِجَابَةِ', sub: 'Dernière heure avant Maghrib' },
  { id: 'ghusl', label: 'Ghusl du vendredi', arabic: 'غُسْلُ الْجُمُعَةِ', sub: 'Purification recommandée' },
  { id: 'parfum', label: 'Se parfumer', arabic: 'الطِّيبُ', sub: 'Sunnah du vendredi' },
];

export const RAMADAN_ITEMS = [
  { id: 'fast', label: "J'ai jeûné aujourd'hui", arabic: 'صُمْتُ الْيَوْمَ', isFast: true, special: true },
  { id: 'suhur', label: "Suhur — repas avant l'aube", arabic: 'السَّحُور' },
  { id: 'iftar', label: 'Iftar — rupture du jeûne', arabic: 'الْإِفْطَار', sub: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ' },
  { id: 'tarawih', label: 'Prière Tarawih', arabic: 'صَلَاةُ التَّرَاوِيحِ', sub: '8 ou 20 rakaat après Isha' },
  { id: 'quran_ramadan', label: 'Récitation du Coran', arabic: 'قِرَاءَةُ الْقُرْآنِ', sub: 'Objectif : 1 Juzz par jour' },
  { id: 'sadaqa_ramadan', label: 'Sadaqa du jour', arabic: 'الصَّدَقَةُ', sub: 'Même un sourire ou un service' },
];

export const SOURATES = [
  [1,'Al-Fatiha','الفاتحة','L\'Ouverture',7],
  [2,'Al-Baqara','البقرة','La Vache',286],
  [3,'Al-Imran','آل عمران','La Famille d\'Imran',200],
  [4,'An-Nisa','النساء','Les Femmes',176],
  [5,'Al-Maida','المائدة','La Table Servie',120],
  [6,'Al-An\'am','الأنعام','Les Bestiaux',165],
  [7,'Al-A\'raf','الأعراف','Les Murailles',206],
  [8,'Al-Anfal','الأنفال','Le Butin',75],
  [9,'At-Tawba','التوبة','Le Repentir',129],
  [10,'Yunus','يونس','Jonas',109],
  [11,'Hud','هود','Houd',123],
  [12,'Yusuf','يوسف','Joseph',111],
  [13,'Ar-Ra\'d','الرعد','Le Tonnerre',43],
  [14,'Ibrahim','إبراهيم','Abraham',52],
  [15,'Al-Hijr','الحجر','Al-Hijr',99],
  [16,'An-Nahl','النحل','Les Abeilles',128],
  [17,'Al-Isra','الإسراء','Le Voyage Nocturne',111],
  [18,'Al-Kahf','الكهف','La Caverne',110],
  [19,'Maryam','مريم','Marie',98],
  [20,'Ta-Ha','طه','Ta-Ha',135],
  [21,'Al-Anbiya','الأنبياء','Les Prophètes',112],
  [22,'Al-Hajj','الحج','Le Pèlerinage',78],
  [23,'Al-Mu\'minun','المؤمنون','Les Croyants',118],
  [24,'An-Nur','النور','La Lumière',64],
  [25,'Al-Furqan','الفرقان','Le Discernement',77],
  [26,'Ash-Shu\'ara','الشعراء','Les Poètes',227],
  [27,'An-Naml','النمل','Les Fourmis',93],
  [28,'Al-Qasas','القصص','Le Récit',88],
  [29,'Al-Ankabut','العنكبوت','L\'Araignée',69],
  [30,'Ar-Rum','الروم','Les Romains',60],
  [31,'Luqman','لقمان','Luqman',34],
  [32,'As-Sajda','السجدة','La Prosternation',30],
  [33,'Al-Ahzab','الأحزاب','Les Coalisés',73],
  [34,'Saba','سبأ','Saba',54],
  [35,'Fatir','فاطر','Le Créateur',45],
  [36,'Ya-Sin','يس','Ya-Sin',83],
  [37,'As-Saffat','الصافات','Les Rangés',182],
  [38,'Sad','ص','Sad',88],
  [39,'Az-Zumar','الزمر','Les Groupes',75],
  [40,'Ghafir','غافر','Le Pardonneur',85],
  [41,'Fussilat','فصلت','Exposées en Détail',54],
  [42,'Ash-Shura','الشورى','La Consultation',53],
  [43,'Az-Zukhruf','الزخرف','Les Ornements',89],
  [44,'Ad-Dukhan','الدخان','La Fumée',59],
  [45,'Al-Jathiya','الجاثية','L\'Agenouillée',37],
  [46,'Al-Ahqaf','الأحقاف','Les Dunes',35],
  [47,'Muhammad','محمد','Muhammad',38],
  [48,'Al-Fath','الفتح','La Victoire',29],
  [49,'Al-Hujurat','الحجرات','Les Appartements',18],
  [50,'Qaf','ق','Qaf',45],
  [51,'Adh-Dhariyat','الذاريات','Les Vents',60],
  [52,'At-Tur','الطور','Le Mont Sinaï',49],
  [53,'An-Najm','النجم','L\'Étoile',62],
  [54,'Al-Qamar','القمر','La Lune',55],
  [55,'Ar-Rahman','الرحمن','Le Tout Miséricordieux',78],
  [56,'Al-Waqi\'a','الواقعة','L\'Événement',96],
  [57,'Al-Hadid','الحديد','Le Fer',29],
  [58,'Al-Mujadila','المجادلة','La Femme qui Dispute',22],
  [59,'Al-Hashr','الحشر','L\'Exode',24],
  [60,'Al-Mumtahana','الممتحنة','La Femme Éprouvée',13],
  [61,'As-Saf','الصف','Le Rang',14],
  [62,'Al-Jumu\'a','الجمعة','Le Vendredi',11],
  [63,'Al-Munafiqun','المنافقون','Les Hypocrites',11],
  [64,'At-Taghabun','التغابن','La Spoliation',18],
  [65,'At-Talaq','الطلاق','Le Divorce',12],
  [66,'At-Tahrim','التحريم','L\'Interdiction',12],
  [67,'Al-Mulk','الملك','La Royauté',30],
  [68,'Al-Qalam','القلم','Le Calame',52],
  [69,'Al-Haqqa','الحاقة','L\'Inévitable',52],
  [70,'Al-Ma\'arij','المعارج','Les Degrés',44],
  [71,'Nuh','نوح','Noé',28],
  [72,'Al-Jinn','الجن','Les Djinns',28],
  [73,'Al-Muzzammil','المزمل','L\'Enveloppé',20],
  [74,'Al-Muddaththir','المدثر','Le Revêtu',56],
  [75,'Al-Qiyama','القيامة','La Résurrection',40],
  [76,'Al-Insan','الإنسان','L\'Homme',31],
  [77,'Al-Mursalat','المرسلات','Les Envoyés',50],
  [78,'An-Naba','النبأ','La Nouvelle',40],
  [79,'An-Nazi\'at','النازعات','Ceux qui Arrachent',46],
  [80,'Abasa','عبس','Il a Froncé les Sourcils',42],
  [81,'At-Takwir','التكوير','L\'Enroulement',29],
  [82,'Al-Infitar','الانفطار','La Déchirure',19],
  [83,'Al-Mutaffifin','المطففين','Les Fraudeurs',36],
  [84,'Al-Inshiqaq','الانشقاق','La Fissure',25],
  [85,'Al-Buruj','البروج','Les Constellations',22],
  [86,'At-Tariq','الطارق','L\'Astre Nocturne',17],
  [87,'Al-A\'la','الأعلى','Le Très-Haut',19],
  [88,'Al-Ghashiya','الغاشية','L\'Enveloppante',26],
  [89,'Al-Fajr','الفجر','L\'Aube',30],
  [90,'Al-Balad','البلد','La Cité',20],
  [91,'Ash-Shams','الشمس','Le Soleil',15],
  [92,'Al-Layl','الليل','La Nuit',21],
  [93,'Ad-Duha','الضحى','La Matinée',11],
  [94,'Ash-Sharh','الشرح','L\'Ouverture de la Poitrine',8],
  [95,'At-Tin','التين','Le Figuier',8],
  [96,'Al-Alaq','العلق','Le Caillot de Sang',19],
  [97,'Al-Qadr','القدر','La Nuit du Destin',5],
  [98,'Al-Bayyina','البينة','La Preuve',8],
  [99,'Az-Zalzala','الزلزلة','Le Séisme',8],
  [100,'Al-Adiyat','العاديات','Les Coursiers',11],
  [101,'Al-Qari\'a','القارعة','Le Fracas',11],
  [102,'At-Takathur','التكاثر','La Course aux Richesses',8],
  [103,'Al-Asr','العصر','Le Temps',3],
  [104,'Al-Humaza','الهمزة','Le Calomniateur',9],
  [105,'Al-Fil','الفيل','L\'Éléphant',5],
  [106,'Quraysh','قريش','Quraysh',4],
  [107,'Al-Ma\'un','الماعون','Les Ustensiles',7],
  [108,'Al-Kawthar','الكوثر','L\'Abondance',3],
  [109,'Al-Kafirun','الكافرون','Les Infidèles',6],
  [110,'An-Nasr','النصر','Le Secours',3],
  [111,'Al-Masad','المسد','Les Fibres',5],
  [112,'Al-Ikhlas','الإخلاص','Le Monothéisme Pur',4],
  [113,'Al-Falaq','الفلق','L\'Aube Naissante',5],
  [114,'An-Nas','الناس','Les Hommes',6],
];

// Informations détaillées pour chaque item (bouton "i")
export const ITEM_INFO = {
  // === PRIÈRES ===
  'fajr': {
    arabic: 'صَلَاةُ الْفَجْرِ',
    phonetic: 'Salat al-Fajr',
    translation: 'La prière de l\'aube, deux rakaat accomplies avant le lever du soleil.',
    why: 'Celui qui prie Fajr est sous la protection d\'Allah toute la journée.',
    ref: 'Muslim 657'
  },
  'dhuhr': {
    arabic: 'صَلَاةُ الظُّهْرِ',
    phonetic: 'Salat adh-Dhuhr',
    translation: 'La prière du milieu du jour, quatre rakaat accomplies après que le soleil a dépassé son zénith.',
    why: 'C\'est l\'heure où les portes du ciel s\'ouvrent et les œuvres sont présentées à Allah.',
    ref: 'At-Tirmidhi 2675'
  },
  'asr': {
    arabic: 'صَلَاةُ الْعَصْرِ',
    phonetic: 'Salat al-\'Asr',
    translation: 'La prière de l\'après-midi, quatre rakaat avant le coucher du soleil.',
    why: 'Celui qui manque Asr, c\'est comme s\'il avait perdu sa famille et ses biens.',
    ref: 'Bukhari 552'
  },
  'maghrib': {
    arabic: 'صَلَاةُ الْمَغْرِبِ',
    phonetic: 'Salat al-Maghrib',
    translation: 'La prière du coucher du soleil, trois rakaat accomplies juste après le coucher.',
    why: 'Le moment où les portes du pardon sont ouvertes — une prière bénie.',
    ref: 'Muslim 758'
  },
  'isha': {
    arabic: 'صَلَاةُ الْعِشَاءِ',
    phonetic: 'Salat al-\'Isha',
    translation: 'La prière de la nuit, quatre rakaat après la disparition de la lueur rouge du crépuscule.',
    why: 'Celui qui prie Isha en jamaah a la récompense de prier la moitié de la nuit.',
    ref: 'Muslim 656'
  },
  
  // === DHIKR ===
  'ayat_kursi': {
    arabic: 'آيَةُ الْكُرْسِيِّ',
    phonetic: 'Ayat al-Kursi',
    translation: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même...',
    why: 'Celui qui la récite après chaque prière obligatoire, rien ne l\'empêche d\'entrer au Paradis sauf la mort.',
    ref: 'An-Nasa\'i (Sahih)'
  },
  'shukr': {
    arabic: 'الْحَمْدُ لِلَّهِ',
    phonetic: 'Alhamdulillah',
    translation: 'Louange à Allah. Remercier pour au moins 3 grâces du jour.',
    why: 'Si vous êtes reconnaissants, J\'augmenterai Mes bienfaits pour vous. Médite sur les ni\'ma : un toit, un lit, ta famille, la santé, les yeux, le souffle, la nourriture, l\'eau propre, être musulman, connaître Allah, la sécurité, le Coran, chaque réveil.',
    ref: 'Coran 14:7 + Sourate Ar-Rahman'
  },
  'basmala': {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    phonetic: 'Bismillah ar-Rahman ar-Rahim',
    translation: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux. À dire avant chaque action : manger, sortir, commencer.',
    why: 'Tout acte important qui ne commence pas par Bismillah est coupé de sa bénédiction.',
    ref: 'Abu Dawud (Hassan)'
  },
  
  // === NIVEAU 2 ===
  'mosquee': {
    arabic: 'صَلَاةُ الْجَمَاعَةِ',
    phonetic: 'Salat al-Jamaah',
    translation: 'Prier au moins une prière à la mosquée en congrégation.',
    why: 'La prière en jamaah vaut 27 fois plus que la prière accomplie seul.',
    ref: 'Bukhari 645'
  },
  'sunnah_fajr': {
    arabic: 'سُنَّةُ الْفَجْرِ',
    phonetic: 'Sunnah al-Fajr',
    translation: 'Deux rakaat avant Fajr — la sunnah la plus recommandée.',
    why: 'Les 2 rakaat de l\'aube valent mieux que le monde et ce qu\'il contient.',
    ref: 'Muslim 725'
  },
  'tahajjud': {
    arabic: 'قِيَامُ اللَّيْلِ',
    phonetic: 'Qiyam al-Layl',
    translation: 'Prière nocturne accomplie dans le dernier tiers de la nuit.',
    why: 'Notre Seigneur descend chaque nuit au tiers final — qui M\'invoque ? Je lui réponds.',
    ref: 'Bukhari 1145'
  },
  'witr': {
    arabic: 'صَلَاةُ الْوِتْرِ',
    phonetic: 'Salat al-Witr',
    translation: 'Prière impaire, minimum 1 rakaa, accomplie avant de dormir.',
    why: 'Allah est impair et Il aime l\'impair — priez le Witr.',
    ref: 'Bukhari 998'
  },
  'tasbih': {
    arabic: 'سُبْحَانَ اللَّهِ · الْحَمْدُ لِلَّهِ · اللَّهُ أَكْبَرُ',
    phonetic: 'SubhanAllah ×33, Alhamdulillah ×33, Allahu Akbar ×33, puis: La ilaha illallah wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay\'in qadir',
    translation: 'Gloire à Allah ×33, Louange à Allah ×33, Allah est le Plus Grand ×33. Puis à 99 : "Il n\'y a de dieu qu\'Allah Seul, sans associé, à Lui la souveraineté et la louange, Il est Puissant sur toute chose"',
    why: 'Les péchés sont effacés même s\'ils sont comme l\'écume de la mer.',
    ref: 'Muslim 597'
  },
  'coran_ecoute': {
    arabic: 'تِلَاوَةُ الْقُرْآنِ',
    phonetic: 'Tilawat al-Quran',
    translation: 'Choisir une sourate et l\'écouter attentivement.',
    why: 'Récite le Coran car il intercèdera pour ses compagnons le Jour du Jugement.',
    ref: 'Muslim 804'
  },
  
  // === NIVEAU 3 ===
  'sunnah_prieres': {
    arabic: 'السُّنَنُ الرَّوَاتِبُ',
    phonetic: 'As-Sunan ar-Rawatib',
    translation: 'Les prières surérogatoires régulières (Rawatib) : 12 rakaat par jour.',
    why: 'Celui qui prie 12 rakaat par jour, Allah lui bâtit une maison au Paradis.',
    ref: 'Muslim 728'
  },
  'sunnah_jejune': {
    arabic: 'صَوْمُ الِاثْنَيْنِ وَالْخَمِيسِ',
    phonetic: 'Sawm al-Ithnayn wal-Khamis',
    translation: 'Jeûner le lundi ou le jeudi — sunnah du Prophète ﷺ.',
    why: 'Les actes sont présentés à Allah le lundi et jeudi, j\'aime jeûner ces jours-là.',
    ref: 'Tirmidhi 747'
  },
  
  // === NIVEAU 4 ===
  'maruf': {
    arabic: 'الْأَمْرُ بِالْمَعْرُوفِ',
    phonetic: 'Al-Amr bil-Ma\'ruf',
    translation: 'Inviter au bien : partager une parole utile ou rappeler Allah.',
    why: 'La meilleure aumône est de transmettre un savoir.',
    ref: 'Ibn Majah 239'
  },
  'silaturahm': {
    arabic: 'صِلَةُ الرَّحِمِ',
    phonetic: 'Silat ar-Rahim',
    translation: 'Maintenir les liens familiaux : appeler ou voir un proche aujourd\'hui.',
    why: 'Celui qui veut que sa rizq soit élargie et sa vie prolongée, qu\'il maintienne les liens familiaux.',
    ref: 'Bukhari 5986'
  },
  
  // === VENDREDI ===
  'sourate_kahf': {
    arabic: 'سُورَةُ الْكَهْفِ',
    phonetic: 'Surat al-Kahf',
    translation: 'Lire la sourate Al-Kahf le vendredi pour une protection entre deux vendredis.',
    why: 'Celui qui lit Al-Kahf le vendredi aura une lumière entre les deux vendredis.',
    ref: 'Al-Hakim'
  },
  'salawat': {
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    phonetic: 'Allahumma salli ala Muhammad',
    translation: 'Multiplier les bénédictions sur le Prophète ﷺ le vendredi.',
    why: 'Le meilleur de vos jours est le vendredi — multipliez la Salawat.',
    ref: 'Abu Dawud'
  },
  'doua': {
    arabic: 'سَاعَةُ الْإِجَابَةِ',
    phonetic: 'Sa\'at al-Ijabah',
    translation: 'L\'heure où les douaas sont exaucées — dernière heure avant Maghrib le vendredi.',
    why: 'Il y a une heure le vendredi où Allah exauce toute demande.',
    ref: 'Bukhari & Muslim'
  },
  
  // === WIRD MATIN ===
  'fatiha_m': {
    arabic: 'سُورَةُ الْفَاتِحَةِ',
    phonetic: 'Surat al-Fatihah',
    translation: 'L\'Ouverture — la mère du Coran. À réciter une fois le matin.',
    why: 'La meilleure sourate du Coran, divisée entre Allah et Son serviteur.',
    ref: 'Muslim 395'
  },
  'ayat_kursi_m': {
    arabic: 'آيَةُ الْكُرْسِيِّ',
    phonetic: 'Ayat al-Kursi',
    translation: 'Le verset du Trône. Protection puissante contre tout mal.',
    why: 'Le plus grand verset du Coran. Celui qui la récite le matin est protégé jusqu\'au soir.',
    ref: 'Al-Bukhari dans Al-Adab Al-Mufrad'
  },
  'ikhlas_m': {
    arabic: 'سُورَةُ الْإِخْلَاصِ',
    phonetic: 'Surat al-Ikhlas',
    translation: 'Le Monothéisme Pur. À réciter 3 fois.',
    why: 'Équivaut à un tiers du Coran.',
    ref: 'Bukhari 5013'
  },
  'falaq_m': {
    arabic: 'سُورَةُ الْفَلَقِ',
    phonetic: 'Surat al-Falaq',
    translation: 'L\'Aube Naissante. Protection contre le mal extérieur. À réciter 3 fois.',
    why: 'Les Muawwidhat (sourates protectrices) te protègent de tout mal.',
    ref: 'Abu Dawud 5082'
  },
  'nas_m': {
    arabic: 'سُورَةُ النَّاسِ',
    phonetic: 'Surat an-Nas',
    translation: 'Les Hommes. Protection contre le mal intérieur (waswas). À réciter 3 fois.',
    why: 'Complète la protection avec Al-Falaq contre les suggestions du Shaytan.',
    ref: 'Abu Dawud 5082'
  },
  
  // === WIRD SOIR ===
  'baqara_285': {
    arabic: 'آمَنَ الرَّسُولُ',
    phonetic: 'Amana ar-Rasul',
    translation: 'Al-Baqara versets 285-286. Les derniers versets de la sourate La Vache.',
    why: 'Celui qui récite ces deux versets la nuit, ils lui suffiront (protection complète).',
    ref: 'Bukhari 5009'
  },
  'ikhlas_s': {
    arabic: 'سُورَةُ الْإِخْلَاصِ',
    phonetic: 'Surat al-Ikhlas',
    translation: 'Le Monothéisme Pur. À réciter 3 fois le soir.',
    why: 'Équivaut à un tiers du Coran.',
    ref: 'Bukhari 5013'
  },
  'falaq_s': {
    arabic: 'سُورَةُ الْفَلَقِ',
    phonetic: 'Surat al-Falaq',
    translation: 'L\'Aube Naissante. À réciter 3 fois le soir.',
    why: 'Protection du soir jusqu\'au matin.',
    ref: 'Abu Dawud 5082'
  },
  'nas_s': {
    arabic: 'سُورَةُ النَّاسِ',
    phonetic: 'Surat an-Nas',
    translation: 'Les Hommes. À réciter 3 fois le soir.',
    why: 'Protection contre les waswas toute la nuit.',
    ref: 'Abu Dawud 5082'
  },
  'mulk': {
    arabic: 'سُورَةُ الْمُلْكِ',
    phonetic: 'Surat al-Mulk',
    translation: 'La Royauté. 30 versets à réciter avant de dormir.',
    why: 'Elle intercède pour son réciteur et le protège du châtiment de la tombe.',
    ref: 'At-Tirmidhi 2891'
  }
};


// Weekly hadith for bilan
export const WEEKLY_HADITHS = [
  { text: "Sois dans ce monde comme un étranger ou un voyageur de passage.", ref: "Bukhari 6416" },
  { text: "Le fort n'est pas celui qui terrasse, mais celui qui maîtrise sa colère.", ref: "Bukhari 6114" },
  { text: "Celui qui croit en Allah et au Jour dernier, qu'il soit bon envers son voisin.", ref: "Bukhari 6019" },
];
