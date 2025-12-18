
# WhatsApp Assistant Module

This directory contains the core logic for the DiscreteKit WhatsApp Assistant.

## Architecture

- **`manager.ts`**: The "Brain". Handles incoming messages, state transitions, business logic (Orders, Partner Care), and database interactions.
- **`service.ts`**: The "IO Layer". Wraps the Twilio API to send messages. *Note: Includes "Virtual Button" logic for Trial Accounts.*
- **`session.ts`**: The "Memory". Manages user state and context (Cart, Last List Options) in Upstash Redis.
- **`types.ts`**: Zod schemas and TypeScript interfaces.

## Key Features

1.  **Virtual Buttons**: To support Twilio Trial accounts (which block native buttons), lists are rendered with numbers (`1. Option`), and `manager.ts` acts as a "Virtual Click Handler" by mapping numbers back to IDs.
2.  **Order Sync**: `manager.ts` creates a `pending_payment` order in `supabase.orders` before generating a Paystack link. This ensures the webhook can always fulfill the order.
3.  **Real Tracking**: Providing an order code (e.g. `DK-WA-12345`) triggers a real-time status lookup.

## Usage

The entry point is `src/app/api/whatsapp/route.ts`, which calls `manager.handleIncomingMessage`.
