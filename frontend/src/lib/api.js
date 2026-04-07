// API Service for Niyyah Daily
// Handles all backend communication with JWT authentication

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  }

  // Auth helpers
  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // HTTP helpers
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.clearAuth();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erreur réseau' }));
      throw new Error(error.detail || 'Une erreur est survenue');
    }

    return response.json();
  }

  // Auth endpoints
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setAuth(data.access_token, data.user);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(data.access_token, data.user);
    return data;
  }

  logout() {
    this.clearAuth();
  }

  // Practice endpoints
  async getPracticeState(date) {
    try {
      return await this.request(`/practice/state/${date}`);
    } catch (error) {
      if (error.message.includes('404')) return null;
      throw error;
    }
  }

  async savePracticeState(date, state, counters, wirdState, ramadanState) {
    return await this.request('/practice/state', {
      method: 'POST',
      body: JSON.stringify({
        date,
        state,
        counters: counters || {},
        wird_state: wirdState || {},
        ramadan_state: ramadanState || {},
      }),
    });
  }

  async getHistory() {
    try {
      return await this.request('/practice/history');
    } catch (error) {
      if (error.message.includes('404')) return null;
      throw error;
    }
  }

  async saveHistory(history) {
    return await this.request('/practice/history', {
      method: 'POST',
      body: JSON.stringify(history),
    });
  }
}

export const api = new ApiService();

// Sync helper - synchronize localStorage with cloud
export const syncToCloud = async (state, counters, wirdState, ramadanState, history, date) => {
  if (!api.isAuthenticated()) return false;

  try {
    // Save practice state
    await api.savePracticeState(date, state, counters, wirdState, ramadanState);

    // Save history
    if (history) {
      await api.saveHistory({
        days: history.days || {},
        day_scores: history.dayScores || {},
        streak: history.streak || 0,
        best_streak: history.bestStreak || 0,
        total_days: history.totalDays || 0,
      });
    }

    return true;
  } catch (error) {
    console.error('Sync to cloud failed:', error);
    return false;
  }
};

// Sync helper - pull from cloud to localStorage
export const syncFromCloud = async (date) => {
  if (!api.isAuthenticated()) return null;

  try {
    const [practiceState, history] = await Promise.all([
      api.getPracticeState(date),
      api.getHistory(),
    ]);

    return { practiceState, history };
  } catch (error) {
    console.error('Sync from cloud failed:', error);
    return null;
  }
};
