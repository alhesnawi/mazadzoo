module.exports = {
  apps: [
    {
      name: 'rare-animals-backend',
      script: './backend/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'rare-animals-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './auction-frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      watch: false,
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s'
    },
    {
      name: 'rare-animals-admin',
      script: 'npm',
      args: 'run preview',
      cwd: './admin-dashboard',
      env: {
        NODE_ENV: 'production',
        PORT: 5174
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_file: './logs/admin-combined.log',
      time: true,
      watch: false,
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/rare-animals-auction.git',
      path: '/var/www/rare-animals-auction',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};