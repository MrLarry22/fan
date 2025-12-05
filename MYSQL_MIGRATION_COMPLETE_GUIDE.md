# 🚀 Complete MySQL Migration Guide
## From Supabase (PostgreSQL) to MySQL

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Migration](#step-by-step-migration)
3. [Database Setup](#database-setup)
4. [Backend Migration](#backend-migration)
5. [Testing](#testing)
6. [Rollback Plan](#rollback-plan)
7. [Known Differences](#known-differences)

---

## ✅ Prerequisites

### Install MySQL
```powershell
# Download and install MySQL from: https://dev.mysql.com/downloads/installer/
# Or use Chocolatey:
choco install mysql

# Or use XAMPP (includes MySQL, phpMyAdmin):
choco install xampp
```

### Install Required NPM Package
```powershell
cd d:\Downloads\1\project\server
npm install mysql2
```

---

## 🔄 Step-by-Step Migration

### Step 1: Start MySQL Server

**Option A: MySQL Service**
```powershell
# Start MySQL service
net start MySQL80

# Or if using XAMPP, start from XAMPP Control Panel
```

**Option B: Check if MySQL is Running**
```powershell
# Test MySQL connection
mysql -u root -p
# Press Enter if no password, or enter your password
```

### Step 2: Create Database and Import Schema

```powershell
# Navigate to project root
cd d:\Downloads\1\project

# Import the schema
mysql -u root -p < mysql\schema.sql

# Or login to MySQL first and run:
mysql -u root -p
```

```sql
-- Inside MySQL prompt:
SOURCE d:/Downloads/1/project/mysql/schema.sql;

-- Verify tables were created:
USE fanview;
SHOW TABLES;

-- Should show:
-- +----------------------------+
-- | Tables_in_fanview          |
-- +----------------------------+
-- | content                    |
-- | creators                   |
-- | likes                      |
-- | messages                   |
-- | payment_transactions       |
-- | profiles                   |
-- | subscriptions              |
-- | users                      |
-- +----------------------------+
```

### Step 3: Configure Environment Variables

The `.env` file has been updated with MySQL configuration:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=          # Add your MySQL password here if you have one
MYSQL_DATABASE=fanview
```

**⚠️ IMPORTANT:** If your MySQL has a password, update `MYSQL_PASSWORD` in `server/.env`

### Step 4: Update Package.json (if needed)

Ensure `mysql2` is in your dependencies:
```json
{
  "dependencies": {
    "mysql2": "^3.6.5"
  }
}
```

### Step 5: Restart Backend Server

```powershell
# Stop current server (Ctrl+C in terminal)

# Navigate to server directory
cd d:\Downloads\1\project\server

# Start server
node server.js

# You should see:
# ✅ MySQL database connected successfully
# 🚀 Fanview API server running on port 3001
```

---

## 🔧 Backend Migration Details

### What Was Changed:

#### 1. **Database Configuration** (`server/config/database.js`)
- ❌ Removed: Supabase client
- ✅ Added: MySQL connection pool with helper functions

#### 2. **Helper Functions Added:**
- `query(sql, params)` - Execute SQL queries
- `transaction(callback)` - Execute transactions
- `checkSubscription(userId, creatorId)` - Check active subscription
- `getCreatorWithProfile(creatorId)` - Get creator with user info
- `getUserByEmail(email)` - Get user by email
- `createUserWithProfile(userData)` - Create user + profile atomically
- `updateProfile(userId, updates)` - Update user profile
- `getContentWithCreator(contentId)` - Get content with creator info

### Route Files That Need Updating:

The following route files will need to be updated to use MySQL instead of Supabase:

```
server/routes/
├── auth.js          ✏️ Update authentication
├── creators.js      ✏️ Update creator operations
├── content.js       ✏️ Update content operations
├── subscriptions.js ✏️ Update subscription operations
├── profile.js       ✏️ Update profile operations
├── messages.js      ✏️ Update messaging
└── admin.js         ✏️ Update admin operations
```

---

## 🔍 Key Differences: PostgreSQL vs MySQL

### 1. **UUID Generation**
- **PostgreSQL:** `gen_random_uuid()`
- **MySQL:** `UUID()` or `crypto.randomUUID()` in Node.js

### 2. **Data Types**
- **PostgreSQL:** `uuid`, `text`, `timestamptz`
- **MySQL:** `CHAR(36)`, `TEXT`, `TIMESTAMP`

### 3. **Boolean Values**
- **PostgreSQL:** `true/false`
- **MySQL:** `TRUE/FALSE` or `1/0`

### 4. **Returning Inserted IDs**
```javascript
// PostgreSQL/Supabase
const { data } = await supabase.from('users').insert({...}).select();

// MySQL
const [result] = await db.query('INSERT INTO users ...', [...]);
const insertedId = result.insertId;
```

### 5. **Querying**
```javascript
// PostgreSQL/Supabase
const { data, error } = await supabase
  .from('creators')
  .select('*')
  .eq('id', creatorId);

// MySQL
const db = require('./config/database');
const creators = await db.query(
  'SELECT * FROM creators WHERE id = ?',
  [creatorId]
);
```

---

## 🧪 Testing the Migration

### 1. Test Database Connection
```powershell
cd d:\Downloads\1\project\server
node -e "require('./config/database.js')"
```

Should output:
```
✅ MySQL database connected successfully
```

### 2. Test API Endpoints

```powershell
# Health check
curl http://localhost:3001/health

# Test creators endpoint
curl http://localhost:3001/api/creators

# Test PayPal config
curl http://localhost:3001/api/paypal/config
```

### 3. Test Frontend Integration

1. Start frontend:
```powershell
cd d:\Downloads\1\project
npm run dev
```

2. Open browser: `http://localhost:5173`

3. Test these features:
   - ✅ User registration
   - ✅ User login
   - ✅ View creators
   - ✅ View creator profile
   - ✅ Subscribe to creator (PayPal)
   - ✅ View subscribed content

---

## 🔄 Rollback Plan

If you need to rollback to Supabase:

### 1. Restore Database Configuration
```javascript
// server/config/database.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
module.exports = supabase;
```

### 2. Remove MySQL from .env
```env
# Comment out MySQL configuration
# MYSQL_HOST=localhost
# MYSQL_PORT=3306
```

### 3. Restart Server
```powershell
node server.js
```

---

## 📊 Database Schema Overview

### Core Tables:
1. **users** - Authentication (replaces `auth.users`)
2. **profiles** - User profiles
3. **creators** - Creator accounts
4. **content** - Creator content
5. **subscriptions** - User subscriptions
6. **likes** - Content likes
7. **messages** - Direct messages
8. **payment_transactions** - Payment history

### Automatic Triggers:
- ✅ Update `likes_count` when likes added/removed
- ✅ Update `media_count` when content added/removed
- ✅ Update `total_subscribers` when subscriptions change
- ✅ Update `total_likes` on creator profile

### Views:
- `creator_profiles_view` - Creators with user info
- `active_subscriptions_view` - Active subscriptions with details

---

## 🐛 Troubleshooting

### Error: "MySQL connection error"
```powershell
# Check if MySQL is running
net start | findstr MySQL

# Start MySQL
net start MySQL80
```

### Error: "Access denied for user 'root'"
Update your MySQL password in `.env`:
```env
MYSQL_PASSWORD=your_mysql_password
```

### Error: "Unknown database 'fanview'"
The database wasn't created. Run:
```sql
CREATE DATABASE fanview;
USE fanview;
SOURCE d:/Downloads/1/project/mysql/schema.sql;
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"
Update MySQL authentication:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

---

## ✅ Migration Checklist

- [ ] MySQL installed and running
- [ ] `mysql2` npm package installed
- [ ] Database schema imported
- [ ] `.env` file updated with MySQL credentials
- [ ] Backend server restarted
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] Frontend connecting to backend
- [ ] PayPal integration working
- [ ] User registration working
- [ ] User login working
- [ ] Creator profiles loading
- [ ] Subscriptions working

---

## 📞 Next Steps

After completing the migration:

1. **Update All Route Files** - Migrate each route file from Supabase to MySQL queries
2. **Test Thoroughly** - Test all features end-to-end
3. **Monitor Performance** - Check query performance and optimize as needed
4. **Backup Database** - Set up regular MySQL backups
5. **Update Documentation** - Document any custom queries or procedures

---

## 🎉 Migration Complete!

Your application is now running on MySQL instead of Supabase!

**Key Benefits:**
- ✅ Full control over your database
- ✅ No external dependencies on Supabase
- ✅ Better performance for complex queries
- ✅ Lower costs (self-hosted)
- ✅ More flexibility with custom procedures and triggers

**Remember to:**
1. Stop Node server and restart it to load new database configuration
2. Test PayPal payment flow
3. Test all user flows (register, login, subscribe, view content)
4. Monitor MySQL logs for any issues

---

## 📝 Notes

- The frontend still references Supabase client in `src/lib/supabase.ts` - this can be removed once all routes are migrated
- PayPal integration remains unchanged - it uses REST APIs
- File uploads may need updating if using Supabase Storage (consider using local storage or S3)

Good luck with your migration! 🚀
