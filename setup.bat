@echo off
cd /d "%~dp0"

echo ========================================================
echo Error404 Admin - Automatic Setup Script
echo ========================================================

echo.
echo Installing dependencies for Admin Server...
cd server
call npm install
echo Creating .env for Admin Server...
(
echo PORT=8000
echo MONGO_URI=mongodb+srv://^<username^>:^<password^>@cluster.mongodb.net/error404
echo NODE_ENV=development
) > .env
cd ..

echo.
echo Installing dependencies for Admin Client...
cd client
call npm install
echo Creating .env for Admin Client...
(
echo VITE_API_URL=http://localhost:8000
) > .env
cd ..

echo.
echo ========================================================
echo Setup Complete! 
echo Please update the generated .env files with your actual credentials.
echo ========================================================
pause
