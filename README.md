# 🌸 BLOOMORA — Beauty Beyond Waste
### Premium Full-Stack Sustainable E-Commerce & Donation Platform

BLOOMORA is an Indian sustainability startup that transforms discarded temple and wedding flowers and unused clothing into artisanal, high-value, environmentally conscious products.

---

## 🌿 Brand Identity & Design System

- **Brand Name**: BLOOMORA
- **Tagline**: *Beauty Beyond Waste*
- **Primary Color Palette**:
  - **Forest Green** (`#263C32`): Elegance, tradition, primary CTA and headers
  - **Sage Green** (`#87977A`): Botanical regeneration, badges, and accents
  - **Warm Ivory** (`#F8F5EC`): Clean organic background
  - **Soft Beige** (`#E9E0D0`): Subtle borders, structural cards
  - **Muted Terracotta** (`#B97860`): Warm community donation highlights
  - **Charcoal** (`#292B27`): Refined high-contrast typography
- **Typography**:
  - Headings: **Playfair Display** (Editorial serif)
  - Body & UI: **DM Sans** & **Inter** (Modern sans-serif)

---

## 🚀 Key Features Implemented

### 1. Storefront & E-Commerce
- **Hero & Storytelling**: Editorial hero banner with live CMS integration, trust metrics, and dual initiative pathways.
- **Dynamic Product Catalogue**: Filter by category, sort by price (low/high) or popularity, real-time search, discount badges, and stock availability indicators.
- **Product Detail Pages**: Multi-image thumbnail gallery, sustainability claims badges, stock counter, quantity selector, tabs for Crafting / Materials / Ecological Impact.
- **Artisan Product Reviews**: Customer review submission form and verified patron review lists.
- **Cart & Bag Management**: Real-time quantity manipulation, line-item pricing in INR (₹), coupon code validation (`BLOOM10`, `WELCOME200`), free shipping calculation threshold (₹499+).
- **Checkout Flow**: Real-time order placement generating unique `ORD-2026-XXXX` order IDs, delivery address capture, and clearly labeled simulated test payment flow.
- **Wishlist System**: One-click heart save for authenticated patrons with fast cart transfer.

### 2. Dual Circular Social Impact Modules
- **Clothing Donation System** (`/donate`):
  - Form fields: Donor details, pickup address, clothing category, garment count, condition selector (*Like New*, *Gently Used*, *Needs Repair*, *Textile Recycling*), pickup date, and special instructions.
  - Generates unique reference code (`DON-2026-XXXX`).
  - Integrated public lifecycle tracker.
- **Floral Waste Collection System** (`/flowers`):
  - Facilitates partnerships with temples, wedding halls, event managers, and flower wholesale markets.
  - Sourcing categories, volume estimates (10kg to 100+ kg daily routes), flower type classifications (marigold, jasmine, rose, lotus, hibiscus).
  - Generates unique reference code (`FLW-2026-XXXX`).
- **Unified Public Tracker** (`/track`):
  - Allows donors and institutions to track requests through full visual status timelines from review to sorting and artisan upcycling.

### 3. Media Management & Image Upload System (Section 18 High Priority)
- **Admin Media Library** (`/admin/media`):
  - Drag-and-drop or file picker image uploads from laptop or mobile device.
  - Supports JPG/JPEG, PNG, and WEBP formats with 10MB limits.
  - Progress indicator, instant preview, one-click URL copy, and permanent file deletion.
  - Real disk persistence in `/server/uploads` + metadata tracking in database.
- **Product Image Manager** (`/admin/products`):
  - Direct file upload or URL specification during product creation or editing.
  - Images immediately sync to product cards, shop catalog, and detail pages.
- **Website CMS** (`/admin/content`):
  - Non-technical image & headline replacement for homepage hero, about story, and donation banners.

### 4. Admin Management Console (`/admin`)
- **Executive Analytics Dashboard**: Gross revenue in ₹, active orders count, donation counts, and recent transaction feeds.
- **Product Management**: Full CRUD with instant price and stock editing.
- **Order Fulfillment**: Update order statuses (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Donation Logistics**: Coordinator review, approval, slot scheduling, and internal notes.
- **Flower Collection Route Logistics**: Volume management and daily pickup coordination.
- **Customer Directory**: Registered patron database with purchase and donation histories.
- **Review Moderation**: Approve or unpublish user reviews.
- **Discount Coupons**: Generate percentage or flat-rate coupon codes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router v6
- **Backend**: Node.js, Express.js (ES Modules), TypeScript, Prisma ORM
- **Database**: Supabase PostgreSQL via Prisma
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and role-based access control (`USER` vs `ADMIN`)
- **File Uploads**: `multer` with persistent disk storage and file validation

---

## 🔑 Demo Access Credentials

The database has been seeded with realistic demonstration accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@bloomora.in` | `adminpassword123` |
| **Patron / Customer** | `user@bloomora.in` | `userpassword123` |

*Tip: The Sign In modal features one-click demo credentials filling for quick evaluation.*

---

## 🏃 Running the Application

### 1. Start the Backend Server (Terminal 1)
```bash
cd server
npm run dev
```
- Server listens on: `http://0.0.0.0:5001`
- Static uploads served at: `http://0.0.0.0:5001/uploads`
- Health check: `http://0.0.0.0:5001/api/health`

### 2. Start the Frontend Client (Terminal 2)
```bash
cd client
npm run dev
```
- Localhost URL: `http://localhost:5173`
- Network URL: `http://0.0.0.0:5173`

---

## 🌐 Network Access & Device Sharing

### A. Same Wi-Fi / Local Network Access (LAN)
The servers are pre-configured to bind to `0.0.0.0` so you can open the platform on your smartphone, tablet, or another laptop on the same Wi-Fi.

1. **Find your laptop's local IPv4 address** on macOS:
   ```bash
   ipconfig getifaddr en0
   ```
   *(e.g., `192.168.1.15`)*

2. **Open the browser on any phone or device on the same Wi-Fi**:
   ```
   http://<YOUR-LAPTOP-IP>:5173
   ```
   *(e.g., `http://192.168.1.15:5173`)*

3. **Firewall Note**: If a mobile device cannot connect, check **System Settings → Network → Firewall** and verify incoming connections to Node / Vite are permitted.

---

### B. Public Internet Access (Cloudflare Tunnel)
To share the live website with patrons or reviewers outside your local Wi-Fi:

1. **Install Cloudflare Tunnel CLI**:
   ```bash
   brew install cloudflared
   ```

2. **Start a secure public HTTPS tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```

3. Cloudflare will output an HTTPS URL:
   ```
   https://bloomora-xxxx.trycloudflare.com
   ```
   - All backend API and image routes are securely proxied through Vite.
   - Database ports are never exposed publicly.
   - Keep your laptop awake and both development servers running.

---

## 🧪 Testing Checklist

1. **Storefront & Catalog**: Browse `/shop`, sort by price, filter by category (*Dried Flower Decorations*, *Upcycled Textile Products*).
2. **Product Details & Cart**: Open any product, add to bag, apply coupon code `BLOOM10` for 10% discount.
3. **Checkout**: Complete simulated checkout to receive a real `ORD-2026-XXXX` order confirmation.
4. **Clothing Donation**: Fill out `/donate` form and save your generated `DON-2026-XXXX` reference.
5. **Flower Collection**: Fill out `/flowers` form to schedule floral waste pickup (`FLW-2026-XXXX`).
6. **Tracking**: Visit `/track` and look up `DON-2026-8812` or `FLW-2026-3490` to observe the lifecycle visual timeline.
7. **Admin Console**: Sign in as `admin@bloomora.in` and visit `/admin`.
8. **Image Upload & Media Library**:
   - Go to `/admin/media` and drag-and-drop a new image.
   - Go to `/admin/products`, create or edit a product, upload an image from your device, and verify it immediately displays on the store.
