# Full-Stack Web Application

A modern full-stack web application built with React, TypeScript, Node.js, and Supabase.

## 🚀 Features

- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT-based authentication system
- **UI**: Modern design with Tailwind CSS and Framer Motion
- **Payment**: PayPal integration
- **Content Management**: File uploads and content management system
- **Admin Dashboard**: Administrative interface
- **Email Services**: Email verification and password reset

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- Supabase (Database & Storage)
- JWT Authentication
- bcryptjs (password hashing)
- Multer (file uploads)

## 📁 Project Structure

```
project/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── server/                # Backend Node.js application
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── uploads/           # File upload directory
├── supabase/              # Database migrations
└── public/                # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `server` directory using the provided example:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Fill in your environment variables:
   - Supabase URL and keys
   - JWT secret
   - PayPal credentials
   - Email service configuration

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🗃️ Database Setup

This project uses Supabase for the database. The database migrations are located in the `supabase/migrations/` directory.

To apply migrations:
1. Install Supabase CLI
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Apply migrations: `supabase db push`

## 🔑 Environment Variables

### Server (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (development)

## 🎨 Features Overview

### User Authentication
- User registration and login
- Email verification
- Password reset functionality
- JWT-based session management

### Content Management
- File upload system
- Creator profiles
- Content categorization
- Admin content moderation

### Payment System
- PayPal integration
- Subscription management
- Wallet system

### Admin Dashboard
- User management
- Content moderation
- Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase credentials in `.env`
   - Check network connectivity

2. **File Upload Issues**
   - Ensure upload directories exist
   - Check file permissions

3. **Authentication Issues**
   - Verify JWT secret configuration
   - Check token expiration settings

## 📞 Support

For support and questions, please contact the development team.
