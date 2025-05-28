import axios from 'axios';

// Make sure this matches your server port (5001 if that's what your server is using)
// Export API_URL so it can be imported elsewhere
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fantatorneo-backend.onrender.com/api' 
  : 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log('API Request:', config.url, config);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses and errors
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response);
    return response;
  },
  error => {
    console.error('API Response Error:', error.config?.url, error);
    return Promise.reject(error);
  }
);

// Auth services
export const login = async (username, password) => {
  try {
    console.log('Attempting login with:', { username, url: API_URL });
    const response = await api.post('/auth/login', { username, password });
    console.log('Login response:', response);
    return response;
  } catch (error) {
    console.error('API login error:', error);
    throw error;
  }
};

export const register = (name, username, password) => {
  return api.post('/auth/register', { name, username, password });
};

// User services
export const getUsers = () => {
  return api.get('/users');
};

export const getUser = (id) => {
  return api.get(`/users/${id}`);
};

export const updateUser = (id, userData) => {
  return api.put(`/users/${id}`, userData);
};

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

// Team services
export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    
    // Assicuriamoci che ogni team abbia almeno un array players vuoto
    if (response.data) {
      response.data = response.data.map(team => ({
        ...team,
        players: team.players || []
      }));
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const getTeam = (id) => {
  return api.get(`/teams/${id}`);
};

export const getUserTeam = (userId) => {
  return api.get(`/teams/user/${userId}`);
};

// Try a simpler endpoint pattern that matches other API calls
// Try adjusting the data format to match what the server expects
// Try a different approach for team creation
// Add this function to your api.js file

export const createTeam = async (teamData) => {
  try {
    // Simple payload with just the essential data
    const payload = {
      name: teamData.name,
      playerIds: teamData.playerIds
    };
    
    return await api.post('/teams', payload);
  } catch (error) {
    console.error('API error creating team:', error);
    throw error;
  }
};

export const updateTeam = (id, teamData) => {
  return api.put(`/teams/${id}`, teamData);
};

export const deleteTeam = (id) => {
  return api.delete(`/teams/${id}`);
};

// Player services
export const getPlayers = () => {
  return api.get('/players');
};

export const getPlayer = (id) => {
  return api.get(`/players/${id}`);
};

export const createPlayer = (playerData) => {
  return api.post('/players', playerData);
};

export const updatePlayer = (id, playerData) => {
  return api.put(`/players/${id}`, playerData);
};

export const deletePlayer = (id) => {
  return api.delete(`/players/${id}`);
};

// Bonus services - Matches (nuova versione)
export const getMatches = () => {
  return api.get('/bonus/matches');
};

export const getMatch = (id) => {
  return api.get(`/bonus/matches/${id}`);
};

export const createMatch = (matchData) => {
  return api.post('/bonus/matches', matchData);
};

export const getPlayersWithBonuses = (matchId) => {
  return api.get(`/bonus/matches/${matchId}/players`);
};

export const updateBonuses = async (matchId, bonusesData) => {
  try {
    // Add logging to debug the request
    console.log(`Sending bonus update to /bonus/matches/${matchId}/bonuses:`, bonusesData);
    
    // Make sure we're using the api instance with interceptors
    const response = await api.post(`/bonus/matches/${matchId}/bonuses`, bonusesData);
    
    // Log the response
    console.log('Bonus update response:', response.data);
    
    return response;
  } catch (error) {
    console.error('API error updating bonuses:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const deleteMatch = (id) => {
  return api.delete(`/bonus/matches/${id}`);
};

export const deleteBonus = async (matchId, playerId) => {
  try {
    const response = await api.delete(`/bonus/matches/${matchId}/bonuses/${playerId}`);
    return response;
  } catch (error) {
    console.error('API error deleting bonus:', error);
    throw error;
  }
};

// Leaderboard services
export const getLeaderboard = () => {
  return api.get('/leaderboard');
};

export const getDetailedLeaderboard = () => {
  return api.get('/leaderboard/detailed');
};

export default api;