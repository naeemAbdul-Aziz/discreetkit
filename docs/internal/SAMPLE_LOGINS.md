# Sample User Logins for Testing

## Admin Accounts
- **Email:** naeemabdulaziz202@gmail.com
- **Password:** DiscreetKitAdmin2k25

- **Email:** admin@discreetkit.com
- **Password:** AdminPass2k25

## Pharmacy Accounts

Pharmacy accounts are now linked to specific pharmacy records in the system. Admins can create pharmacy users when adding partners via the Admin → Partners page.

### Sample Pharmacy Logins (if created):
- **Email:** legon@pharmacy.com
- **Password:** PharmacyPass123
- **Linked to:** Legon Campus Pharmacy

- **Email:** osu@pharmacy.com
- **Password:** PharmacyPass123
- **Linked to:** Osu Oxford St Pharmacy

> **Note:** Pharmacy users are created by admins through the Partner Management interface. Each pharmacy user is linked to a specific pharmacy record via the `user_id` column in the `pharmacies` table.

## Creating New Pharmacy Users

Admins can create pharmacy accounts in two ways:

1. **During Partner Creation:**
   - Go to Admin → Partners → Add Partner
   - Fill in pharmacy details
   - Click "Add User Account"
   - Enter email and password
   - System automatically creates auth user and links to pharmacy

2. **For Existing Partners:**
   - Currently requires manual database update or future UI enhancement
   - Contact system administrator

## System Roles

- **admin**: Full access to all admin features
- **pharmacy**: Access to pharmacy portal (view assigned orders, update status)
- **support**: Customer support access (future implementation)
