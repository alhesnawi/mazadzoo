// Mock data for testing the mobile app without backend dependency

export const mockAnimals = [
  {
    _id: '1',
    name: 'نمر سيبيري نادر',
    type: 'نمر',
    breed: 'سيبيري',
    age: 3,
    gender: 'ذكر',
    description: 'نمر سيبيري نادر جداً، من أندر الأنواع في العالم. يتميز بجماله الاستثنائي وقوته الهائلة.',
    images: [
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop',
    ],
    currentBid: 15000,
    startingPrice: 10000,
    totalBids: 12,
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'active',
    category: 'نمور',
    location: 'طرابلس',
    seller: {
      _id: 'seller1',
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 4.8,
    },
    certificates: [
      {
        type: 'شهادة صحة',
        url: 'https://example.com/health-cert.pdf',
      },
      {
        type: 'شهادة أصل',
        url: 'https://example.com/origin-cert.pdf',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    _id: '2',
    name: 'أسد أفريقي ملكي',
    type: 'أسد',
    breed: 'أفريقي',
    age: 5,
    gender: 'أنثى',
    description: 'أسد أفريقي ملكي من سلالة نادرة، تتميز بجمالها الاستثنائي وقوتها.',
    images: [
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400&h=300&fit=crop',
    ],
    currentBid: 25000,
    startingPrice: 20000,
    totalBids: 8,
    auctionEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    status: 'active',
    category: 'أسود',
    location: 'بنغازي',
    seller: {
      _id: 'seller2',
      name: 'فاطمة علي',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      rating: 4.9,
    },
    certificates: [
      {
        type: 'شهادة صحة',
        url: 'https://example.com/health-cert2.pdf',
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    _id: '3',
    name: 'فهد صياد نادر',
    type: 'فهد',
    breed: 'أفريقي',
    age: 2,
    gender: 'ذكر',
    description: 'فهد صياد نادر، أسرع الحيوانات البرية في العالم. يتميز بسرعته الفائقة ورشاقته.',
    images: [
      'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop',
    ],
    currentBid: 8000,
    startingPrice: 5000,
    totalBids: 15,
    auctionEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    status: 'active',
    category: 'فهود',
    location: 'مصراتة',
    seller: {
      _id: 'seller3',
      name: 'محمد الصادق',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 4.7,
    },
    certificates: [
      {
        type: 'شهادة صحة',
        url: 'https://example.com/health-cert3.pdf',
      },
      {
        type: 'شهادة تدريب',
        url: 'https://example.com/training-cert.pdf',
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    _id: '4',
    name: 'نسر ذهبي ملكي',
    type: 'نسر',
    breed: 'ذهبي',
    age: 4,
    gender: 'ذكر',
    description: 'نسر ذهبي ملكي نادر جداً، من أجمل الطيور الجارحة في العالم.',
    images: [
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=400&h=300&fit=crop',
    ],
    currentBid: 12000,
    startingPrice: 8000,
    totalBids: 6,
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: 'active',
    category: 'طيور',
    location: 'سبها',
    seller: {
      _id: 'seller4',
      name: 'عائشة أحمد',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 4.6,
    },
    certificates: [
      {
        type: 'شهادة صحة',
        url: 'https://example.com/health-cert4.pdf',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

export const mockUser = {
  _id: 'user1',
  name: 'محمد أحمد',
  email: 'mohamed@example.com',
  phone: '+218912345678',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  walletBalance: 50000,
  totalBids: 25,
  wonAuctions: 3,
  activeListings: 2,
  joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  isVerified: true,
  rating: 4.8,
};

export const mockBids = [
  {
    _id: 'bid1',
    animalId: '1',
    userId: 'user1',
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'active',
  },
  {
    _id: 'bid2',
    animalId: '2',
    userId: 'user1',
    amount: 25000,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    status: 'active',
  },
  {
    _id: 'bid3',
    animalId: '3',
    userId: 'user1',
    amount: 8000,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    status: 'active',
  },
];

export const mockNotifications = [
  {
    _id: 'notif1',
    type: 'bid_outbid',
    title: 'تم تجاوز مزايدتك',
    message: 'تم تجاوز مزايدتك على النمر السيبيري النادر',
    animalId: '1',
    isRead: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    _id: 'notif2',
    type: 'auction_ending',
    title: 'المزاد ينتهي قريباً',
    message: 'المزاد على الأسد الأفريقي الملكي ينتهي خلال ساعة',
    animalId: '2',
    isRead: false,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    _id: 'notif3',
    type: 'auction_won',
    title: 'مبروك! فزت بالمزاد',
    message: 'لقد فزت بمزاد الفهد الصياد النادر',
    animalId: '3',
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

export const mockCategories = [
  { id: 'نمور', name: 'نمور', icon: 'paw', count: 5 },
  { id: 'أسود', name: 'أسود', icon: 'paw', count: 3 },
  { id: 'فهود', name: 'فهود', icon: 'paw', count: 4 },
  { id: 'طيور', name: 'طيور', icon: 'airplane', count: 8 },
  { id: 'زواحف', name: 'زواحف', icon: 'bug', count: 2 },
  { id: 'أخرى', name: 'أخرى', icon: 'ellipsis-horizontal', count: 6 },
];

// Mock API functions
export const mockApiService = {
  // Animals
  getAnimals: () => Promise.resolve(mockAnimals),
  getAnimalById: (id) => Promise.resolve(mockAnimals.find(animal => animal._id === id)),
  getFeaturedAnimals: () => Promise.resolve(mockAnimals.slice(0, 2)),
  getRecentAnimals: () => Promise.resolve(mockAnimals.slice(1, 3)),
  getEndingSoonAnimals: () => Promise.resolve([mockAnimals[2]]),
  
  // User
  getCurrentUser: () => Promise.resolve(mockUser),
  updateProfile: (data) => Promise.resolve({ ...mockUser, ...data }),
  
  // Bids
  getUserBids: () => Promise.resolve(mockBids),
  placeBid: (animalId, amount) => Promise.resolve({
    _id: 'new_bid',
    animalId,
    userId: mockUser._id,
    amount,
    timestamp: new Date().toISOString(),
    status: 'active',
  }),
  
  // Favorites
  getFavorites: () => Promise.resolve(mockAnimals.slice(0, 2)),
  addToFavorites: (animalId) => Promise.resolve({ success: true }),
  removeFromFavorites: (animalId) => Promise.resolve({ success: true }),
  
  // Notifications
  getNotifications: () => Promise.resolve(mockNotifications),
  markNotificationAsRead: (id) => Promise.resolve({ success: true }),
  deleteNotification: (id) => Promise.resolve({ success: true }),
  
  // Categories
  getCategories: () => Promise.resolve(mockCategories),
  
  // Auth
  login: (credentials) => Promise.resolve({
    token: 'mock_token_123',
    user: mockUser,
  }),
  register: (userData) => Promise.resolve({
    token: 'mock_token_123',
    user: { ...mockUser, ...userData },
  }),
  logout: () => Promise.resolve({ success: true }),
};