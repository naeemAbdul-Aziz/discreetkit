# The DiscreetKit Developer Reference Manual
**Master Index Document**  
**Version:** 1.0  
**Last Updated:** May 2026

Welcome to the DiscreetKit developer documentation. This suite of documents provides a comprehensive, end-to-end guide to the platform's architecture, business logic, and operational flows.

Whether you are onboarding as a new engineer, debugging a fulfillment issue, or extending the database schema, this manual serves as your single source of truth.

---

## 📚 Core Documentation Suite

### 1. Business & Operational Logic
*   **[DEV-01: Project Scope Definition](DEV_01_SCOPE.md)**  
    What DiscreetKit is, what it isn't, and the exact boundaries of the platform (anonymity-first model, supported features, exclusions).
*   **[DEV-02: User Types & Capabilities](DEV_02_USER_TYPES.md)**  
    The Role-Based Access Control (RBAC) model. Defines what Anonymous Customers, Pharmacy Partners, and Platform Admins can and cannot do.
*   **[DEV-05: User Stories & Acceptance Criteria](DEV_05_USER_STORIES.md)**  
    The Agile translation of system features into testable user stories. Essential for QA and feature validation.

### 2. System Architecture & Flow
*   **[DEV-03: System Architecture & Engineering Standards](DEV_03_ARCHITECTURE.md)**  
    The technical blueprint. Covers the "Three-Pillar" Monorepo, stateless scaling, proxy routing, and the zero-trust security model.
*   **[DEV-04: End-to-End System Data Flow](DEV_04_SYSTEM_FLOW.md)**  
    Maps the flow of data across the ecosystem for the Core Web Order, WhatsApp Commerce, Refills, and System Escalations.
*   **[DEV-06: API & Webhook Contracts](DEV_06_API_CONTRACTS.md)**  
    Strict definitions of every endpoint in the system: Paystack webhooks, Twilio WhatsApp payloads, Cron jobs, and core Server Actions.

### 3. Infrastructure & Deployment
*   **[DEV-07: Environment & Deployment Guide](DEV_07_ENVIRONMENT.md)**  
    How to run the system locally (including subdomain `/etc/hosts` setup) and how to deploy to Vercel and Supabase safely.

---

## 🗺️ Visual Reference Diagrams

*   **[DIAGRAM-01: Entity-Relationship Diagram (ERD)](DIAGRAM_01_ERD.md)**  
    The database schema and foreign key relationships mapped out as a class diagram.
*   **[DIAGRAM-02: Data Flow Diagram (DFD)](DIAGRAM_02_DFD.md)**  
    High-level view of how data moves between external APIs, internal proxy, server actions, and databases.
*   **[DIAGRAM-03: Core Fulfillment Sequence Diagram](DIAGRAM_03_SEQUENCE.md)**  
    Step-by-step chronological visualization of checkout, webhook verification, auto-assignment, and fulfillment.
*   **[DIAGRAM-04: Use Case Diagram](DIAGRAM_04_USE_CASE.md)**  
    Visual mapping of the capabilities available to each actor in the system.

---
*End of Master Index. For further questions, consult the codebase implementation in `src/proxy.ts` and `src/lib/actions.ts`.*
