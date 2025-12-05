# 📊 Supabase → MySQL: Code Conversion Reference

## Quick Reference Guide for Converting Backend Routes

### 1. Authentication Routes

#### Supabase (Old)
```javascript
const supabase = require('../config/database');

router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (authError) throw authError;
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: 'user'
    });
});
```

#### MySQL (New)
```javascript
const { query, queryRows } = require('../config/mysql-database');
const { generateUUID, hashPassword } = require('../utils/mysql-migration-helpers');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  // Check if user exists
  const existing = await queryRows(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  
  if (existing.length > 0) {
    return res.status(409).json({ 
      success: false, 
      message: 'Email already exists' 
    });
  }
  
  // Create user
  const userId = generateUUID();
  const passwordHash = await hashPassword(password);
  
  await query(
    'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
    [userId, email, passwordHash, fullName, 'user']
  );
  
  // Generate JWT token
  const token = jwt.sign(
    { userId, email, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ success: true, token, userId });
});
```

---

### 2. Creator Routes

#### Supabase (Old)
```javascript
// Get all creators
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('creators')
    .select(`
      *,
      profiles(full_name, avatar_url)
    `)
    .eq('is_active', true)
    .order('total_subscribers', { ascending: false });
  
  if (error) throw error;
  res.json({ success: true, data });
});

// Get creator by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  res.json({ success: true, data });
});
```

#### MySQL (New)
```javascript
// Get all creators
router.get('/', async (req, res) => {
  const creators = await queryRows(`
    SELECT 
      c.*,
      u.full_name,
      u.avatar_url
    FROM creators c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_active = TRUE
    ORDER BY c.total_subscribers DESC
  `);
  
  res.json({ success: true, data: creators });
});

// Get creator by ID
router.get('/:id', async (req, res) => {
  const creators = await queryRows(
    `SELECT c.*, u.full_name, u.avatar_url
     FROM creators c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [req.params.id]
  );
  
  if (!creators.length) {
    return res.status(404).json({ success: false, message: 'Creator not found' });
  }
  
  res.json({ success: true, data: creators[0] });
});
```

---

### 3. Content Routes

#### Supabase (Old)
```javascript
// Upload content
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const { creatorId } = req.body;
  
  // Save file locally
  const fileName = req.file.filename;
  const contentUrl = `/uploads/${creatorId}/${fileName}`;
  
  // Save metadata to Supabase
  const { data: content, error } = await supabase
    .from('content')
    .insert({
      creator_id: creatorId,
      title: req.body.title,
      description: req.body.description,
      content_url: contentUrl,
      content_type: req.body.type || 'image',
      is_premium: true
    })
    .select();
  
  res.json({ success: true, data: content[0] });
});
```

#### MySQL (New)
```javascript
// Upload content
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  const { creatorId } = req.body;
  const { generateUUID } = require('../utils/mysql-migration-helpers');
  
  // Save file locally (same as before)
  const fileName = req.file.filename;
  const contentUrl = `/uploads/${creatorId}/${fileName}`;
  
  // Save metadata to MySQL
  const contentId = generateUUID();
  
  await query(
    `INSERT INTO content 
     (id, creator_id, title, description, content_url, content_type, is_premium, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      contentId,
      creatorId,
      req.body.title,
      req.body.description,
      contentUrl,
      req.body.type || 'image',
      true,
      req.file.size
    ]
  );
  
  const content = await queryRows(
    'SELECT * FROM content WHERE id = ?',
    [contentId]
  );
  
  res.json({ success: true, data: content[0] });
});
```

---

### 4. Subscription Routes

#### Supabase (Old)
```javascript
// Create subscription
router.post('/subscribe', authenticateToken, async (req, res) => {
  const { creatorId, paypalSubscriptionId } = req.body;
  const userId = req.user.id;
  
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      creator_id: creatorId,
      paypal_subscription_id: paypalSubscriptionId,
      status: 'active',
      amount: 5.00
    })
    .select();
  
  res.json({ success: true, data: subscription[0] });
});
```

#### MySQL (New)
```javascript
// Create subscription
router.post('/subscribe', authenticateToken, async (req, res) => {
  const { creatorId, paypalSubscriptionId } = req.body;
  const userId = req.user.id;
  const { generateUUID } = require('../utils/mysql-migration-helpers');
  
  const subscriptionId = generateUUID();
  
  await query(
    `INSERT INTO subscriptions 
     (id, user_id, creator_id, paypal_subscription_id, status, amount, auto_renew)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subscriptionId, userId, creatorId, paypalSubscriptionId, 'active', 5.00, true]
  );
  
  const subscription = await queryRows(
    'SELECT * FROM subscriptions WHERE id = ?',
    [subscriptionId]
  );
  
  res.json({ success: true, data: subscription[0] });
});
```

---

### 5. Messaging Routes

#### Supabase (Old)
```javascript
// Get messages
router.get('/conversations/:convId/messages', async (req, res) => {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', req.params.convId)
    .order('created_at', { ascending: true });
  
  res.json({ success: true, data: messages });
});

// Send message
router.post('/conversations/:convId/messages', async (req, res) => {
  const { content, recipientId, message_type } = req.body;
  
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: req.params.convId,
      sender_id: req.user.id,
      recipient_id: recipientId,
      content,
      message_type: message_type || 'text'
    })
    .select();
  
  res.json({ success: true, data: message[0] });
});
```

#### MySQL (New)
```javascript
// Get messages
router.get('/conversations/:convId/messages', async (req, res) => {
  const messages = await queryRows(
    `SELECT * FROM messages 
     WHERE conversation_id = ? AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    [req.params.convId]
  );
  
  res.json({ success: true, data: messages });
});

// Send message
router.post('/conversations/:convId/messages', async (req, res) => {
  const { content, recipientId, message_type, creatorId } = req.body;
  const { generateUUID } = require('../utils/mysql-migration-helpers');
  
  const messageId = generateUUID();
  
  await query(
    `INSERT INTO messages 
     (id, conversation_id, sender_id, recipient_id, creator_id, content, message_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [messageId, req.params.convId, req.user.id, recipientId, creatorId, content, message_type || 'text']
  );
  
  // Update conversation
  await query(
    `UPDATE conversations 
     SET last_message = ?, last_message_at = NOW(), last_message_sender_id = ?
     WHERE id = ?`,
    [content.substring(0, 500), req.user.id, req.params.convId]
  );
  
  const message = await queryRows(
    'SELECT * FROM messages WHERE id = ?',
    [messageId]
  );
  
  res.json({ success: true, data: message[0] });
});
```

---

### 6. Middleware Updates

#### Supabase (Old)
```javascript
// middleware/auth.js
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

#### MySQL (New)
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { queryRows } = require('../config/mysql-database');

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user data
    const users = await queryRows(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (!users.length) throw new Error('User not found');
    
    req.user = users[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};
```

---

### 7. Admin Routes

#### Supabase (Old)
```javascript
// Make user admin
router.post('/make-admin/:userId', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', req.params.userId);
  
  res.json({ success: true });
});
```

#### MySQL (New)
```javascript
// Make user admin
router.post('/make-admin/:userId', requireAdmin, async (req, res) => {
  await query(
    'UPDATE users SET role = ? WHERE id = ?',
    ['admin', req.params.userId]
  );
  
  res.json({ success: true, message: 'User promoted to admin' });
});
```

---

### 8. Transaction Handling

#### Supabase (Old)
```javascript
// Supabase doesn't support transactions in JS SDK
// Had to be done in SQL or use multiple calls
```

#### MySQL (New)
```javascript
const { beginTransaction, commit, rollback } = require('../config/mysql-database');

router.post('/complex-operation', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await beginTransaction();
    
    // Multiple operations in transaction
    await connection.execute(
      'INSERT INTO wallet_transactions (id, user_id, type, amount) VALUES (?, ?, ?, ?)',
      [generateUUID(), req.user.id, 'topup', 10.00]
    );
    
    await connection.execute(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [10.00, req.user.id]
    );
    
    await commit(connection);
    res.json({ success: true });
  } catch (error) {
    if (connection) await rollback(connection);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### 9. Error Handling

#### Supabase (Old)
```javascript
const { data, error } = await supabase
  .from('creators')
  .select('*');

if (error) {
  return res.status(error.status).json({ 
    success: false, 
    message: error.message 
  });
}
```

#### MySQL (New)
```javascript
try {
  const creators = await queryRows('SELECT * FROM creators');
  res.json({ success: true, data: creators });
} catch (error) {
  console.error('Database error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Database operation failed',
    error: error.message 
  });
}
```

---

### 10. Common SQL Queries Conversion

| Operation | Supabase | MySQL |
|-----------|----------|-------|
| SELECT * | `.select('*')` | `SELECT * FROM table` |
| WHERE | `.eq('column', value)` | `WHERE column = ?` |
| ORDER BY | `.order('column')` | `ORDER BY column ASC/DESC` |
| LIMIT | `.limit(10)` | `LIMIT 10` |
| INSERT | `.insert({...})` | `INSERT INTO table VALUES (...)` |
| UPDATE | `.update({...}).eq('id', id)` | `UPDATE table SET ... WHERE id = ?` |
| DELETE | `.delete().eq('id', id)` | `DELETE FROM table WHERE id = ?` |
| JOIN | Can use nested selects | `JOIN` clauses |
| COUNT | `.select('count', {...})` | `SELECT COUNT(*) FROM table` |
| GROUP BY | Limited support | `GROUP BY column` |

---

## Tips for Migration

1. **Search & Replace Strategy:**
   - Replace `await supabase.from('table').select()` with `await queryRows()`
   - Replace `.insert()` with `query()`
   - Update error handling consistently

2. **Test Each Route:**
   - Test with Postman/curl before frontend
   - Verify data is saved correctly
   - Check timestamps and data types

3. **Performance:**
   - MySQL connection pooling is built-in
   - Add indexes for frequently queried columns
   - Use EXPLAIN to analyze slow queries

4. **Security:**
   - Always use parameterized queries (?)
   - Never interpolate user input
   - Hash passwords before storing
   - Validate JWT tokens

---

## Quick Migration Checklist

- [ ] Update `config/database.js` → use MySQL config
- [ ] Update authentication routes
- [ ] Update creator routes
- [ ] Update content routes
- [ ] Update subscription routes
- [ ] Update messaging routes
- [ ] Update admin routes
- [ ] Update middleware
- [ ] Test all endpoints
- [ ] Update frontend API calls if needed
- [ ] Run full test suite
- [ ] Deploy to production

