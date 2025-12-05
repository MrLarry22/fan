# PayPal Business Dashboard Setup Guide
**Professional Payment System Configuration for PayPal JavaScript SDK v6**

## Overview
This guide will help you configure your PayPal Business Dashboard to enable all advanced payment methods including cards, Venmo, Google Pay, Apple Pay, and local payment methods.

---

## 1. PayPal Business Account Requirements

### Account Type Required
- **PayPal Business Account** (Personal accounts cannot access advanced features)
- **Verified Business Account** with business documents uploaded
- **Live vs Sandbox**: Use sandbox for development, live for production

### Business Information Needed
- Business legal name and address
- Tax ID/EIN (for US businesses)
- Business type and industry classification
- Bank account for fund withdrawals
- Website URL and business description

---

## 2. API Credentials Configuration

### Step 1: Access Developer Dashboard
1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Navigate to **My Apps & Credentials**
3. Switch between **Sandbox** and **Live** environments

### Step 2: Create REST API App
1. Click **Create App**
2. Configure app settings:
   ```
   App Name: Fanview Payment System
   Merchant: [Your Business Account]
   Platform: Web
   Product: Accept payments online
   ```
3. Enable features:
   - ✅ Accept payments
   - ✅ Subscriptions
   - ✅ Vault
   - ✅ Advanced Checkout

### Step 3: Note Your Credentials
```env
# Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox

# Live Credentials (when ready)
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_MODE=live
```

---

## 3. Enable Payment Methods

### A. Credit/Debit Cards
**Already enabled by default with PayPal Business accounts**

**Supported Cards:**
- Visa, Mastercard, American Express
- Discover, JCB, UnionPay (depending on region)

**Configuration:**
- No additional setup required
- Cards processed through PayPal's secure vault
- PCI compliance handled by PayPal

### B. Venmo (US Only)
**Steps to Enable:**
1. In PayPal Dashboard → **Account Settings**
2. Navigate to **Payment Preferences**
3. Find **Venmo** section
4. Click **Enable Venmo**
5. Accept Venmo Terms of Service

**Requirements:**
- US-based business only
- Venmo Business Profile required
- Additional verification may be needed

### C. Google Pay
**Steps to Enable:**
1. **PayPal Side:**
   - Dashboard → **Account Settings** → **Payment Methods**
   - Enable **Google Pay** integration
   - Configure Google Pay settings

2. **Google Pay Console:**
   - Create account at [Google Pay Business Console](https://pay.google.com/business/console)
   - Add your business information
   - Link your PayPal merchant account
   - Submit for approval (can take 3-7 days)

**Integration Code:**
```javascript
// Already included in our enhanced component
enable-funding: 'googlepay'
```

### D. Apple Pay
**Steps to Enable:**
1. **Apple Developer Account Required:**
   - Enroll in Apple Developer Program ($99/year)
   - Create Apple Pay Merchant ID
   - Generate certificates

2. **PayPal Configuration:**
   - Dashboard → **Account Settings** → **Payment Methods**
   - Enable **Apple Pay**
   - Upload Apple Pay certificate
   - Configure domain verification

3. **Domain Verification:**
   - Download verification file from PayPal
   - Upload to `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

### E. Local Payment Methods

#### iDEAL (Netherlands)
- **Auto-enabled** for Netherlands-based transactions
- Requires business registration in Netherlands or EU
- No additional setup needed

#### Bancontact (Belgium)
- **Auto-enabled** for Belgium-based transactions  
- Requires EU business registration
- No additional setup needed

#### SOFORT (Germany/Austria)
- **Auto-enabled** for German/Austrian transactions
- Requires EU business registration
- No additional setup needed

#### Other European Methods
- **giropay** (Germany) - Auto-enabled
- **EPS** (Austria) - Auto-enabled  
- **MyBank** (Italy) - Auto-enabled
- **Przelewy24** (Poland) - Auto-enabled

---

## 4. Webhook Configuration

### Step 1: Create Webhook Endpoint
1. PayPal Dashboard → **Developer** → **Webhooks**
2. Click **Create Webhook**
3. Configure webhook:
   ```
   Webhook URL: https://yourdomain.com/api/payments/webhooks/paypal
   Event Types: [Select events below]
   ```

### Step 2: Select Event Types
**Essential Events for Subscriptions:**
- ✅ `BILLING.SUBSCRIPTION.CREATED`
- ✅ `BILLING.SUBSCRIPTION.ACTIVATED` 
- ✅ `BILLING.SUBSCRIPTION.UPDATED`
- ✅ `BILLING.SUBSCRIPTION.CANCELLED`
- ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
- ✅ `BILLING.SUBSCRIPTION.EXPIRED`
- ✅ `PAYMENT.SALE.COMPLETED`
- ✅ `PAYMENT.SALE.REFUNDED`
- ✅ `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

### Step 3: Webhook Security
```env
# Add to your .env file
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_WEBHOOK_SECRET=auto_generated_secret
```

---

## 5. Advanced Settings Configuration

### A. Risk & Fraud Settings
1. **Account Settings** → **Security** → **Seller Protection**
2. Enable:
   - ✅ Advanced Fraud Protection
   - ✅ 3D Secure authentication
   - ✅ AVS (Address Verification)
   - ✅ CVV verification

### B. Business Settings
1. **Account Settings** → **Business Information**
2. Configure:
   - Business hours and timezone
   - Customer service contact info
   - Return/refund policies
   - Terms of service URL

### C. Payout Settings
1. **Account Settings** → **Money, banks, and cards**
2. Add bank account for fund transfers
3. Configure automatic vs manual payouts
4. Set payout schedule (daily, weekly, monthly)

---

## 6. SDK Integration Parameters

### Enhanced SDK URL Configuration
```javascript
const sdkParams = new URLSearchParams({
  'client-id': 'your_client_id',
  'vault': 'true',
  'intent': 'subscription',
  'enable-funding': 'venmo,card,googlepay,applepay,ideal,bancontact,sofort,giropay,eps,mybank,p24',
  'disable-funding': '', // Allow all enabled methods
  'currency': 'USD', // Or your preferred currency
  'locale': 'en_US', // Or user's locale
  'commit': 'true',
  'components': 'buttons,hosted-fields,payment-fields'
});

const sdkUrl = `https://www.paypal.com/sdk/js?${sdkParams.toString()}`;
```

### Funding Source Priority
```javascript
const fundingPriority = [
  'paypal',      // PayPal wallet
  'card',        // Credit/debit cards
  'venmo',       // Venmo (US only)  
  'googlepay',   // Google Pay
  'applepay',    // Apple Pay
  'ideal',       // iDEAL (Netherlands)
  'bancontact',  // Bancontact (Belgium)
  'sofort',      // SOFORT (Germany/Austria)
  'giropay',     // giropay (Germany)
  'eps',         // EPS (Austria)
  'mybank',      // MyBank (Italy) 
  'p24'          // Przelewy24 (Poland)
];
```

---

## 7. Testing & Validation

### Sandbox Testing
1. **Test Credit Cards:**
   ```
   Visa: 4111111111111111
   Mastercard: 5555555555554444
   American Express: 378282246310005
   ```

2. **Test PayPal Accounts:**
   - Create sandbox buyer/seller accounts
   - Use sandbox credentials for testing

3. **Test Subscriptions:**
   - Create test subscription plans
   - Verify webhook events fire correctly
   - Test cancellation/suspension flows

### Pre-Live Checklist
- [ ] All payment methods tested in sandbox
- [ ] Webhook endpoints responding correctly
- [ ] SSL certificate installed and valid
- [ ] Privacy policy and terms of service published
- [ ] Customer support contact information configured
- [ ] Bank account linked for payouts
- [ ] Live API credentials generated
- [ ] Business verification completed

---

## 8. Common Issues & Solutions

### Issue: "Funding source not available"
**Solution:** 
- Verify payment method is enabled in dashboard
- Check if user's region supports the payment method
- Ensure proper SDK parameters are set

### Issue: "Webhook signature verification failed"
**Solution:**
- Verify webhook ID and secret are correct
- Check webhook URL is publicly accessible
- Implement proper signature validation

### Issue: "Subscription creation failed"
**Solution:**
- Verify plan ID exists and is active
- Check product is properly configured
- Ensure all required fields are provided

### Issue: "Card payments not working"
**Solution:**
- Verify merchant account is fully approved
- Check if additional business verification needed
- Contact PayPal support for account review

---

## 9. Going Live

### Pre-Live Requirements
1. **Business Verification Complete**
2. **Bank Account Linked**
3. **SSL Certificate Installed**
4. **Privacy Policy Published**
5. **Terms of Service Published**
6. **Customer Support Info Added**

### Switch to Live
1. Create live PayPal app in dashboard
2. Update environment variables:
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=live_client_id
   PAYPAL_CLIENT_SECRET=live_client_secret
   ```
3. Update webhook URLs to production
4. Test with small real transactions first

### Post-Live Monitoring
- Monitor webhook events dashboard
- Track payment success/failure rates
- Monitor customer support tickets
- Review PayPal transaction reports
- Set up automated error alerting

---

## 10. Advanced Features

### Subscription Modification
```javascript
// Update subscription amount
await paypal.updateSubscription(subscriptionId, {
  proration_behavior: 'IMMEDIATE_WITH_PRORATION',
  plan_id: newPlanId
});
```

### Advanced Fraud Protection
```javascript
// Enhanced risk assessment
const riskData = {
  customer_id: userId,
  session_id: sessionId,
  device_fingerprint: deviceFingerprint,
  ip_address: clientIP
};
```

### Multi-Currency Support
```javascript
// Dynamic currency based on user location
const currency = getUserCurrency(userCountry);
const amount = convertAmount(baseAmount, currency);
```

---

**Need Help?**
- PayPal Developer Support: [developer.paypal.com/support](https://developer.paypal.com/support)
- PayPal Merchant Support: [paypal.com/merchantsupport](https://paypal.com/merchantsupport)
- Integration Documentation: [developer.paypal.com/docs](https://developer.paypal.com/docs)
