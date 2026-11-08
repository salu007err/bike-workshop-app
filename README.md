# Bike Workshop - Simple Stock & Invoice Web App

A clean, fast, and free web application designed specifically for small bike workshops and two-wheeler garages. Built for owners with little or no computer knowledge: large buttons, simple English, zero complicated menus, and ₹0 running cost.

---

## 🚀 Key Features

### 1. Home Screen
- **Two Large Buttons Only:**
  - **STOCK**
  - **CREATE INVOICE**

### 2. Stock Section
- Manage spare parts: **Part Name**, **Price (₹)**, **Available Quantity**, and **Note**.
- **Add New Part**: Add parts with initial stock and price.
- **Quick + Stock**: Add new quantity with a single click when a shipment or stock box arrives.
- **Edit & Delete**: Easily update prices or remove discontinued parts.
- **Instant Search**: Find parts by name in real time.
- Low stock and out-of-stock color badges.

### 3. Create Invoice Section
- **Vehicle Registration Number Only**: e.g., `KL 07 AB 1234`. No customer name, phone, or address required.
- **Select Parts from Stock**: Pick parts with live stock availability and quantity checks.
- **Add Work / Service**: Enter custom labor (e.g. *Oil Change Work*, *Chain Lubing*, *Brake Cleaning*) with quick suggestion chips and prices.
- **Automatic Total Calculation**: Accurate real-time bill total in Indian Rupees (₹).
- **Stock Protection**:
  - Stock is **only reduced upon invoice confirmation**.
  - Stock is **never reduced twice**.
  - Stock **never becomes negative** (excess quantity is prevented).
  - **Invoice Cancellation**: If a bill is cancelled, deducted parts are automatically restored to stock!

### 4. Professional Invoice & Free Sharing
- **Download PDF**: Instant professional PDF generated via `jsPDF` and `jspdf-autotable`.
- **Print Invoice**: Direct browser print formatted cleanly for POS or A4 printers.
- **WhatsApp Click-to-Chat**: Generates a clean, readable text bill summary and opens WhatsApp with zero paid API costs.
- **Device Share Sheet**: Uses standard Web Share API when supported to share the PDF file directly.

---

## 🛠️ Technology Stack (100% Free / ₹0 Cost)

| Layer | Technology | Free Tier Details |
|---|---|---|
| **Frontend** | React 19 + Vite | Open-source, blazing fast |
| **Styling** | Tailwind CSS v3 | Clean, high-legibility UI |
| **Icons** | Lucide React | Lightweight, clear SVG icons |
| **PDF Generation** | jsPDF + autotable | Client-side zero-cost PDF generator |
| **Database** | Supabase PostgreSQL | Free tier (500MB DB, generous quotas) |
| **Hosting** | Cloudflare Pages | Free unlimited requests & custom domains |
| **Version Control**| GitHub Free | Free private/public repositories |
| **Messaging** | WhatsApp Click-to-Chat | Uses `wa.me` links, 0 API fees |

---

## 📦 Quick Start (Running Locally)

1. Open your terminal in the project directory:
   ```bash
   cd C:\Users\salma\.gemini\antigravity\scratch\bike-workshop-app
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in any browser on your computer, phone, or tablet.

> **Offline-Ready:** The app runs immediately out-of-the-box using browser storage with sample bike workshop stock (Engine Oil, Brake Shoes, Spark Plugs, etc.) even before configuring Supabase!

---

## 🗄️ Setting Up Supabase Database (Free)

1. Go to [supabase.com](https://supabase.com) and create a **Free Account**.
2. Create a new project (e.g. `bike-workshop-db`).
3. In the Supabase Dashboard, go to **SQL Editor** -> **New Query**.
4. Open and copy the contents of `supabase/schema.sql` from this repository, paste it into the editor, and click **Run**.
5. Go to **Project Settings** -> **API**:
   - Copy **Project URL**
   - Copy **anon public key**
6. Connect it to the app:
   - **Method A (Inside the App):** Click the **Settings** button in the top navigation bar, enter your Project URL and Anon Public Key, and click **Save & Connect Supabase**.
   - **Method B (Environment File):** Create a `.env` file in the project folder:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     ```

---

## 🌐 Deploying to Cloudflare Pages (Free)

1. Push this project to your GitHub account:
   ```bash
   git add .
   git commit -m "Simple Bike Workshop Stock & Invoice App"
   git remote add origin https://github.com/<your-username>/bike-workshop-app.git
   git push -u origin main
   ```
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your GitHub repository.
4. Set Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version (Environment Variables):** `NODE_VERSION = 20`
   - *(Optional)* Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using Supabase.
5. Click **Save and Deploy**. Your web app will be live with a free SSL certificate on `https://your-app.pages.dev`!

---

## 🔒 Security & Privacy

- No customer private details (address, customer mobile, PAN, GSTIN) are collected or stored.
- Row-Level Security (RLS) is enabled on all tables.
- The Supabase service-role secret key is **never** included or exposed in frontend code.
