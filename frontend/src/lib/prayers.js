// Prayer data and utilities

export const PRAYERS = [
  { id: 'fajr', name: 'Fajr', arabic: 'صَلَاةُ الْفَجْرِ', description: 'Prière de l\'aube' },
  { id: 'dhuhr', name: 'Dhuhr', arabic: 'صَلَاةُ الظُّهْرِ', description: 'Prière du milieu du jour' },
  { id: 'asr', name: 'Asr', arabic: 'صَلَاةُ الْعَصْرِ', description: 'Prière de l\'après-midi' },
  { id: 'maghrib', name: 'Maghrib', arabic: 'صَلَاةُ الْمَغْرِبِ', description: 'Prière du coucher du soleil' },
  { id: 'isha', name: 'Isha', arabic: 'صَلَاةُ الْعِشَاءِ', description: 'Prière de la nuit' },
];

export const DHIKR_ITEMS = [
  { id: 'ayat_kursi', name: 'Ayat al-Kursi', arabic: 'آيَةُ الْكُرْسِيّ', description: 'Après chaque prière' },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', description: 'Remercier Allah' },
  { id: 'bismillah', name: 'Bismillah', arabic: 'بِسْمِ اللَّهِ', description: 'Avant chaque action' },
];

export const WIRD_MATIN = [
  { id: 'fatiha', name: 'Al-Fatiha', arabic: 'سُورَةُ الْفَاتِحَة' },
  { id: 'ayat_kursi_m', name: 'Ayat al-Kursi', arabic: 'آيَةُ الْكُرْسِيّ' },
  { id: 'ikhlas_m', name: 'Al-Ikhlass ×3', arabic: 'سُورَةُ الْإِخْلَاص' },
  { id: 'falaq_m', name: 'Al-Falaq ×3', arabic: 'سُورَةُ الْفَلَق' },
  { id: 'nas_m', name: 'An-Nas ×3', arabic: 'سُورَةُ النَّاس' },
];

export const WIRD_SOIR = [
  { id: 'baqara_285', name: 'Al-Baqara 285-286', arabic: 'آمَنَ الرَّسُولُ' },
  { id: 'ikhlas_s', name: 'Al-Ikhlass ×3', arabic: 'سُورَةُ الْإِخْلَاص' },
  { id: 'falaq_s', name: 'Al-Falaq ×3', arabic: 'سُورَةُ الْفَلَق' },
  { id: 'nas_s', name: 'An-Nas ×3', arabic: 'سُورَةُ النَّاس' },
  { id: 'mulk', name: 'Sourate Al-Mulk', arabic: 'سُورَةُ الْمُلْك' },
];

export const fetchPrayerTimes = async (city) => {
  if (!city) return null;
  try {
    const url = `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(city)}&method=12`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 200 && data.data?.timings) {
      return data.data.timings;
    }
    return null;
  } catch (e) {
    console.error('Error fetching prayer times:', e);
    return null;
  }
};

export const calculateQibla = (lat, lng) => {
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA_LAT * Math.PI / 180;
  const Δλ = (KAABA_LNG - lng) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(x, y);
  return ((θ * 180 / Math.PI) + 360) % 360;
};