# 🍷 Georgian Restaurant Chain — Full-Stack Web Application

A full-stack restaurant management, food ordering, and table reservation platform built for a Georgian restaurant chain in Dnipro. The application implements Role-Based Access Control (RBAC) for **Guests**, **Customers**, **Waiters**, and **Administrators**.

---

## 🚀 Tech Stack

### **Frontend**
* **Framework:** Angular (Standalone Components, Signals, Reactive Forms)
* **UI & Styling:** Angular Material, Custom SCSS, CSS Custom Properties (Light / Dark Theme)
* **PDF Generation:** `jspdf` & `jspdf-autotable`
* **Architecture:** Functional Route Guards, HTTP JWT Interceptor, Responsive Mobile Burger Menu

### **Backend**
* **Runtime & Framework:** Node.js, Express.js
* **Database:** MongoDB Atlas & Mongoose ODM
* **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`)
* **File Uploads:** `multer` (for dish images)

---

## 👥 User Roles & Features

### 1. **Guest (Unauthenticated User)**
* Browse the interactive dish menu with live search by name and price sorting (Low-to-High / High-to-Low).
* Explore restaurant locations in Dnipro, interiors, working hours, and guest reviews.
* Redirected seamlessly to Sign Up -> Table Booking flow when clicking **Book a table**.
* Toggle between **Light** and **Dark** themes.

### 2. **Customer**
* **Personal Shopping Cart:** Add/remove dishes and adjust quantities in a slide-out cart drawer persisted per user in MongoDB.
* **Order Checkout:** Submit orders with instant confirmation feedback.
* **Table Reservations:** Book tables using an interactive timeline with real-time slot conflict detection (including 30-minute buffer intervals and timezone awareness).
* **Reviews:** Leave and edit a personal star rating (1–5) and review for each restaurant.
* **Profile Management:** Update first/second name, view **Order History** and **Booking History**, or delete the account.

### 3. **Waiter**
* **Live Orders Dashboard:** View incoming customer orders (`In progress`) and mark them as `Completed`.
* **Table Reservations Management:** View all reservations with customer details, filter by date, and export filtered reports to **PDF**.

### 4. **Admin**
* **Menu Management (CRUD):** Create new dishes with image uploads, edit existing dishes (name, description, price, image), and delete dishes directly from the menu.
* **Customer Directory:** View the list of all registered customers.

---

## 🔑 Demo Credentials

The backend automatically seeds the database with default **Admin** and **Waiter** accounts on startup:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `admin123` |
| **Waiter** | `waiter@test.com` | `waiter123` |
| **Customer** | *Register via Sign Up* | *Any password* |

---

## ⚙️ Installation & Local Setup

### Prerequisites
* Node.js (v18+ recommended)
* Angular CLI (`npm install -g @angular/cli`)
* MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and add your configuration:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/restaurant_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:
```bash
node server.js
```
*The server will run on `http://localhost:3000` and automatically seed the initial roles and sample dish.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
ng serve
```
Navigate to `http://localhost:4200/` in your browser.

---

## 📁 Project Structure

```text
├── backend/
│   ├── models/          # Mongoose schemas (User, Dish, Cart, Order, Booking, Review)
│   ├── routes/          # Modular Express routers (restaurants, bookings, customer)
│   ├── services/        # Business logic (timeline calculation & conflict checks)
│   ├── public/          # Static assets & uploaded dish images
│   ├── .env             # Environment variables (excluded from Git)
│   └── server.js        # Entry point & auth/admin/order endpoints
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── components/   # Navbar, Footer, Cart Drawer, Modals (Login, Register, Booking, Review, Edit)
        │   ├── guards/       # Functional route guards (admin, waiter, customer, not-waiter)
        │   ├── interceptors/ # JWT Bearer token HTTP interceptor
        │   └── services/     # State management with Angular Signals (Auth, Cart, Dishes, Orders, Theme)
        ├── pages/            # Route views (Home, Restaurants, Restaurant Detail, About, Admin, Orders, Reservations, Profile)
        └── shared/           # Reusable UI components (Button, Spinner)
```
