@echo off
echo ========================================
echo    MySQL Setup for Fanview Platform
echo ========================================
echo.

echo This script will help you set up MySQL for the Fanview platform.
echo.

echo Step 1: Install MySQL (if not already installed)
echo - Download from: https://dev.mysql.com/downloads/mysql/
echo - Or use XAMPP: https://www.apachefriends.org/
echo.

echo Step 2: Create database and user
echo Run these commands in MySQL Workbench or command line:
echo.

echo CREATE DATABASE IF NOT EXISTS fanview;
echo CREATE USER 'fanview_user'@'localhost' IDENTIFIED BY 'fanview_pass123';
echo GRANT ALL PRIVILEGES ON fanview.* TO 'fanview_user'@'localhost';
echo FLUSH PRIVILEGES;
echo.

echo Step 3: Update your server/.env file with:
echo DB_HOST=localhost
echo DB_USER=fanview_user
echo DB_PASSWORD=fanview_pass123
echo DB_NAME=fanview
echo.

echo Step 4: Run the schema
echo After setting up MySQL, run: node scripts/init-db.js
echo.

pause
