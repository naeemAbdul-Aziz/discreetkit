# DiscreetKit System Design

This document outlines the architecture and system design of the DiscreetKit application. It details the core components and how they interact to provide a secure, anonymous, and efficient service.

## 1. Core Principles

The system is designed around these foundational principles:

*   **Anonymity:** No user accounts are required. Orders are tracked via unique, non-identifiable codes.
*   **Data Minimization:** Only the absolute necessary information for delivery and payment is collected.
*   **Security:** All backend operations are handled through secure server-side logic, and payment processing is delegated to a trusted third party.
*   **Scalability:** Built on modern, serverless-friendly technologies (Next.js, Supabase, Vercel/Firebase App Hosting).

---

## 2. Architectural Overview

DiscreetKit is a modern web application built on the Jamstack architecture, heavily utilizing the features of Next.js and a "Backend-as-a-Service" (BaaS) provider, Supabase.

![System Diagram](https://res.cloudinary.com/dzfa6wqb8/image/upload/v1760351745/discreetkit_system_diagram_mzyyud.png)

### Core Components:

1.  **Frontend (Next.js App Router)**
2.  **Client-Side State Management (Zustand)**
3.  **Backend Logic (Next.js Server Actions)**
4.  **Database (Supabase)**
5.  **Payment Gateway (Paystack)**
6.  **AI Chatbot (Genkit & Google Gemini)**
7.  **SMS Notifications (Arkesel)**

---

## 3. Component Deep Dive

### 3.1. Frontend

*   **Framework:** Next.js 14+ with the App Router. This allows for a hybrid approach of Server Components (for performance and SEO) and Client Components (for interactivity).
*   **UI Library:** React.
*   **Component Toolkit:** `ShadCN UI` is used for pre-built, accessible, and themeable components (Buttons, Cards, Forms, etc.).
*   **Styling:** `Tailwind CSS` provides utility-first styling, customized through `globals.css` and `tailwind.config.ts` to maintain a consistent brand identity.
*   **Key UI Responsibilities:**
    *   Displaying products fetched from the database.
    *   Providing an interactive shopping cart experience.
    *   Rendering forms for order placement and user input.
    *   Displaying real-time order tracking information.

### 3.2. Client-Side State Management

*   **Library:** `Zustand`.
*   **Purpose:** The `useCart` hook (`src/hooks/use-cart.ts`) manages the entire lifecycle of a user's shopping cart.
*   **Functionality:**
    *   Adding, removing, and updating the quantity of products.
    *   Calculating subtotal, delivery fees, and student discounts.
    *   Persisting the cart state to `localStorage`, so a user's cart is not lost if they close the browser.
    *   Storing the selected delivery location to apply correct fees and discounts.

### 3.3. Backend Logic

*   **Implementation:** All backend logic is encapsulated within **Next.js Server Actions** located in `src/lib/actions.ts`.
*   **Security:** This is a critical security feature. Instead of the client making direct requests to the database (which would require exposing sensitive keys), the client invokes a Server Action. This action runs exclusively on the server, where it can safely use admin-level database credentials.
*   **Core Actions:**
    *   `createOrderAction`: Validates cart and user details, inserts the order into Supabase, and initiates a payment transaction with Paystack.
    *   `getOrderAction`: Securely fetches a specific order and its event history for the tracking page.
    *   `saveSuggestion`: Inserts user product suggestions into the database.
    *   `handleChat`: Serves as a secure bridge between the client-side chatbot and the server-side Genkit AI flow.

### 3.4. Database (Supabase)

*   **Provider:** Supabase acts as the primary database and backend service.
*   **Data Models:** The schema (defined in `supabase/migrations/`) includes tables for:
    *   `products`: The master list of all products, including details, pricing, and categories.
    *   `orders`: Contains all order information, including items, delivery details, pricing, and the anonymous tracking code.
    *   `order_events`: A log of status changes for each order (e.g., "Order Received", "Payment Confirmed", "Out for Delivery").
    *   `suggestions`: Stores product suggestions from users.
*   **Security:** Row Level Security (RLS) is enabled on all sensitive tables (like `orders`). This ensures that data can only be accessed via the secure `service_role` key, which is only used within the server-side Server Actions. Public `anon_key` access is restricted.
*   **Real-time:** Supabase's real-time capabilities are used to listen for database changes, particularly on the admin orders page, allowing the UI to update automatically without needing a manual refresh.

### 3.5. Payment Gateway (Paystack)

*   **Role:** Securely handles all payment processing (Mobile Money, Card).
*   **Flow:**
    1.  The `createOrderAction` server action sends a request to the Paystack API to initialize a transaction, passing the total amount and order reference code.
    2.  Paystack returns a secure `authorization_url`.
    3.  The user's browser is redirected to this URL to complete payment on Paystack's hosted page.
    4.  Upon completion, Paystack sends a server-to-server notification (webhook) to our application's webhook handler.
*   **Webhook (`src/api/webhooks/paystack/route.ts`):**
    *   A dedicated API route that listens for `charge.success` events from Paystack.
    *   It cryptographically verifies the webhook signature to ensure it's genuinely from Paystack.
    *   Upon successful verification, it updates the order status in the Supabase database (e.g., from `pending_payment` to `received`) and logs a payment confirmation event in `order_events`.

### 3.6. AI Chatbot (Genkit)

*   **Framework:** `Firebase Genkit` with the `googleAI` plugin.
*   **Implementation:**
    *   A Genkit flow is defined in `src/ai/flows/answer-questions.ts`.
    *   This flow uses a prompt that is heavily augmented with a **Knowledge Base** (`src/ai/knowledge.ts`) containing official information about DiscreetKit's products, policies, and process.
    *   This "Retrieval-Augmented Generation" (RAG) approach ensures the AI provides answers based on factual data, not external knowledge, preventing hallucinations.
    *   The `handleChat` server action provides the secure interface for the frontend to access this flow.

### 3.7. SMS Notifications (Arkesel)

*   **Provider:** Arkesel SMS API V2.
*   **Flow:**
    1.  Immediately after an order is successfully created in the `createOrderAction`, a request is made to the Arkesel API.
    2.  A message containing the order confirmation and unique tracking link is sent to the user's provided phone number.
    3.  The API key is stored securely in environment variables and is only accessible from the server.
---

This modular and secure design allows each part of the system to perform its function independently, ensuring the application is robust, maintainable, and can be scaled effectively in the future.