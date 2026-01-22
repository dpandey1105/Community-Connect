@echo off
echo Building and starting Community Connect with Docker...

echo.
echo Step 1: Stopping existing containers...
docker-compose down

echo.
echo Step 2: Building Docker image...
docker-compose build --no-cache

echo.
echo Step 3: Starting services...
docker-compose up -d

echo.
echo Step 4: Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo Step 5: Checking container status...
docker-compose ps

echo.
echo Step 6: Showing application logs...
docker-compose logs app

echo.
echo ========================================
echo Community Connect is starting up!
echo Frontend: http://localhost:5222
echo API: http://localhost:5222/api
echo MongoDB: localhost:27017
echo ========================================
echo.
echo To view logs: docker-compose logs -f app
echo To stop: docker-compose down
echo.