# 🚨 PRODUCTION FIX GUIDE - RLS POLICY ERRORS

## Problem
You're getting: `new row violates row-level security policy for table "content"` and `"profiles"`

## Root Cause
Your Supabase database has Row-Level Security (RLS) enabled, but the policies are blocking even your admin operations.

---

## ✅ SOLUTION (Choose ONE of these approaches)

### **APPROACH 1: Quick Fix (Disable RLS temporarily)**
**Use this to test and deploy quickly, then fix properly later**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the file: `QUICK_DISABLE_RLS.sql`
   - Change `'your-email@example.com'` to YOUR actual email
   - This will:
     - ✅ Make you an admin
     - ✅ Disable RLS temporarily so everything works

**⚠️ WARNING**: This disables security! Use only for testing.

---

### **APPROACH 2: Proper Production Fix (Recommended)**
**Use this for production deployment with proper security**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run BOTH files in this order:
   
   **First:** `QUICK_DISABLE_RLS.sql` (to make you admin)
   - Change the email to yours
   
   **Then:** `PRODUCTION_FIX_RLS_POLICIES.sql` (to create proper policies)
   - This re-enables RLS with correct admin bypass rules

---

## 🔍 Why This Happens

Your backend uses the **service role key** ✅ (which is correct), but Supabase RLS policies still apply when:

1. Operations go through PostgREST API (which checks RLS)
2. Policies don't include admin bypass rules
3. Your user account isn't marked as `role = 'admin'`

---

## 📝 After Running the Fix

### Test that it works:
1. Restart your backend server
2. Try creating a creator in admin dashboard
3. Try uploading content
4. Both should work without RLS errors!

### What the fix does:
- ✅ Makes your account an admin (`role = 'admin'`)
- ✅ Creates policies that allow admins to bypass all restrictions
- ✅ Keeps security for non-admin users
- ✅ Allows creators to manage their own content
- ✅ Protects premium content from non-subscribers

---

## 🚀 For Production Deployment

1. ✅ Run `PRODUCTION_FIX_RLS_POLICIES.sql` on your production database
2. ✅ Ensure your admin accounts have `role = 'admin'` in profiles table
3. ✅ Keep using service role key in backend (you already are)
4. ✅ Never expose service role key in frontend code
5. ✅ Test all admin operations before going live

---

## 🆘 If Still Not Working

Check these:

1. **Is your account admin?**
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
   Should show `role = 'admin'`

2. **Is service role key correct?**
   - Run: `node server/verify-supabase-config.js`
   - Should show "✅ Appears to be a valid JWT service role key"

3. **Are policies created?**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('profiles', 'creators', 'content', 'subscriptions');
   ```
   Should show multiple policies with "admin" in the name

---

## 📋 Files Created for You

1. `QUICK_DISABLE_RLS.sql` - Quick temporary fix
2. `PRODUCTION_FIX_RLS_POLICIES.sql` - Proper production policies
3. `server/verify-supabase-config.js` - Verify your configuration

**Next Step**: Go to Supabase SQL Editor and run the SQL files!
