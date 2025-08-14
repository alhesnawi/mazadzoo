const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const Animal = require('../models/Animal');
const Bid = require('../models/Bid');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: config.SOCKET_CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          socket.user = user;
        }
      }
      
      next();
    } catch (error) {
      // Allow connection even without valid token for public viewing
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user?.username || 'Anonymous'} (${socket.id})`);

    // Join auction room
    socket.on('join-auction', (animalId) => {
      socket.join(`auction-${animalId}`);
      console.log(`User ${socket.user?.username || 'Anonymous'} joined auction ${animalId}`);
    });

    // Leave auction room
    socket.on('leave-auction', (animalId) => {
      socket.leave(`auction-${animalId}`);
      console.log(`User ${socket.user?.username || 'Anonymous'} left auction ${animalId}`);
    });

    // Handle real-time bidding
    socket.on('place-bid', async (data) => {
      try {
        if (!socket.user) {
          socket.emit('bid-error', { message: 'يجب تسجيل الدخول للمزايدة' });
          return;
        }

        const { animalId, bidAmount } = data;

        // Validate input
        if (!animalId || !bidAmount || bidAmount <= 0) {
          socket.emit('bid-error', { message: 'بيانات المزايدة غير صحيحة' });
          return;
        }

        // Get animal
        const animal = await Animal.findById(animalId);
        if (!animal) {
          socket.emit('bid-error', { message: 'الحيوان غير موجود' });
          return;
        }

        // Check if auction is active
        if (animal.status !== 'active') {
          socket.emit('bid-error', { message: 'المزاد غير نشط' });
          return;
        }

        // Check if auction has ended
        if (new Date() > animal.auctionEndTime) {
          socket.emit('bid-error', { message: 'انتهى وقت المزاد' });
          return;
        }

        // Check if user is not the seller
        if (animal.sellerId.toString() === socket.user.id) {
          socket.emit('bid-error', { message: 'لا يمكنك المزايدة على حيوانك الخاص' });
          return;
        }

        // Check if bid amount is higher than current bid
        if (bidAmount <= animal.currentBid) {
          socket.emit('bid-error', { 
            message: `يجب أن تكون المزايدة أكبر من ${animal.currentBid} دينار ليبي` 
          });
          return;
        }

        // Check user balance for bidding fee
        const user = await User.findById(socket.user.id);
        const biddingFee = parseFloat(config.BIDDING_FEE_LYD) || 40;
        
        if (user.balance < biddingFee) {
          socket.emit('bid-error', { 
            message: `رصيدك غير كافي. تحتاج إلى ${biddingFee} دينار ليبي كرسوم مزايدة` 
          });
          return;
        }

        // Place the bid
        const previousHighestBidderId = animal.highestBidderId;
        const bidPlaced = animal.placeBid(socket.user.id, bidAmount);
        
        if (!bidPlaced) {
          socket.emit('bid-error', { message: 'فشل في وضع المزايدة' });
          return;
        }

        await animal.save();

        // Create bid record
        const bid = await Bid.create({
          animalId,
          bidderId: socket.user.id,
          bidAmount
        });

        await bid.populate('bidderId', 'username');

        // Broadcast new bid to all users in the auction room
        io.to(`auction-${animalId}`).emit('new-bid', {
          bid: {
            _id: bid._id,
            bidAmount: bid.bidAmount,
            bidTime: bid.bidTime,
            bidderId: {
              _id: bid.bidderId._id,
              username: bid.bidderId.username
            }
          },
          animal: {
            _id: animal._id,
            currentBid: animal.currentBid,
            bidCount: animal.bidCount,
            auctionEndTime: animal.auctionEndTime,
            highestBidderId: animal.highestBidderId
          }
        });

        // Notify previous highest bidder that they were outbid
        if (previousHighestBidderId && previousHighestBidderId.toString() !== socket.user.id) {
          io.emit('outbid-notification', {
            userId: previousHighestBidderId,
            animalId: animal._id,
            animalName: animal.name,
            newBid: bidAmount
          });
        }

        // Send success response to bidder
        socket.emit('bid-success', {
          message: 'تم وضع المزايدة بنجاح',
          bid,
          animal
        });

      } catch (error) {
        console.error('Socket bid error:', error);
        socket.emit('bid-error', { message: 'حدث خطأ أثناء المزايدة' });
      }
    });

    // Handle auction time updates
    socket.on('get-auction-time', async (animalId) => {
      try {
        const animal = await Animal.findById(animalId);
        if (animal && animal.status === 'active') {
          const timeLeft = animal.auctionEndTime - new Date();
          socket.emit('auction-time-update', {
            animalId,
            timeLeft: Math.max(0, timeLeft),
            auctionEndTime: animal.auctionEndTime
          });
        }
      } catch (error) {
        console.error('Socket time error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.username || 'Anonymous'} (${socket.id})`);
    });
  });

  // Auction management functions
  const broadcastAuctionStart = (animal) => {
    io.emit('auction-started', {
      animalId: animal._id,
      animalName: animal.name,
      startPrice: animal.startPrice,
      auctionEndTime: animal.auctionEndTime
    });
  };

  const broadcastAuctionEnd = (animal) => {
    io.to(`auction-${animal._id}`).emit('auction-ended', {
      animalId: animal._id,
      animalName: animal.name,
      finalBid: animal.currentBid,
      winnerId: animal.highestBidderId,
      status: animal.status
    });
  };

  const broadcastAuctionExtension = (animal, extensionMinutes) => {
    io.to(`auction-${animal._id}`).emit('auction-extended', {
      animalId: animal._id,
      newEndTime: animal.auctionEndTime,
      extensionMinutes
    });
  };

  // Periodic auction time updates
  setInterval(async () => {
    try {
      const activeAnimals = await Animal.find({ 
        status: 'active',
        auctionEndTime: { $gt: new Date() }
      });

      for (const animal of activeAnimals) {
        const timeLeft = animal.auctionEndTime - new Date();
        
        io.to(`auction-${animal._id}`).emit('auction-time-update', {
          animalId: animal._id,
          timeLeft: Math.max(0, timeLeft),
          auctionEndTime: animal.auctionEndTime
        });

        // Check if auction should end
        if (timeLeft <= 0) {
          animal.endAuction();
          await animal.save();
          broadcastAuctionEnd(animal);
        }
        // Warn when 5 minutes left
        else if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
          io.to(`auction-${animal._id}`).emit('auction-warning', {
            animalId: animal._id,
            message: 'باقي 5 دقائق على انتهاء المزاد!'
          });
        }
        // Warn when 1 minute left
        else if (timeLeft <= 60 * 1000 && timeLeft > 30 * 1000) {
          io.to(`auction-${animal._id}`).emit('auction-warning', {
            animalId: animal._id,
            message: 'باقي دقيقة واحدة على انتهاء المزاد!'
          });
        }
      }
    } catch (error) {
      console.error('Auction timer error:', error);
    }
  }, 10000); // Update every 10 seconds

  return {
    broadcastAuctionStart,
    broadcastAuctionEnd,
    broadcastAuctionExtension,
    getIO: () => io
  };
};

module.exports = { initializeSocket };

