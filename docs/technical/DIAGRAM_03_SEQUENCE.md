# DiscreetKit — Core Fulfillment Sequence Diagram
**Document:** DIAGRAM-03  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

This sequence diagram details the step-by-step interactions between the client, the server, third-party APIs, and the fulfillment partner during a standard order lifecycle.

```mermaid
sequenceDiagram
    autonumber
    
    participant Customer as Anonymous Customer
    participant Client as Next.js Client (React)
    participant Server as Next.js Server Actions
    participant DB as Supabase PostgreSQL
    participant Paystack as Paystack API
    participant Comms as Arkesel / Resend
    participant Pharmacy as Pharmacy Partner

    %% Phase 1: Order Creation
    rect rgb(240, 248, 255)
        Note over Customer, Paystack: Phase 1: Checkout & Payment Initiation
        Customer->>Client: Adds item to cart, clicks Checkout
        Customer->>Client: Submits Delivery Info & Phone
        Client->>Server: createOrderAction(payload)
        
        Server->>DB: Fetch Canonical Product Prices
        DB-->>Server: Return DB Prices
        Server->>Server: Calculate True Total (Apply Campus Discount)
        
        Server->>DB: Insert Order (status: pending_payment)
        DB-->>Server: Return Order ID & Tracking Code
        
        Server->>Paystack: Initialize Transaction (amount, email, reference)
        Paystack-->>Server: Return Authorization URL
        
        Server-->>Client: Redirect to Authorization URL
        Client-->>Customer: Displays Paystack Checkout Page
    end

    %% Phase 2: Payment Webhook & Assignment
    rect rgb(236, 253, 245)
        Note over Customer, Pharmacy: Phase 2: Webhook Processing & Auto-Assignment
        Customer->>Paystack: Completes Payment
        Paystack-->>Customer: Redirect to /order/success
        
        Paystack->>Server: Webhook (charge.success)
        Server->>DB: Verify Idempotency & Update Status to 'received'
        
        Server->>Server: trigger findBestPharmacyForOrder()
        Server->>DB: Query Service Areas & Stock Levels
        DB-->>Server: Return Candidate Pharmacies
        Server->>Server: Rank by lowest fee & fastest time
        
        Server->>DB: Update Order (pharmacy_id = winner_id)
        
        Server--x Comms: Dispatch Assignment Alerts
        Comms-->>Pharmacy: SMS & Email: "New Order Assigned"
    end

    %% Phase 3: Fulfillment Lifecycle
    rect rgb(255, 244, 235)
        Note over Pharmacy, Customer: Phase 3: Partner Fulfillment & Tracking
        Pharmacy->>Server: Logs into Pharmacy Portal
        Server->>DB: Fetch Assigned Orders (RLS Enforced)
        DB-->>Pharmacy: Display Dashboard
        
        Pharmacy->>Server: Clicks "Accept Order"
        Server->>DB: Update pharmacy_ack_status = 'accepted'
        
        Pharmacy->>Server: Clicks "Dispatch (Out for Delivery)"
        Server->>DB: Update status = 'out_for_delivery'
        Server--x Comms: Dispatch Tracking Alert
        Comms-->>Customer: SMS: "Order is on the way. Track here."
        
        Pharmacy->>Server: Clicks "Mark Completed"
        Server->>DB: Update status = 'completed'
        Server->>DB: Update Pharmacy Ledger Payouts
    end
```
