# ⚡ MySQL Migration Quick Reference Card

## 🚀 Quick Start (5 minutes)

```bash
cd project/server
node setup-mysql.js      # Interactive setup
npm install              # Install dependencies
npm run dev              # Start server
```

## 📋 Key Files

| File | Purpose |
|------|---------|
| `config/mysql-schema.sql` | Database schema - import into MySQL |
| `config/mysql-database.js` | Connection pooling and query execution |
| `utils/mysql-migration-helpers.js` | Utility functions (UUID, hash, etc) |
| `CODE_CONVERSION_REFERENCE.md` | How to convert each route type |
| `MYSQL_MIGRATION_GUIDE.md` | Complete step-by-step guide |
| `setup-mysql.js` | Automated setup script |

## 🔄 Route Conversion Pattern

### Before (Supabase)
```javascript
const { data, error } = await supabase
  .from('creators')
  .select('*')
  .eq('is_active', true);
```

### After (MySQL)
```javascript
const { queryRows } = require('../config/mysql-database');

const creators = await queryRows(
  'SELECT * FROM creators WHERE is_active = TRUE'
);
```

## 📊 SQL Query Mapping

| Operation | Supabase | MySQL |
|-----------|----------|-------|
| **SELECT** | `.select('*')` | `queryRows('SELECT * FROM table')` |
| **WHERE** | `.eq('col', val)` | `WHERE col = ?` (parameterized) |
| **WHERE NOT** | `.neq('col', val)` | `WHERE col != ?` |
| **INSERT** | `.insert({...})` | `query('INSERT INTO table VALUES (...)')` |
| **UPDATE** | `.update({...}).eq('id', id)` | `query('UPDATE table SET ... WHERE id = ?')` |
| **DELETE** | `.delete().eq('id', id)` | `query('DELETE FROM table WHERE id = ?')` |

## 🛠️ Common Functions

```javascript
// Import what you need
const { queryRows, query } = require('../config/mysql-database');
const { generateUUID, hashPassword } = require('../utils/mysql-migration-helpers');

// Query (SELECT)
const rows = await queryRows('SELECT * FROM table WHERE id = ?', [id]);

// Execute (INSERT/UPDATE/DELETE)
await query('INSERT INTO table VALUES (?, ?, ?)', [val1, val2, val3]);

// Generate ID
const id = generateUUID();

// Hash password
const hash = await hashPassword(password);
```

## 🔐 Authentication Example

```javascript
// Import JWT
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/mysql-migration-helpers');
const { queryRows, query } = require('../config/mysql-database');

// Register user
const userId = generateUUID();
const passwordHash = await hashPassword(password);
await query(
  'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
  [userId, email, passwordHash, fullName, 'user']
);

// Login - verify password
const bcrypt = require('bcryptjs');
const users = await queryRows('SELECT * FROM users WHERE email = ?', [email]);
const isValid = await bcrypt.compare(password, users[0].password_hash);

// Generate token
const token = jwt.sign(
  { userId, email, role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

## 📝 Environment Variables

```dotenv
# Required
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fanview
DB_PORT=3306

# API
PORT=3001
FRONTEND_URL=http://localhost:5173

# Auth
JWT_SECRET=your_jwt_secret_key

# Email
ETHEREAL_USER=your_email@ethereal.email
ETHEREAL_PASS=your_password
```

## 🧪 Testing Routes

```bash
# Test connection
node server/test-mysql.js

# View conversion checklist
node server/ROUTE_CONVERSION_CHECKLIST.js

# Run server
npm run dev
```

## 🐛 Debugging

```javascript
// Add to routes for debugging
console.log('Query:', sql);
console.log('Values:', values);
console.log('Result:', result);

// Check connection
const { testConnection } = require('./config/mysql-database');
await testConnection();

// Verify schema
// mysql> USE fanview;
// mysql> SHOW TABLES;
// mysql> DESCRIBE users;
```

## ⚠️ Common Mistakes

❌ **Don't:**
- Use string interpolation for queries
- Forget to parameterize values with `?`
- Mix Supabase and MySQL calls
- Forget `await` on async functions

✅ **Do:**
- Always parameterize: `'SELECT * FROM users WHERE id = ?'`
- Use `queryRows()` for SELECT
- Use `query()` for INSERT/UPDATE/DELETE
- Properly handle errors with try/catch
- Generate UUIDs with `generateUUID()`

## 📊 Database Tables

```
users                    (authentication + profile)
├── creators            (creator profiles)
│   ├── content        (posts/content)
│   │   └── content_likes (engagement)
│   └── subscriptions  (subscribers)
├── wallets            (wallet balances)
│   └── wallet_transactions (history)
├── messages           (messaging)
│   ├── conversations  (message threads)
│   └── notifications  (alerts)
└── payment_events     (webhook tracking)
```

## 🔗 Relationships

```sql
-- User can have many subscriptions
users (1) ──→ (M) subscriptions

-- Creator has many content
creators (1) ──→ (M) content

-- User can like many content
users (M) ──→ (M) content_likes ←─ (M) content

-- User has one wallet
users (1) ──→ (1) wallets

-- Conversation has many messages
conversations (1) ──→ (M) messages
```

## 📈 Migration Timeline

- **Setup:** 15 minutes
- **Auth routes:** 30 minutes
- **Creator routes:** 30 minutes
- **Content routes:** 30 minutes
- **Other routes:** 1-2 hours
- **Testing:** 1-2 hours
- **Total:** 4-6 hours

## 🚀 Deployment Checklist

- [ ] MySQL running on production server
- [ ] Schema imported
- [ ] Environment variables configured
- [ ] All routes converted and tested
- [ ] Dependencies installed
- [ ] Server starts successfully
- [ ] Can login
- [ ] Can create/read/update/delete
- [ ] File uploads work
- [ ] Payments work
- [ ] Messaging works

## 📞 Help References

```bash
# View full migration guide
cat MYSQL_MIGRATION_GUIDE.md

# View code examples
cat CODE_CONVERSION_REFERENCE.md

# View migration summary
cat MYSQL_MIGRATION_SUMMARY.md

# See conversion checklist
node server/ROUTE_CONVERSION_CHECKLIST.js

# Test setup
node server/test-mysql.js
```

## 💾 Backup & Recovery

```bash
# Backup database
mysqldump -u root -p fanview > backup.sql

# Restore database
mysql -u root -p fanview < backup.sql

# Verify backup
mysql -u root -p fanview -e "SELECT COUNT(*) FROM users;"
```

## 🎯 Priority Order

1. **CRITICAL:** Auth routes (all apps depend on this)
2. **HIGH:** Creator & Content routes
3. **HIGH:** Subscriptions & Payments
4. **MEDIUM:** Messaging & Wallets
5. **MEDIUM:** Admin & Profile routes

---

**Status:** ✅ Ready to migrate!

Start with: `node setup-mysql.js`

