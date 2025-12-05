# Enhanced PayPal Integration Testing Guide

## Overview
This guide provides comprehensive testing procedures for the enhanced PayPal JavaScript SDK v6 integration with multi-payment method support.

---

## 1. Development Environment Setup

### Prerequisites
- ✅ Node.js 16+ installed
- ✅ PayPal Business Sandbox account
- ✅ PayPal Developer Dashboard access
- ✅ Valid SSL certificate (for production testing)

### Environment Configuration
```env
# Backend (.env)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox
FRONTEND_URL=http://localhost:5173
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

### Start Development Servers
```bash
# Backend
cd project/server
npm install
npm start

# Frontend
cd project
npm install
npm run dev
```

---

## 2. PayPal Sandbox Testing

### Test Accounts Setup
1. **Create Sandbox Accounts:**
   - Log in to [PayPal Developer Dashboard](https://developer.paypal.com)
   - Navigate to **Sandbox** → **Accounts**
   - Create test buyer and seller accounts

2. **Test Account Credentials:**
   ```
   Buyer Account:
   Email: buyer@example.com
   Password: test123456
   
   Seller Account:
   Email: seller@example.com
   Password: test123456
   ```

### Test Credit Cards
```
Visa Success: 4111111111111111
Visa Declined: 4000000000000002
Mastercard: 5555555555554444
American Express: 378282246310005

Security Code: 123
Expiry: Any future date
```

---

## 3. Component Testing

### A. PaymentMethodSelector Component
**Test Cases:**
1. **Render all payment methods correctly**
   - Verify PayPal, Cards, Venmo (US only), Google Pay displayed
   - Check local methods show for specific countries

2. **Country-based filtering**
   ```javascript
   // Test different countries
   const testCountries = ['US', 'NL', 'DE', 'BE', 'AT', 'IT', 'PL'];
   
   testCountries.forEach(country => {
     // Venmo should only show for US
     // Local methods should show for respective countries
   });
   ```

3. **Method selection**
   - Click each payment method
   - Verify selection state updates
   - Check callback function fires correctly

### B. PayPalEnhancedSubscription Component
**Test Cases:**
1. **SDK Loading**
   ```javascript
   // Verify SDK loads with correct parameters
   const expectedParams = [
     'vault=true',
     'intent=subscription', 
     'enable-funding=venmo,card,googlepay',
     'currency=USD'
   ];
   ```

2. **Payment Method Switching**
   - Test each payment method selection
   - Verify buttons re-render correctly
   - Check funding source parameter updates

3. **Subscription Creation**
   ```javascript
   // Mock successful subscription creation
   const mockSubscription = {
     id: 'I-BW452GLLEP1G',
     status: 'APPROVAL_PENDING',
     create_time: '2023-01-01T00:00:00Z'
   };
   ```

4. **Error Handling**
   - Test network errors
   - Test invalid responses
   - Test PayPal API errors
   - Verify error messages display correctly

### C. SubscriptionManager Component
**Test Cases:**
1. **Subscription Display**
   - Load active subscription
   - Display subscription details correctly
   - Show correct status badges

2. **Subscription Actions**
   ```javascript
   // Test all subscription actions
   const actions = [
     'cancel',
     'suspend', 
     'reactivate'
   ];
   
   actions.forEach(action => {
     // Test API call
     // Test UI updates
     // Test error handling
   });
   ```

---

## 4. API Endpoint Testing

### A. Enhanced Subscription Creation
```bash
# Test subscription creation
curl -X POST http://localhost:5000/api/payments/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "amount": "5.00",
    "currency": "USD",
    "paymentMethod": "card",
    "fundingSource": "card",
    "customerEmail": "test@example.com",
    "country": "US"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "subscriptionId": "I-BW452GLLEP1G",
  "data": {
    "id": "I-BW452GLLEP1G",
    "status": "APPROVAL_PENDING",
    "plan_id": "P-5ML4271244454362WXNWU5NQ"
  },
  "metadata": {
    "paymentMethod": "card",
    "fundingSource": "card",
    "country": "US"
  }
}
```

### B. Subscription Management
```bash
# Test subscription cancellation
curl -X POST http://localhost:5000/api/payments/subscriptions/I-BW452GLLEP1G/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{"reason": "User requested cancellation"}'

# Test subscription suspension
curl -X POST http://localhost:5000/api/payments/subscriptions/I-BW452GLLEP1G/suspend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token"

# Test subscription reactivation
curl -X POST http://localhost:5000/api/payments/subscriptions/I-BW452GLLEP1G/reactivate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token"
```

### C. Webhook Testing
```bash
# Test webhook endpoint
curl -X POST http://localhost:5000/api/payments/webhooks/paypal \
  -H "Content-Type: application/json" \
  -H "PAYPAL-TRANSMISSION-ID: test-transmission-id" \
  -H "PAYPAL-CERT-ID: test-cert-id" \
  -H "PAYPAL-TRANSMISSION-SIG: test-signature" \
  -H "PAYPAL-TRANSMISSION-TIME: 2023-01-01T00:00:00Z" \
  -d '{
    "id": "WH-2WR32451HC0013842-67976317FL4543714",
    "create_time": "2023-01-01T00:00:00.000Z",
    "resource_type": "subscription",
    "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
    "resource": {
      "id": "I-BW452GLLEP1G",
      "status": "ACTIVE"
    }
  }'
```

---

## 5. Payment Flow Testing

### Complete Subscription Flow
1. **Plan Selection**
   - Navigate to payment page
   - Select subscription plan
   - Verify plan details display

2. **Payment Method Selection**
   - Test each available payment method
   - Verify method-specific options appear
   - Check country-based filtering

3. **PayPal Payment Flow**
   ```javascript
   // Test steps:
   // 1. Click PayPal payment method
   // 2. Click Subscribe button
   // 3. Login to PayPal sandbox
   // 4. Approve subscription
   // 5. Return to success page
   // 6. Verify subscription created
   ```

4. **Card Payment Flow**
   ```javascript
   // Test steps:
   // 1. Click Card payment method
   // 2. Enter test card details
   // 3. Click Subscribe button
   // 4. Verify payment processing
   // 5. Check subscription activation
   ```

5. **Venmo Flow (US only)**
   ```javascript
   // Test steps:
   // 1. Set country to US
   // 2. Click Venmo payment method
   // 3. Complete Venmo authentication
   // 4. Verify subscription creation
   ```

6. **Local Payment Methods**
   ```javascript
   // Test iDEAL (Netherlands)
   // 1. Set country to NL
   // 2. Click iDEAL method
   // 3. Select test bank
   // 4. Complete payment flow
   ```

---

## 6. Error Scenario Testing

### Network Errors
```javascript
// Test cases:
// 1. Backend server down
// 2. PayPal API timeout
// 3. Invalid API responses
// 4. Network connectivity issues

// Expected behavior:
// - Show user-friendly error messages
// - Provide retry options
// - Log errors for debugging
// - Graceful degradation
```

### Payment Failures
```javascript
// Test cases:
// 1. Insufficient funds
// 2. Card declined
// 3. PayPal account suspended
// 4. Invalid payment details

// Use these test cards for failures:
const failureCards = {
  insufficient_funds: '4000000000000341',
  card_declined: '4000000000000002',
  expired_card: '4000000000000069'
};
```

### Validation Errors
```javascript
// Test cases:
// 1. Empty required fields
// 2. Invalid email format
// 3. Invalid amount values
// 4. Unsupported currency

// Expected behavior:
// - Show field-specific errors
// - Prevent form submission
// - Highlight invalid fields
// - Provide correction guidance
```

---

## 7. Webhook Event Testing

### Subscription Events
```bash
# Test webhook events in PayPal Sandbox
# Navigate to: Developer Dashboard > Webhooks > [Your Webhook] > Simulate Events

# Test these events:
events=(
  "BILLING.SUBSCRIPTION.CREATED"
  "BILLING.SUBSCRIPTION.ACTIVATED" 
  "BILLING.SUBSCRIPTION.CANCELLED"
  "BILLING.SUBSCRIPTION.SUSPENDED"
  "BILLING.SUBSCRIPTION.EXPIRED"
  "PAYMENT.SALE.COMPLETED"
  "PAYMENT.SALE.REFUNDED"
)
```

### Webhook Validation
```javascript
// Test webhook signature validation
const crypto = require('crypto');

function validateWebhookSignature(body, headers) {
  const expected = headers['PAYPAL-TRANSMISSION-SIG'];
  const transmissionId = headers['PAYPAL-TRANSMISSION-ID'];
  const certId = headers['PAYPAL-CERT-ID'];
  const transmissionTime = headers['PAYPAL-TRANSMISSION-TIME'];
  
  // Implement signature validation
  // Verify against PayPal's public certificate
}
```

---

## 8. Cross-Browser Testing

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Test Checklist
```javascript
// For each browser:
// 1. PayPal SDK loads correctly
// 2. Payment buttons render properly
// 3. Payment flows work end-to-end
// 4. Error handling functions correctly
// 5. Responsive design works on mobile
```

---

## 9. Performance Testing

### Load Testing
```bash
# Test API endpoints under load
npm install -g artillery

# Test subscription creation endpoint
artillery quick --count 10 --num 50 \
  http://localhost:5000/api/payments/subscriptions/create
```

### Frontend Performance
```javascript
// Metrics to track:
// 1. PayPal SDK load time
// 2. Component render time
// 3. Payment button response time
// 4. Memory usage
// 5. Bundle size impact

// Use browser dev tools Performance tab
```

---

## 10. Security Testing

### Authentication Testing
```bash
# Test without valid JWT token
curl -X POST http://localhost:5000/api/payments/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"amount": "5.00"}'

# Expected: 401 Unauthorized
```

### Input Validation
```javascript
// Test malicious inputs:
const maliciousInputs = [
  '<script>alert("xss")</script>',
  '../../etc/passwd',
  'DROP TABLE subscriptions;',
  '{"__proto__": {"polluted": true}}'
];

// Expected: All inputs sanitized and validated
```

### HTTPS Testing
```bash
# Ensure all API calls use HTTPS in production
# Test SSL certificate validity
# Verify secure cookie settings
```

---

## 11. Automation Testing

### Jest Test Setup
```javascript
// __tests__/PaymentComponents.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentMethodSelector from '../components/Payment/PaymentMethodSelector';

describe('PaymentMethodSelector', () => {
  test('renders all payment methods', () => {
    render(<PaymentMethodSelector 
      selectedMethod={null}
      onMethodSelect={jest.fn()}
      country="US"
    />);
    
    expect(screen.getByText('PayPal')).toBeInTheDocument();
    expect(screen.getByText('Credit / Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Venmo')).toBeInTheDocument();
  });
  
  test('filters Venmo for non-US countries', () => {
    render(<PaymentMethodSelector 
      selectedMethod={null}
      onMethodSelect={jest.fn()}
      country="DE"
    />);
    
    expect(screen.queryByText('Venmo')).not.toBeInTheDocument();
  });
});
```

### E2E Testing with Playwright
```javascript
// tests/e2e/payment-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete payment flow', async ({ page }) => {
  await page.goto('/enhanced-payment');
  
  // Select plan
  await page.click('[data-testid="basic-plan"]');
  
  // Select payment method
  await page.click('[data-testid="paypal-method"]');
  
  // Complete PayPal flow
  await page.click('[data-testid="paypal-subscribe-button"]');
  
  // Handle PayPal popup/redirect
  // Verify success state
  await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
});
```

---

## 12. Production Checklist

### Pre-Production Validation
- [ ] All tests pass in staging environment
- [ ] PayPal live credentials configured
- [ ] Webhook endpoints tested with live events
- [ ] SSL certificates valid and configured
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled
- [ ] Database backup strategy in place
- [ ] Customer support processes documented

### Go-Live Steps
1. **Switch to Live Mode**
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=live_client_id
   PAYPAL_CLIENT_SECRET=live_client_secret
   ```

2. **Verify Live Configuration**
   - Test with small real transactions
   - Monitor webhook events
   - Check PayPal dashboard reporting

3. **Monitor Post-Launch**
   - Payment success/failure rates
   - Error logs and alerts
   - Customer support tickets
   - PayPal transaction reports

---

**Need Help?**
- Review logs: `/var/log/paypal-integration.log`
- Check PayPal Developer Docs: [developer.paypal.com](https://developer.paypal.com)
- Test in PayPal Sandbox: [sandbox.paypal.com](https://sandbox.paypal.com)
- Contact PayPal Support: [paypal.com/merchantsupport](https://paypal.com/merchantsupport)
