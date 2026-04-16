module.exports = {
  apps: [
    {
      name: 'compro-next-pinet',
      script: 'npm',
      args: 'start',
      cwd: '/opt/compro-next-pinet',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
