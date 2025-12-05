# PayPal Webhook Implementation

## Overview
This document describes the PayPal webhook implementation for handling subscription lifecycle events and payment notifications.

## Webhook Endpoint
- **URL**: `/api/payments/webhooks/paypal`
- **Method**: POST
- **Content-Type**: `application/json` (raw body parsing)

## Supported Events

### Subscription Events
- `BILLING.SUBSCRIPTION.ACTIVATED` - Subscription becomes active
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription is cancelled
- `BILLING.SUBSCRIPTION.SUSPENDED` - Subscription is suspended due to payment issues
- `BILLING.SUBSCRIPTION.EXPIRED` - Subscription has expired

### Payment Events
- `BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED` - Monthly payment processed successfully
- `BILLING.SUBSCRIPTION.PAYMENT.FAILED` - Monthly payment failed

## Event Processing

### Database Updates
All events update the `subscriptions` table in Supabase:

- **Activated**: Sets `status = 'active'`, updates `start_date`
- **Cancelled**: Sets `status = 'cancelled'`
- **Suspended**: Sets `status = 'inactive'`
- **Expired**: Sets `status = 'cancelled'`
- **Payment Succeeded**: Extends `end_date` by 1 month
- **Payment Failed**: Sets `status = 'inactive'`

### Content Access
Premium content access is controlled by the subscription status in the database. The RLS policy ensures only active subscribers can view premium content.

## Webhook Security

### Signature Verification
- Uses PayPal's official webhook signature verification API
- Validates in production environment only
- Skips verification in development for easier testing

### Required Environment Variables
```env
PAYPAL_WEBHOOK_ID=your_webhook_id_from_paypal_dashboard
```

## PayPal Dashboard Setup

1. Log into PayPal Developer Dashboard
2. Go to your application settings
3. Add webhook URL: `https://yourdomain.com/api/payments/webhooks/paypal`
4. Select these events:
   - Billing subscriptions: All events
   - Payments: Sale completed, Sale denied

## Testing Webhooks

### Development Testing
- Webhooks are logged to console in development
- Signature verification is skipped
- Use PayPal sandbox for testing

### Sandbox Webhook URL
For local development, use a service like ngrok to expose your local server:
```bash
ngrok http 5000
# Use the ngrok URL in PayPal sandbox webhook settings
```

## Error Handling
- Invalid signatures return 400 status
- Processing errors are logged and return 500 status
- All events return 200 to acknowledge receipt (per PayPal requirements)

## Monitoring
- Check server logs for webhook processing
- Monitor subscription status changes in database
- Verify content access after subscription activation

## Future Enhancements
- Email notifications for subscription events
- Payment retry logic for failed payments
- Detailed transaction logging
- Admin dashboard for webhook monitoring