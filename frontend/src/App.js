import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, CheckSquare, Compass, BarChart3, Clock, Check, 
  ChevronRight, ChevronDown, RotateCcw, MapPin, Play, Pause, X,
  Volume2, Info
} from "lucide-react";
import "@/App.css";
import { 
  loadState, saveState, loadHistory, saveHistory, 
  loadCity, saveCity, loadIntention, saveIntention, 
  loadWirdState, saveWirdState, loadCounters, saveCounters,
  loadCurrentLevel, saveCurrentLevel, isOnboardDone, setOnboardDone,
  getToday, getDateMinus, formatDateFr
} from "@/lib/storage";
import { LEVELS, WIRD_DATA, BADGES, HADITHS, INTENTIONS, MEDITATION_PHRASES } from "@/lib/data";

// API for prayer times
const fetchPrayerTimes = async (city) => {
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

// Qibla calculation
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const calculateQibla = (lat, lng) => {
  const φ1 = lat * Math.PI / 180;
  const φ2 = KAABA_LAT * Math.PI / 180;
  const Δλ = (KAABA_LNG - lng) * Math.PI / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(x, y);
  return ((θ * 180 / Math.PI) + 360) % 360;
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
  
  // UI State
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState(() => loadCity());
  const [cityInput, setCityInput] = useState('');
  const [intention, setIntention] = useState(() => loadIntention());
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardDone());
  const [onboardStep, setOnboardStep] = useState(0);
  
  // Qibla
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [qiblaLoading, setQiblaLoading] = useState(false);
  
  // Meditation
  const [showMeditation, setShowMeditation] = useState(false);
  const [meditationTime, setMeditationTime] = useState(180); // 3 min default
  const [meditationRunning, setMeditationRunning] = useState(false);
  const [meditationLeft, setMeditationLeft] = useState(180);
  
  // Tasbih fullscreen
  const [showTasbih, setShowTasbih] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(99);
  
  // Wird expanded
  const [wirdExpanded, setWirdExpanded] = useState({ matin: false, soir: false });
  
  // Dynamic date check
  useEffect(() => {
    const checkDate = () => {
      const today = getToday();
      if (state._date !== today) {
        // Calculate previous day score
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
            return newHistory;
          });
        } else if (prevScore > 0) {
          setHistory(prev => {
            const newHistory = { 
              ...prev, 
              streak: 0,
              dayScores: { ...prev.dayScores, [prevDate]: prevScore },
            };
            saveHistory(newHistory);
            return newHistory;
          });
        }
        
        // Reset for new day
        const newState = {
          _date: today,
          _unlocked: state._unlocked,
          _prevDate: prevDate,
        };
        setState(newState);
        saveState(newState);
        setCounters({ istighfar: 0, tasbih: 0 });
        setWirdState({ matin: {}, soir: {} });
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
    setWirdState({
      matin: loadWirdState('matin'),
      soir: loadWirdState('soir'),
    });
  }, []);
  
  // Load prayer times
  useEffect(() => {
    if (city) {
      fetchPrayerTimes(city).then(times => {
        if (times) setPrayerTimes(times);
      });
    }
  }, [city]);
  
  // Show intention modal if needed
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
        if (prev <= 1) {
          setMeditationRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [meditationRunning, meditationLeft]);
  
  // Qibla compass
  useEffect(() => {
    if (!qiblaOpen || qiblaAngle === null) return;
    
    const handleOrientation = (e) => {
      let heading = null;
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null) setDeviceHeading(heading);
    };
    
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permission => {
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      });
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
    let totalWeight = 0;
    let doneWeight = 0;
    
    items.forEach(item => {
      const weight = item.weight || 1;
      totalWeight += weight;
      
      if (item.type === 'wird') {
        const session = item.session;
        const wirdItems = WIRD_DATA[session]?.items || [];
        const allDone = wirdItems.every(wi => wirdState[session]?.[wi.id]);
        if (allDone) doneWeight += weight;
      } else if (item.type === 'counter') {
        if ((counters[item.id] || 0) >= item.target) doneWeight += weight;
      } else {
        if (s[item.id]) doneWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;
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
    const newWirdState = {
      ...wirdState,
      [session]: { ...wirdState[session], [itemId]: !wirdState[session]?.[itemId] }
    };
    setWirdState(newWirdState);
    saveWirdState(session, newWirdState[session]);
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
  
  // Handle city submit
  const handleCitySubmit = (e) => {
    e?.preventDefault();
    if (cityInput.trim()) {
      setCity(cityInput.trim());
      saveCity(cityInput.trim());
    }
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
      pos => {
        setQiblaAngle(calculateQibla(pos.coords.latitude, pos.coords.longitude));
        setQiblaLoading(false);
      },
      () => {
        setQiblaAngle(136); // Default for Paris
        setQiblaLoading(false);
      },
      { timeout: 8000 }
    );
  };
  
  // Finish onboarding
  const finishOnboarding = () => {
    setOnboardDone();
    setShowOnboarding(false);
    if (cityInput.trim()) {
      setCity(cityInput.trim());
      saveCity(cityInput.trim());
    }
    setTimeout(() => setShowIntentionModal(true), 400);
  };
  
  // Tasbih tap
  const tapTasbih = () => {
    if (tasbihCount < tasbihTarget) {
      setTasbihCount(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };
  
  const score = calculateScore(state);
  const todayHadith = HADITHS[Math.floor(Date.now() / 86400000) % HADITHS.length];
  const level = LEVELS.find(l => l.id === currentLevel);
  
  // Get medal level
  const getMedal = () => {
    if (score >= 100 && history.streak >= 7) return 'gold';
    if (score >= 80 && history.streak >= 3) return 'silver';
    if (score >= 50) return 'bronze';
    return 'none';
  };
  const medal = getMedal();
  
  return (
    <div className="min-h-screen islamic-bg">
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#03030a] flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-sm text-center">
              {onboardStep === 0 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <img src="https://nabs881-sketch.github.io/niyyah-app/logo2.png" alt="Niyyah" className="w-40 h-40 mx-auto mb-6 object-contain" />
                  <h1 className="font-heading text-3xl text-white mb-2">Niyyah Daily</h1>
                  <p className="text-amber-500 text-sm font-arabic mb-4">نِيَّة · Pose ton intention</p>
                  <h2 className="text-xl text-white mb-3">Ta pratique spirituelle,<br/>chaque jour</h2>
                  <p className="text-slate-400 text-sm mb-8">Niyyah t'accompagne dans ton chemin vers Allah — à ton rythme, sans jugement.</p>
                  <button onClick={() => setOnboardStep(1)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-4 rounded-xl mb-3" data-testid="onboard-next">
                    Commencer →
                  </button>
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
                        <div>
                          <div className="text-white font-medium">{l.name}</div>
                          <div className="text-slate-500 text-sm">{l.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setOnboardStep(2)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-4 rounded-xl mb-3">
                    Suivant →
                  </button>
                  <button onClick={finishOnboarding} className="text-slate-500 text-sm">Passer</button>
                </motion.div>
              )}
              {onboardStep === 2 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <img src="https://nabs881-sketch.github.io/niyyah-app/logo2.png" alt="Niyyah" className="w-28 h-28 mx-auto mb-6 object-contain" />
                  <h2 className="text-xl text-white mb-3">Tes horaires de prière</h2>
                  <p className="text-slate-400 text-sm mb-6">Entre ta ville pour afficher les horaires.</p>
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="Paris, Casablanca..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500"
                      data-testid="onboard-city-input"
                    />
                    <button onClick={() => { handleCitySubmit(); }} className="bg-emerald-500 text-black px-4 rounded-xl font-bold">
                      OK
                    </button>
                  </div>
                  <button onClick={finishOnboarding} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-4 rounded-xl mb-3" data-testid="onboard-finish">
                    C'est parti — Bismillah 🌿
                  </button>
                </motion.div>
              )}
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === onboardStep ? 'bg-emerald-500 w-4' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Intention Modal */}
      <AnimatePresence>
        {showIntentionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-8 max-w-sm w-full text-center"
            >
              <div className="text-5xl font-arabic text-amber-400/30 mb-2">نِيَّة</div>
              <h2 className="font-heading text-2xl text-white mb-1">Avec quelle intention</h2>
              <p className="text-slate-500 mb-6">débutes-tu cette journée ?</p>
              
              <div className="space-y-3">
                {INTENTIONS.map((int) => (
                  <button
                    key={int.type}
                    onClick={() => handleIntentionSelect(int)}
                    className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all group text-left"
                    data-testid={`intention-${int.type}`}
                  >
                    <span className="text-2xl">{int.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{int.label}</div>
                      <div className="text-amber-500/60 text-xs">{int.sub}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                  </button>
                ))}
              </div>
              
              <button onClick={() => setShowIntentionModal(false)} className="mt-4 text-slate-600 text-sm">
                passer →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Meditation Screen */}
      <AnimatePresence>
        {showMeditation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#03030a] flex flex-col items-center justify-center p-6"
          >
            <button onClick={() => { setShowMeditation(false); setMeditationRunning(false); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
            
            <motion.div
              className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center"
              animate={{ scale: meditationRunning ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <div className="w-16 h-16 rounded-full bg-red-500" />
            </motion.div>
            
            <div className="flex gap-3 mt-8 mb-6">
              {[180, 300, 600].map(t => (
                <button
                  key={t}
                  onClick={() => { setMeditationTime(t); setMeditationLeft(t); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${meditationTime === t ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}
                >
                  {t / 60} min
                </button>
              ))}
            </div>
            
            <div className="font-heading text-6xl text-white mb-4">
              {String(Math.floor(meditationLeft / 60)).padStart(2, '0')}:{String(meditationLeft % 60).padStart(2, '0')}
            </div>
            
            <p className="text-slate-400 text-center mb-8 max-w-xs italic font-serif">
              {MEDITATION_PHRASES[Math.floor(Date.now() / 60000) % MEDITATION_PHRASES.length]}
            </p>
            
            <button
              onClick={() => {
                if (meditationRunning) {
                  setMeditationRunning(false);
                } else {
                  setMeditationLeft(meditationTime);
                  setMeditationRunning(true);
                }
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center"
            >
              {meditationRunning ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-1" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tasbih Fullscreen */}
      <AnimatePresence>
        {showTasbih && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#03030a] flex flex-col items-center justify-center"
          >
            <button onClick={() => setShowTasbih(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-slate-500 text-sm uppercase tracking-widest mb-2">Tasbih</div>
            <div className="font-arabic text-emerald-500/70 text-xl mb-8">سُبْحَانَ اللَّهِ</div>
            
            <div 
              className="font-heading text-9xl text-white mb-2 transition-transform active:scale-110"
              onClick={tapTasbih}
            >
              {tasbihCount}
            </div>
            <div className="text-slate-500 text-xl">/ {tasbihTarget}</div>
            
            <div 
              className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer"
              onClick={tapTasbih}
              data-testid="tasbih-tap-zone"
            >
              <div className="absolute bottom-32 left-0 right-0 text-center text-slate-600 text-xs uppercase tracking-widest">
                Appuie n'importe où
              </div>
            </div>
            
            <button onClick={() => setTasbihCount(0)} className="absolute bottom-8 left-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-500">
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <div className="absolute bottom-8 left-16 right-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${(tasbihCount / tasbihTarget) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 px-5 pt-4 pb-3 backdrop-blur-xl bg-[#022c22]/80 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-heading text-2xl text-white">
                Niyyah Daily <span className="text-emerald-500 text-lg">✦</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{formatDateFr(getToday())}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                medal === 'gold' ? 'bg-amber-500/20 text-amber-400' :
                medal === 'silver' ? 'bg-slate-400/20 text-slate-300' :
                medal === 'bronze' ? 'bg-orange-500/20 text-orange-400' :
                'bg-white/10 text-slate-500'
              }`}>
                {medal === 'gold' ? '🥇 Or' : medal === 'silver' ? '🥈 Argent' : medal === 'bronze' ? '🥉 Bronze' : '—'}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </header>
        
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
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Niveau actuel</div>
                      <div className="text-emerald-500 font-semibold">{level?.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">{score}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <span className="text-[10px] text-slate-400">Score pondéré du jour</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white">{score}</span>
                      <span className="text-amber-500/50 text-xs">/100</span>
                    </div>
                  </div>
                  
                  {/* Heatmap */}
                  <div className="flex gap-1 mt-3">
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = getDateMinus(getToday(), 13 - i);
                      const isToday = date === getToday();
                      const dayScore = history.dayScores?.[date] || 0;
                      const done = isToday ? score >= 80 : history.days?.[date];
                      return (
                        <div
                          key={date}
                          className={`flex-1 h-2 rounded transition-all ${
                            done ? 'bg-emerald-500' : 
                            dayScore > 0 ? 'bg-amber-500/50' :
                            isToday ? 'ring-1 ring-emerald-500 bg-white/10' : 'bg-white/5'
                          }`}
                        />
                      );
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
                      <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider">🕌 Horaires du jour</span>
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
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Paris, Casablanca..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                        data-testid="city-input"
                      />
                      <button type="submit" className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold" data-testid="city-submit">
                        OK
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Streak', value: history.streak, color: 'emerald' },
                    { label: 'Record', value: history.bestStreak, color: 'white' },
                    { label: 'Score', value: score, color: 'amber' },
                    { label: 'Jours', value: history.totalDays, color: 'slate' },
                  ].map(stat => (
                    <div key={stat.label} className="glass-card p-3 text-center">
                      <div className={`font-heading text-2xl ${stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'amber' ? 'text-amber-500' : 'text-white'}`}>
                        {stat.value}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('checklist')} 
                    className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold"
                  >
                    ▶ Commencer
                  </button>
                  <button 
                    onClick={() => setActiveTab('stats')} 
                    className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-semibold"
                  >
                    📊 Bilan
                  </button>
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
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-emerald-500 font-bold text-sm">{score}%</span>
                  </div>
                </div>
                
                {/* Qibla Card */}
                <div className="glass-card overflow-hidden">
                  <button 
                    onClick={() => { setQiblaOpen(!qiblaOpen); if (!qiblaOpen && !qiblaAngle) loadQibla(); }}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <span className="text-amber-500 font-medium">🕋 Qibla — Direction de La Mecque</span>
                    <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform ${qiblaOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {qiblaOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        {qiblaLoading ? (
                          <div className="text-center py-8 text-slate-500">Localisation en cours...</div>
                        ) : qiblaAngle !== null ? (
                          <div className="text-center">
                            <div className="relative w-48 h-48 mx-auto my-4">
                              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold text-sm">N</div>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 text-sm">S</div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">E</div>
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">O</div>
                              <div 
                                className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                                style={{ transform: `rotate(${deviceHeading !== null ? qiblaAngle - deviceHeading : qiblaAngle}deg)` }}
                              >
                                <div className="w-1 h-20 bg-gradient-to-t from-transparent to-amber-400 rounded-full -translate-y-2" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center text-2xl">🕋</div>
                            </div>
                            <div className="font-heading text-4xl text-amber-400 mb-2">
                              {Math.round(deviceHeading !== null ? (qiblaAngle - deviceHeading + 360) % 360 : qiblaAngle)}°
                            </div>
                            <p className="text-emerald-400 text-sm">
                              {deviceHeading !== null && Math.abs((qiblaAngle - deviceHeading + 360) % 360) < 15 
                                ? '✦ Tu es aligné avec La Mecque !' 
                                : 'Tourne vers l\'aiguille dorée'}
                            </p>
                          </div>
                        ) : (
                          <button onClick={loadQibla} className="w-full py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 font-medium">
                            📍 Trouver la Qibla
                          </button>
                        )}
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
                              <button
                                onClick={() => setWirdExpanded(prev => ({ ...prev, [session]: !prev[session] }))}
                                className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${allDone ? 'bg-emerald-500/10' : ''}`}
                              >
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                  allDone ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                                }`}>
                                  {allDone && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <div className={`font-medium ${allDone ? 'text-slate-500 line-through' : 'text-white'}`}>{item.label}</div>
                                  <div className="text-slate-500 text-sm">{item.sub}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-500 text-sm">{doneCount}/{wirdItems.length}</span>
                                  <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform ${wirdExpanded[session] ? 'rotate-180' : ''}`} />
                                </div>
                              </button>
                              
                              <AnimatePresence>
                                {wirdExpanded[session] && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-white/5"
                                  >
                                    {wirdItems.map(wi => (
                                      <button
                                        key={wi.id}
                                        onClick={() => toggleWirdItem(session, wi.id)}
                                        className={`w-full flex items-center gap-3 p-3 pl-12 text-left border-t border-white/5 ${wirdState[session]?.[wi.id] ? 'opacity-50' : ''}`}
                                        data-testid={`wird-${session}-${wi.id}`}
                                      >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                          wirdState[session]?.[wi.id] ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                                        }`}>
                                          {wirdState[session]?.[wi.id] && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                          <div className={`text-sm ${wirdState[session]?.[wi.id] ? 'line-through text-slate-500' : 'text-white'}`}>{wi.name}</div>
                                        </div>
                                        <span className="text-emerald-500/60 text-xs">{wi.count}</span>
                                        <span className="font-arabic text-emerald-500/50 text-sm">{wi.arabic}</span>
                                      </button>
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
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                                  done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                                }`}>
                                  {done && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <div className={`font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>{item.label}</div>
                                  <div className="text-slate-500 text-sm">{item.sub}</div>
                                </div>
                                <button
                                  onClick={() => { setTasbihCount(count); setTasbihTarget(item.target); setShowTasbih(true); }}
                                  className="text-slate-500 text-xs"
                                >
                                  ⛶
                                </button>
                              </div>
                              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <button onClick={() => resetCounter(item.id)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 text-sm">
                                  ↺
                                </button>
                                <div className="flex-1 text-center">
                                  <div className={`font-heading text-3xl ${done ? 'text-emerald-500' : 'text-white'}`}>{count}</div>
                                  <div className="text-slate-500 text-xs">/ {item.target}</div>
                                </div>
                                <button
                                  onClick={() => incrementCounter(item.id)}
                                  className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-xl"
                                  data-testid={`counter-${item.id}`}
                                >
                                  +
                                </button>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (count / item.target) * 100)}%` }} />
                              </div>
                            </div>
                          );
                        }
                        
                        // Regular item
                        const done = state[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${done ? 'bg-emerald-500/10' : ''}`}
                            data-testid={`item-${item.id}`}
                          >
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                              done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30' : 'border-white/20'
                            }`}>
                              {done && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${done ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {item.priority === 'fard' && <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />}
                                {item.priority === 'sunnah' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />}
                                {item.label}
                              </div>
                              <div className="text-slate-500 text-sm">{item.sub}</div>
                              <div className={`font-arabic text-emerald-500/60 text-lg mt-1 ${done ? 'opacity-30' : ''}`}>{item.arabic}</div>
                            </div>
                            {item.hasAudio && <button className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-sm">🔊</button>}
                            {item.hasInfo && <button className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-slate-500 text-xs italic">i</button>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Reset Button */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      const newState = { _date: state._date, _unlocked: state._unlocked };
                      setState(newState);
                      saveState(newState);
                      setCounters({ istighfar: 0, tasbih: 0 });
                      saveCounters({ istighfar: 0, tasbih: 0 });
                      setWirdState({ matin: {}, soir: {} });
                      saveWirdState('matin', {});
                      saveWirdState('soir', {});
                    }}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400"
                  >
                    ↺ Reset
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold font-serif text-lg">
                    بِسْمِ اللَّهِ
                  </button>
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
                  
                  {/* Medals */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { name: 'Bronze', emoji: '🥉', cond: '≥50%', active: medal === 'bronze' || medal === 'silver' || medal === 'gold' },
                      { name: 'Argent', emoji: '🥈', cond: '≥80% + 3j', active: medal === 'silver' || medal === 'gold' },
                      { name: 'Or', emoji: '🥇', cond: '100% + 7j', active: medal === 'gold' },
                    ].map(m => (
                      <div key={m.name} className={`text-center p-3 rounded-xl border transition-all ${
                        m.active ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="text-xl mb-1">{m.emoji}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${m.active ? 'text-amber-500' : 'text-slate-500'}`}>{m.name}</div>
                        <div className="text-[9px] text-slate-600 mt-1">{m.cond}</div>
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
                    const dayScore = history.dayScores?.[date] || (isToday ? score : 0);
                    const done = history.days?.[date];
                    const d = new Date(date + 'T12:00:00');
                    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                    
                    return (
                      <div key={date} className={`aspect-[0.7] rounded-xl border flex flex-col items-center justify-center gap-1 ${
                        done ? 'bg-emerald-500/10 border-emerald-500/30' :
                        isToday ? 'border-emerald-500' : 'bg-white/5 border-white/10'
                      }`}>
                        <div className={`text-[9px] uppercase font-semibold ${isToday ? 'text-emerald-500' : done ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {dayNames[d.getDay()]}
                        </div>
                        <div className="text-base">{done ? '✓' : dayScore > 0 ? '◐' : '○'}</div>
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
                      <div key={badge.id} className={`glass-card p-4 text-center transition-all ${
                        unlocked ? badge.gold ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30' : 'opacity-40 grayscale'
                      }`}>
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
            <button
              key={tab.id}
              onClick={() => tab.action ? tab.action() : setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                activeTab === tab.id ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-400'
              }`}
              data-testid={`nav-${tab.id}`}
            >
              <tab.icon className={`w-6 h-6 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
              <span className="text-[9px] uppercase tracking-wider font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
