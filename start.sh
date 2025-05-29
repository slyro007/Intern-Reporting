#!/bin/bash

echo "🚀 Starting Wolff Logics Intern Tracking System..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your OpenAI API key and other settings."
    echo "   Then run this script again."
    exit 1
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ System started successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend (Intern Form): http://localhost:3000"
echo "   n8n (Backend):          http://localhost:5678"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:5678 to set up n8n"
echo "   2. Import workflows from n8n-workflows/ directory"
echo "   3. Configure OpenAI API credentials in n8n"
echo "   4. Test the form at http://localhost:3000"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop system:  docker-compose down"
echo "   Restart:      docker-compose restart" 