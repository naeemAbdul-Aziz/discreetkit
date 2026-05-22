# DiscreetKit — Use Case Diagram
**Document:** DIAGRAM-04  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

This diagram maps the high-level capabilities of each primary actor interacting with the DiscreetKit platform.

```mermaid
flowchart LR
    %% Actors
    Customer(("👤 Anonymous Customer"))
    Pharmacy(("🏥 Pharmacy Partner"))
    Admin(("🛡️ Platform Admin"))
    System(("🤖 Automated System"))

    %% Subsystems / Boundaries
    subgraph "Core Commerce (discreetkit.com)"
        UC1([Browse Catalog])
        UC2([Checkout & Pay])
        UC3([Track Order Status])
        UC4([Submit Refill Subscription])
    end

    subgraph "Pharmacy Portal"
        UC5([Accept/Decline Assigned Orders])
        UC6([Update Order Fulfillment Status])
        UC7([Manage Own Inventory])
        UC8([View Financial Ledger])
        UC9([Configure Service Areas])
    end

    subgraph "Admin Command Center"
        UC10([View Global Metrics & Analytics])
        UC11([Manage Global Products])
        UC12([Manage Partner Pharmacies])
        UC13([Intervene / Reassign Orders])
        UC14([Oversight of Refills])
    end

    subgraph "Background Operations"
        UC15([Auto-Assign Paid Orders])
        UC16([Reconcile Webhooks])
        UC17([Trigger SMS/Email Alerts])
        UC18([Release Unused Reservations])
    end

    %% Actor to Use Case Links
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4

    Pharmacy --> UC5
    Pharmacy --> UC6
    Pharmacy --> UC7
    Pharmacy --> UC8
    Pharmacy --> UC9

    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    System --> UC15
    System --> UC16
    System --> UC17
    System --> UC18

    %% Optional styling for visual hierarchy
    classDef actor fill:#f3f4f6,stroke:#374151,stroke-width:2px;
    classDef usecase fill:#e0f2fe,stroke:#0284c7,stroke-width:1px,rx:10px,ry:10px;
    classDef system fill:#fef3c7,stroke:#d97706,stroke-width:1px,rx:10px,ry:10px;

    class Customer,Pharmacy,Admin actor;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14 usecase;
    class UC15,UC16,UC17,UC18 system;
```
