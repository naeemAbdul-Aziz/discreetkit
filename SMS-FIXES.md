# 🔧 DiscreetKit SMS Issues - Fix Guide

## Issue Summary
1. **Wrong Domain**: SMS showing `discreetkit.vercel.app` instead of `discreetkit.shop`
2. **Missing Payment SMS**: Order EWW-F93-9GK didn't receive payment confirmation

## 🛠️ IMMEDIATE FIXES

### Fix 1: Update Vercel Environment Variables

1. **Login to Vercel Dashboard**:
   ```
   https://vercel.com/dashboard
   ```

2. **Navigate to Project Settings**:
   - Select "discreetkit" project
   - Go to "Settings" tab
   - Click "Environment Variables"

3. **Update NEXT_PUBLIC_SITE_URL**:
   ```
   Variable Name: NEXT_PUBLIC_SITE_URL
   Value: https://discreetkit.shop
   Environment: All (Production, Preview, Development)
   ```

4. **Trigger Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Fix 2: Test Payment Confirmation SMS

Run this command to manually send payment confirmation for your order:

```bash
# Test the confirmation SMS manually
curl -X POST https://discreetkit.shop/api/test/sms \
-H "Content-Type: application/json" \
-d '{"orderId": "EWW-F93-9GK", "type": "confirmation"}'
```

### Fix 3: Check Order Status in Database

Your order `EWW-F93-9GK` might be stuck in `pending_payment` status. This would prevent the webhook from sending SMS.

**Possible reasons**:
- Paystack webhook failed
- Payment verification didn't complete
- Environment variable mismatch

## 🧪 TESTING & VERIFICATION

### Test 1: Debug Your Order
```bash
node debug-order.js EWW-F93-9GK
```

### Test 2: Check Production Environment
After Vercel update, place a new test order to verify:
- Initial SMS uses `discreetkit.shop`
- Payment confirmation SMS is sent
- All tracking URLs are correct

### Test 3: Manual SMS Verification
```bash
# Test different SMS types
curl -X POST https://discreetkit.shop/api/test/sms \
-H "Content-Type: application/json" \
-d '{"orderId": "EWW-F93-9GK", "type": "shipping"}'
```

## 🚨 URGENT CHECKLIST

- [ ] Update Vercel environment variables
- [ ] Redeploy application
- [ ] Test new order flow
- [ ] Verify SMS uses correct domain
- [ ] Check webhook logs for payment confirmation
- [ ] Remove test endpoints before full production

## 📝 NEXT STEPS

1. **Immediate**: Fix Vercel environment variables
2. **Testing**: Place test order to verify fixes
3. **Monitoring**: Check Paystack webhook logs
4. **Production**: Remove `/api/test/sms` endpoint

## 🔍 DEBUGGING COMMANDS

```bash
# Local debugging
node debug-order.js EWW-F93-9GK

# Production SMS test
curl -X POST https://discreetkit.shop/api/test/sms \
-H "Content-Type: application/json" \
-d '{"orderId": "EWW-F93-9GK", "type": "confirmation"}'

# Check Arkesel balance
node test-arkesel.js
```

Your SMS system is properly implemented - these are just environment configuration issues that need to be synced between local and production! 🚀