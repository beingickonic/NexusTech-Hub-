# NexusTech Hub

NexusTech Hub is a premium, modern, and high-performance e-commerce platform designed for tech enthusiasts in Kenya. The platform allows users to browse top-tier electronics, manage their carts, and securely checkout using M-Pesa, Flutterwave, and PayPal.

## Architecture Stack
NexusTech Hub has transitioned to a modern, serverless "Thin Client" architecture:
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Mobile**: Capacitor (Android)
- **Backend / Database**: Supabase (PostgreSQL) + Row Level Security (RLS)
- **Edge Logic**: Supabase Edge Functions (Deno)
- **Error Tracking**: Sentry
- **Hosting**: Vercel

## Core Features
1. **User Authentication**: Secure JWT-based login, registration, and password recovery powered by Supabase Auth.
2. **Product Catalog & Inventory**: Advanced product filtering, category navigation, and real-time inventory checks.
3. **Shopping Cart & Wishlist**: Persistent cart and wishlist management tied to user profiles.
4. **Secure Checkout & Payments**: 
   - **M-Pesa STK Push**: Native Kenyan mobile payments via Safaricom API.
   - **Flutterwave**: Global card payments and bank transfers.
   - **PayPal**: International transactions.
5. **Admin Dashboard**: Full-fledged CRM, Inventory Manager, and Sales Analytics Dashboard using Recharts.
6. **Automated Business Logic**: 
   - PDF Invoice generation and email dispatch via Resend triggered by Edge Functions.

## Getting Started

### Prerequisites
- Node.js >= 18.x
- Supabase CLI

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:beingickonic/NexusTech-Hub-.git
   cd nexustechhub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Edge Functions
All secure backend logic resides in `/supabase/functions/`.
To deploy Edge Functions:
```bash
npx supabase functions deploy
```

## Build for Android
1. Build the Vite production bundle:
   ```bash
   npm run build
   ```
2. Sync with Capacitor:
   ```bash
   npx cap sync android
   ```
3. Open Android Studio:
   ```bash
   npx cap open android
   ```

## Security & Compliance
All database interactions are strictly governed by Row Level Security (RLS) policies defined in `database/supabase_schema.sql`. The platform utilizes tokenized payment gateways, ensuring that sensitive financial data is never exposed to the client bundle.

## Troubleshooting & Deployment

### Vercel & Sentry Version Mismatches
If you encounter a `scripts/check-siblings.js` error during Vercel deployment:
- Ensure that `@sentry/react` and `@sentry/capacitor` share the **exact same version string** in your `package.json` (do not use carets `^` or tildes `~`).
- If you change Sentry versions, always clear your `node_modules` and regenerate `package-lock.json` before deploying.
