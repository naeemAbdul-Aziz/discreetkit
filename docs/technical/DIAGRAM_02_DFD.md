# DiscreetKit — Data Flow Diagram (DFD)
**Document:** DIAGRAM-02  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

This Level 1 Data Flow Diagram illustrates how information moves between the external entities, the application processes, and the data stores within the DiscreetKit platform.

```mermaid
flowchart TD
    %% External Entities
    Customer((Anonymous Customer))
    Partner((Pharmacy Partner))
    Admin((Platform Admin))
    Paystack[Paystack Payment Gateway]
    Twilio[Twilio WhatsApp API]
    CommsService[Arkesel SMS / Resend]

    %% Data Stores
    DB_Orders[(DB: Orders)]
    DB_Products[(DB: Product Catalog)]
    DB_Pharmacies[(DB: Pharmacies & Stock)]
    Redis[(Redis: Sessions & Rate Limits)]

    %% Processes
    P1_Proxy(1.0 Proxy & RBAC Gateway)
    P2_OrderGen(2.0 Order Generation & Pricing)
    P3_PaymentProc(3.0 Payment Webhook & Reconciliation)
    P4_AutoAssign(4.0 Auto-Assignment Engine)
    P5_Fulfillment(5.0 Fulfillment & Ledger)
    P6_WhatsApp(6.0 WhatsApp Chatbot Engine)

    %% Flows - Customer Ordering Web
    Customer -- "Cart Items, Delivery Area, Phone" --> P1_Proxy
    P1_Proxy -- "Validated Payload" --> P2_OrderGen
    P2_OrderGen -- "Fetch Canonical Price" --> DB_Products
    P2_OrderGen -- "Create Pending Order" --> DB_Orders
    P2_OrderGen -- "Initialize Transaction" --> Paystack
    Paystack -- "Authorization URL" --> Customer

    %% Flows - Payment Webhook
    Paystack -- "Payment Success Webhook" --> P3_PaymentProc
    P3_PaymentProc -- "Idempotency Check" --> Redis
    P3_PaymentProc -- "Update Order Status" --> DB_Orders
    P3_PaymentProc -- "Trigger Assignment" --> P4_AutoAssign

    %% Flows - Auto Assignment
    P4_AutoAssign -- "Query Coverage & Stock" --> DB_Pharmacies
    P4_AutoAssign -- "Assign Winner Pharmacy" --> DB_Orders
    P4_AutoAssign -- "Dispatch Alerts" --> CommsService
    CommsService -- "New Order SMS/Email" --> Partner

    %% Flows - Pharmacy Fulfillment
    Partner -- "Login & Auth JWT" --> P1_Proxy
    P1_Proxy -- "View Assigned Orders" --> DB_Orders
    Partner -- "Accept/Decline & Update Status" --> P5_Fulfillment
    P5_Fulfillment -- "Update Order State" --> DB_Orders
    P5_Fulfillment -- "Status Updates" --> CommsService
    CommsService -- "Tracking Link SMS" --> Customer

    %% Flows - WhatsApp Channel
    Customer -- "WhatsApp Message" --> Twilio
    Twilio -- "Webhook Payload" --> P6_WhatsApp
    P6_WhatsApp <--> |"Read/Write State"| Redis
    P6_WhatsApp -- "Browse Catalog" --> DB_Products
    P6_WhatsApp -- "Convert to Order" --> P2_OrderGen

    %% Flows - Admin Oversight
    Admin -- "Manage System" --> P1_Proxy
    P1_Proxy -- "Global Visibility & Mutations" --> DB_Orders
    P1_Proxy -- "Global Visibility & Mutations" --> DB_Products
    P1_Proxy -- "Global Visibility & Mutations" --> DB_Pharmacies
```
