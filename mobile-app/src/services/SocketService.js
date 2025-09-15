import { io } from 'socket.io-client';
import config from '../config/environment';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io(config.API_BASE_URL.replace('/api', ''), {
      auth: {
        token: token
      },
      transports: ['websocket'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      // Socket connected
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      // Socket disconnected
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      // Socket connection error
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Auction events
  joinAuction(animalId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-auction', animalId);
    }
  }

  leaveAuction(animalId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-auction', animalId);
    }
  }

  placeBid(animalId, amount) {
    if (this.socket && this.isConnected) {
      this.socket.emit('place-bid', { animalId, amount });
    }
  }

  // Event listeners
  onNewBid(callback) {
    if (this.socket) {
      this.socket.on('new-bid', callback);
    }
  }

  onAuctionEnd(callback) {
    if (this.socket) {
      this.socket.on('auction-ended', callback);
    }
  }

  onBidError(callback) {
    if (this.socket) {
      this.socket.on('bid-error', callback);
    }
  }

  onAuctionTimeUpdate(callback) {
    if (this.socket) {
      this.socket.on('auction-time-update', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();