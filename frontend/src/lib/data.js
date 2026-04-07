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
  { num: 1, name: 'Al-Fatiha', arabic: 'الفاتحة', verses: 7 },
  { num: 2, name: 'Al-Baqara', arabic: 'البقرة', verses: 286 },
  { num: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83 },
  { num: 55, name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78 },
  { num: 56, name: "Al-Waqi'a", arabic: 'الواقعة', verses: 96 },
  { num: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30 },
  { num: 78, name: 'An-Naba', arabic: 'النبأ', verses: 40 },
  { num: 87, name: "Al-A'la", arabic: 'الأعلى', verses: 19 },
  { num: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4 },
  { num: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5 },
  { num: 114, name: 'An-Nas', arabic: 'الناس', verses: 6 },
];

// Weekly hadith for bilan
export const WEEKLY_HADITHS = [
  { text: "Sois dans ce monde comme un étranger ou un voyageur de passage.", ref: "Bukhari 6416" },
  { text: "Le fort n'est pas celui qui terrasse, mais celui qui maîtrise sa colère.", ref: "Bukhari 6114" },
  { text: "Celui qui croit en Allah et au Jour dernier, qu'il soit bon envers son voisin.", ref: "Bukhari 6019" },
];