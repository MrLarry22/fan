# 🗄️ Supabase to MySQL Migration Guide

## Overview
This guide walks you through converting your Fanview platform from Supabase (PostgreSQL) to MySQL.

---

## ✅ Pre-Migration Checklist

- [ ] Backup your current Supabase database
- [ ] Have MySQL server installed and running (MySQL 8.0 or higher recommended)
- [ ] Have Node.js and npm installed
- [ ] Have MySQL client tools available (MySQL Workbench, TablePlus, or CLI)
- [ ] Backup all environment configuration files

---

## 📋 Step 1: Set Up MySQL Database

### Option A: Using MySQL CLI

```bash
# Connect to MySQL server
mysql -u root -p

# Then run:
CREATE DATABASE IF NOT EXISTS fanview;
USE fanview;
```

### Option B: Using Docker (Recommended for Development)

```bash
# Pull MySQL image
docker pull mysql:8.0

# Run MySQL container
docker run --name fanview-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=fanview \
  -p 3306:3306 \
  -d mysql:8.0
```

### Create Database User (Optional but Recommended)

```sql
CREATE USER 'fanview_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON fanview.* TO 'fanview_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 Step 2: Create Database Schema

### Option A: Using SQL File

```bash
# Navigate to server directory
cd project/server

# Import the schema
mysql -u root -p fanview < config/mysql-schema.sql
```

### Option B: Using MySQL CLI

```sql
mysql -u root -p fanview

-- Then paste the contents of: server/config/mysql-schema.sql
```

### Verify Schema Creation

```sql
USE fanview;

-- Check tables
SHOW TABLES;

-- Check specific table
DESCRIBE users;
DESCRIBE creators;
DESCRIBE subscriptions;
```

---

## 🔄 Step 3: Update Environment Configuration

### Update `.env` Files

**1. Server `.env` (`server/.env`)**

```dotenv
# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fanview
DB_PORT=3306

# Keep existing vars
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3001

# Email Configuration (keep existing)
ETHEREAL_USER=your_ethereal_email
ETHEREAL_PASS=your_ethereal_password

# PayPal (keep existing)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

**2. Frontend `.env` (`project/.env`)**

```dotenv
VITE_API_URL=http://localhost:3001
# Remove VITE_SUPABASE_* variables (no longer needed)
```

---

## 📦 Step 4: Install Dependencies

```bash
cd project/server

# Install new MySQL dependency
npm install mysql2 uuid bcryptjs jsonwebtoken

# Install all dependencies
npm install
```

---

## 🔀 Step 5: Data Migration (If You Have Existing Data)

### Export Data from Supabase

```bash
# Using pg_dump (if you have PostgreSQL tools)
pg_dump -h [supabase-host] -U postgres -d [database] -Fc > supabase_backup.dump

# Or use Supabase export feature in dashboard
```

### Create Migration Script

```bash
# Create new migration file
touch server/migrations/001-migrate-from-supabase.js
```

See **Step 6** for migration script template.

---

## 🔗 Step 6: Update Backend Configuration

### Update Database Module

Replace Supabase imports with MySQL in your routes:

**Old (Supabase):**
```javascript
const supabase = require('../config/database');
const { data, error } = await supabase
  .from('creators')
  .select('*');
```

**New (MySQL):**
```javascript
const { queryRows, query } = require('../config/mysql-database');
const results = await queryRows('SELECT * FROM creators');
```

### Migration Script Template

Create `server/migrations/001-migrate-from-supabase.js`:

```javascript
const { initializePool, query, queryRows } = require('../config/mysql-database');
const { generateUUID, hashPassword, convertTimestamp } = require('../utils/mysql-migration-helpers');

async function migrateFromSupabase() {
  try {
    console.log('🔄 Starting Supabase to MySQL migration...\n');
    
    await initializePool();
    
    // 1. Migrate Users/Profiles
    console.log('📝 Migrating users...');
    const users = [
      // Your user data from Supabase
      // Format: { id, email, full_name, avatar_url, role, bio, created_at }
    ];
    
    for (const user of users) {
      await query(
        `INSERT INTO users (id, email, full_name, avatar_url, role, bio, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.full_name,
          user.avatar_url,
          user.role || 'user',
          user.bio,
          convertTimestamp(user.created_at),
          new Date()
        ]
      );
    }
    
    // 2. Migrate Creators
    console.log('🎬 Migrating creators...');
    const creators = [
      // Your creator data
    ];
    
    for (const creator of creators) {
      await query(
        `INSERT INTO creators (id, user_id, display_name, bio, avatar_url, total_subscribers, total_revenue, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          creator.id,
          creator.user_id,
          creator.display_name,
          creator.bio,
          creator.avatar_url,
          creator.total_subscribers || 0,
          creator.total_revenue || 0,
          creator.is_active !== false,
          convertTimestamp(creator.created_at),
          new Date()
        ]
      );
    }
    
    // 3. Migrate Content
    console.log('📸 Migrating content...');
    // Similar pattern for other tables
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  migrateFromSupabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = migrateFromSupabase;
```

### Run Migration

```bash
node server/migrations/001-migrate-from-supabase.js
```

---

## 🔐 Step 7: Update Authentication Routes

### Update `server/routes/auth.js`

**Replace Supabase calls:**

```javascript
// OLD (Supabase)
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email, password
});

// NEW (MySQL)
const bcrypt = require('bcryptjs');
const { queryRows, query } = require('../config/mysql-database');
const { generateToken } = require('../utils/helpers');

// Find user by email
const users = await queryRows(
  'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
  [email]
);

if (!users.length) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}

const user = users[0];

// Compare password
const isValidPassword = await bcrypt.compare(password, user.password_hash);
if (!isValidPassword) {
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}

// Generate JWT token
const token = generateToken(user.id);
```

---

## 🔄 Step 8: Update All Routes to Use MySQL

### Pattern for GET Request

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from('creators')
  .select('*')
  .eq('id', creatorId)
  .single();

// NEW (MySQL)
const rows = await queryRows(
  'SELECT * FROM creators WHERE id = ?',
  [creatorId]
);
const creator = rows[0] || null;
```

### Pattern for INSERT

```javascript
// OLD (Supabase)
const { data, error } = await supabase
  .from('creators')
  .insert({ display_name, user_id, is_active: true });

// NEW (MySQL)
const result = await query(
  'INSERT INTO creators (id, display_name, user_id, is_active, created_at) VALUES (?, ?, ?, TRUE, NOW())',
  [generateUUID(), display_name, user_id]
);
```

### Pattern for UPDATE

```javascript
// OLD (Supabase)
await supabase
  .from('creators')
  .update({ display_name })
  .eq('id', creatorId);

// NEW (MySQL)
await query(
  'UPDATE creators SET display_name = ? WHERE id = ?',
  [display_name, creatorId]
);
```

### Pattern for DELETE

```javascript
// OLD (Supabase)
await supabase
  .from('creators')
  .delete()
  .eq('id', creatorId);

// NEW (MySQL)
await query(
  'DELETE FROM creators WHERE id = ?',
  [creatorId]
);
```

---

## 🧪 Step 9: Test the Migration

### Create Test Script

```bash
# Create test file
touch server/test-mysql.js
```

**Contents:**

```javascript
const { initializePool, queryRows, testConnection } = require('./config/mysql-database');

async function testMySQL() {
  console.log('🧪 Testing MySQL Connection and Schema...\n');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    const isConnected = await testConnection();
    if (!isConnected) throw new Error('Connection failed');
    console.log('✅ Connection successful\n');
    
    // Test tables
    console.log('2. Checking tables...');
    const tables = await queryRows(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'fanview'
    `);
    console.log(`✅ Found ${tables.length} tables\n`);
    
    // Test user creation
    console.log('3. Testing user creation...');
    const { generateUUID, hashPassword } = require('./utils/mysql-migration-helpers');
    const { query } = require('./config/mysql-database');
    
    const testUser = {
      id: generateUUID(),
      email: 'test@fanview.com',
      password: hashPassword('testpass123'),
      full_name: 'Test User',
      role: 'user'
    };
    
    await query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [testUser.id, testUser.email, testUser.password, testUser.full_name, testUser.role]
    );
    console.log('✅ User created successfully\n');
    
    // Query test
    console.log('4. Testing data retrieval...');
    const users = await queryRows('SELECT * FROM users');
    console.log(`✅ Retrieved ${users.length} users\n`);
    
    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMySQL();
```

**Run test:**
```bash
node server/test-mysql.js
```

---

## 🚀 Step 10: Update Frontend (If Using Direct Supabase Client)

### Update `src/lib/supabase.ts`

**Option A: Keep for auth only** (not recommended)
**Option B: Remove entirely** (recommended)

Create new API client instead:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = {
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    return response.json();
  },
  
  async post(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return response.json();
  }
  // Add PUT, DELETE, etc.
};
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: UUID Format Errors

**Problem:** MySQL doesn't recognize UUID format
**Solution:** Store UUIDs as VARCHAR(36) (already done in schema)

### Issue 2: Timezone Issues

**Problem:** Timestamp data shows wrong times
**Solution:** Add to MySQL connection:
```javascript
timezone: 'Z', // UTC
dateStrings: true
```

### Issue 3: Connection Pool Exhaustion

**Problem:** "Too many connections" errors
**Solution:** Increase `connectionLimit` in config and ensure connections are released:
```javascript
connectionLimit: 20
```

### Issue 4: ENUM Values Not Matching

**Problem:** Data migration fails due to ENUM mismatch
**Solution:** Verify all ENUM values match exactly:
```sql
-- Check MySQL enum values
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='users' AND COLUMN_NAME='role';
```

---

## 🔄 Rollback Plan

If something goes wrong:

```bash
# Drop fanview database
mysql -u root -p -e "DROP DATABASE fanview;"

# Restore from backup
mysql -u root -p fanview < supabase_backup.sql

# Or revert to Supabase by:
# 1. Remove mysql2 dependency: npm uninstall mysql2
# 2. Revert backend code to use Supabase
# 3. Restart server
```

---

## ✨ Post-Migration Checklist

- [ ] All tables created successfully
- [ ] Sample data migrated and verified
- [ ] Authentication working
- [ ] Can create/read/update/delete records
- [ ] File uploads working
- [ ] Email services working
- [ ] Payment/subscription flow tested
- [ ] Messaging system working
- [ ] Frontend connecting to API correctly
- [ ] Admin dashboard working
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Backups configured

---

## 📞 Troubleshooting Commands

```bash
# Check MySQL service status
sudo systemctl status mysql

# View MySQL logs
tail -f /var/log/mysql/error.log

# Connect to MySQL CLI
mysql -u root -p

# Test Node.js connection
node server/test-mysql.js

# Run server in debug mode
DEBUG=* npm run dev
```

---

## 📚 Reference

- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/)
- [mysql2 npm package](https://www.npmjs.com/package/mysql2)
- [Node.js MySQL Connection Pooling](https://github.com/mysqljs/mysql#pooling-connections)

---

## 🎉 You're Done!

Your Fanview platform is now running on MySQL! 

**Next Steps:**
1. Monitor performance and logs
2. Set up automated backups
3. Configure production MySQL server
4. Deploy to production

