import { createContext, useContext, useState, useEffect } from 'react';
import { animalsService, bidsService, socketService } from '../services/api';
import { useAuth } from './AuthContext';

const AuctionContext = createContext();

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};

export const AuctionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [bids, setBids] = useState([]);
  const [auctionTime, setAuctionTime] = useState({});

  // Load animals on mount
  useEffect(() => {
    loadAnimals();
  }, []);

  // Setup Socket.IO listeners
  useEffect(() => {
    if (isAuthenticated) {
      setupSocketListeners();
    }
    
    return () => {
      // Cleanup socket listeners
      if (socketService.socket) {
        socketService.socket.off('new-bid');
        socketService.socket.off('auction-time-update');
        socketService.socket.off('auction-ended');
        socketService.socket.off('outbid-notification');
      }
    };
  }, [isAuthenticated]);

  const setupSocketListeners = () => {
    // Listen for new bids
    socketService.onNewBid((data) => {
      setAnimals(prevAnimals => 
        prevAnimals.map(animal => 
          animal._id === data.animal._id 
            ? { ...animal, ...data.animal }
            : animal
        )
      );
      
      setBids(prevBids => [data.bid, ...prevBids]);
    });

    // Listen for auction time updates
    socketService.onAuctionTimeUpdate((data) => {
      setAuctionTime(prev => ({
        ...prev,
        [data.animalId]: data.timeLeft
      }));
    });

    // Listen for auction ended
    socketService.onAuctionEnded((data) => {
      setAnimals(prevAnimals => 
        prevAnimals.map(animal => 
          animal._id === data.animalId 
            ? { ...animal, status: 'ended' }
            : animal
        )
      );
    });

    // Listen for outbid notifications
    socketService.onOutbidNotification((data) => {
      // You can show a toast notification here
      // Handle outbid notification silently or show user-friendly message
    });
  };

  const loadAnimals = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await animalsService.getAnimals(params);
      const animalsData = response.data?.animals || response.animals || response;

      setAnimals(animalsData);
    } catch (error) {
      console.error('Error loading animals:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnimal = async (animalId) => {
    try {
      setLoading(true);
      setError(null);
      
      const animal = await animalsService.getAnimal(animalId);
      setSelectedAnimal(animal);
      
      // Load bids for this animal
      await loadBids(animalId);
      
      // Join auction room
      socketService.joinAuction(animalId);
      
      return animal;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async (animalId) => {
    try {
      const response = await bidsService.getBids(animalId);
      setBids(response.bids || response);
    } catch (error) {
      // Handle bid loading error silently
      setError('Failed to load bids');
    }
  };

  const placeBid = async (animalId, bidAmount) => {
    try {
      setError(null);
      
      // Use Socket.IO for real-time bidding
      socketService.placeBid(animalId, bidAmount);
      
      // Also make HTTP request for backup
      const response = await bidsService.placeBid(animalId, bidAmount);
      
      return { success: true, data: response };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const searchAnimals = async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await animalsService.getAnimals({
        q: query,
        ...filters
      });

      const animalsData = response.data?.animals || response.animals || response;
      setAnimals(animalsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createAnimal = async (animalData) => {
    try {
      setError(null);
      
      const newAnimal = await animalsService.createAnimal(animalData);
      setAnimals(prev => [newAnimal, ...prev]);
      
      return { success: true, data: newAnimal };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const updateAnimal = async (animalId, animalData) => {
    try {
      setError(null);
      
      const updatedAnimal = await animalsService.updateAnimal(animalId, animalData);
      setAnimals(prev => 
        prev.map(animal => 
          animal._id === animalId ? updatedAnimal : animal
        )
      );
      
      if (selectedAnimal?._id === animalId) {
        setSelectedAnimal(updatedAnimal);
      }
      
      return { success: true, data: updatedAnimal };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const deleteAnimal = async (animalId) => {
    try {
      setError(null);
      
      await animalsService.deleteAnimal(animalId);
      setAnimals(prev => prev.filter(animal => animal._id !== animalId));
      
      if (selectedAnimal?._id === animalId) {
        setSelectedAnimal(null);
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const leaveAuction = (animalId) => {
    socketService.leaveAuction(animalId);
    setSelectedAnimal(null);
    setBids([]);
  };

  const value = {
    animals,
    selectedAnimal,
    bids,
    auctionTime,
    loading,
    error,
    loadAnimals,
    getAnimal,
    placeBid,
    searchAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    clearError,
    leaveAuction
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
