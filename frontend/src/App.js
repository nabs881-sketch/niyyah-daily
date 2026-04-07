import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, CheckSquare, Compass, BarChart3, Check, 
  ChevronRight, ChevronDown, RotateCcw, MapPin, Play, Pause, X,
  Volume2, ExternalLink, Moon, Cloud, CloudOff, User, LogOut, Sun
} from "lucide-react";
import "@/App.css";
import { 
  loadState, saveState, loadHistory, saveHistory, 
  loadCity, saveCity, loadIntention, saveIntention, 
  loadWirdState, saveWirdState, loadCounters, saveCounters,
  loadCurrentLevel, saveCurrentLevel, isOnboardDone, setOnboardDone,
  getToday, getDateMinus, formatDateFr, loadRamadanState, saveRamadanState
} from "@/lib/storage";
import { LEVELS, WIRD_DATA, BADGES, HADITHS, INTENTIONS, MEDITATION_PHRASES, FRIDAY_ITEMS, RAMADAN_ITEMS, SOURATES, isFriday, WEEKLY_HADITHS, ITEM_INFO } from "@/lib/data";
import { api, syncToCloud, syncFromCloud } from "@/lib/api";

// API for prayer times
const fetchPrayerTimes = async (city) => {
  if (!city) return null;
  try {
    const url = `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(city)}&method=12`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 200 && data.data?.timings) return data.data.timings;
    return null;
  } catch (e) { return null; }
};

// Qibla calculation
const KAABA_LAT = 21.4225, KAABA_LNG = 39.8262;
const calculateQibla = (lat, lng) => {
  const φ1 = lat * Math.PI / 180, φ2 = KAABA_LAT * Math.PI / 180;
  const Δλ = (KAABA_LNG - lng) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(x, y) * 180 / Math.PI) + 360) % 360;
};

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('accueil');
  const [currentLevel, setCurrentLevel] = useState(() => loadCurrentLevel());
  
  // State
  const [state, setState] = useState(() => loadState());
  const [history, setHistory] = useState(() => loadHistory());
  const [wirdState, setWirdState] = useState({ matin: {}, soir: {} });
  const [counters, setCounters] = useState(() => loadCounters());
  const [fridayState, setFridayState] = useState({});
  const [ramadanState, setRamadanState] = useState(() => loadRamadanState());
  
  // UI State
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState(() => loadCity());
  const [cityInput, setCityInput] = useState('');
  const [intention, setIntention] = useState(() => loadIntention());
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardDone());
  const [onboardStep, setOnboardStep] = useState(0);
  const [showLevelPopup, setShowLevelPopup] = useState(null);
  const [showBadgePopup, setShowBadgePopup] = useState(null);
  const [showWeeklyBilan, setShowWeeklyBilan] = useState(false);
  
  // Qibla
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [qiblaLoading, setQiblaLoading] = useState(false);
  
  // Meditation
  const [showMeditation, setShowMeditation] = useState(false);
  const [meditationTime, setMeditationTime] = useState(180);
  const [meditationRunning, setMeditationRunning] = useState(false);
  const [meditationLeft, setMeditationLeft] = useState(180);
  
  // Tasbih fullscreen
  const [showTasbih, setShowTasbih] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(99);
  
  // Wird expanded
  const [wirdExpanded, setWirdExpanded] = useState({ matin: false, soir: false });
  
  // Audio
  const audioRef = useRef(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  
  // Coran picker
  const [showCoranPicker, setShowCoranPicker] = useState(false);
  const [currentSourate, setCurrentSourate] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [isPlayingQuran, setIsPlayingQuran] = useState(false);
  const [quranAudio, setQuranAudio] = useState(null);
  
  // Info sheet
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [currentInfo, setCurrentInfo] = useState(null);
  
  // Auth & Sync
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => api.isAuthenticated());
  const [syncEnabled, setSyncEnabled] = useState(() => api.isAuthenticated());
  const [lastSync, setLastSync] = useState(null);
  
  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('niyyah_theme') || 'dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('niyyah_theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Dynamic date check
  useEffect(() => {
    const checkDate = () => {
      const today = getToday();
      if (state._date !== today) {
        const prevScore = calculateScore(state);
        const prevDate = state._date;
        
        if (prevScore >= 80) {
          setHistory(prev => {
            const newStreak = prev.streak + 1;
            const newHistory = {
              ...prev,
              days: { ...prev.days, [prevDate]: true },
              dayScores: { ...prev.dayScores, [prevDate]: prevScore },
              streak: newStreak,
              bestStreak: Math.max(prev.bestStreak, newStreak),
              totalDays: prev.totalDays + 1,
            };
            saveHistory(newHistory);
            
            // Check for new badges
            BADGES.forEach(badge => {
              if (badge.check(state, newHistory) && !badge.check(state, prev)) {
                setTimeout(() => setShowBadgePopup(badge), 500);
              }
            });
            
            // Check for weekly bilan (Sunday)
            if (new Date().getDay() === 0 && newStreak >= 7) {
              setTimeout(() => setShowWeeklyBilan(true), 1000);
            }
            
            return newHistory;
          });
        } else if (prevScore > 0) {
          setHistory(prev => {
            const newHistory = { ...prev, streak: 0, dayScores: { ...prev.dayScores, [prevDate]: prevScore } };
            saveHistory(newHistory);
            return newHistory;
          });
        }
        
        const newState = { _date: today, _unlocked: state._unlocked, _prevDate: prevDate };
        setState(newState);
        saveState(newState);
        setCounters({ istighfar: 0, tasbih: 0 });
        setWirdState({ matin: {}, soir: {} });
        setFridayState({});
        setIntention(null);
        setShowIntentionModal(true);
      }
    };
    checkDate();
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [state]);
  
  // Load wird state
  useEffect(() => {
    setWirdState({ matin: loadWirdState('matin'), soir: loadWirdState('soir') });
    // Load friday state
    const fridayKey = 'niyyah_friday_' + getToday();
    const saved = localStorage.getItem(fridayKey);
    if (saved) setFridayState(JSON.parse(saved));
  }, []);
  
  // Load prayer times
  useEffect(() => {
    if (city) fetchPrayerTimes(city).then(times => { if (times) setPrayerTimes(times); });
  }, [city]);
  
  // Show intention modal
  useEffect(() => {
    if (!intention && !showIntentionModal && !showOnboarding) {
      const sessionShown = sessionStorage.getItem('intention_shown');
      if (!sessionShown) {
        setShowIntentionModal(true);
        sessionStorage.setItem('intention_shown', '1');
      }
    }
  }, [intention, showIntentionModal, showOnboarding]);
  
  // Meditation timer
  useEffect(() => {
    if (!meditationRunning || meditationLeft <= 0) return;
    const timer = setInterval(() => {
      setMeditationLeft(prev => {
        if (prev <= 1) { setMeditationRunning(false); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [meditationRunning, meditationLeft]);
  
  // Qibla compass
  useEffect(() => {
    if (!qiblaOpen || qiblaAngle === null) return;
    const handleOrientation = (e) => {
      let heading = e.webkitCompassHeading ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (heading !== null) setDeviceHeading(heading);
    };
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(p => { if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation, true); });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [qiblaOpen, qiblaAngle]);
  
  // Calculate score
  const calculateScore = useCallback((s) => {
    const level = LEVELS.find(l => l.id === currentLevel);
    if (!level) return 0;
    const items = level.sections.flatMap(sec => sec.items);
    
    // Séparer les items obligatoires et optionnels
    const requiredItems = items.filter(item => !item.optional);
    const optionalItems = items.filter(item => item.optional);
    
    let requiredTotal = 0, requiredDone = 0;
    let optionalTotal = 0, optionalDone = 0;
    
    // Calculer le score des items obligatoires
    requiredItems.forEach(item => {
      const weight = item.weight || 1;
      requiredTotal += weight;
      
      let isDone = false;
      if (item.type === 'wird') {
        const session = item.session;
        const wirdItems = WIRD_DATA[session]?.items || [];
        isDone = wirdItems.every(wi => wirdState[session]?.[wi.id]);
      } else if (item.type === 'counter') {
        isDone = (counters[item.id] || 0) >= item.target;
      } else {
        isDone = !!s[item.id];
      }
      
      if (isDone) requiredDone += weight;
    });
    
    // Calculer le score des items optionnels (bonus)
    optionalItems.forEach(item => {
      const weight = item.weight || 1;
      optionalTotal += weight;
      
      let isDone = false;
      if (item.type === 'wird') {
        const session = item.session;
        const wirdItems = WIRD_DATA[session]?.items || [];
        isDone = wirdItems.every(wi => wirdState[session]?.[wi.id]);
      } else if (item.type === 'counter') {
        isDone = (counters[item.id] || 0) >= item.target;
      } else {
        isDone = !!s[item.id];
      }
      
      if (isDone) optionalDone += weight;
    });
    
    // Score de base (0-100%) basé sur les items obligatoires
    const baseScore = requiredTotal > 0 ? (requiredDone / requiredTotal) * 100 : 0;
    
    // Bonus (0-20%) basé sur les items optionnels
    const bonusScore = optionalTotal > 0 ? (optionalDone / optionalTotal) * 20 : 0;
    
    // Score total plafonné à 120%
    return Math.min(Math.round(baseScore + bonusScore), 120);
  }, [currentLevel, wirdState, counters]);
  
  // Toggle item
  const toggleItem = (itemId) => {
    const newState = { ...state, [itemId]: !state[itemId] };
    setState(newState);
    saveState(newState);
    if (navigator.vibrate) navigator.vibrate(10);
  };
  
  // Toggle wird item
  const toggleWirdItem = (session, itemId) => {
    const newWirdState = { ...wirdState, [session]: { ...wirdState[session], [itemId]: !wirdState[session]?.[itemId] } };
    setWirdState(newWirdState);
    saveWirdState(session, newWirdState[session]);
    if (navigator.vibrate) navigator.vibrate(10);
  };
  
  // Toggle friday item
  const toggleFridayItem = (itemId) => {
    const newFridayState = { ...fridayState, [itemId]: !fridayState[itemId] };
    setFridayState(newFridayState);
    localStorage.setItem('niyyah_friday_' + getToday(), JSON.stringify(newFridayState));
    if (navigator.vibrate) navigator.vibrate(10);
  };
  
  // Toggle ramadan item
  const toggleRamadanItem = (itemId, isSpecialFast = false) => {
    if (isSpecialFast) {
      const today = getToday();
      const newRamadanState = {
        ...ramadanState,
        days: { ...ramadanState.days, [today]: !ramadanState.days?.[today] }
      };
      setRamadanState(newRamadanState);
      saveRamadanState(newRamadanState);
    } else {
      const key = 'niyyah_ramadan_item_' + getToday();
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      saved[itemId] = !saved[itemId];
      localStorage.setItem(key, JSON.stringify(saved));
    }
    if (navigator.vibrate) navigator.vibrate(10);
  };
  
  // Increment counter
  const incrementCounter = (counterId) => {
    const newCounters = { ...counters, [counterId]: (counters[counterId] || 0) + 1 };
    setCounters(newCounters);
    saveCounters(newCounters);
    if (navigator.vibrate) navigator.vibrate(10);
  };
  
  // Reset counter
  const resetCounter = (counterId) => {
    const newCounters = { ...counters, [counterId]: 0 };
    setCounters(newCounters);
    saveCounters(newCounters);
  };
  
  // Play audio
  const playAudio = (url) => {
    if (audioRef.current) {
      if (playingAudio === url) {
        audioRef.current.pause();
        setPlayingAudio(null);
      } else {
        audioRef.current.src = url;
        audioRef.current.play()
          .then(() => {
            setPlayingAudio(url);
          })
          .catch((error) => {
            console.log('Audio playback failed:', error);
            // Try again with user interaction
            setPlayingAudio(url);
          });
      }
    }
  };
  
  // Handle city submit
  const handleCitySubmit = (e) => {
    e?.preventDefault();
    if (cityInput.trim()) { setCity(cityInput.trim()); saveCity(cityInput.trim()); }
  };
  
  // Handle intention select
  const handleIntentionSelect = (int) => {
    saveIntention(int.type, int.label);
    setIntention({ type: int.type, label: int.label });
    setShowIntentionModal(false);
  };
  
  // Load Qibla
  const loadQibla = () => {
    setQiblaLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setQiblaAngle(calculateQibla(pos.coords.latitude, pos.coords.longitude)); setQiblaLoading(false); },
      () => { setQiblaAngle(136); setQiblaLoading(false); },
      { timeout: 8000 }
    );
  };
  
  // Finish onboarding
  const finishOnboarding = () => {
    setOnboardDone();
    setShowOnboarding(false);
    if (cityInput.trim()) { setCity(cityInput.trim()); saveCity(cityInput.trim()); }
    setTimeout(() => setShowIntentionModal(true), 400);
  };
  
  // Tasbih tap
  const tapTasbih = () => {
    if (tasbihCount < tasbihTarget) { setTasbihCount(prev => prev + 1); if (navigator.vibrate) navigator.vibrate(10); }
  };
  
  // Switch level
  const switchLevel = (levelId) => {
    if ((state._unlocked || [1]).includes(levelId)) {
      setCurrentLevel(levelId);
      saveCurrentLevel(levelId);
    }
  };
  
  const score = calculateScore(state);
  const todayHadith = HADITHS[Math.floor(Date.now() / 86400000) % HADITHS.length];
  const level = LEVELS.find(l => l.id === currentLevel);
  
  // Check and unlock next level if score >= 100
  const checkLevelUnlock = useCallback(() => {
    const currentScore = calculateScore(state);
    if (currentScore >= 100 && currentLevel < 4) {
      const nextLevel = currentLevel + 1;
      if (!(state._unlocked || [1]).includes(nextLevel)) {
        const updatedState = { ...state, _unlocked: [...(state._unlocked || [1]), nextLevel] };
        setState(updatedState);
        saveState(updatedState);
        setTimeout(() => setShowLevelPopup(LEVELS.find(l => l.id === nextLevel)), 500);
      }
    }
  }, [state, currentLevel, calculateScore]);
  
  // Auto-check on state/wird/counter changes
  useEffect(() => {
    checkLevelUnlock();
  }, [state, wirdState, counters, currentLevel]);
  
  const getMedal = () => {
    if (score >= 100 && history.streak >= 7) return 'gold';
    if (score >= 80 && history.streak >= 3) return 'silver';
    if (score >= 50) return 'bronze';
    return 'none';
  };
  const medal = getMedal();
  const isRamadanMode = ramadanState.active;
  const ramadanDay = ramadanState.startDate ? Math.round((new Date(getToday() + 'T12:00:00') - new Date(ramadanState.startDate + 'T12:00:00')) / 86400000) + 1 : 0;
  
  // Auth functions
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await api.register(authEmail, authPassword, authName);
      } else {
        await api.login(authEmail, authPassword);
      }
      
      setIsAuthenticated(true);
      setSyncEnabled(true);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      
      // Sync to cloud after login
      await performSync();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setSyncEnabled(false);
  };

  // Sync function
  const performSync = async () => {
    if (!isAuthenticated || !syncEnabled) return;

    const today = getToday();
    try {
      // Sync current state to cloud
      const success = await syncToCloud(state, counters, wirdState, ramadanState, history, today);
      if (success) {
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Auto-sync on state changes
  useEffect(() => {
    if (!isAuthenticated || !syncEnabled) return;
    const syncTimeout = setTimeout(() => performSync(), 2000); // Debounce 2s
    return () => clearTimeout(syncTimeout);
  }, [state, counters, wirdState, ramadanState, history, isAuthenticated, syncEnabled]);
  
  // Info sheet functions
  const showInfo = (itemId) => {
    const info = ITEM_INFO[itemId];
    if (info) {
      setCurrentInfo({ id: itemId, ...info });
      setShowInfoSheet(true);
    }
  };
  
  const closeInfoSheet = () => {
    setShowInfoSheet(false);
    setCurrentInfo(null);
  };
  
  // Quran player functions
  const playSourate = (sourate) => {
    if (quranAudio) {
      quranAudio.pause();
    }
    setCurrentSourate(sourate);
    setCurrentVerse(0);
    setIsPlayingQuran(true);
    setShowCoranPicker(false);
    playNextVerse(sourate, 0);
  };
  
  const playNextVerse = (sourate, verseIndex) => {
    if (!sourate || verseIndex >= sourate[4]) {
      setIsPlayingQuran(false);
      return;
    }
    
    const num = String(sourate[0]).padStart(3, '0');
    const ver = String(verseIndex + 1).padStart(3, '0');
    const url = `https://everyayah.com/data/Alafasy_128kbps/${num}${ver}.mp3`;
    
    const audio = new Audio(url);
    setQuranAudio(audio);
    setCurrentVerse(verseIndex);
    
    audio.onended = () => {
      playNextVerse(sourate, verseIndex + 1);
    };
    
    audio.onerror = () => {
      playNextVerse(sourate, verseIndex + 1);
    };
    
    audio.play().catch(() => {
      playNextVerse(sourate, verseIndex + 1);
    });
  };
  
  const stopQuranPlayer = () => {
    if (quranAudio) {
      quranAudio.pause();
      setQuranAudio(null);
    }
    setIsPlayingQuran(false);
    setCurrentSourate(null);
    setCurrentVerse(0);
  };
  
  const toggleQuranPlay = () => {
    if (!quranAudio) return;
    
    if (isPlayingQuran) {
      quranAudio.pause();
      setIsPlayingQuran(false);
    } else {
      quranAudio.play();
      setIsPlayingQuran(true);
    }
  };
  
  return (
    <div className="min-h-screen islamic-bg">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} />
      
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#03030a] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm text-center">
              {onboardStep === 0 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <img src="https://nabs881-sketch.github.io/niyyah-app/logo2.png" alt="Niyyah" className="w-40 h-40 mx-auto mb-6 object-contain animate-float" />
                  <h1 className="font-heading text-3xl text-white mb-2">Niyyah Daily</h1>
                  <p className="text-amber-500 text-sm font-arabic mb-4">نِيَّة · Pose ton intention</p>
                  <h2 className="text-xl text-white mb-3">Ta pratique spirituelle,<br/>chaque jour</h2>
                  <p className="text-slate-400 text-sm mb-8">Niyyah t'accompagne dans ton chemin vers Allah — à ton rythme, sans jugement.</p>
                  <button onClick={() => setOnboardStep(1)} className="w-full btn-primary py-4 rounded-xl mb-3" data-testid="onboard-next">Commencer →</button>
                  <button onClick={finishOnboarding} className="text-slate-500 text-sm">Passer</button>
                </motion.div>
              )}
              {onboardStep === 1 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <h2 className="text-xl text-white mb-6">4 niveaux de pratique</h2>
                  <div className="space-y-3 mb-8">
                    {LEVELS.map(l => (
                      <div key={l.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 text-left">
                        <span className="text-2xl">{l.icon}</span>
                        <div><div className="text-white font-medium">{l.name}</div><div className="text-slate-500 text-sm">{l.desc}</div></div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setOnboardStep(2)} className="w-full btn-primary py-4 rounded-xl mb-3">Suivant →</button>
                  <button onClick={finishOnboarding} className="text-slate-500 text-sm">Passer</button>
                </motion.div>
              )}
              {onboardStep === 2 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <img src="https://nabs881-sketch.github.io/niyyah-app/logo2.png" alt="Niyyah" className="w-28 h-28 mx-auto mb-6 object-contain" />
                  <h2 className="text-xl text-white mb-3">Tes horaires de prière</h2>
                  <p className="text-slate-400 text-sm mb-6">Entre ta ville pour afficher les horaires.</p>
                  <div className="flex gap-2 mb-6">
                    <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Paris, Casablanca..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500" data-testid="onboard-city-input" />
                    <button onClick={handleCitySubmit} className="bg-emerald-500 text-black px-4 rounded-xl font-bold">OK</button>
                  </div>
                  <button onClick={finishOnboarding} className="w-full btn-primary py-4 rounded-xl mb-3" data-testid="onboard-finish">C'est parti — Bismillah 🌿</button>
                </motion.div>
              )}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map(i => (<div key={i} className={`w-2 h-2 rounded-full transition-all ${i === onboardStep ? 'bg-emerald-500 w-4' : 'bg-white/20'}`} />))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Intention Modal */}
      <AnimatePresence>
        {showIntentionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card p-8 max-w-sm w-full text-center">
              <div className="text-5xl font-arabic text-amber-400/30 mb-2">نِيَّة</div>
              <h2 className="font-heading text-2xl text-white mb-1">Avec quelle intention</h2>
              <p className="text-slate-500 mb-6">débutes-tu cette journée ?</p>
              <div className="space-y-3">
                {INTENTIONS.map((int) => (
                  <button key={int.type} onClick={() => handleIntentionSelect(int)} className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all group text-left" data-testid={`intention-${int.type}`}>
                    <span className="text-2xl">{int.icon}</span>
                    <div className="flex-1"><div className="text-white font-medium">{int.label}</div><div className="text-amber-500/60 text-xs">{int.sub}</div></div>
                    <ChevronRight className="w-5 h-5 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowIntentionModal(false)} className="mt-4 text-slate-600 text-sm">passer →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Level Unlock Popup */}
      <AnimatePresence>
        {showLevelPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} className="glass-card p-8 max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <div className="text-5xl mb-4 animate-bounce">{showLevelPopup.icon}</div>
              <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-semibold mb-2">Niveau débloqué</div>
              <h2 className="font-heading text-2xl text-white mb-2">{showLevelPopup.name}</h2>
              <p className="text-slate-400 mb-6">{showLevelPopup.desc}</p>
              <button onClick={() => { switchLevel(showLevelPopup.id); setShowLevelPopup(null); }} className="w-full btn-primary py-3 rounded-xl mb-2">Explorer ce niveau</button>
              <button onClick={() => setShowLevelPopup(null)} className="text-slate-500 text-sm">Rester sur le niveau actuel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Badge Popup */}
      <AnimatePresence>
        {showBadgePopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} className="glass-card p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4 animate-bounce">{showBadgePopup.emoji}</div>
              <h2 className="font-heading text-2xl text-white mb-2">{showBadgePopup.name}</h2>
              <p className="text-slate-400 mb-6">{showBadgePopup.desc}</p>
              <button onClick={() => setShowBadgePopup(null)} className="w-full btn-primary py-3 rounded-xl">Alhamdulillah !</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Weekly Bilan */}
      <AnimatePresence>
        {showWeeklyBilan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 max-w-sm w-full text-center max-h-[90vh] overflow-y-auto border-amber-500/30">
              <div className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mb-4">Bilan hebdomadaire</div>
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-amber-500 flex flex-col items-center justify-center bg-amber-500/10 mb-4">
                <span className="font-heading text-2xl text-amber-500">{history.streak}</span>
                <span className="text-[9px] text-slate-500 uppercase">jours</span>
              </div>
              <h3 className="font-heading text-xl text-white mb-4">Semaine bénie !</h3>
              <div className="flex gap-1 justify-center mb-4">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="w-7 h-10 rounded-md bg-white/10 flex items-end overflow-hidden">
                    <div className="w-full bg-emerald-500 rounded-md" style={{ height: `${Math.random() * 60 + 40}%` }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/5 rounded-xl p-3"><div className="font-heading text-xl text-emerald-500">{Math.round(score * 7 / 100)}</div><div className="text-[9px] text-slate-500 uppercase">jours 100%</div></div>
                <div className="bg-white/5 rounded-xl p-3"><div className="font-heading text-xl text-white">{history.streak}</div><div className="text-[9px] text-slate-500 uppercase">série</div></div>
                <div className="bg-white/5 rounded-xl p-3"><div className="font-heading text-xl text-amber-500">{score}%</div><div className="text-[9px] text-slate-500 uppercase">moyenne</div></div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                <p className="text-white text-sm italic mb-2">"{WEEKLY_HADITHS[Math.floor(Date.now() / 604800000) % WEEKLY_HADITHS.length].text}"</p>
                <p className="text-amber-500 text-xs">— {WEEKLY_HADITHS[Math.floor(Date.now() / 604800000) % WEEKLY_HADITHS.length].ref}</p>
              </div>
              <button onClick={() => setShowWeeklyBilan(false)} className="w-full btn-primary py-3 rounded-xl">Continuer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card p-8 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-6">
                <Cloud className="w-6 h-6 text-emerald-500" />
                <h2 className="font-heading text-2xl text-white">{authMode === 'login' ? 'Se connecter' : 'Créer un compte'}</h2>
              </div>
              
              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}
              
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Nom (optionnel)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                  />
                )}
                
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                />
                
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                />
                
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
                >
                  {authLoading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : 'Créer mon compte')}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-slate-400 text-sm hover:text-emerald-500 transition-colors"
                >
                  {authMode === 'login' ? 'Créer un compte' : 'J\'ai déjà un compte'}
                </button>
              </div>
              
              <button onClick={() => setShowAuthModal(false)} className="mt-4 w-full text-slate-500 text-sm">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Sheet Modal */}
      <AnimatePresence>
        {showInfoSheet && currentInfo && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeInfoSheet}
              className="fixed inset-0 z-[96] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[97] bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-6"></div>
              
              <div className="px-6 pb-8">
                <div className="text-[10px] font-semibold tracking-widest uppercase text-emerald-500 mb-3">
                  Pourquoi cette pratique ?
                </div>
                
                {currentInfo.arabic && (
                  <div className="text-2xl text-emerald-400 text-right mb-4 leading-relaxed border-b border-white/10 pb-4" dir="rtl">
                    {currentInfo.arabic}
                  </div>
                )}
                
                {currentInfo.phonetic && (
                  <div className="text-base italic text-slate-300 mb-3 leading-relaxed">
                    {currentInfo.phonetic}
                  </div>
                )}
                
                {currentInfo.translation && (
                  <div className="text-sm text-slate-400 mb-5 leading-relaxed">
                    {currentInfo.translation}
                  </div>
                )}
                
                {currentInfo.why && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                    <div className="text-xs font-semibold text-emerald-500 mb-2 uppercase tracking-wider">
                      💡 Pourquoi ?
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed">
                      {currentInfo.why}
                    </div>
                  </div>
                )}
                
                {currentInfo.ref && (
                  <div className="text-xs text-slate-500 italic">
                    — {currentInfo.ref}
                  </div>
                )}
                
                <button
                  onClick={closeInfoSheet}
                  className="w-full mt-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Quran Player */}
      {currentSourate && (
        <div className="fixed bottom-20 left-4 right-4 z-[90] bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 backdrop-blur-lg rounded-2xl border border-emerald-500/30 shadow-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="text-sm font-semibold text-emerald-400">{currentSourate[1]} — {currentSourate[2]}</div>
              <div className="text-xs text-slate-400">Verset {currentVerse + 1} / {currentSourate[4]}</div>
            </div>
            <button
              onClick={toggleQuranPlay}
              className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:bg-emerald-400 transition-colors"
            >
              {isPlayingQuran ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={stopQuranPlayer}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300" 
              style={{ width: `${((currentVerse + 1) / currentSourate[4]) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Meditation Screen */}
      <AnimatePresence>
        {showMeditation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#03030a] flex flex-col items-center justify-center p-6">
            <button onClick={() => { setShowMeditation(false); setMeditationRunning(false); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
            <motion.div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center" animate={{ scale: meditationRunning ? [1, 1.1, 1] : 1 }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <div className="w-16 h-16 rounded-full bg-red-500" />
            </motion.div>
            <div className="flex gap-3 mt-8 mb-6">
              {[180, 300, 600].map(t => (
                <button key={t} onClick={() => { setMeditationTime(t); setMeditationLeft(t); }} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${meditationTime === t ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>{t / 60} min</button>
              ))}
            </div>
            <div className="font-heading text-6xl text-white mb-4">{String(Math.floor(meditationLeft / 60)).padStart(2, '0')}:{String(meditationLeft % 60).padStart(2, '0')}</div>
            <p className="text-slate-400 text-center mb-8 max-w-xs italic font-serif">{MEDITATION_PHRASES[Math.floor(Date.now() / 60000) % MEDITATION_PHRASES.length]}</p>
            <button onClick={() => { if (meditationRunning) { setMeditationRunning(false); } else { setMeditationLeft(meditationTime); setMeditationRunning(true); }}} className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
              {meditationRunning ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-1" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tasbih Fullscreen */}
      <AnimatePresence>
        {showTasbih && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#03030a] flex flex-col items-center justify-center">
            <button onClick={() => setShowTasbih(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
            <div className="text-slate-500 text-sm uppercase tracking-widest mb-2">Tasbih</div>
            <div className="font-arabic text-emerald-500/70 text-xl mb-8">سُبْحَانَ اللَّهِ</div>
            <div className={`font-heading text-9xl mb-2 transition-transform ${tasbihCount >= tasbihTarget ? 'text-emerald-500' : 'text-white'}`} onClick={tapTasbih}>{tasbihCount}</div>
            <div className="text-slate-500 text-xl">/ {tasbihTarget}</div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer" onClick={tapTasbih} data-testid="tasbih-tap-zone">
              <div className="absolute bottom-32 left-0 right-0 text-center text-slate-600 text-xs uppercase tracking-widest">Appuie n'importe où</div>
            </div>
            <button onClick={() => setTasbihCount(0)} className="absolute bottom-8 left-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-500"><RotateCcw className="w-4 h-4" /></button>
            <div className="absolute bottom-8 left-16 right-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200" style={{ width: `${(tasbihCount / tasbihTarget) * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Coran Picker */}
      <AnimatePresence>
        {showCoranPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm p-6 overflow-y-auto">
            <button onClick={() => setShowCoranPicker(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
            <h2 className="font-heading text-2xl text-white mb-6 text-center mt-12">Écouter le Coran</h2>
            <p className="text-slate-400 text-sm text-center mb-6">Sélectionnez une sourate pour l'écouter verset par verset</p>
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {SOURATES.map(sourate => (
                <button 
                  key={sourate[0]} 
                  onClick={() => { playSourate(sourate); toggleItem('coran_ecoute'); }} 
                  className={`glass-card p-4 text-left hover:bg-emerald-500/10 transition-colors ${currentSourate && currentSourate[0] === sourate[0] ? 'bg-emerald-500/20 border-emerald-500/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-sm font-bold flex-shrink-0">{sourate[0]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">{sourate[1]} <span className="text-slate-500 text-xs">· {sourate[3]}</span></div>
                      <div className="text-xs text-slate-500">{sourate[4]} versets</div>
                    </div>
                    <div className="text-emerald-500/70 font-arabic text-lg">{sourate[2]}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 px-5 pt-4 pb-3 backdrop-blur-xl bg-[#022c22]/80 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_web-app-enhance-1/artifacts/v3fs1xde_banner.png" 
                alt="Niyyah - Pratique & Élévation"
                className="h-12 w-auto object-contain"
              />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{formatDateFr(getToday())}</p>
            </div>
            <div className="flex items-center gap-2">
              {isRamadanMode && <span className="text-amber-500 text-xl">🌙</span>}
              
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
              
              {/* Sync indicator */}
              {isAuthenticated && (
                <button
                  onClick={() => performSync()}
                  className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                  title={lastSync ? `Dernière sync: ${lastSync.toLocaleTimeString('fr-FR')}` : 'Synchroniser'}
                >
                  <Cloud className={`w-4 h-4 ${syncEnabled ? 'text-emerald-500' : 'text-slate-500'}`} />
                  {lastSync && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></div>}
                </button>
              )}
              
              {/* Auth button */}
              <button
                onClick={() => isAuthenticated ? handleLogout() : setShowAuthModal(true)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                title={isAuthenticated ? 'Se déconnecter' : 'Se connecter'}
              >
                {isAuthenticated ? (
                  <LogOut className="w-4 h-4 text-emerald-500" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </button>
              
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${medal === 'gold' ? 'bg-amber-500/20 text-amber-400' : medal === 'silver' ? 'bg-slate-400/20 text-slate-300' : medal === 'bronze' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-slate-500'}`}>
                {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : '—'}
              </div>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.5 }} />
          </div>
        </header>
        
        {/* Level Tabs */}
        <div className="sticky top-[72px] z-30 bg-[#022c22]/80 backdrop-blur-xl px-4 py-2 border-b border-white/5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {LEVELS.map(l => {
              const unlocked = (state._unlocked || [1]).includes(l.id);
              const active = currentLevel === l.id;
              const lvlScore = l.id === currentLevel ? score : 0;
              return (
                <button key={l.id} onClick={() => switchLevel(l.id)} disabled={!unlocked} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-emerald-500 text-black' : unlocked ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-600 opacity-50'} ${!unlocked && 'cursor-not-allowed'}`}>
                  {l.icon} {l.name} {active && lvlScore >= 100 && '✓'}
                </button>
              );
            })}
            {isRamadanMode && <button onClick={() => setActiveTab('ramadan')} className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-amber-500/20 text-amber-500">🌙 Ramadan</button>}
          </div>
        </div>
        
        {/* Tab Content */}
        <main className="p-4">
          <AnimatePresence mode="wait">
            {/* ACCUEIL TAB */}
            {activeTab === 'accueil' && (
              <motion.div key="accueil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Hero Card */}
                <div className="glass-card p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-1">Série en cours</div>
                      <div className="flex items-end gap-2">
                        <span className="font-heading text-5xl text-white">{history.streak}</span>
                        <span className="text-slate-500 text-sm mb-2">jours</span>
                        <span className="text-2xl">🔥</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Niveau</div>
                      <div className="text-emerald-500 font-semibold">{level?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">{score}%</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = getDateMinus(getToday(), 13 - i);
                      const isToday = date === getToday();
                      const done = isToday ? score >= 80 : history.days?.[date];
                      return <div key={date} className={`flex-1 h-2 rounded transition-all ${done ? 'bg-emerald-500' : isToday ? 'ring-1 ring-emerald-500 bg-white/10' : 'bg-white/5'}`} />;
                    })}
                  </div>
                </div>
                
                {/* Intention */}
                {intention && (
                  <div className="glass-card p-4 border-l-2 border-amber-500">
                    <div className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold mb-1">Intention du jour</div>
                    <div className="text-white font-serif italic">{intention.label}</div>
                  </div>
                )}
                
                {/* Friday Banner */}
                {/* Friday Special - SEULEMENT LE VENDREDI */}
                {isFriday() && (
                  <div className="glass-card p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🕌</span>
                      <div>
                        <h3 className="font-heading text-lg text-amber-500">Jumua Mubarak ✨</h3>
                        <p className="text-slate-500 text-xs">Le meilleur jour de la semaine</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {FRIDAY_ITEMS.map(item => (
                        <button key={item.id} onClick={() => toggleFridayItem(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left transition-all hover:bg-amber-500/20 ${fridayState[item.id] ? 'opacity-50' : ''}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${fridayState[item.id] ? 'bg-amber-500 border-amber-500' : 'border-amber-500/40'}`}>
                            {fridayState[item.id] && <Check className="w-3 h-3 text-black" />}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${fridayState[item.id] ? 'line-through text-slate-500' : 'text-amber-500'}`}>{item.label}</div>
                            <div className="text-xs text-slate-500">{item.sub}</div>
                          </div>
                          {item.audio && <button onClick={(e) => { e.stopPropagation(); playAudio(item.audio); }} className={`w-7 h-7 rounded-full flex items-center justify-center ${playingAudio === item.audio ? 'bg-amber-500 text-black' : 'bg-amber-500/20 text-amber-500'}`}><Volume2 className="w-3 h-3" /></button>}
                          <span className="font-arabic text-amber-500/50 text-sm">{item.arabic}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Hadith */}
                <div className="glass-card p-4">
                  <div className="text-amber-500/30 text-3xl font-serif mb-1">"</div>
                  <p className="text-slate-300 italic font-serif leading-relaxed">{todayHadith.text}</p>
                  <p className="text-amber-500/60 text-sm mt-2">— {todayHadith.ref}</p>
                </div>
                
                {/* Prayer Times */}
                {prayerTimes && (
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider">🕌 Horaires</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{city}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(name => (
                        <div key={name} className="text-center p-2 rounded-lg bg-white/5">
                          <div className="text-[9px] text-slate-500 uppercase">{name}</div>
                          <div className="text-white font-medium text-sm">{prayerTimes[name]?.substring(0, 5)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* City Input */}
                {!city && (
                  <form onSubmit={handleCitySubmit} className="glass-card p-4">
                    <div className="text-slate-400 text-sm mb-2">Entre ta ville pour les horaires</div>
                    <div className="flex gap-2">
                      <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Paris, Casablanca..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500" data-testid="city-input" />
                      <button type="submit" className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold" data-testid="city-submit">OK</button>
                    </div>
                  </form>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: 'Streak', value: history.streak, color: 'emerald' }, { label: 'Record', value: history.bestStreak, color: 'white' }, { label: 'Score', value: score, color: 'amber' }, { label: 'Jours', value: history.totalDays, color: 'slate' }].map(stat => (
                    <div key={stat.label} className="glass-card p-3 text-center">
                      <div className={`font-heading text-2xl ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-white'}`}>{stat.value}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* CTAs */}
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('checklist')} className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold">▶ Commencer</button>
                  <button onClick={() => setActiveTab('stats')} className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-semibold">📊 Bilan</button>
                </div>
                
              </motion.div>
            )}
            
            {/* CHECKLIST TAB */}
            {activeTab === 'checklist' && (
              <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Level Hero */}
                <div className="glass-card p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mb-1">Niveau {currentLevel}</div>
                  <h2 className="font-heading text-2xl text-white mb-3">{level?.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${score}%` }} /></div>
                    <span className="text-emerald-500 font-bold text-sm">{score}%</span>
                  </div>
                </div>
                
                {/* Qibla Card */}
                <div className="glass-card overflow-hidden">
                  <button onClick={() => { setQiblaOpen(!qiblaOpen); if (!qiblaOpen && !qiblaAngle) loadQibla(); }} className="w-full flex items-center justify-between p-4">
                    <span className="text-amber-500 font-medium">🕋 Qibla — Direction de La Mecque</span>
                    <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform ${qiblaOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {qiblaOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                        {qiblaLoading ? <div className="text-center py-8 text-slate-500">Localisation en cours...</div> : qiblaAngle !== null ? (
                          <div className="text-center">
                            <div className="relative w-48 h-48 mx-auto my-4">
                              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold text-sm">N</div>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 text-sm">S</div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">E</div>
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">O</div>
                              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300" style={{ transform: `rotate(${deviceHeading !== null ? qiblaAngle - deviceHeading : qiblaAngle}deg)` }}>
                                <div className="w-1 h-20 bg-gradient-to-t from-transparent to-amber-400 rounded-full -translate-y-2" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center text-2xl">🕋</div>
                            </div>
                            <div className="font-heading text-4xl text-amber-400 mb-2">{Math.round(deviceHeading !== null ? (qiblaAngle - deviceHeading + 360) % 360 : qiblaAngle)}°</div>
                            <p className="text-emerald-400 text-sm">{deviceHeading !== null && Math.abs((qiblaAngle - deviceHeading + 360) % 360) < 15 ? '✦ Tu es aligné avec La Mecque !' : 'Tourne vers l\'aiguille dorée'}</p>
                          </div>
                        ) : <button onClick={loadQibla} className="w-full py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 font-medium">📍 Trouver la Qibla</button>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Sections */}
                {level?.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <div className="flex items-center gap-2 px-1 pt-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">{section.icon}</div>
                      <span className="text-slate-400 text-sm font-medium">{section.title}</span>
                    </div>
                    <div className="glass-card divide-y divide-white/5 overflow-hidden">
                      {section.items.map((item) => {
                        if (item.type === 'wird') {
                          const session = item.session;
                          const wirdItems = WIRD_DATA[session]?.items || [];
                          const doneCount = wirdItems.filter(wi => wirdState[session]?.[wi.id]).length;
                          const allDone = doneCount === wirdItems.length;
                          return (
                            <div key={item.id}>
                              <button onClick={() => setWirdExpanded(prev => ({ ...prev, [session]: !prev[session] }))} className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${allDone ? 'bg-emerald-500/10' : ''}`}>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${allDone ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{allDone && <Check className="w-4 h-4 text-white" />}</div>
                                <div className="flex-1"><div className={`font-medium ${allDone ? 'text-slate-500 line-through' : 'text-white'}`}>{item.label}</div><div className="text-slate-500 text-sm">{item.sub}</div></div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-500 text-sm">{doneCount}/{wirdItems.length}</span>
                                  <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform ${wirdExpanded[session] ? 'rotate-180' : ''}`} />
                                </div>
                              </button>
                              <AnimatePresence>
                                {wirdExpanded[session] && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-white/5">
                                    {wirdItems.map(wi => (
                                      <div key={wi.id} className={`flex items-center gap-3 p-3 pl-12 border-t border-white/5 ${wirdState[session]?.[wi.id] ? 'opacity-50' : ''}`}>
                                        <button onClick={() => toggleWirdItem(session, wi.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${wirdState[session]?.[wi.id] ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`} data-testid={`wird-${session}-${wi.id}`}>
                                          {wirdState[session]?.[wi.id] && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <div className="flex-1"><div className={`text-sm ${wirdState[session]?.[wi.id] ? 'line-through text-slate-500' : 'text-white'}`}>{wi.name}</div></div>
                                        <span className="text-emerald-500/60 text-xs">{wi.count}</span>
                                        {wi.audio && <button onClick={() => playAudio(wi.audio)} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${playingAudio === wi.audio ? 'bg-emerald-500 text-black' : 'bg-emerald-500/20 text-emerald-500'}`}><Volume2 className="w-3 h-3" /></button>}
                                        <span className="font-arabic text-emerald-500/50 text-sm">{wi.arabic}</span>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        }
                        if (item.type === 'counter') {
                          const count = counters[item.id] || 0;
                          const done = count >= item.target;
                          return (
                            <div key={item.id} className={`p-4 ${done ? 'bg-emerald-500/10' : ''}`}>
                              <div className="flex items-center gap-4 mb-3">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{done && <Check className="w-4 h-4 text-white" />}</div>
                                <div className="flex-1"><div className={`font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>{item.label}</div><div className="text-slate-500 text-sm">{item.sub}</div></div>
                                <button onClick={() => { setTasbihCount(count); setTasbihTarget(item.target); setShowTasbih(true); }} className="text-slate-500 text-xs">⛶</button>
                              </div>
                              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <button onClick={() => resetCounter(item.id)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 text-sm">↺</button>
                                <div className="flex-1 text-center">
                                  <div className={`font-heading text-3xl ${done ? 'text-emerald-500' : 'text-white'}`}>{count}</div>
                                  <div className="text-slate-500 text-xs">/ {item.target}</div>
                                </div>
                                <button onClick={() => incrementCounter(item.id)} className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-xl" data-testid={`counter-${item.id}`}>+</button>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (count / item.target) * 100)}%` }} /></div>
                            </div>
                          );
                        }
                        if (item.coranPicker) {
                          return (
                            <button key={item.id} onClick={() => setShowCoranPicker(true)} className="w-full flex items-center gap-4 p-4 text-left">
                              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${state[item.id] ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{state[item.id] && <Check className="w-4 h-4 text-white" />}</div>
                              <div className="flex-1"><div className="text-white font-medium">{item.label}</div><div className="text-slate-500 text-sm">{item.sub}</div></div>
                              <span className="font-arabic text-emerald-500/60">{item.arabic}</span>
                            </button>
                          );
                        }
                        const done = state[item.id];
                        return (
                          <div key={item.id} onClick={() => toggleItem(item.id)} className={`w-full flex items-center gap-4 p-4 text-left transition-colors cursor-pointer ${done ? 'bg-emerald-500/10' : ''}`} data-testid={`item-${item.id}`}>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-white/20'}`}>{done && <Check className="w-4 h-4 text-white" />}</div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {item.priority === 'fard' && <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />}
                                {item.priority === 'sunnah' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />}
                                {item.label}
                              </div>
                              <div className="text-slate-500 text-sm">{item.sub}</div>
                              {item.arabic && <div className={`font-arabic text-emerald-500/60 text-lg mt-1 ${done ? 'opacity-30' : ''}`}>{item.arabic}</div>}
                            </div>
                            {ITEM_INFO[item.id] && <button onClick={(e) => { e.stopPropagation(); showInfo(item.id); }} className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-slate-400 text-xs font-serif italic hover:bg-white/10 transition-colors">i</button>}
                            {item.hasAudio && item.audio && <button onClick={(e) => { e.stopPropagation(); playAudio(item.audio); }} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${playingAudio === item.audio ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'}`}><Volume2 className="w-4 h-4" /></button>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Links */}
                    {section.links && (
                      <div className="space-y-2 mt-2">
                        {section.links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <span className="text-lg">{link.icon}</span>
                            <div className="flex-1"><div className="text-amber-500 font-medium text-sm">{link.label}</div><div className="text-slate-500 text-xs">{link.sub}</div></div>
                            <ExternalLink className="w-4 h-4 text-amber-500/50" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Reset + Bismillah */}
                <div className="flex gap-2 pt-4">
                  <button onClick={() => { const newState = { _date: state._date, _unlocked: state._unlocked }; setState(newState); saveState(newState); setCounters({ istighfar: 0, tasbih: 0 }); saveCounters({ istighfar: 0, tasbih: 0 }); setWirdState({ matin: {}, soir: {} }); saveWirdState('matin', {}); saveWirdState('soir', {}); }} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400">↺ Reset</button>
                  <button className="flex-1 py-3 rounded-xl btn-primary text-lg font-serif">بِسْمِ اللَّهِ</button>
                </div>
                
                {/* BOUTON RAMADAN - TOUJOURS VISIBLE */}
                <div className="glass-card p-6 border-2 border-amber-500/30 mt-6">
                  <div className="text-center mb-4">
                    <Moon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-heading text-xl text-white mb-2">Mode Ramadan</h3>
                    <p className="text-slate-400 text-sm">
                      {isRamadanMode ? 'Mode Ramadan actif' : 'Suivi des 30 jours + items spéciaux'}
                    </p>
                  </div>
                  {isRamadanMode ? (
                    <button 
                      onClick={() => {
                        const newState = { ...ramadanState, active: false }; 
                        setRamadanState(newState); 
                        saveRamadanState(newState);
                      }} 
                      className="w-full py-4 px-6 rounded-xl border-2 border-red-500 bg-red-500/30 text-red-200 text-lg font-bold hover:bg-red-500/40 transition-all"
                    >
                      ❌ Désactiver Ramadan
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        const newState = { ...ramadanState, active: true, startDate: getToday() }; 
                        setRamadanState(newState); 
                        saveRamadanState(newState);
                        setActiveTab('ramadan');
                      }} 
                      className="w-full py-4 px-6 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-200 text-lg font-bold hover:from-amber-500/40 hover:to-amber-600/40 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                    >
                      🌙 Activer le mode Ramadan
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Streak Card */}
                <div className="glass-card p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Série en cours</div>
                      <div className="font-heading text-7xl text-white">{history.streak}</div>
                      <div className="text-slate-400 text-sm mt-1">jours consécutifs</div>
                    </div>
                    <div className="text-5xl">🔥</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ name: 'Bronze', emoji: '🥉', active: medal === 'bronze' || medal === 'silver' || medal === 'gold' }, { name: 'Argent', emoji: '🥈', active: medal === 'silver' || medal === 'gold' }, { name: 'Or', emoji: '🥇', active: medal === 'gold' }].map(m => (
                      <div key={m.name} className={`text-center p-3 rounded-xl border transition-all ${m.active ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                        <div className="text-xl mb-1">{m.emoji}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${m.active ? 'text-amber-500' : 'text-slate-500'}`}>{m.name}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-3 border-t border-white/10 text-sm text-slate-500">
                    <span>Record: <span className="text-white font-medium">{history.bestStreak}</span></span>
                    <span>Total: <span className="text-white font-medium">{history.totalDays}</span> jours</span>
                  </div>
                </div>
                
                {/* Week Strip */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = getDateMinus(getToday(), 6 - i);
                    const isToday = date === getToday();
                    const done = history.days?.[date];
                    const d = new Date(date + 'T12:00:00');
                    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                    return (
                      <div key={date} className={`aspect-[0.7] rounded-xl border flex flex-col items-center justify-center gap-1 ${done ? 'bg-emerald-500/10 border-emerald-500/30' : isToday ? 'border-emerald-500' : 'bg-white/5 border-white/10'}`}>
                        <div className={`text-[9px] uppercase font-semibold ${isToday ? 'text-emerald-500' : done ? 'text-emerald-500' : 'text-slate-500'}`}>{dayNames[d.getDay()]}</div>
                        <div className="text-base">{done ? '✓' : '○'}</div>
                        <div className="text-[10px] text-slate-500">{d.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Badges */}
                <h3 className="font-heading text-xl text-white pt-2">Badges</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BADGES.map(badge => {
                    const unlocked = badge.check(state, history);
                    return (
                      <div key={badge.id} className={`glass-card p-4 text-center transition-all ${unlocked ? badge.gold ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30' : 'opacity-40 grayscale'}`}>
                        <div className="text-3xl mb-2">{badge.emoji}</div>
                        <div className="text-white font-medium text-sm">{badge.name}</div>
                        <div className="text-slate-500 text-xs mt-1">{badge.desc}</div>
                        {unlocked && <div className={`text-[10px] uppercase tracking-wider mt-2 px-2 py-1 rounded-full inline-block ${badge.gold ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>Débloqué</div>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            
            {/* RAMADAN TAB */}
            {activeTab === 'ramadan' && isRamadanMode && (
              <motion.div key="ramadan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Ramadan Banner */}
                <div className="glass-card p-6 text-center border border-amber-500/30 bg-amber-500/5">
                  <div className="text-5xl mb-2 animate-pulse">🌙</div>
                  <h2 className="font-heading text-2xl text-amber-500 mb-1">Ramadan Mubarak</h2>
                  <p className="font-arabic text-amber-500/60">رَمَضَانُ مُبَارَكٌ</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-6 py-3">
                      <div className="font-heading text-3xl text-amber-500">{ramadanDay}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Jour</div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-6 py-3">
                      <div className="font-heading text-3xl text-amber-500">{Object.values(ramadanState.days || {}).filter(Boolean).length}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">Jeûnes</div>
                    </div>
                  </div>
                </div>
                
                {/* Ramadan Items */}
                <div className="glass-card divide-y divide-white/5 overflow-hidden">
                  {RAMADAN_ITEMS.map(item => {
                    const done = item.special ? ramadanState.days?.[getToday()] : JSON.parse(localStorage.getItem('niyyah_ramadan_item_' + getToday()) || '{}')?.[item.id];
                    return (
                      <button key={item.id} onClick={() => toggleRamadanItem(item.id, item.special)} className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${done ? 'bg-amber-500/10' : ''}`}>
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-amber-500 border-amber-500' : 'border-amber-500/40'}`}>{done && <Check className="w-4 h-4 text-black" />}</div>
                        <div className="flex-1"><div className={`font-medium ${done ? 'text-slate-500 line-through' : 'text-amber-500'}`}>{item.label}</div>{item.sub && <div className="text-slate-500 text-sm">{item.sub}</div>}</div>
                        <span className="font-arabic text-amber-500/50">{item.arabic}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Fast Calendar */}
                <div className="glass-card p-4">
                  <h3 className="text-slate-400 text-sm mb-3">Calendrier du jeûne</h3>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 30 }, (_, i) => {
                      const d = new Date(ramadanState.startDate + 'T12:00:00');
                      d.setDate(d.getDate() + i);
                      const dStr = d.toISOString().split('T')[0];
                      const fasted = ramadanState.days?.[dStr];
                      const isToday = dStr === getToday();
                      const isFuture = dStr > getToday();
                      return (
                        <button key={i} onClick={() => { if (!isFuture || isToday) { const newState = { ...ramadanState, days: { ...ramadanState.days, [dStr]: !ramadanState.days?.[dStr] } }; setRamadanState(newState); saveRamadanState(newState); }}} className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center border transition-all ${fasted ? 'bg-amber-500/30 border-amber-500/50 text-amber-500' : isToday ? 'border-amber-500 text-amber-500' : isFuture ? 'border-white/10 text-slate-600 opacity-30' : 'border-white/10 text-slate-500'}`}>
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Laylatul Qadr */}
                <div className="glass-card p-4 text-center border border-amber-500/30 bg-amber-500/5">
                  <div className="text-2xl mb-2">✨🌙✨</div>
                  <h3 className="font-heading text-xl text-amber-500 mb-1">Laylat al-Qadr</h3>
                  <p className="font-arabic text-amber-500/60 text-sm mb-2">لَيْلَةُ الْقَدْرِ</p>
                  <p className="text-slate-500 text-xs mb-3">Les 5 nuits impaires des 10 dernières nuits</p>
                  <div className="flex gap-2 justify-center">
                    {[21, 23, 25, 27, 29].map(n => {
                      const done = ramadanState.laylatul?.[n];
                      return (
                        <button key={n} onClick={() => { const newState = { ...ramadanState, laylatul: { ...ramadanState.laylatul, [n]: !done } }; setRamadanState(newState); saveRamadanState(newState); }} className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all ${done ? 'bg-amber-500/30 border-amber-500 text-amber-500' : 'border-white/20 text-slate-500'}`}>
                          <span className="font-bold">{n}</span>
                          <span className="text-[8px]">Nuit</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Disable Ramadan */}
                <button onClick={() => { const newState = { ...ramadanState, active: false }; setRamadanState(newState); saveRamadanState(newState); setActiveTab('accueil'); }} className="w-full py-3 rounded-xl border border-white/10 text-slate-500 text-sm">Désactiver le mode Ramadan</button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[#022c22]/90 border-t border-white/10 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}>
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {[
            { id: 'accueil', icon: Home, label: 'Accueil' },
            { id: 'checklist', icon: CheckSquare, label: 'Pratique' },
            { id: 'meditation', icon: () => <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />, label: 'Méditer', action: () => setShowMeditation(true) },
            { id: 'stats', icon: BarChart3, label: 'Stats' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => tab.action ? tab.action() : setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${activeTab === tab.id ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-400'}`} data-testid={`nav-${tab.id}`}>
              {typeof tab.icon === 'function' && tab.id === 'meditation' ? (
                <tab.icon />
              ) : (
                <tab.icon className={`w-6 h-6 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
              )}
              <span className="text-[9px] uppercase tracking-wider font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
