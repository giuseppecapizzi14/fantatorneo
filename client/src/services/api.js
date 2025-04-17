import axios from 'axios';

// Make sure this matches your server port (5001 if that's what your server is using)
// Export API_URL so it can be imported elsewhere
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.herokuapp.com/api' 
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
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth services
// Make sure your login function is properly implemented
// Fix the login function to use the api instance with the correct URL
// Fix the login function to use the correct endpoint
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
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

// Bonus services
export const getMatchdays = () => {
  return api.get('/bonus/matchdays');
};

export const getMatchday = (id) => {
  return api.get(`/bonus/matchdays/${id}`);
};

export const createMatchday = (matchdayData) => {
  return api.post('/bonus/matchdays', matchdayData);
};

export const updateBonuses = async (matchdayId, bonusesData) => {
  try {
    // Add logging to debug the request
    console.log(`Sending bonus update to /bonus/matchdays/${matchdayId}/bonuses:`, bonusesData);
    
    // Make sure we're using the api instance with interceptors
    const response = await api.post(`/bonus/matchdays/${matchdayId}/bonuses`, bonusesData);
    
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

export const deleteMatchday = (id) => {
  return api.delete(`/bonus/matchdays/${id}`);
};

export const getPlayersWithBonuses = (matchdayId) => {
  return api.get(`/bonus/matchdays/${matchdayId}/players`);
};

// Leaderboard services
export const getLeaderboard = () => {
  return api.get('/leaderboard');
};

export const getDetailedLeaderboard = () => {
  return api.get('/leaderboard/detailed');
};

export const deleteBonus = async (matchdayId, playerId) => {
  try {
    const response = await api.delete(`/bonus/matchdays/${matchdayId}/bonuses/${playerId}`);
    return response;
  } catch (error) {
    console.error('API error deleting bonus:', error);
    throw error;
  }
};

export default api;