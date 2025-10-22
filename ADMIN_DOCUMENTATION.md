# DiscreetKit Admin Dashboard - Implementation Guide

This document provides a comprehensive guide for building a new, standalone admin dashboard for DiscreetKit. The design and functionality should align with the main application's UI/UX to ensure brand consistency.

## 1. Technology Stack

*   **Framework:** Next.js (App Router)
*   **UI Components:** ShadCN UI (using existing components from the main app)
*   **Styling:** Tailwind CSS (using `tailwind.config.ts` from the main app for consistency)
*   **Database:** Supabase (connecting to the existing project)
*   **Authentication:** JWT-based session management (Email/Password)

---

## 2. Authentication

The entire admin dashboard must be protected.

*   **Login Page (`/login`):**
    *   A full-screen page with a centered `Card` component for the login form.
    *   **Fields:** Email and Password.
    *   **Action:** On submit, a server action should verify credentials against secure environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
    *   **Session:** Upon success, create an encrypted session cookie (e.g., using `jose`) and redirect to the dashboard.
    *   **Error Handling:** Use an `Alert` component to display login failure messages.

*   **Layout Guard (`/layout.tsx`):**
    *   The root layout of the admin app must check for a valid session on every page load.
    *   If no session exists, it must redirect the user to the `/login` page.

---

## 3. Core Pages & UI Design

All admin pages should be nested within a main shell (`AdminShell`) that provides consistent navigation.

### 3.1. Admin Shell (`components/admin-shell.tsx`)

*   **Desktop View:** A responsive sidebar on the left (e.g., 220px wide).
    *   The DiscreetKit logo at the top.
    *   A vertical navigation list with icons (`Home`, `ShoppingCart`, `Package`, etc.).
*   **Mobile View:** The sidebar should be hidden and accessible via a "hamburger" menu `Button` in the header, opening as a `Sheet` component.
*   **Header:** A simple header that displays the current page title (e.g., "Dashboard", "Orders").
*   **Content Area:** The main content of each page should render within this shell, with appropriate padding (e.g., `p-4 lg:p-6`).

### 3.2. Dashboard (`/dashboard`)

This page provides a high-level overview of store performance.

*   **Layout:** A grid of `Card` components for key analytics.
*   **Analytics Cards:** Each card should have a `CardHeader` with a title and icon, and `CardContent` displaying the value.
    *   **Total Revenue:** `GHS 1,234.56` (Icon: `CreditCard`)
    *   **Sales:** `+58` (Icon: `BarChart3`)
    *   **Unique Customers:** `+45` (Icon: `Users`)
    *   **All Orders:** `+70` (Icon: `ShoppingCart`)
    *   **Pending Fulfillment:** `12` (Icon: `Hourglass`)
    *   **In Transit:** `5` (Icon: `Truck`)
    *   **Delivered:** `31` (Icon: `PackageCheck`)

### 3.3. Orders Page (`/orders`)

An interactive data table for managing all orders.

*   **Component:** Use the `Table` component, wrapped in a `Card`.
*   **Features:**
    *   **Search:** An `Input` with a `Search` icon to filter orders by code or email.
    *   **Filter:** A `Select` dropdown to filter by order status (`received`, `processing`, `completed`, etc.).
    *   **Sorting:** Table headers should be clickable to sort columns (Date, Total, Status).
    *   **Real-time Updates:** Use Supabase real-time subscriptions to automatically update the table when orders change.
    *   **Inline Status Editing:** The "Status" column should be a `Select` dropdown inside the table row, allowing admins to change the order status directly. Use `Badge` components with different colors for each status to improve scannability.
    *   **Pharmacy Assignment:** An "Assigned Pharmacy" column with a `Popover` containing a `Command` component. This allows admins to search for and assign an order to a specific pharmacy partner.

### 3.4. Products Page (`/products`)

A page for managing the product catalog.

*   **Component:** A `Table` similar to the orders page.
*   **Features:**
    *   **Add New Product:** A `Button` (`<PlusCircle /> Add New`) that opens a `Dialog` containing the `ProductForm`.
    *   **Inline Editing:**
        *   **Price & Stock:** These table cells should be clickable, opening a small `Popover` with an `Input` to update the value directly (`InlineEditField` component).
        *   **Category:** The category cell should be a clickable `Popover` that allows for quick re-categorization.
    *   **Actions Menu:** Each row should have a `DropdownMenu` (`MoreHorizontal` icon) with "Edit Full Details" (opens the form dialog) and "Delete" actions.

*   **Product Form (`components/product-form.tsx`):**
    *   A multi-column form using `Input`, `Textarea`, `Select`, and `Checkbox` for all product fields (`name`, `description`, `price_ghs`, `category`, `stock_level`, `image_url`, `usage_instructions`, etc.).
    *   Should handle both creating new products and editing existing ones.

### 3.5. Other Pages

*   **Customers (`/customers`):** A simple table listing unique customers based on email, total orders, and total spent. Include a CSV export `Button`.
*   **Pharmacies (`/pharmacies`):** A page to CRUD (Create, Read, Update, Delete) pharmacy partners. Use a `Dialog` with a form for creating/editing.
*   **Suggestions (`/suggestions`):** A table to review and delete product suggestions submitted by users from the homepage.

---

## 4. Server Actions

All database mutations should be handled via secure server actions.

*   **Authentication:** `login()`, `logout()`, `getSession()`.
*   **Products:** `getAdminProducts()`, `getProductById()`, `saveProduct()`, `updateProductField()`, `deleteProduct()`.
*   **Orders:** `getAdminOrders()`, `updateOrderStatus()`, `assignOrderToPharmacy()`.
*   **And so on for other modules.**

By following this guide, you can build a robust and secure admin dashboard that is visually and functionally consistent with the main DiscreetKit application.
