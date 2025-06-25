#!/bin/bash

# Taxi Platform Deployment Script
echo "🚕 Starting Taxi Platform Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with the following variables:"
    echo "POSTGRES_PASSWORD=your_postgres_password"
    echo "NEXTAUTH_SECRET=your_nextauth_secret"
    echo "NEXTAUTH_URL=https://yourdomain.com"
    echo "GOVERNMENT_API_BASE_URL=https://api.government.be/taxi"
    echo "GOVERNMENT_API_KEY=your_government_api_key"
    echo "GOOGLE_CLIENT_ID=your_google_client_id"
    echo "GOOGLE_CLIENT_SECRET=your_google_client_secret"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

echo "📦 Building Docker containers..."
docker-compose build

echo "🗄️ Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to start..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose run --rm app npx prisma migrate deploy

echo "🌱 Seeding database..."
docker-compose run --rm app npx prisma db seed

echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Deployment complete!"
echo "🌐 Your taxi platform is now running at:"
echo "   - Frontend: https://yourdomain.com"
echo "   - API: https://yourdomain.com/api"
echo ""
echo "📊 Monitor logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"

# Show running containers
echo "📋 Running containers:"
docker-compose ps 