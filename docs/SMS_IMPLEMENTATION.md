# SMS Order Confirmation Implementation Guide

This document outlines the complete SMS notification system implemented for DiscreetKit using the official Arkesel SMS API.

## Overview

The SMS system sends notifications at key points in the order lifecycle:
1. **Initial Order Confirmation** - When order is placed (pending payment)
2. **Payment Confirmation** - When payment is successful 
3. **Shipping Notification** - When order is out for delivery
4. **Delivery Confirmation** - When order is completed

## Configuration

### Environment Variables
```env
# Arkesel SMS Configuration
ARKESEL_API_KEY=your-arkesel-api-key
ARKESEL_SENDER_ID=DiscreetKit
NEXT_PUBLIC_SITE_URL=https://discreetkit.com
```

The sender ID "DiscreetKit" has been whitelisted with Arkesel for your account.

## Implementation Details

### Core SMS Function (`src/lib/actions.ts`)
```typescript
async function sendSMS(phone: string, message: string): Promise<{ok: boolean; recipient: string; status?: number; body?: any; error?: string}>
```
- Handles phone number formatting (adds 233 prefix for Ghana numbers)
- Uses Arkesel API endpoint: `https://sms.arkesel.com/sms/api` with GET method
- Follows official Arkesel documentation format with query parameters
- Automatically adds `use_case=promotional` for Nigerian numbers (234xxxxxxxx)
- Returns detailed response object with success status and API response
- Includes comprehensive error handling and logging

### Notification Functions

#### 1. Initial Order SMS
**Trigger**: When order is created  
**Function**: Embedded in `createOrderAction()`  
**Message**: "Your order {CODE} is received. We'll notify you once payment is processed. Track status: {URL}"

#### 2. Payment Confirmation SMS  
**Trigger**: When payment is successful  
**Function**: `sendOrderConfirmationSMS(orderId: string)`  
**Message**: "Payment for order {CODE} confirmed. We're now preparing your package for discreet delivery. Track: {URL}"

#### 3. Shipping Notification SMS
**Trigger**: When order status changes to 'out_for_delivery'  
**Function**: `sendShippingNotificationSMS(orderId: string)`  
**Message**: "Your order {CODE} has been shipped. Your package is on the way for discreet delivery. Track: {URL}"

#### 4. Delivery Confirmation SMS
**Trigger**: When order status changes to 'completed'  
**Function**: `sendDeliveryNotificationSMS(orderId: string)`  
**Message**: "Your order {CODE} has been delivered successfully. Thank you for choosing DiscreetKit for your health needs. Need support? We're here to help."

## Integration Points

### Automatic Triggers

1. **Payment Webhooks** (`src/app/api/webhooks/paystack/route.ts`)
   - Sends confirmation SMS after successful Paystack payment

2. **Payment Verification** (`src/app/api/payment/verify/route.ts`)
   - Sends confirmation SMS when verifying payment manually

3. **Payment Reconciliation** (`src/app/api/payments/reconcile/route.ts`)
   - Sends confirmation SMS during scheduled reconciliation

4. **Admin Status Updates** (`src/app/api/admin/orders/[orderId]/route.ts`)
   - Sends shipping/delivery SMS when admin updates order status

### Manual Testing

Test endpoint available at `/api/test/sms` (POST):
```json
{
  "orderId": "123",
  "type": "confirmation" | "shipping" | "delivery"
}
```

## Phone Number Formatting

The system automatically formats phone numbers for Ghana:
- Input: "0241234567" → Output: "233241234567"
- Input: "233241234567" → Output: "233241234567" (unchanged)

## Error Handling

- API failures are logged but don't block order processing
- SMS delivery failures are gracefully handled
- All SMS attempts are logged for debugging

## Admin Usage

To update order status and trigger SMS notifications:

```bash
PATCH /api/admin/orders/[orderId]
{
  "status": "out_for_delivery", // or "completed"
  "note": "Optional custom note"
}
```

## Security Features

- API key stored securely in environment variables
- Admin authentication required for status updates
- Rate limiting on payment verification endpoints
- Webhook signature verification for Paystack events

## Monitoring

SMS operations are logged with the following information:
- Recipient phone number
- Success/failure status
- Error details (if applicable)
- Order context (order ID, status)

## Testing Checklist

- [ ] SMS sent on order creation
- [ ] SMS sent after successful payment (webhook)
- [ ] SMS sent after manual payment verification
- [ ] SMS sent when admin marks order as shipped
- [ ] SMS sent when admin marks order as delivered
- [ ] Phone number formatting works correctly
- [ ] Error handling works when API is down
- [ ] Test endpoint functions properly

## Production Considerations

1. **Remove Test Endpoint**: Delete `/api/test/sms` in production
2. **Monitor Costs**: Track SMS usage via Arkesel dashboard
3. **Rate Limits**: Monitor Arkesel API rate limits
4. **Backup Notifications**: Consider email fallbacks for critical notifications

## Troubleshooting

### Common Issues

1. **SMS not sending**: Check ARKESEL_API_KEY configuration
2. **Wrong sender ID**: Verify ARKESEL_SENDER_ID is set to "DiscreetKit"
3. **Phone format errors**: Ensure numbers start with 0 or 233
4. **API errors**: Check Arkesel dashboard for account status

### Debugging

Enable debug logging by checking console logs for:
- "Successfully sent SMS notification via Arkesel"
- "Arkesel SMS API Error"
- SMS payload details in development mode

## Future Enhancements

1. **Delivery Updates**: Real-time tracking integration
2. **SMS Templates**: Configurable message templates
3. **Multi-language**: Support for local languages
4. **SMS Analytics**: Delivery rates and customer engagement metrics
5. **Two-way SMS**: Allow customers to reply for support