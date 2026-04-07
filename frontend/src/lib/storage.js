// Storage utilities with dynamic TODAY calculation

export const getToday = () => new Date().toISOString().split('T')[0];

export const getDateMinus = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const formatDateFr = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

const STORAGE_KEYS = {
  STATE: 'spiritual_v2',
  HISTORY: 'spiritual_history',
  LEVEL: 'spiritual_level',
  WIRD: 'niyyah_wird_',
  CITY: 'niyyah_city',
  INTENTION_TYPE: 'niyyah_intention_type',
  INTENTION_LABEL: 'niyyah_intention_label',
  INTENTION_DATE: 'niyyah_intention_date',
  ONBOARD: 'niyyah_onboard',
  COUNTERS: 'niyyah_counters_',
};

export const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STATE);
    const state = saved ? JSON.parse(saved) : null;
    const today = getToday();
    
    // Reset state if it's a new day
    if (!state || state._date !== today) {
      const prevState = state || {};
      return {
        _date: today,
        _unlocked: prevState._unlocked || [1],
        _prevDate: prevState._date,
      };
    }
    return state;
  } catch (e) {
    console.error('Error loading state:', e);
    return {
      _date: getToday(),
      _unlocked: [1],
    };
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

export const loadHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : {
      days: {},
      dayScores: {},
      streak: 0,
      bestStreak: 0,
      totalDays: 0,
    };
  } catch (e) {
    return { days: {}, dayScores: {}, streak: 0, bestStreak: 0, totalDays: 0 };
  }
};

export const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history:', e);
  }
};

export const loadCurrentLevel = () => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.LEVEL) || '1', 10);
};

export const saveCurrentLevel = (level) => {
  localStorage.setItem(STORAGE_KEYS.LEVEL, String(level));
};

export const loadWirdState = (session) => {
  try {
    const key = STORAGE_KEYS.WIRD + session + '_' + getToday();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

export const saveWirdState = (session, wirdState) => {
  const key = STORAGE_KEYS.WIRD + session + '_' + getToday();
  localStorage.setItem(key, JSON.stringify(wirdState));
};

export const loadCounters = () => {
  try {
    const key = STORAGE_KEYS.COUNTERS + getToday();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { istighfar: 0, tasbih: 0 };
  } catch (e) {
    return { istighfar: 0, tasbih: 0 };
  }
};

export const saveCounters = (counters) => {
  const key = STORAGE_KEYS.COUNTERS + getToday();
  localStorage.setItem(key, JSON.stringify(counters));
};

export const loadCity = () => localStorage.getItem(STORAGE_KEYS.CITY) || '';
export const saveCity = (city) => localStorage.setItem(STORAGE_KEYS.CITY, city);

export const loadIntention = () => {
  const date = localStorage.getItem(STORAGE_KEYS.INTENTION_DATE);
  if (date !== getToday()) return null;
  return {
    type: localStorage.getItem(STORAGE_KEYS.INTENTION_TYPE),
    label: localStorage.getItem(STORAGE_KEYS.INTENTION_LABEL),
  };
};

export const saveIntention = (type, label) => {
  localStorage.setItem(STORAGE_KEYS.INTENTION_TYPE, type);
  localStorage.setItem(STORAGE_KEYS.INTENTION_LABEL, label);
  localStorage.setItem(STORAGE_KEYS.INTENTION_DATE, getToday());
};

export const isOnboardDone = () => localStorage.getItem(STORAGE_KEYS.ONBOARD) === '1';
export const setOnboardDone = () => localStorage.setItem(STORAGE_KEYS.ONBOARD, '1');