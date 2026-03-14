# CoreInventory

Hey! This is **CoreInventory** — a web-based inventory management system we built for a hackathon. It helps businesses keep track of their products, warehouses, and stock movements all in one place.

Think of it like a simplified version of what companies use to know *what they have*, *where it is*, and *where it's going*.

---

## What does it do?

At its core, CoreInventory lets you:

- **Track products** — Add items with names, SKUs, prices, and stock levels
- **Manage warehouses** — Set up multiple storage locations
- **Receive stock** — Log incoming goods from suppliers
- **Ship orders** — Record outgoing deliveries to customers
- **Move stock around** — Transfer items between warehouses
- **Fix mistakes** — Adjust quantities when the numbers don't match reality
- **See everything that happened** — A full audit trail of every stock movement

The whole idea is: stock comes in through **receipts**, moves around via **transfers**, goes out through **deliveries**, and if something's off, you use **adjustments** to correct it. The system keeps track of it all.

---

## How to run it

You'll need **Python 3.8+** and **Node.js 18+** installed.

**Start the backend first:**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

This fires up the Flask API on `http://127.0.0.1:5000`. The database (SQLite) gets created automatically on the first run — no setup needed.

**Then start the frontend:**

```bash
cd frontend
npm install
npm run dev
```

> **Windows PowerShell users**: If you get an "execution policy" error, run `cmd /c "npm run dev"` instead. It's a common Windows thing, not a bug.

Open `http://localhost:5173` in your browser, create an account, and you're good to go!

---

## The pages, explained

### Login & Register
Pretty self-explanatory. Create an account, log in, and get a JWT token that keeps you authenticated. Every other page requires you to be logged in — if your session expires, you'll get kicked back here automatically.

### Dashboard
Your home base. Shows you the big picture at a glance — how many products you have, total stock quantity, anything running low, and a chart showing how your inventory value has changed over time.

### Products
This is your product catalog. Add new items with details like name, SKU, price, and how much stock you've got. Each product shows whether it's "In Stock", "Low Stock", or "Out of Stock" based on its quantity vs. reorder level. You can search, filter, and delete products from here.

### Warehouses
Your physical storage locations. Create them with a name and address. You need at least one warehouse before you can do receipts, deliveries, or transfers — because stock has to *be* somewhere.

### Receipts
This is how stock **enters** the system. Say a supplier ships you 50 laptops — you create a receipt with the supplier name, pick the product, enter the quantity, and save it as a draft. When the goods actually arrive, you "validate" the receipt and assign it to a warehouse. That's when the stock numbers actually update.

### Delivery Orders
The opposite of receipts — this is how stock **leaves** the system. A customer orders something, you create a delivery with their name and the items they want. Validate it to deduct the stock from a specific warehouse.

### Transfers
Moving stock from one warehouse to another. Pick the source warehouse, the destination, the products, and the quantities. Create it as a draft, validate to execute the move. Simple.

### Inventory Adjustments
Real life is messy. Sometimes you count your stock and the numbers don't match what the system says. Maybe something got damaged, lost, or you just miscounted. Adjustments let you manually set the correct quantity and record *why* you changed it.

### Stock Ledger
The audit trail. Every receipt, delivery, transfer, and adjustment gets logged here. It's read-only — no one can edit it. You can filter by type to see, for example, only transfer-related entries. This is your source of truth for "what happened and when."

### Settings
Update your profile name or change your password. Nothing fancy.

---

## How the stock flow works

Here's the big picture of how stock moves through the system:

```
Supplier → [Receipt] → Warehouse A → [Transfer] → Warehouse B → [Delivery] → Customer
                              ↕
                       [Adjustment]
                              ↓
                       [Stock Ledger] ← records everything automatically
```

---

## Tech stack

- **Frontend**: React 19 + Vite + Tailwind CSS + React Router + Chart.js + Lucide icons
- **Backend**: Flask + SQLAlchemy + Flask-JWT-Extended + Flask-CORS
- **Database**: SQLite (auto-created, zero config)
- **Auth**: JWT tokens

---

## Project structure (the important bits)

```
backend/
  app.py              → starts the Flask server
  models/             → database tables (Product, Warehouse, Receipt, etc.)
  routes/             → API endpoints
  services/           → business logic (validation, stock updates, etc.)

frontend/src/
  App.jsx             → routing + auth protection
  services/api.js     → handles all API calls + JWT token management
  components/Layout.jsx → sidebar + top bar
  pages/              → one file per page (Dashboard, Products, etc.)
```

---

## API overview

All endpoints live under `/api/`. Most require a JWT token (sent as `Bearer <token>` in the Authorization header). The frontend handles this automatically.

| What | Endpoint | Needs login? |
|------|----------|:---:|
| Register | `POST /api/auth/register` | No |
| Login | `POST /api/auth/login` | No |
| Dashboard stats | `GET /api/dashboard` | Yes |
| Products CRUD | `/api/products` | Yes |
| Warehouses CRUD | `/api/warehouses` | GET is public |
| Receipts | `/api/receipts` | Yes |
| Deliveries | `/api/deliveries` | Yes |
| Transfers | `/api/transfers` | Yes |
| Adjustments | `/api/adjustments` | Yes |
| Stock Ledger | `GET /api/ledger` | Yes |
| Profile | `/api/auth/profile` | Yes |

---

Built for a hackathon with ☕ and determination.
