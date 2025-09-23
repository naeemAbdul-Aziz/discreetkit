
# DiscreetKit Ghana - Confidential Health Products

This repository contains the source code for the DiscreetKit Ghana web application, a service designed to provide private, anonymous, and confidential health products (including self-test kits for HIV and pregnancy) to young people and students in Ghana.

## ✨ Key Features

*   **100% Anonymous Ordering:** No user accounts, names, or stored personal data.
*   **Private & Discreet Delivery:** All products are delivered in plain, unbranded packaging.
*   **Student Discount Program:** Automatic discounts for students when a valid campus location is selected.
*   **Secure Payments:** Integrated with Paystack for reliable and secure mobile money and card payments.
*   **AI-Powered Assistant:** An integrated chatbot ("Pacely") powered by Google's Gemini to answer user questions about products, privacy, and the process.
*   **Real-Time Order Tracking:** Users can track their order status with a unique, anonymous code.
*   **Supabase Backend:** Utilizes Supabase for database management and real-time updates.
*   **Built with Next.js & ShadCN UI:** A modern, performant, and responsive user interface.

## 🚀 Getting Started

To run this project locally, you'll need to have Node.js and npm installed.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xffvvxdtfsxfnkowgdzu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzNzcsImV4cCI6MjA3MjAzNzM3N30.YJafTn5uFrfVpaZWpa2OwS2AZsI_ul7bmm6lMTKsJ9A"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MTM3NywiZXhwIjoyMDcyMDM3Mzc3fQ.YnmKw7BIjl-oKDCbpQVZ60ZvzgNE4nj4EOh2lyGDf4A"

# Paystack (Replace with your own keys)
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# Hubtel SMS (Replace with your keys from hubtel.com)
HUBTEL_API_ID="your-hubtel-api-id"
HUBTEL_API_SECRET="your-hubtel-api-secret"

# Genkit (Google AI - Replace with your own key)
GEMINI_API_KEY="your-google-ai-api-key"

# Site URL (IMPORTANT: Use ngrok for local development with Paystack)
NEXT_PUBLIC_SITE_URL="https://your-ngrok-tunnel-url.ngrok-free.app"
```

### 4. Set Up Ngrok for Local Development

To test the Paystack payment flow and webhooks locally, you need to expose your local server to the internet. We recommend using **ngrok**.

1.  **Install ngrok:** Follow the instructions at [ngrok.com](https://ngrok.com/download).
2.  **Start your Next.js app:**
    ```bash
    npm run dev
    ```
    Your app will be running on `http://localhost:3000`.
3.  **Start an ngrok tunnel:** In a new terminal window, run:
    ```bash
    ngrok http 3000
    ```
4.  **Update your `.env.local`:** Ngrok will give you a public URL (e.g., `https://random-string.ngrok-free.app`). Copy this HTTPS URL and set it as the value for `NEXT_PUBLIC_SITE_URL` in your `.env.local` file.
5.  **Restart your app:** Stop and restart the `npm run dev` process for the new environment variable to take effect.

### 5. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will now be accessible via your ngrok URL, and Paystack will be able to communicate with it correctly.

## 🛠 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini models](https://ai.google.dev/)
*   **Backend & Database:** [Supabase](https://supabase.io/)
*   **Payments:** [Paystack](https://paystack.com/)
*   **Notifications:** [Hubtel SMS](https://hubtel.com/)
*   **Deployment:** [Vercel](https://vercel.com/) / [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 📦 Deployment

This project is optimized for deployment on Vercel or Firebase App Hosting. Simply connect your Git repository and configure the environment variables in the hosting provider's dashboard. Remember to set `NEXT_PUBLIC_SITE_URL` to your actual production domain.

    