// Cloudflare Pages Configuration
// This file configures the deployment for Cloudflare Pages

module.exports = {
  // Build configuration
  build: {
    command: 'npm run build',
    destination: 'dist',
    environment: {
      NODE_VERSION: '18.17.0',
      NPM_VERSION: '9.6.7'
    }
  },

  // Function routes for API endpoints
  functions: {
    // Taxi meter API endpoints will be handled by Cloudflare Workers
    '/api/taxi-meter/*': 'functions/taxi-meter/[[...route]].js',
    '/api/drivers/*': 'functions/drivers/[[...route]].js',
    '/api/bookings/*': 'functions/bookings/[[...route]].js'
  },

  // Redirects and routing
  redirects: [
    {
      from: '/api/*',
      to: '/api/:path*',
      status: 200
    }
  ],

  // Headers for CORS and security
  headers: [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization'
        }
      ]
    }
  ]
}; 