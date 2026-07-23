module.exports = {
  apps: [
    {
      name: 'looper',
      script: './index.ts',
      interpreter: './node_modules/.bin/tsx',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
