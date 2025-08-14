# Production Deployment Guide for mazadzoo.online

## Overview
This guide provides step-by-step instructions for deploying the Rare Animals Auction Platform to the production domain `mazadzoo.online`.

## Domain Configuration

### Updated Configuration Files
The following files have been updated to use the production domain:

1. **Backend Configuration**:
   - `backend/.env` - Updated with production domain settings
   - `backend/.env.example` - Template for production deployment
   - `backend/config/environment.js` - Added domain configuration

2. **Frontend Configuration**:
   - `auction-frontend/.env` - Updated API URLs to use `https://api.mazadzoo.online`
   - `admin-dashboard/.env` - Updated API URLs to use `https://api.mazadzoo.online`

### Domain Structure
- **Main Website**: `https://mazadzoo.online`
- **Admin Dashboard**: `https://admin.mazadzoo.online` (or subdirectory)
- **API Backend**: `https://api.mazadzoo.online`

## SSL/HTTPS Configuration

### 1. SSL Certificate Setup
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificates for all domains
sudo certbot --nginx -d mazadzoo.online -d www.mazadzoo.online -d api.mazadzoo.online -d admin.mazadzoo.online
```

### 2. Nginx Configuration
Create `/etc/nginx/sites-available/mazadzoo.online`:

```nginx
# Main website (Frontend)
server {
    listen 80;
    listen [::]:80;
    server_name mazadzoo.online www.mazadzoo.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mazadzoo.online www.mazadzoo.online;

    ssl_certificate /etc/letsencrypt/live/mazadzoo.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mazadzoo.online/privkey.pem;

    root /var/www/mazadzoo.online/auction-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}

# API Backend
server {
    listen 80;
    listen [::]:80;
    server_name api.mazadzoo.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.mazadzoo.online;

    ssl_certificate /etc/letsencrypt/live/mazadzoo.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mazadzoo.online/privkey.pem;

    location / {
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

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Dashboard
server {
    listen 80;
    listen [::]:80;
    server_name admin.mazadzoo.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.mazadzoo.online;

    ssl_certificate /etc/letsencrypt/live/mazadzoo.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mazadzoo.online/privkey.pem;

    root /var/www/mazadzoo.online/admin-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install MongoDB
sudo apt install mongodb
```

### 2. Application Deployment
```bash
# Clone repository to server
git clone <your-repo-url> /var/www/mazadzoo.online
cd /var/www/mazadzoo.online

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ../auction-frontend
npm install
npm run build

cd ../admin-dashboard
npm install
npm run build

# Set up environment variables
cd ../backend
cp .env.example .env
# Edit .env with production values
```

### 3. Process Management with PM2
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mazadzoo-backend',
    script: './backend/server.js',
    cwd: '/var/www/mazadzoo.online',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/mazadzoo-error.log',
    out_file: '/var/log/pm2/mazadzoo-out.log',
    log_file: '/var/log/pm2/mazadzoo-combined.log'
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Database Setup
```bash
# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use rare_animals_auction
db.createUser({
  user: "mazadzoo_user",
  pwd: "secure_password_here",
  roles: ["readWrite"]
})
```

### 5. Firewall Configuration
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Environment Variables for Production

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mazadzoo_user:secure_password@localhost:27017/rare_animals_auction
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRE=7d

# Domain Configuration
DOMAIN=mazadzoo.online
CORS_ORIGIN=https://mazadzoo.online
SOCKET_CORS_ORIGIN=https://mazadzoo.online

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@mazadzoo.online
EMAIL_PASS=your_app_password

# Firebase Admin SDK (add your credentials)
FIREBASE_ADMIN_SDK={"type":"service_account",...}
```

## Security Checklist

- [ ] SSL certificates installed and configured
- [ ] Firewall configured (UFW)
- [ ] MongoDB secured with authentication
- [ ] JWT secret changed from default
- [ ] Environment variables secured
- [ ] File upload directory permissions set correctly
- [ ] Nginx security headers configured
- [ ] PM2 process monitoring enabled
- [ ] Log rotation configured
- [ ] Backup strategy implemented

## Monitoring and Maintenance

### Log Monitoring
```bash
# View PM2 logs
pm2 logs mazadzoo-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx -f
```

### Backup Strategy
```bash
# Database backup
mongodump --db rare_animals_auction --out /backup/mongodb/$(date +%Y%m%d)

# File backup
tar -czf /backup/files/uploads-$(date +%Y%m%d).tar.gz /var/www/mazadzoo.online/backend/uploads
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN in backend .env
2. **Socket.IO Connection Issues**: Verify SOCKET_CORS_ORIGIN setting
3. **SSL Certificate Issues**: Check certificate paths in Nginx config
4. **Database Connection**: Verify MongoDB is running and credentials are correct

### Health Checks
```bash
# Check if backend is running
curl https://api.mazadzoo.online/api/health

# Check SSL certificate
openssl s_client -connect mazadzoo.online:443 -servername mazadzoo.online

# Check PM2 status
pm2 status
```

## Post-Deployment Tasks

1. Test all functionality on the live domain
2. Set up monitoring and alerting
3. Configure automated backups
4. Update DNS records if needed
5. Test mobile app with production API
6. Update Firebase project settings for production domain
7. Configure email templates with production domain
8. Set up analytics and error tracking

## Support

For deployment issues, check:
- Server logs: `/var/log/nginx/` and PM2 logs
- Application logs: Check PM2 dashboard
- Database logs: MongoDB logs
- SSL certificate status: `sudo certbot certificates`