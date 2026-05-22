# DiscreetKit — Entity-Relationship Diagram (ERD)
**Document:** DIAGRAM-01  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

This diagram illustrates the core database entities, their primary attributes, and the relationships between them based on the consolidated schema.

```mermaid
classDiagram
    class auth_users {
        +uuid id
        +string email
    }
    class roles {
        +int id
        +string name
    }
    class user_roles {
        +uuid user_id
        +int role_id
    }
    class pharmacies {
        +int id
        +string name
        +boolean is_active
        +string partner_code
    }
    class products {
        +int id
        +string name
        +float price_ghs
        +int stock_level
    }
    class orders {
        +int id
        +string code
        +string status
        +float total_price_ghs
    }
    class pharmacy_products {
        +int id
        +int pharmacy_id
        +int product_id
    }
    class order_events {
        +int id
        +string status
    }
    class medication_refill_subscriptions {
        +string id
        +string status
        +string frequency
    }

    auth_users "1" -- "*" user_roles : has
    roles "1" -- "*" user_roles : defines
    auth_users "1" -- "*" pharmacies : manages
    auth_users "1" -- "*" medication_refill_subscriptions : owns

    pharmacies "1" -- "*" pharmacy_products : stocks
    products "1" -- "*" pharmacy_products : stocked_as
    pharmacies "1" -- "*" orders : fulfills
    
    orders "1" -- "*" order_events : generates
    products "1" -- "*" medication_refill_subscriptions : prescribed_in
```
