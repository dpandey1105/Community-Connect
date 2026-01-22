@echo off
echo Building Community Connect Docker Image...

docker build -t community-connect:latest .

echo Docker image built successfully!
echo To run the application:
echo   docker-compose up -d
echo.
echo To run without MongoDB (if you have external DB):
echo   docker run -p 5222:5222 --env-file .env.docker community-connect:latest

pause