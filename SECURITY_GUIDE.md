# Security Guide - Rare Animals Auction Platform

## 🔒 Security Overview

This guide outlines the security measures implemented in the Rare Animals Auction Platform and provides best practices for secure deployment.

## 🛡️ Implemented Security Features

### 1. Authentication & Authorization
- JWT-based authentication with secure token generation
- Password hashing using bcryptjs
- Role-based access control (buyer, seller, admin)
- Phone number verification system

### 2. Rate Limiting
- General API rate limiting (100 requests per 15 minutes)
- Authentication endpoint protection (5 attempts per 15 minutes)
- Bidding rate limiting (10 bids per minute)
- File upload rate limiting (5 uploads per minute)

### 3. Input Validation
- Express-validator for request validation
- Mongoose schema validation
- File type and size validation for uploads
- XSS protection through input sanitization

### 4. Security Headers
- Helmet.js for security headers
- CORS configuration with origin validation
- Content Security Policy (CSP)
- HSTS headers for HTTPS enforcement

### 5. Error Handling
- Centralized error handling with Winston logging
- No sensitive information in error responses
- Proper HTTP status codes

## 🚨 Critical Security Checklist

### Before Production Deployment

#### Environment Variables
- [ ] Change `JWT_SECRET` to a strong, random 32+ character string
- [ ] Set up proper database credentials (MongoDB Atlas recommended)
- [ ] Configure email service credentials
- [ ] Set up payment gateway credentials
- [ ] Configure Firebase Admin SDK
- [ ] Set `NODE_ENV=production`

#### Database Security
- [ ] Enable MongoDB authentication
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Enable database encryption at rest
- [ ] Regular database backups

#### Server Security
- [ ] Use HTTPS/TLS certificates (Let's Encrypt recommended)
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor server logs

#### Application Security
- [ ] Remove all console.log statements in production
- [ ] Implement proper SMS service for phone verification
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation

## 🔧 Environment Configuration

### Development Environment
```bash
# Use the provided .env file with development settings
cp backend/.env.example backend/.env
```

### Production Environment
```bash
# Use the production template
cp backend/.env.production.example backend/.env
# Fill in all required values
```

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Strong random string for JWT signing |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `EMAIL_USER` | ⚠️ | Email service username |
| `EMAIL_PASS` | ⚠️ | Email service password |
| `PAYMENT_GATEWAY_KEY` | ⚠️ | Payment service API key |
| `PAYMENT_GATEWAY_SECRET` | ⚠️ | Payment service secret |
| `FIREBASE_ADMIN_SDK` | ⚠️ | Path to Firebase admin SDK JSON |

## 🚀 Secure Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (use NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd rare_animals_auction

# Install dependencies
npm run setup

# Configure environment
cp backend/.env.production.example backend/.env
# Edit .env with production values

# Start with PM2
pm2 start ecosystem.config.js
```

### 3. Reverse Proxy Setup (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Security Monitoring

### Log Monitoring
- Monitor authentication failures
- Track rate limit violations
- Watch for unusual bidding patterns
- Monitor file upload attempts

### Alerts Setup
- Failed login attempts > 10 per hour
- Database connection failures
- Payment processing errors
- Server resource usage > 80%

## 🆘 Incident Response

### Security Breach Response
1. Immediately revoke all JWT tokens
2. Change all secrets and API keys
3. Review server logs for compromise
4. Notify users if data was accessed
5. Update security measures

### Emergency Contacts
- System Administrator: [contact]
- Security Team: [contact]
- Database Administrator: [contact]

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Note**: This security guide should be reviewed and updated regularly as new threats emerge and the application evolves.