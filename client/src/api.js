import axios from 'axios';

export const createTeam = async (teamData) => {
  try {
    // Assicuriamoci che i dati siano nel formato corretto
    const formattedData = { ...teamData };
    
    // Se abbiamo playerIds, assicuriamoci che sia un array di ID validi (non null)
    if (formattedData.playerIds) {
      formattedData.playerIds = formattedData.playerIds
        .map(id => typeof id === 'object' ? id.id : id)
        .filter(id => id !== null && id !== undefined && id !== '');
      
      if (formattedData.playerIds.length === 0) {
        throw new Error('Devi selezionare almeno un giocatore valido');
      }
    }
    
    // Se abbiamo players ma non playerIds, convertiamo players in playerIds
    if (formattedData.players && !formattedData.playerIds) {
      formattedData.playerIds = formattedData.players
        .map(player => {
          if (!player) return null;
          return typeof player === 'object' ? player.id : player;
        })
        .filter(id => id !== null && id !== undefined && id !== '');
      
      if (formattedData.playerIds.length === 0) {
        throw new Error('Devi selezionare almeno un giocatore valido');
      }
      
      delete formattedData.players;
    }
    
    // Verifica finale che ci siano giocatori validi
    if (!formattedData.playerIds || formattedData.playerIds.length === 0) {
      throw new Error('Devi selezionare almeno un giocatore');
    }
    
    console.log('Sending team data:', formattedData);
    
    const response = await axios.post('/api/teams', formattedData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('API error creating team:', error);
    throw error;
  }
};