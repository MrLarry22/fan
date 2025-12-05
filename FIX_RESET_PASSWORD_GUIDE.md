# 🔧 Fix Reset Password Functionality - Step by Step

## Problem Identified:
- Frontend expects server on port 5000
- Server was running on port 5001
- Reset link clicks were failing with connection refused error

## ✅ Solution Applied:
1. Changed server port from 5001 to 5000 in `.env` file
2. Updated ResetPasswordPage to use correct port
3. Created test scripts to verify functionality

## 📋 Steps to Test & Verify Fix:

### **Step 1: Stop Current Server (if running)**
```bash
# Press Ctrl+C in the terminal where server is running
```

### **Step 2: Start Server on Correct Port**
```bash
cd "d:\Downloads\1\project\server"
node server.js
```
**Expected Output:**
```
✅ Email transporter configured using provided SMTP credentials
✅ SMTP connection verified successfully - Ready to send emails!
🚀 Server is running on port 5000
🔗 http://localhost:5000
```

### **Step 3: Start Frontend (New Terminal)**
```bash
cd "d:\Downloads\1\project"
npm run dev
```
**Expected Output:**
```
  Local:   http://localhost:5173/
  Network: use --host to expose
```

### **Step 4: Generate Fresh Reset Token**
```bash
cd "d:\Downloads\1\project\server"
node test-password-reset-complete.js
```
**What this does:**
- Sends a real email with a fresh reset token
- Gives you a valid reset link to test with

### **Step 5: Test Reset Link from Email**
1. Check your Gmail inbox for the new reset email
2. Copy the reset link (looks like: `http://localhost:5173/reset-password/test-reset-token-XXXXXXXXX`)
3. Open the link in your browser
4. You should see the reset password form (no more "Invalid Reset Link" error)

### **Step 6: Test Password Reset Form**
1. Enter a new password (minimum 6 characters)
2. Confirm the password
3. Click "Reset Password"
4. Should see success message and redirect to sign-in

### **Step 7: Verify API Endpoint (Optional)**
```bash
cd "d:\Downloads\1\project\server"
node test-reset-endpoint.js
```
**Note:** Update the token in the script with the actual token from your test email

## 🎯 Expected Results:

### **✅ Working Reset Flow:**
1. **Email Link Click** → Opens reset form (no connection error)
2. **Password Submit** → Shows success message
3. **Automatic Redirect** → Goes to sign-in page after 3 seconds
4. **New Password Works** → Can sign in with new password

### **✅ Success Messages:**
- "Password reset successfully"
- "Redirecting to sign-in page..."
- No network errors in console

### **❌ If Still Getting Errors:**

**"Connection Refused" Error:**
- Check server is running on port 5000 (not 5001)
- Verify frontend is making requests to port 5000
- Check firewall/antivirus blocking ports

**"Invalid Reset Token" Error:**
- Token might be expired (1 hour limit)
- Generate fresh token with test script
- Check token format in URL

**"Network Error" Message:**
- Restart both frontend and backend
- Clear browser cache
- Check browser developer tools for exact error

## 🚀 Quick Test Sequence (5 minutes):

1. **Start server:** `node server.js` (should show port 5000)
2. **Generate token:** `node test-password-reset-complete.js`
3. **Check email:** Look for reset email in Gmail
4. **Click link:** Open reset link from email
5. **Reset password:** Enter new password and submit
6. **Verify:** Check for success message

## ✅ Success Indicators:

- ✅ Server starts on port 5000
- ✅ Reset email is received
- ✅ Reset link opens password form
- ✅ Password submission succeeds
- ✅ Redirect to sign-in works
- ✅ No console errors

**Result:** Complete working password reset functionality!
