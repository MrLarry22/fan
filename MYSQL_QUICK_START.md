# 🚀 MySQL Migration - Quick Start

## ⚡ Run This Now!

```powershell
cd d:\Downloads\1\project
powershell -ExecutionPolicy Bypass -File install-mysql-migration.ps1
```

---

## 📋 Manual Installation (If Script Fails)

### 1. Install MySQL
- Download: https://dev.mysql.com/downloads/installer/
- Or XAMPP: https://www.apachefriends.org/

### 2. Start MySQL
```powershell
net start MySQL80
# Or start from XAMPP Control Panel
```

### 3. Create Database
```powershell
mysql -u root -p
```

```sql
CREATE DATABASE fanview;
USE fanview;
SOURCE d:/Downloads/1/project/mysql/schema.sql;
SHOW TABLES;
EXIT;
```

### 4. Install Dependencies
```powershell
cd d:\Downloads\1\project\server
npm install mysql2
```

### 5. Update .env (if you have MySQL password)
```env
MYSQL_PASSWORD=your_password_here
```

### 6. Restart Server
```powershell
# Stop current server (Ctrl+C)
cd d:\Downloads\1\project\server
node server.js
```

You should see:
```
✅ MySQL database connected successfully
🚀 Fanview API server running on port 3001
```

---

## ✅ Verify Migration

### Test Backend:
```powershell
curl http://localhost:3001/health
curl http://localhost:3001/api/paypal/config
```

### Test Frontend:
```powershell
cd d:\Downloads\1\project
npm run dev
# Open http://localhost:5173
```

---

## 🔧 Quick Fixes

### MySQL Not Running?
```powershell
net start MySQL80
```

### Access Denied?
Update password in `server\.env`:
```env
MYSQL_PASSWORD=your_password
```

### Database Not Created?
```powershell
mysql -u root -p < d:\Downloads\1\project\mysql\schema.sql
```

### PayPal Still Loading?
Make sure server restarted with MySQL connection:
1. Stop server (Ctrl+C)
2. `node server.js`
3. Look for "✅ MySQL database connected successfully"

---

## 📁 What Changed?

✅ **Created:**
- `mysql/schema.sql` - Complete MySQL database schema
- `server/config/database.js` - MySQL connection (replaces Supabase)
- `MYSQL_MIGRATION_COMPLETE_GUIDE.md` - Detailed guide
- `install-mysql-migration.ps1` - Automated installer

✅ **Updated:**
- `server/.env` - Added MySQL configuration
- `server/package.json` - Added mysql2 dependency

---

## 🎯 Current Status

- ✅ MySQL schema created with all tables
- ✅ Triggers for automatic counts
- ✅ Views for common queries
- ✅ Backend database config updated
- ✅ PayPal credentials configured
- ⏳ Need to restart server
- ⏳ Need to test application

---

## 📞 Need Help?

See full guide: `MYSQL_MIGRATION_COMPLETE_GUIDE.md`

### Common Issues:

**"Loading payment system..."**
- Server needs restart to load PayPal credentials
- Run: `node server.js` in server folder

**"MySQL connection error"**
- Check MySQL is running
- Check password in .env
- Check database 'fanview' exists

**"Cannot connect to backend"**
- Make sure server is running on port 3001
- Check terminal for errors

---

## 🎉 Success Checklist

- [ ] MySQL installed and running
- [ ] Database 'fanview' created
- [ ] Schema imported (8 tables)
- [ ] mysql2 package installed
- [ ] .env file configured
- [ ] Server restarted
- [ ] See "✅ MySQL database connected successfully"
- [ ] PayPal config loads (no more "Loading payment system...")
- [ ] Can create creators in admin
- [ ] Can subscribe to creators

---

**Ready to go? Run the installer! 🚀**

```powershell
cd d:\Downloads\1\project
powershell -ExecutionPolicy Bypass -File install-mysql-migration.ps1
```
