# Fanview Backend API

A comprehensive Node.js backend for the Fanview subscription-based content platform.

## 🚀 Features

- **Authentication & Users**: JWT-based auth with Supabase integration
- **Creator Management**: Admin-controlled creator profiles and content
- **Content System**: Locked/unlocked content based on subscriptions
- **PayPal Integration**: Subscription and wallet top-up functionality
- **Likes System**: User engagement with creator content
- **Wallet System**: Credits and transaction management
- **Security**: Rate limiting, CORS, helmet protection

## 📋 Prerequisites

- Node.js 16+ 
- Supabase account and project
- PayPal Developer account

## 🛠️ Installation

1. **Clone and setup:**
```bash
cd server
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
```

3. **Configure your `.env` file:**
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_PLAN_ID=P-0MN6183124871754NNC7PKVQ

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Creators
- `GET /api/creators` - Get all active creators
- `GET /api/creators/:id` - Get single creator
- `POST /api/creators` - Create creator (Admin only)
- `PUT /api/creators/:id` - Update creator (Admin only)

### Content
- `GET /api/content/creator/:creatorId` - Get creator content (subscription-aware)
- `POST /api/content` - Create content (Admin only)
- `POST /api/content/:contentId/like` - Like/unlike content
- `GET /api/content/:contentId/likes` - Get content likes

### Subscriptions
- `POST /api/subscriptions/subscribe` - Subscribe to creator
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `POST /api/subscriptions/cancel/:subscriptionId` - Cancel subscription
- `GET /api/subscriptions/status/:creatorId` - Check subscription status

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile/update` - Update user profile

### Wallet
- `GET /api/wallet` - Get wallet balance and transactions
- `POST /api/wallet/topup` - Add credits via PayPal
- `GET /api/wallet/transactions` - Get transaction history

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Security headers and CSP
- **Input Validation**: Express-validator for all inputs
- **Password Hashing**: bcryptjs with salt rounds

## 🗄️ Database Schema

The backend uses your existing Supabase database with these main tables:
- `profiles` - User profiles and authentication
- `creators` - Creator information and stats
- `content` - Creator content with lock status
- `subscriptions` - User subscriptions to creators
- `content_likes` - User likes on content
- `wallets` - User wallet balances
- `wallet_transactions` - Transaction history

## 💳 PayPal Integration

- Uses your existing PayPal Plan ID: `P-0MN6183124871754NNC7PKVQ`
- Handles subscription creation and validation
- Wallet top-up functionality
- Transaction logging and history

## 🔐 Content Protection

- **Subscription-based access**: Premium content locked until subscribed
- **No download/screenshot protection**: Content URLs hidden for non-subscribers
- **Preview system**: Locked content shows preview messages
- **Real-time validation**: Subscription status checked on every request

## 🌍 Deployment

**Recommended for $10/month budget:**
- **Backend**: Railway, Render, or DigitalOcean App Platform
- **Database**: Supabase (free tier)
- **File Storage**: Supabase Storage (free tier)

**Environment variables needed in production:**
- All variables from `.env.example`
- Set `NODE_ENV=production`
- Update `FRONTEND_URL` to your deployed frontend URL

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request logging with Morgan
- Error handling and logging
- Graceful shutdown handling

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 📝 API Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": { ... },
  "errors": [ ... ] // Only for validation errors
}
```

## 🚨 Important Notes

1. **Admin Access**: Content creation requires admin role
2. **Content Security**: Premium content URLs are hidden from non-subscribers
3. **PayPal Integration**: Uses your existing PayPal setup
4. **Rate Limiting**: Adjust limits based on your needs
5. **CORS**: Update `FRONTEND_URL` for production

## 🆘 Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure Supabase database schema matches requirements
4. Test PayPal integration in sandbox mode first