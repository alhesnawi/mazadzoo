const mongoose = require('mongoose');
const Animal = require('./models/Animal');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const config = require('./config/environment');
const logger = require('./utils/logger');

// Sample data for testing
const sampleAnimals = [
  {
    name: 'نمر سيبيري نادر',
    description: 'نمر سيبيري نادر جداً، من أندر الأنواع في العالم. يتميز بجماله الاستثنائي وقوته الهائلة.',
    category: 'ثدييات',
    type: 'نمر',
    breed: 'سيبيري',
    age: '3 سنوات',
    gender: 'ذكر',
    approximateWeight: '200 كيلو',
    healthCondition: 'ممتاز',
    images: [
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
    ],
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    healthCertificate: 'https://example.com/health-cert.pdf',
    startPrice: 10000,
    reservePrice: 15000,
    buyItNowPrice: 25000,
    currentBid: 10000,
    status: 'active',
    isApproved: true,
    auctionStartTime: new Date(),
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: {
      city: 'طرابلس',
      country: 'ليبيا'
    }
  },
  {
    name: 'أسد أفريقي ملكي',
    description: 'أسد أفريقي ملكي بعرف كثيف وجميل. حيوان قوي ومهيب من السلالات النادرة.',
    category: 'ثدييات',
    type: 'أسد',
    breed: 'أفريقي',
    age: '5 سنوات',
    gender: 'ذكر',
    approximateWeight: '180 كيلو',
    healthCondition: 'جيد جداً',
    images: [
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1520315342629-6ea920342047?w=400&h=300&fit=crop'
    ],
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    healthCertificate: 'https://example.com/health-cert2.pdf',
    startPrice: 20000,
    reservePrice: 30000,
    buyItNowPrice: 45000,
    currentBid: 22000,
    status: 'active',
    isApproved: true,
    auctionStartTime: new Date(),
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: {
      city: 'بنغازي',
      country: 'ليبيا'
    }
  },
  {
    name: 'نسر ذهبي نادر',
    description: 'نسر ذهبي نادر بريش لامع وجناحين قويين. من أجمل الطيور الجارحة في العالم.',
    category: 'طيور',
    type: 'نسر',
    breed: 'ذهبي',
    age: '2 سنة',
    gender: 'أنثى',
    approximateWeight: '6 كيلو',
    healthCondition: 'ممتاز',
    images: [
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    ],
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    healthCertificate: 'https://example.com/health-cert3.pdf',
    startPrice: 5000,
    reservePrice: 8000,
    buyItNowPrice: 12000,
    currentBid: 6500,
    status: 'active',
    isApproved: true,
    auctionStartTime: new Date(),
    auctionEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    location: {
      city: 'سبها',
      country: 'ليبيا'
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Find existing seller user
    let seller = await User.findOne({ role: 'seller' });
    
    if (!seller) {
      logger.error('No seller user found. Please create a seller first.');
      return;
    }
    
    logger.info(`Using seller: ${seller.username}`);

    // Clear existing animals
    await Animal.deleteMany({});
    logger.info('Cleared existing animals');

    // Add sellerId to each animal
    const animalsWithSeller = sampleAnimals.map(animal => ({
      ...animal,
      sellerId: seller._id
    }));

    // Insert sample animals
    const createdAnimals = await Animal.insertMany(animalsWithSeller);
    logger.info(`Created ${createdAnimals.length} sample animals`);

    logger.info('Database seeded successfully!');
    createdAnimals.forEach((animal, index) => {
      logger.info(`${index + 1}. ${animal.name} - ${animal.startPrice} دينار`);
    });

  } catch (error) {
    logger.error('Error seeding database', { message: error.message, stack: error.stack });
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

// Run the seed function
seedDatabase();