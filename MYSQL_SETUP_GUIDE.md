# 🚀 MySQL Setup Quick Guide

## Problem Fixed
Your server was getting 500 errors because it was trying to connect to Supabase, which is unreachable. We've switched to MySQL.

## ✅ What We Did
1. ✅ Created MySQL database configuration
2. ✅ Created MySQL routes (auth-mysql.js, creators-mysql.js, etc.)
3. ✅ Updated server.js to auto-switch to MySQL when `USE_MYSQL=true`
4. ✅ Installed mysql2 package
5. ✅ Created database setup script

## 🔧 Next Steps (Do This Now)

### 1. Set Up MySQL Database
Run the setup script:
```bash
# Double-click this file to run it:
mysql-setup.bat
```

Or manually in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS fanview;
CREATE USER 'fanview_user'@'localhost' IDENTIFIED BY 'fanview_pass123';
GRANT ALL PRIVILEGES ON fanview.* TO 'fanview_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Initialize Database Schema
```bash
cd server
node scripts/init-db.js
```

### 3. Restart Your Backend Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
# or
node server.js
```

### 4. Test the Connection
Your frontend should now work! The creators should load without 500 errors.

## 📁 Files Created/Modified
- `server/config/mysql-database.js` - MySQL connection
- `server/config/mysql-queries.js` - Query helpers
- `server/routes/auth-mysql.js` - MySQL auth routes
- `server/routes/creators-mysql.js` - MySQL creator routes
- `server/server.js` - Auto-switches to MySQL
- `server/.env` - MySQL configuration
- `mysql-setup.bat` - Setup script
- `server/scripts/init-db.js` - Database initializer

## 🔍 Troubleshooting

### If you get "Access denied" errors:
1. Open MySQL Workbench
2. Connect as root
3. Run the SQL commands from `mysql-setup.bat`

### If schema fails:
```bash
# Check MySQL is running
net start MySQL80

# Check credentials
mysql -u fanview_user -p
# Password: fanview_pass123
```

### If server still fails:
Check server logs for specific MySQL errors and share them.

---
**🎯 Goal**: Get your frontend loading creators without 500 errors!
