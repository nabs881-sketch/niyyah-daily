import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, BookOpen, Compass, BarChart3, Check, 
  Moon, Sun, ChevronRight, RotateCcw, MapPin,
  Play, Pause, Volume2
} from "lucide-react";
import "@/App.css";
import { 
  loadState, saveState, loadHistory, saveHistory, 
  loadCity, saveCity, loadIntention, saveIntention, getToday, getDateMinus 
} from "@/lib/storage";
import { PRAYERS, DHIKR_ITEMS, WIRD_MATIN, WIRD_SOIR, fetchPrayerTimes, calculateQibla } from "@/lib/prayers";

// Hadith quotes
const HADITHS = [
  { text: "Les actes ne valent que par les intentions.", ref: "Bukhari 1" },
  { text: "Ne sous-estime aucun acte de bonté, fût-ce un visage souriant.", ref: "Muslim 2626" },
  { text: "L'acte le plus aimé d'Allah est celui qui est régulier, même s'il est peu.", ref: "Bukhari 6464" },
  { text: "Certes, avec la difficulté vient la facilité.", ref: "Coran 94:5" },
  { text: "Allah est avec ceux qui sont patients.", ref: "Coran 2:153" },
];

const INTENTIONS = [
  { type: 'rapprochement', icon: '🌙', label: 'Me rapprocher d\'Allah', arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ' },
  { type: 'engagement', icon: '⚖️', label: 'Tenir mes engagements', arabic: 'أَحَبُّ الْأَعْمَالِ' },
  { type: 'reconstruction', icon: '🤲', label: 'Me reconstruire', arabic: 'التَّوَّابِينَ' },
  { type: 'gratitude', icon: '✦', label: 'Être reconnaissant', arabic: 'لَئِن شَكَرْتُمْ' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [state, setState] = useState(() => loadState());
  const [history, setHistory] = useState(() => loadHistory());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState(() => loadCity());
  const [cityInput, setCityInput] = useState('');
  const [intention, setIntention] = useState(() => loadIntention());
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [tasbihCount, setTasbihCount] = useState(0);
  
  // Dynamic date check - runs every minute
  useEffect(() => {
    const checkDate = () => {
      const today = getToday();
      if (state._date !== today) {
        // Save yesterday's progress
        const prevDate = state._date;
        const prayersCompleted = Object.values(state.prayers || {}).filter(Boolean).length;
        if (prayersCompleted >= 5) {
          setHistory(prev => {
            const newHistory = {
              ...prev,
              days: { ...prev.days, [prevDate]: true },
              dayScores: { ...prev.dayScores, [prevDate]: calculateScore(state) },
              streak: prev.streak + 1,
              bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
              totalDays: prev.totalDays + 1,
            };
            saveHistory(newHistory);
            return newHistory;
          });
        } else {
          setHistory(prev => {
            const newHistory = { ...prev, streak: 0 };
            saveHistory(newHistory);
            return newHistory;
          });
        }
        
        // Reset for new day
        const newState = {
          _date: today,
          _unlocked: state._unlocked,
          prayers: {},
          dhikr: {},
          counters: { istighfar: 0, tasbih: 0 },
          wird: { matin: {}, soir: {} },
        };
        setState(newState);
        saveState(newState);
        setIntention(null);
        setShowIntentionModal(true);
      }
    };
    
    checkDate();
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [state]);
  
  // Load prayer times
  useEffect(() => {
    if (city) {
      fetchPrayerTimes(city).then(times => {
        if (times) setPrayerTimes(times);
      });
    }
  }, [city]);
  
  // Check if intention needed - only show once per session
  useEffect(() => {
    const sessionShown = sessionStorage.getItem('intention_modal_shown');
    if (!intention && !showIntentionModal && !sessionShown) {
      setShowIntentionModal(true);
      sessionStorage.setItem('intention_modal_shown', 'true');
    }
  }, [intention, showIntentionModal]);
  
  // Qibla compass
  useEffect(() => {
    if (activeTab !== 'qibla') return;
    
    navigator.geolocation?.getCurrentPosition(
      pos => setQiblaAngle(calculateQibla(pos.coords.latitude, pos.coords.longitude)),
      () => setQiblaAngle(136) // Default Paris direction
    );
    
    const handleOrientation = (e) => {
      const heading = e.webkitCompassHeading ?? (360 - e.alpha);
      if (heading !== null) setDeviceHeading(heading);
    };
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permission => {
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [activeTab]);
  
  const calculateScore = useCallback((s) => {
    const prayersCount = Object.values(s.prayers || {}).filter(Boolean).length;
    const dhikrCount = Object.values(s.dhikr || {}).filter(Boolean).length;
    const wirdMatinCount = Object.values(s.wird?.matin || {}).filter(Boolean).length;
    const wirdSoirCount = Object.values(s.wird?.soir || {}).filter(Boolean).length;
    return Math.round(
      (prayersCount / 5) * 50 + 
      (dhikrCount / 3) * 20 +
      (wirdMatinCount / 5) * 15 +
      (wirdSoirCount / 5) * 15
    );
  }, []);
  
  const togglePrayer = (prayerId) => {
    const newState = {
      ...state,
      prayers: { ...state.prayers, [prayerId]: !state.prayers[prayerId] }
    };
    setState(newState);
    saveState(newState);
  };
  
  const toggleDhikr = (dhikrId) => {
    const newState = {
      ...state,
      dhikr: { ...state.dhikr, [dhikrId]: !state.dhikr[dhikrId] }
    };
    setState(newState);
    saveState(newState);
  };
  
  const toggleWird = (session, itemId) => {
    const newState = {
      ...state,
      wird: {
        ...state.wird,
        [session]: { ...state.wird[session], [itemId]: !state.wird[session]?.[itemId] }
      }
    };
    setState(newState);
    saveState(newState);
  };
  
  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setCity(cityInput.trim());
      saveCity(cityInput.trim());
    }
  };
  
  const handleIntentionSelect = (int) => {
    saveIntention(int.type, int.label);
    setIntention({ type: int.type, label: int.label });
    setShowIntentionModal(false);
  };
  
  const incrementTasbih = () => {
    if (tasbihCount < 99) {
      setTasbihCount(prev => prev + 1);
      // Vibrate on mobile
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };
  
  const resetTasbih = () => setTasbihCount(0);
  
  const score = calculateScore(state);
  const prayersCompleted = Object.values(state.prayers || {}).filter(Boolean).length;
  const todayHadith = HADITHS[Math.floor(Date.now() / 86400000) % HADITHS.length];
  
  return (
    <div className="min-h-screen islamic-bg">
      {/* Intention Modal */}
      <AnimatePresence>
        {showIntentionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-8 max-w-sm w-full text-center"
            >
              <div className="text-4xl font-arabic text-amber-400 mb-4">نِيَّة</div>
              <h2 className="font-heading text-2xl text-white mb-2">Avec quelle intention</h2>
              <p className="text-slate-400 mb-6">débutes-tu cette journée ?</p>
              
              <div className="space-y-3">
                {INTENTIONS.map((int) => (
                  <button
                    key={int.type}
                    onClick={() => handleIntentionSelect(int)}
                    className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all group"
                    data-testid={`intention-${int.type}`}
                  >
                    <span className="text-2xl">{int.icon}</span>
                    <div className="text-left flex-1">
                      <div className="text-white font-medium">{int.label}</div>
                      <div className="text-amber-500/70 text-sm font-arabic">{int.arabic}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowIntentionModal(false)}
                className="mt-4 text-slate-500 text-sm hover:text-slate-400"
              >
                passer →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="max-w-lg mx-auto pb-safe">
        {/* Header */}
        <header className="sticky top-0 z-40 px-6 py-4 backdrop-blur-xl bg-[#022c22]/80 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl text-amber-400">Niyyah Daily</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">نِيَّة · Pratique & Élévation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-amber-400 font-bold text-lg">{history.streak}</div>
                <div className="text-[10px] text-slate-500 uppercase">Streak</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 text-lg">🔥</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500">{prayersCompleted}/5 prières</span>
            <span className="text-xs text-amber-400 font-medium">{score}/100</span>
          </div>
        </header>
        
        {/* Tab Content */}
        <main className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Intention Card */}
                {intention && (
                  <div className="glass-card p-4 border-l-4 border-amber-500">
                    <div className="text-xs text-amber-500 uppercase tracking-wider mb-1">Intention du jour</div>
                    <div className="text-white font-medium">{intention.label}</div>
                  </div>
                )}
                
                {/* Hadith */}
                <div className="glass-card p-5">
                  <div className="text-amber-400 text-3xl mb-2">"</div>
                  <p className="text-slate-200 italic leading-relaxed">{todayHadith.text}</p>
                  <p className="text-amber-500/70 text-sm mt-2">— {todayHadith.ref}</p>
                </div>
                
                {/* Prayer Times */}
                {prayerTimes && (
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading text-lg text-white">🕌 Horaires</h3>
                      <span className="text-xs text-slate-500">{city}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => (
                        <div key={name} className="text-center">
                          <div className="text-[10px] text-slate-400 uppercase">{name}</div>
                          <div className="text-white font-medium text-sm">
                            {prayerTimes[name]?.substring(0, 5) || '--:--'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* City Input */}
                {!city && (
                  <form onSubmit={handleCitySubmit} className="glass-card p-4">
                    <label className="text-sm text-slate-400 mb-2 block">Entre ta ville pour les horaires</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Paris, Casablanca..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        data-testid="city-input"
                      />
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        data-testid="city-submit"
                      >
                        OK
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Prayers Section */}
                <div className="glass-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="font-heading text-lg text-white flex items-center gap-2">
                      🕌 Les 5 Prières
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {PRAYERS.map((prayer) => (
                      <motion.div
                        key={prayer.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                          state.prayers[prayer.id] ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => togglePrayer(prayer.id)}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`prayer-${prayer.id}`}
                      >
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.prayers[prayer.id] 
                            ? 'bg-emerald-500 border-emerald-500 gold-glow' 
                            : 'border-white/30'
                        }`}>
                          {state.prayers[prayer.id] && (
                            <Check className="w-4 h-4 text-white check-animate" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${state.prayers[prayer.id] ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {prayer.name}
                          </div>
                          <div className="text-sm text-slate-500">{prayer.description}</div>
                        </div>
                        <div className="font-arabic text-amber-500/70">{prayer.arabic}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Dhikr Section */}
                <div className="glass-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="font-heading text-lg text-white">📖 Dhikr & Récitation</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {DHIKR_ITEMS.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                          state.dhikr[item.id] ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => toggleDhikr(item.id)}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`dhikr-${item.id}`}
                      >
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.dhikr[item.id] 
                            ? 'bg-emerald-500 border-emerald-500 gold-glow' 
                            : 'border-white/30'
                        }`}>
                          {state.dhikr[item.id] && (
                            <Check className="w-4 h-4 text-white check-animate" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${state.dhikr[item.id] ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-slate-500">{item.description}</div>
                        </div>
                        <div className="font-arabic text-amber-500/70">{item.arabic}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'wird' && (
              <motion.div
                key="wird"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Wird Matin */}
                <div className="glass-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-heading text-lg text-white">🌅 Wird du Matin</h3>
                    <span className="text-xs text-emerald-400">
                      {Object.values(state.wird?.matin || {}).filter(Boolean).length}/{WIRD_MATIN.length}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {WIRD_MATIN.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                          state.wird?.matin?.[item.id] ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => toggleWird('matin', item.id)}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`wird-matin-${item.id}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.wird?.matin?.[item.id] 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-white/30'
                        }`}>
                          {state.wird?.matin?.[item.id] && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${state.wird?.matin?.[item.id] ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {item.name}
                          </div>
                        </div>
                        <div className="font-arabic text-amber-500/60 text-sm">{item.arabic}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Wird Soir */}
                <div className="glass-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-heading text-lg text-white">🌙 Wird du Soir</h3>
                    <span className="text-xs text-emerald-400">
                      {Object.values(state.wird?.soir || {}).filter(Boolean).length}/{WIRD_SOIR.length}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {WIRD_SOIR.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                          state.wird?.soir?.[item.id] ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                        }`}
                        onClick={() => toggleWird('soir', item.id)}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`wird-soir-${item.id}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.wird?.soir?.[item.id] 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-white/30'
                        }`}>
                          {state.wird?.soir?.[item.id] && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${state.wird?.soir?.[item.id] ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {item.name}
                          </div>
                        </div>
                        <div className="font-arabic text-amber-500/60 text-sm">{item.arabic}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Tasbih Counter */}
                <div className="glass-card p-6 text-center">
                  <h3 className="font-heading text-lg text-white mb-6">📿 Tasbih</h3>
                  
                  <button
                    className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center border-4 transition-all active:scale-95 ${
                      tasbihCount >= 99 
                        ? 'bg-amber-500/20 border-amber-400 gold-glow' 
                        : 'bg-white/5 border-white/20 hover:border-amber-500/50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      incrementTasbih();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      incrementTasbih();
                    }}
                    data-testid="tasbih-button"
                  >
                    <div>
                      <div className="font-heading text-5xl text-white">{tasbihCount}</div>
                      <div className="text-slate-400 text-sm">/ 99</div>
                    </div>
                  </button>
                  
                  {/* Progress ring visual */}
                  <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${(tasbihCount / 99) * 100}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={resetTasbih}
                    className="mt-4 text-slate-500 hover:text-slate-400 text-sm flex items-center gap-2 mx-auto"
                    data-testid="tasbih-reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'qibla' && (
              <motion.div
                key="qibla"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="glass-card p-6 text-center">
                  <h3 className="font-heading text-2xl text-white mb-2">🕋 Qibla</h3>
                  <p className="text-slate-400 text-sm mb-8">Direction de La Mecque</p>
                  
                  {/* Compass */}
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    
                    {/* Cardinal directions */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white font-bold">N</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500">S</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">E</div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">O</div>
                    
                    {/* Needle */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        rotate: qiblaAngle !== null ? qiblaAngle - deviceHeading : 0
                      }}
                      animate={{
                        rotate: qiblaAngle !== null ? qiblaAngle - deviceHeading : 0
                      }}
                      transition={{ type: "spring", damping: 30 }}
                    >
                      <div className="w-1 h-24 bg-gradient-to-t from-transparent via-amber-400 to-amber-400 rounded-full transform -translate-y-4" />
                      <div className="absolute w-4 h-4 bg-amber-400 rounded-full" />
                    </motion.div>
                    
                    {/* Kaaba icon */}
                    <motion.div
                      className="absolute text-2xl"
                      style={{
                        top: '50%',
                        left: '50%',
                        x: '-50%',
                        y: '-50%',
                      }}
                    >
                      🕋
                    </motion.div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="text-4xl font-heading text-amber-400">
                      {qiblaAngle !== null ? Math.round((qiblaAngle - deviceHeading + 360) % 360) : '--'}°
                    </div>
                    <p className="text-emerald-400 text-sm mt-2">
                      {qiblaAngle !== null && Math.abs((qiblaAngle - deviceHeading + 360) % 360) < 10
                        ? '✦ Tu es aligné avec La Mecque !'
                        : 'Tourne vers l\'aiguille dorée'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Stats Overview */}
                <div className="glass-card p-6 text-center">
                  <div className="text-6xl font-heading text-amber-400 mb-2">
                    {history.streak}
                  </div>
                  <div className="text-slate-400 uppercase tracking-wider text-sm">Jours consécutifs</div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                      <div className="text-2xl font-heading text-white">{history.bestStreak}</div>
                      <div className="text-xs text-slate-500">Meilleur</div>
                    </div>
                    <div>
                      <div className="text-2xl font-heading text-white">{history.totalDays}</div>
                      <div className="text-xs text-slate-500">Total jours</div>
                    </div>
                    <div>
                      <div className="text-2xl font-heading text-white">{score}</div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                  </div>
                </div>
                
                {/* Last 14 days heatmap */}
                <div className="glass-card p-4">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">14 derniers jours</h3>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {Array.from({ length: 14 }, (_, i) => {
                      const date = getDateMinus(getToday(), 13 - i);
                      const isToday = date === getToday();
                      const done = isToday ? prayersCompleted >= 5 : history.days?.[date];
                      return (
                        <div
                          key={date}
                          className={`w-6 h-6 rounded transition-all ${
                            done 
                              ? 'bg-emerald-500' 
                              : isToday 
                                ? 'bg-amber-500/30 border border-amber-500' 
                                : 'bg-white/10'
                          }`}
                          title={date}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-emerald-500" /> Présent
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-white/10" /> Absent
                    </span>
                  </div>
                </div>
                
                {/* Today's Progress */}
                <div className="glass-card p-4">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Aujourd'hui</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Prières</span>
                        <span className="text-white">{prayersCompleted}/5</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full progress-animate" 
                          style={{ width: `${(prayersCompleted / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Dhikr</span>
                        <span className="text-white">
                          {Object.values(state.dhikr || {}).filter(Boolean).length}/3
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full progress-animate" 
                          style={{ width: `${(Object.values(state.dhikr || {}).filter(Boolean).length / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[#022c22]/90 border-t border-white/10 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 60px)' }}>
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {[
            { id: 'home', icon: Home, label: 'Accueil' },
            { id: 'wird', icon: BookOpen, label: 'Wird' },
            { id: 'qibla', icon: Compass, label: 'Qibla' },
            { id: 'stats', icon: BarChart3, label: 'Stats' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-all ${
                activeTab === tab.id 
                  ? 'text-amber-400' 
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              data-testid={`nav-${tab.id}`}
            >
              <tab.icon className={`w-6 h-6 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
              <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
