# Password Reset Functionality - Implementation Guide

## Overview
This document describes the complete password reset functionality implemented using Gmail SMTP for the Fanview application.

## Email Configuration

### Gmail SMTP Settings
The application is configured to use Gmail SMTP with the following settings in `.env`:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=kimberlytichenor48@gmail.com
EMAIL_PASS=ccxp mhxu nbcw xizw
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM="Fanview" <kimberlytichenor48@gmail.com>
```

### Important Notes
- The `EMAIL_PASS` is a Gmail App Password (not the regular account password)
- 2-factor authentication must be enabled on the Gmail account
- App Password format: 16 characters, spaces are acceptable

## API Endpoints

### 1. Request Password Reset
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent you a password reset link. Please check your email."
}
```

**Security Features:**
- Always returns success message (doesn't reveal if email exists)
- Rate limiting applied
- Input validation with express-validator

### 2. View Reset Password Form
**Endpoint:** `GET /api/auth/reset-password/:token`

- Displays HTML form for password reset
- Validates token and expiration
- Shows user-friendly error messages for invalid/expired tokens

### 3. Submit New Password
**Endpoint:** `POST /api/auth/reset-password/:token`

**Request Body:**
```json
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Validation:**
- Password minimum 6 characters
- Password confirmation must match
- Token must be valid and not expired

## Email Template

The password reset email includes:
- Professional HTML styling
- Clear reset instructions
- Clickable reset button
- Security disclaimer
- 1-hour expiration notice

## Database Schema

The `profiles` table includes these password reset fields:
- `reset_token` (string) - Unique reset token
- `reset_token_expires` (timestamp) - Token expiration time

## Security Features

1. **Token Security:**
   - 32-byte random tokens using crypto.randomBytes()
   - 1-hour expiration time
   - Single-use tokens (cleared after use)

2. **Rate Limiting:**
   - Prevents abuse of forgot password endpoint
   - Configured in auth routes

3. **Input Validation:**
   - Email format validation
   - Password strength requirements
   - CSRF protection

4. **Privacy Protection:**
   - Doesn't reveal if email exists in system
   - Consistent response times

## Testing

### Test Scripts Available:

1. **Basic Email Test:**
   ```bash
   node test-reset-password-email.js
   ```

2. **Complete Flow Test:**
   ```bash
   node test-password-reset-complete.js
   ```

3. **API Endpoint Test:**
   ```bash
   node test-forgot-password-api.js
   ```

### Manual Testing Process:

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Test forgot password API:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"kimberlytichenor48@gmail.com"}'
   ```

3. **Check email inbox** for reset link

4. **Click reset link** or visit reset URL manually

5. **Submit new password** through the form

## Frontend Integration

### React Components Needed:

1. **ForgotPasswordPage:**
   - Form to enter email address
   - Submit to `/api/auth/forgot-password`
   - Display success message

2. **ResetPasswordPage:**
   - Extract token from URL params
   - Form for new password and confirmation
   - Submit to `/api/auth/reset-password/:token`

### Example Frontend Code:

```javascript
// Forgot Password Form
const handleForgotPassword = async (email) => {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const result = await response.json();
  if (result.success) {
    setMessage('Reset link sent! Check your email.');
  }
};

// Reset Password Form
const handleResetPassword = async (token, password, confirmPassword) => {
  const response = await fetch(`/api/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword })
  });
  
  const result = await response.json();
  if (result.success) {
    navigate('/signin?message=Password reset successfully');
  }
};
```

## Troubleshooting

### Gmail Authentication Issues:
1. Verify 2FA is enabled
2. Generate new App Password
3. Check EMAIL_USER is full Gmail address
4. Ensure EMAIL_PASS is the App Password (not regular password)

### Connection Issues:
1. Check internet connection
2. Verify EMAIL_HOST=smtp.gmail.com
3. Verify EMAIL_PORT=587
4. Check firewall settings

### Email Delivery Issues:
1. Check spam/junk folders
2. Verify EMAIL_FROM address
3. Check Gmail sending limits
4. Review server logs for SMTP errors

## Production Considerations

1. **Environment Variables:**
   - Never commit EMAIL_PASS to version control
   - Use secure secret management in production

2. **Rate Limiting:**
   - Implement stricter rate limits in production
   - Consider CAPTCHA for repeated requests

3. **Monitoring:**
   - Log email sending attempts
   - Monitor for failed authentication
   - Track password reset usage

4. **SSL/TLS:**
   - Use EMAIL_SECURE=true in production
   - Ensure proper certificate validation

## Status

✅ **Implemented and Tested:**
- Gmail SMTP configuration
- Password reset email sending
- Token generation and validation
- API endpoints for forgot/reset password
- HTML email template
- Security features

✅ **Ready for Use:**
The password reset functionality is fully implemented and tested with Gmail SMTP. You can now integrate it with your frontend application.
