# Rare Animals Auction Platform 🦁

## Overview

The Rare Animals Auction Platform is a comprehensive and advanced application for rare animal auctions, combining modern technology with ease of use. This project was developed to be a complete solution that meets all the needs of electronic auctions for rare animals.

## ✨ Key Features

### 🎯 Real-time Auction System
- **Live Auctions**: Real-time bidding system with instant updates
- **Countdown Timer**: Accurate display of remaining auction time
- **Auto Extension**: Ability to extend auction when bids are placed in final moments
- **Buy Now**: Instant purchase option

### 💰 Integrated Financial System
- **Digital Wallet**: Comprehensive balance system for each user
- **Transparent Fees**: 10 Libyan Dinars for animal listing, 40 Dinars for bidding
- **Automatic Refund**: Refund of bidding fees for non-winning bidders
- **Platform Commission**: 5% of sale value for the platform

### 📱 Advanced Mobile App
- **React Native**: Native app for iOS and Android
- **Responsive Design**: Modern and responsive user interface
- **Arabic Language Support**: Full Arabic language support with RTL direction

### 🌐 Professional Web Interface
- **React.js**: Modern and fast frontend interface
- **Tailwind CSS**: Modern and consistent design
- **Smooth UX**: Easy and intuitive navigation

## 🚀 Quick Start

### Method 1: Automatic Script
```bash
# Run the automatic script
./start-project.sh
```

### Method 2: Manual Setup

#### 1. Install Dependencies
```bash
# Install all libraries
npm run setup
```

#### 2. Start MongoDB
```bash
# Start MongoDB (macOS)
brew services start mongodb-community

# Or start MongoDB.app from Applications folder
open /Applications/MongoDB.app
```

#### 3. Run the Project
```bash
# Run all services
npm run dev:all

# Or run each service separately
npm run dev:backend    # Backend server
npm run dev:frontend   # Frontend
npm run dev:admin      # Admin dashboard
```

## 🌐 Available Links

After running the project, you can access:

- **Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **API Server**: http://localhost:5000
- **Socket.IO**: ws://localhost:5000

## 👤 Test Data

### Admin Account:
- **Email**: admin@rareauction.ly
- **Password**: admin123

### Regular User Account:
- **Email**: user@example.com
- **Password**: user123

## 🏗️ Technical Architecture

### Backend
- **Node.js + Express.js**: Powerful and scalable server
- **MongoDB**: Flexible and fast database
- **Socket.IO**: Real-time auction updates
- **JWT**: Secure and advanced authentication system
- **Multer**: File upload and management

### Frontend
- **React.js 18**: Latest React version
- **Vite**: Fast and modern build tool
- **Tailwind CSS**: Advanced CSS framework
- **Socket.IO Client**: For real-time communication

### Admin Dashboard
- **React.js 18**: Modern admin interface
- **Vite**: Fast build tool
- **Tailwind CSS**: Consistent design
- **Recharts**: Charts and reports

### Mobile App
- **React Native**: Cross-platform native app
- **Expo**: Integrated development platform
- **React Navigation**: Advanced navigation system

## 📁 Project Structure

```
rare-animals-auction/
├── backend/                    # Backend server
│   ├── controllers/           # Control logic
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Application middleware
│   ├── utils/                # Helper utilities
│   └── server.js             # Main server file
├── auction-frontend/          # Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Helper utilities
│   └── public/              # Public files
├── admin-dashboard/          # Admin dashboard
│   ├── src/
│   │   ├── components/      # Admin components
│   │   ├── services/       # Admin services
│   │   └── utils/          # Helper utilities
│   └── public/             # Public files
├── mobile-app/              # Mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── services/       # App services
│   │   └── utils/          # Helper utilities
│   └── assets/             # Assets and images
└── docs/                   # Documentation
```

## 🔧 Available Commands

### Run Commands:
```bash
npm run dev:all          # Run all services
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only
npm run dev:admin        # Run admin dashboard only
npm run dev:mobile       # Run mobile app
```

### Build Commands:
```bash
npm run build:all        # Build all projects
npm run build:frontend   # Build frontend
npm run build:admin      # Build admin dashboard
```

### Test Commands:
```bash
npm run test:all         # Test all projects
npm run test:backend     # Test backend
npm run test:frontend    # Test frontend
```

### Maintenance Commands:
```bash
npm run setup            # Install all libraries
npm run clean            # Clean node_modules
npm run lint:all         # Lint all projects
```

## 🛡️ Security & Protection

### Implemented Security Features:
- **Password Encryption**: Using bcryptjs
- **Attack Protection**: Rate limiting and CORS
- **Data Validation**: Express Validator
- **Secure File Upload**: Filtering and file type verification
- **Secure JWT**: Secure tokens with expiration

### Security Settings:
```env
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Available Features

### For Users:
1. **Registration and Login**
2. **View Available Animals**
3. **Real-time Bidding**
4. **Wallet Management**
5. **Track Auctions**
6. **Receive Notifications**

### For Administrators:
1. **User Management**
2. **Animal Management**
3. **Monitor Auctions**
4. **Financial Reports**
5. **System Settings**

## 🎯 Next Steps

### Immediate Improvements:
- [ ] Add more animals for testing
- [ ] Improve user interface
- [ ] Add more images
- [ ] Optimize performance

### Advanced Features:
- [ ] Rating and review system
- [ ] Private auction system
- [ ] Detailed reports
- [ ] Push notifications

## 🐛 Troubleshooting

### Common Issues:

#### 1. MongoDB Not Running
```bash
# Start MongoDB
brew services start mongodb-community
# Or
open /Applications/MongoDB.app
```

#### 2. Ports in Use
```bash
# Find running processes
lsof -i :5000
lsof -i :5173
lsof -i :5174

# Stop processes
kill -9 <PID>
```

#### 3. Library Issues
```bash
# Reinstall libraries
npm run clean
npm run setup
```

## 📞 Support & Help

For support and assistance:
- **Email**: info@rareauction.ly
- **Phone**: +218 21 123 4567
- **Address**: Tripoli, Libya

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Developed by Manus AI Team** 🚀
**Last Updated**: August 10, 2024
**Status**: ✅ Complete and Working
