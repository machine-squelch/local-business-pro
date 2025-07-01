module.exports = {
  apps: [
    {
      name: 'localbrand-pro-backend',
      script: '/Users/agurley/local-business-pro-main/backend/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
