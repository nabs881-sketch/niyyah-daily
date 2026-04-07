// Storage utilities with dynamic TODAY calculation

export const getToday = () => new Date().toISOString().split('T')[0];

export const getDateMinus = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const STORAGE_KEYS = {
  STATE: 'niyyah_state_v3',
  HISTORY: 'niyyah_history_v3',
  WIRD: 'niyyah_wird_',
  CITY: 'niyyah_city',
  INTENTION: 'niyyah_intention',
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
        prayers: {},
        dhikr: {},
        counters: { istighfar: 0, tasbih: 0 },
        wird: { matin: {}, soir: {} },
      };
    }
    return state;
  } catch (e) {
    console.error('Error loading state:', e);
    return {
      _date: getToday(),
      _unlocked: [1],
      prayers: {},
      dhikr: {},
      counters: { istighfar: 0, tasbih: 0 },
      wird: { matin: {}, soir: {} },
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

export const loadCity = () => localStorage.getItem(STORAGE_KEYS.CITY) || '';
export const saveCity = (city) => localStorage.setItem(STORAGE_KEYS.CITY, city);

export const loadIntention = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INTENTION);
    if (!saved) return null;
    const data = JSON.parse(saved);
    if (data.date !== getToday()) return null;
    return data;
  } catch (e) {
    return null;
  }
};

export const saveIntention = (type, label) => {
  localStorage.setItem(STORAGE_KEYS.INTENTION, JSON.stringify({
    date: getToday(),
    type,
    label,
  }));
};