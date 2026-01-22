#!/bin/bash
# Render Deployment Verification Script

echo "🔍 Checking Render Deployment Configuration..."

# Check if render.yaml has required environment variables
echo "📋 Verifying render.yaml configuration..."
if grep -q "FRONTEND_URL" render.yaml && grep -q "VITE_API_URL" render.yaml; then
    echo "✅ Environment variables configured in render.yaml"
else
    echo "❌ Missing environment variables in render.yaml"
    exit 1
fi

# Check if API config exists
echo "📋 Verifying API configuration..."
if [ -f "frontend/src/lib/config.js" ]; then
    echo "✅ API configuration file exists"
else
    echo "❌ Missing API configuration file"
    exit 1
fi

echo "🚀 Render deployment configuration verified!"
echo ""
echo "📝 Next steps:"
echo "1. Deploy to Render using: git push origin main"
echo "2. Verify URLs in Render dashboard match render.yaml"
echo "3. Test API connectivity after deployment"
echo ""
echo "🔗 Expected URLs:"
echo "Frontend: https://community-connect-frontend.onrender.com"
echo "Backend:  https://community-connect-backend.onrender.com"