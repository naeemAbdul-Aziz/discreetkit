# DiscreetKit — Project Scope Definition
**Document:** DEV-01  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. What Is DiscreetKit?

DiscreetKit is a **health-tech logistics platform** purpose-built to provide discreet, doorstep delivery of sexual health products across Ghana. It operates on an **anonymity-first, no-account-required** model, meaning customers can browse, order, track, and receive their products without creating a user profile or providing any identifying information beyond a delivery address and phone number.

The platform orchestrates a network of **partner pharmacies** who receive, pack, and dispatch orders through their own riders or courier services. Administrators manage the entire ecosystem — products, orders, partners, and financial settlements — from a centralized command center.

---

## 2. In Scope

### 2.1 Core Commerce (Customer Storefront)

| Feature | Description |
|---|---|
| **Product Catalog** | Display of available products with descriptions, pricing in GHS, and stock availability |
| **Shopping Cart** | Client-side cart with Zustand state management, persisted in localStorage |
| **Anonymous Checkout** | Two-step checkout: (1) delivery details (2) contact & payment — no account creation |
| **Server-Side Price Validation** | All client-submitted prices are discarded and recalculated from the database on the server to prevent tampering |
| **Campus/Student Pricing** | Reduced delivery fee (GHS 10 vs. GHS 20) automatically applied for recognized campus delivery areas |
| **Payment via Paystack** | Full card and Mobile Money support in GHS via Paystack's hosted checkout |
| **Order Tracking** | Real-time status tracking by unique order code at `/track` |
| **Refill/Subscription System** | Chronic medication refill subscriptions validated by hospital-issued token codes |
| **Prescription Uploads** | Anonymous file upload to Supabase Storage for prescription documentation |
| **Waitlist Signup** | Capture interest for upcoming products before launch |
| **Product Suggestions** | Anonymous feedback channel for customers to request new products |

### 2.2 WhatsApp Commerce Channel

| Feature | Description |
|---|---|
| **Full Catalog Browsing** | Users can browse all products via a numbered menu system in WhatsApp |
| **Add to Cart & Checkout** | Complete order flow without leaving WhatsApp |
| **Order Status Lookup** | Users can check order status by sending their tracking code |
| **Campus/Delivery Selection** | Conversation-based address collection with GPS pin fallback |
| **Partner Care Portal** | Access-code-gated menu for pharmacy partners to use support features via WhatsApp |
| **HIV Refill via REFILL keyword** | Patients on the refill program can confirm adherence and trigger next dispatch |
| **Triage AI Assist** | Health-sensitive questions are routed to an AI assistant within the conversation |

### 2.3 Pharmacy Partner Portal (`pharmacy.discreetkit.com`)

| Feature | Description |
|---|---|
| **Order Dashboard** | Real-time view of all assigned orders with status management |
| **Accept / Decline Orders** | Pharmacists can accept or decline new assignments with a reason |
| **Order Status Updates** | Update order status through the fulfillment pipeline (Processing → Out for Delivery → Completed) |
| **Inventory Management** | Track product stock levels per pharmacy, set reorder thresholds |
| **Rider Management** | Register and manage a fleet of delivery riders |
| **Service Area Configuration** | Define which geographic areas the pharmacy serves and at what delivery fee/time |
| **Financial Ledger** | View completed order history and calculated payout amounts |
| **Store Profile Settings** | Update pharmacy name, location, contact info visible to admin |
| **Notification Preferences** | Configure SMS and email alert types |
| **Security Settings** | Change account password |
| **Financial Settings** | Register bank account or MoMo number for payouts |
| **Operational Hours** | Toggle 24/7 availability or define operating hours |
| **Hub Mode (Clinical Partners)** | Hospitals enrolled as "Partner Hubs" have an additional dashboard showing enrolled patients, adherence rates, and identity verification queues |

### 2.4 Admin Command Center (`admin.discreetkit.com`)

| Feature | Description |
|---|---|
| **KPI Dashboard** | Live metrics: Total Sales, Orders, Active Customers, Avg. Order Value, Fulfillment Velocity |
| **Sales Timeline Chart** | Revenue over time visualization |
| **Activity Pulse Feed** | Real-time stream of recent order events |
| **Performance Rankings** | Top pharmacies by revenue; best-selling products by units |
| **All Orders Management** | Full CRUD over all orders with status transitions, messaging, and forced reassignment |
| **Partner Network Management** | View all registered pharmacies, their status, location, and performance |
| **Product Management** | Add, edit, and remove products from the catalog |
| **Category Management** | Manage product categories |
| **Operations Dashboard** | Live logistics overview: active deliveries, stuck orders, escalations |
| **Refill Program Oversight** | View all active medication subscriptions |
| **Customer Directory** | Anonymized view of order history grouped by delivery area/email |
| **Analytics Module** | Extended financial and operational analytics |
| **Store Settings** | Store-wide configuration including support email and notification defaults |
| **AI Copilot** | Role-aware AI assistant for strategic and operational insights |

### 2.5 Automation & Background Systems

| Feature | Description |
|---|---|
| **Auto-Pharmacy Assignment** | Post-payment, the system automatically assigns the best-fit pharmacy based on delivery area coverage, stock availability, lowest fee, and fastest time |
| **Escalation Detection** | A cron job runs every 15 minutes to detect orders stuck in fulfillment beyond acceptable thresholds and triggers SMS alerts to admin |
| **Inventory Reservation Release** | Reservations held against accepted orders are automatically released if not dispatched within 2 hours |
| **Payment Reconciliation** | A scheduled job re-verifies `pending_payment` orders older than 10 minutes against the Paystack API to recover any missed webhooks |
| **Refill Dispatch Processing** | Cron job to process due medication refill subscriptions and trigger re-orders |
| **SMS Notifications** | Customer and pharmacy notifications at key lifecycle events via Arkesel |
| **Email Notifications** | Pharmacy and customer email alerts via Resend for order assignment and status changes |

---

## 3. Out of Scope

The following are **explicitly not part of the platform** and should not be built into the system without a formal scope extension:

| Out of Scope | Reason |
|---|---|
| **User Accounts for Customers** | The anonymity model is a core design principle; accounts would compromise it |
| **Product Reviews or Ratings** | No user identity anchor makes reviews meaningless and gameable |
| **Multi-Currency Support** | GHS is the single operating currency; FX conversion is not planned |
| **Inventory Procurement / Supplier Management** | DiscreetKit does not manage pharmacy stock procurement; pharmacies manage their own |
| **Direct Pharmacy-to-Customer Chat** | All communication is mediated through the platform's order messaging system |
| **Customer Loyalty / Points Programs** | Incompatible with the anonymous order model |
| **In-App Map / GPS Rider Tracking** | Real-time rider GPS is not part of the current logistics model |
| **Native Mobile Apps (iOS / Android)** | The platform is web-only; WhatsApp serves the mobile-first commerce channel |
| **Marketplace / Multi-Vendor Product Listings** | Pharmacies fulfill orders; they do not post their own product listings |
| **Prescription Validation/Clinical Review** | The platform logs prescriptions but does not provide clinical verification workflow |
| **Tax Invoicing / VAT Calculation** | Financial reporting is payout-based; formal tax invoice generation is out of scope |
| **International Shipping** | Ghana-only delivery network at launch |
| **Pharmacy-to-Pharmacy Stock Transfers** | Each pharmacy manages its own inventory independently |

---

## 4. Platform Boundaries (Interface Contracts)

| Boundary | What DiscreetKit Owns | What Is External |
|---|---|---|
| **Payments** | Initialize transaction, handle webhooks, reconciliation | Paystack's hosted checkout page and payment processing |
| **SMS** | Compose and dispatch messages, log status | Arkesel SMS gateway and carrier delivery |
| **Email** | HTML email templates and dispatch logic | Resend delivery infrastructure |
| **WhatsApp** | Session management, state machine, message composition | Twilio API and WhatsApp delivery |
| **File Storage** | Upload logic, path management, access control | Supabase Storage (S3-compatible) |
| **AI Responses** | Prompt engineering, RAG knowledge base, role dispatch | Google Gemini / OpenAI API |
| **Authentication** | Login, session cookies, role-based routing | Supabase Auth (GoTrue) |
| **Database** | Schema, migrations, RLS policies | Supabase PostgreSQL |

---

## 5. Supported Geographies

| Scope | Status |
|---|---|
| Accra (metro areas) | Live |
| KNUST Campus, Legon Campus, other university campuses | Live with reduced delivery fee |
| Other Ghana regions | Supported via "Other" delivery area input |
| International | Not supported |

---

## 6. Regulatory & Compliance Scope

| Area | Approach |
|---|---|
| **Data Privacy** | PII (phone, address) is masked server-side before reaching any dashboard; no PII is stored unnecessarily |
| **Payment Security** | Paystack HMAC-SHA512 webhook verification with timing-safe comparison |
| **Content Security** | Strict CSP headers on all responses; frame-busting via `X-Frame-Options: SAMEORIGIN` |
| **Prescription Handling** | Stored in private Supabase Storage bucket; not displayed to pharmacy without explicit admin unlock |
| **Anonymous Upload** | Random folder paths for prescription uploads prevent enumeration attacks |

---

*This document defines the current scope boundaries. Any new capabilities should be formally assessed against these boundaries before implementation.*
