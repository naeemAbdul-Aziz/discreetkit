# DiscreetKit Ghana - Confidential Self-Test Kits

This repository contains the source code for the DiscreetKit Ghana web application, a service designed to provide private, anonymous, and confidential self-test kits for HIV and pregnancy to young people and students in Ghana.

## ✨ Key Features

*   **100% Anonymous Ordering:** No user accounts, names, or stored personal data.
*   **Private & Discreet Delivery:** All kits are delivered in plain, unbranded packaging.
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

Create a `.env.local` file in the root of your project and add the following environment variables. You will need to get these values from your own Supabase and Paystack dashboards.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-public-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-role-key"

# Paystack
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# Genkit (Google AI)
GEMINI_API_KEY="your-google-ai-api-key"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🛠 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini models](https://ai.google.dev/)
*   **Backend & Database:** [Supabase](https://supabase.io/)
*   **Payments:** [Paystack](https://paystack.com/)
*   **Deployment:** [Vercel](https://vercel.com/) / [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 📦 Deployment

This project is optimized for deployment on Vercel or Firebase App Hosting. Simply connect your Git repository and configure the environment variables in the hosting provider's dashboard.
