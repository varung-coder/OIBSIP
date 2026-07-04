# PizzaPilot - Pizza Delivery & Inventory Management Platform 🍕✈️

**PizzaPilot** is an enterprise-grade, production-ready MERN stack web application that combines a customer-facing custom pizza builder interface with a live order-tracking pipeline and an administrative control deck for inventory levels. 

Developed with visual styling (glassmorphism), security headers, database transaction logic, real-time Socket.IO alerts, automated inventory threshold monitoring (node-cron + Nodemailer), and Razorpay test mode payment verification.

---

## 🚀 Key Features

### 🔐 Authentication & Roles
- **Secured JWT Sessioning**: HTTP-only or token headers for access verification.
- **Verification Flow**: Crypto-token verification link sent to email on register.
- **Password Reset**: Cryptographically signed recovery tokens delivered via email.
- **Admin Accounts**: Strictly stored and seeded in the database. Restricted access validation.

### 🍕 Pizza Builder Workspace
- **Dynamic 4-Step Customizer**: Wizard panel detailing Bases (Exactly 5), Sauces (Exactly 5), Cheeses, and Veggies.
- **Visual Canvas Mockup**: Custom CSS graphics that update dynamically to display selected toppings and sauce colors.
- **Real-Time Cost Ticker**: Instantly computes prices as options are added/removed.
- **Stock Guard**: Disables choices in the builder that are currently out of stock.

### 💳 Order Summary & Checkout
- **Razorpay Checkout SDK**: Seamless integration with Razorpay Test Mode checkout popup.
- **Signature Verification**: SHA-256 validation of payment signatures on the backend.
- **Transactional Stock Deduction**: Atomically deducts item levels from the inventory database only after validated payment.

### 🛰️ Live Tracking & History
- **Socket.IO Event pipeline**: Real-time status progress timeline (`Received` ➔ `In Kitchen` ➔ `Out For Delivery` ➔ `Delivered`).
- **Tabbed History**: Compiled log of active and historical transactions with quick-track pathways.

### 📊 Admin Console Dashboard
- **Aggregate KPIs**: Core widgets summarizing total sales revenue, active users, pending dispatches, and active stock warnings.
- **CSS Trend Graphs**: Weekly charts illustrating daily sales volume aggregates.
- **Live Inventory Manager**: Table indicating quantities, warning limits, prices, and timestamped audit logs. Enables instant restocking.
- **Live Order Control**: Status updates, cancels, customer reviews, and payment logs.

### ⚙️ Automation & Security
- **Cron Stock Daemon**: Runs a `node-cron` schedule to monitor inventory. If items fall below warnings limits, it automatically emails the Admin.
- **Email Sandbox Fallback**: Auto-generates a mock Ethereal SMTP inbox account if default SMTP keys are missing.
- **HTTP Hardening**: Mounted with Helmet headers, CORS policies, and Rate Limiter constraints.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, React Icons, React Hook Form
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose (Schemas for Users, Orders, Inventory, Tokens)
- **Email**: Nodemailer (with auto Ethereal Mail fallback)
- **Payments**: Razorpay Node SDK (Checkout)
- **Real-time Sync**: Socket.IO
- **Schedules**: node-cron

---

## 📂 Folder Structure

```
/WebDev-L3-Pizzadelivery
├── backend/
│   ├── config/          # Database, Razorpay, and Mailer configurations
│   ├── controllers/     # Authentication, Inventory, and Order controllers
│   ├── middleware/      # Auth validation, Admin protection, Error handlers
│   ├── models/          # Mongoose Schemas (User, Order, Inventory, Token)
│   ├── routes/          # API endpoints (Auth, Inventory, Orders)
│   ├── services/        # Nodemailer and email templates
│   ├── socket/          # Socket.io connection mapping
│   ├── utils/           # Database seeding (initial inventory and Admin user)
│   ├── cron/            # Scheduled inventory stock check jobs
│   ├── .env             # Environment configuration (active)
│   ├── package.json
│   └── server.js        # Backend entrypoint bootstrap
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, ErrorBoundary
    │   ├── pages/       # Login, Register, Dashboards, Customizer, Checkout, Tracker
    │   ├── context/     # AuthContext, ThemeContext, ToastContext
    │   ├── utils/       # Axios and Socket connections
    │   ├── App.jsx      # Route controllers and protected paths
    │   ├── index.css    # Tailwind directives and Glassmorphism styling variables
    │   └── main.jsx     # Root mount
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env             # Environment variables
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `/backend` folder:
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pizzapilot
JWT_SECRET=pizzapilot_jwt_secret_key_98765
FRONTEND_URL=http://localhost:5173

# Admin Seeding
ADMIN_EMAIL=admin@pizzapilot.com
ADMIN_PASSWORD=AdminPilot@123

# Razorpay Test Credentials (Get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP Credentials (Optional - Ethereal sandbox automatically configured if left empty)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `/frontend` folder:
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏁 Installation & Startup

### Prerequisites
- Node.js installed
- MongoDB server running locally or a MongoDB Atlas URI

### Step 1: Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the server (deploys in dev mode using nodemon):
   ```bash
   npm run dev
   ```
   *Note: On startup, the seeder will auto-populate the inventory database with 5 bases, 5 sauces, cheeses, veggies, and configure the default Admin account.*

### Step 2: Start the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open the browser and visit: `http://localhost:5173`

---

## 🧪 Admin Test Credentials
To access the Admin Console dashboard, log in with the seeded credentials:
- **Email**: `admin@pizzapilot.com`
- **Password**: `AdminPilot@123`

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Registers new user and sends verification email.
- `GET /verify/:token`: Verifies token and activates account.
- `POST /login`: Validates credentials, signs JWT.
- `POST /forgot-password`: Dispatches reset instructions.
- `POST /reset-password`: Updates password using token.
- `GET /me`: Returns current user session (Protected).

### Inventory (`/api/inventory`)
- `GET /`: Lists all active ingredients (Protected).
- `PUT /:id`: Updates quantity, price, threshold (Admin only).

### Orders (`/api/orders`)
- `POST /`: Places custom order, returns Razorpay payload (Protected).
- `POST /verify`: Verifies payment signature, deducts stock (Protected).
- `GET /`: Lists completed user purchases (Protected).
- `GET /:id`: Retrieves receipt details (Protected).
- `GET /admin/all`: Lists all orders in database (Admin only).
- `PUT /admin/status/:id`: Transitions tracking states (Admin only).
- `PUT /admin/cancel/:id`: Cancels order, refunds stock (Admin only).
- `GET /admin/dashboard-stats`: Compiles dashboard metrics & aggregates (Admin only).

---

## SCREENSHOTS 

<img width="1920" height="1020" alt="Screenshot 2026-07-04 104555" src="https://github.com/user-attachments/assets/024e6e03-0537-495e-bc3c-d72838c43931" />
<img width="1920" height="1020" alt="Screenshot 2026-07-04 104547" src="https://github.com/user-attachments/assets/53e64843-fd47-4364-a673-3f9695f13990" />
<img width="1920" height="1020" alt="Screenshot 2026-07-04 104535" src="https://github.com/user-attachments/assets/c09b2007-6f4e-489c-9dd7-4776348cb2b5" />
<img width="1920" height="1020" alt="Screenshot 2026-07-04 104502" src="https://github.com/user-attachments/assets/f99e0cf9-9f56-4631-884d-c3c017c4e300" />
<img width="1920" height="1020" alt="Screenshot 2026-07-04 110345" src="https://github.com/user-attachments/assets/627ca862-b2e3-494b-a526-0604ebd8112d" />
<img width="1920" height="1020" alt="Screenshot 2026-07-04 110410" src="https://github.com/user-attachments/assets/2adfddcc-e7da-4848-9a19-d16adbbcd8ac" />


## 📝 License
This project is developed as an Internship evaluation project. Free to showcase in portfolios.

## AUTHOR 
G VARUN 
Web development Intern at Oasis Infobyte
