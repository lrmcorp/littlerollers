module.exports = {
  apps: [
    {
      name: 'dailydose-api',
      cwd: '/workspace/dailydose_v2',
      script: 'node',
      args: '--max-old-space-size=256 --env-file=.env apps/api/dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dailydose-worker',
      cwd: '/workspace/dailydose_v2',
      script: 'node',
      args: '--max-old-space-size=192 --env-file=.env apps/worker/dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dailydose-web',
      cwd: '/workspace/dailydose_v2/apps/web',
      script: 'node',
      args: '--max-old-space-size=256 .next/standalone/apps/web/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
