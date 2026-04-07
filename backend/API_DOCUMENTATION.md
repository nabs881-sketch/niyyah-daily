# Niyyah Daily - Documentation API

## Base URL
```
Production: https://web-app-enhance-1.preview.emergentagent.com/api
Local: http://localhost:8001/api
```

## Authentification

### 1. Inscription (Register)
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "name": "Nom Utilisateur"
}
```

**Réponse:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nom Utilisateur",
    "created_at": "2026-04-07T11:17:56Z"
  }
}
```

### 2. Connexion (Login)
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse:** (Identique à /register)

---

## Synchronisation des Pratiques

**Note:** Toutes les routes nécessitent un header d'authentification:
```
Authorization: Bearer {access_token}
```

### 3. Récupérer l'état d'une journée
**GET** `/api/practice/state/{date}`

**Paramètres:**
- `date`: Format YYYY-MM-DD (ex: 2026-04-07)

**Réponse:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2026-04-07",
  "state": {
    "fajr": true,
    "dhuhr": true,
    "ayat_kursi": false
  },
  "counters": {
    "tasbih": 33,
    "istighfar": 50
  },
  "wird_state": {
    "matin": {
      "fatiha_m": true,
      "ayat_kursi_m": true
    }
  },
  "ramadan_state": {
    "fast": true,
    "tarawih": true
  },
  "created_at": "2026-04-07T11:18:04Z",
  "updated_at": "2026-04-07T11:18:40Z"
}
```

### 4. Sauvegarder l'état d'une journée
**POST** `/api/practice/state`

**Body:**
```json
{
  "date": "2026-04-07",
  "state": {
    "fajr": true,
    "dhuhr": true
  },
  "counters": {
    "tasbih": 33
  },
  "wird_state": {
    "matin": {
      "fatiha_m": true
    }
  },
  "ramadan_state": {}
}
```

**Réponse:** (Objet PracticeState complet)

### 5. Récupérer l'historique complet
**GET** `/api/practice/history`

**Réponse:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "days": {
    "2026-04-06": { "score": 85 },
    "2026-04-07": { "score": 92 }
  },
  "day_scores": {
    "2026-04-06": 85,
    "2026-04-07": 92
  },
  "streak": 7,
  "best_streak": 14,
  "total_days": 45,
  "updated_at": "2026-04-07T11:18:40Z"
}
```

### 6. Sauvegarder l'historique
**POST** `/api/practice/history`

**Body:**
```json
{
  "days": {
    "2026-04-07": { "score": 92 }
  },
  "day_scores": {
    "2026-04-07": 92
  },
  "streak": 7,
  "best_streak": 14,
  "total_days": 45
}
```

---

## Exemples d'utilisation (JavaScript)

### Inscription
```javascript
const response = await fetch(`${REACT_APP_BACKEND_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'User Name'
  })
});

const { access_token, user } = await response.json();
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));
```

### Sauvegarder les pratiques
```javascript
const token = localStorage.getItem('token');
const today = new Date().toISOString().split('T')[0];

const response = await fetch(`${REACT_APP_BACKEND_URL}/api/practice/state`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    date: today,
    state: { fajr: true, dhuhr: true },
    counters: { tasbih: 33 },
    wird_state: {},
    ramadan_state: {}
  })
});

const practiceState = await response.json();
```

### Récupérer les pratiques d'un jour
```javascript
const token = localStorage.getItem('token');
const date = '2026-04-07';

const response = await fetch(
  `${REACT_APP_BACKEND_URL}/api/practice/state/${date}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const practiceState = await response.json();
```

---

## Codes d'erreur

- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Token manquant ou invalide
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

---

## Notes techniques

1. **Token JWT**: Expire après 30 jours
2. **Synchronisation**: L'app fonctionne en mode hors ligne (localStorage). La sync API est optionnelle
3. **CORS**: Activé pour tous les domaines en développement
4. **MongoDB**: Les données sont stockées dans les collections `users`, `practice_states`, `histories`

---

## Roadmap API

- [ ] Endpoint pour récupérer les badges débloqués
- [ ] Endpoint pour les statistiques agrégées (semaine, mois)
- [ ] WebSocket pour sync temps réel
- [ ] Export des données (PDF, JSON)
- [ ] Partage social des achievements
