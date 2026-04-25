# OrderIt - Food Ordering Application 🍔🍕🥗

A fully functional, MERN-stack based food ordering website. This project provides a seamless user experience for browsing restaurants, viewing menus, adding items to a cart, user authentication, and admin controls. Let's dig in and satisfy your cravings!

---

## 🌟 Features

*   **Modern Premium UI/UX:** Clean, responsive, glassmorphism-inspired design with sleek hover animations. 🎨
*   **User Authentication:** Secure signup, login, and password management powered by JWT. 🔒
*   **Restaurant Browsing & Search:** Dynamically loads seeded local restaurants with reviews, sentiment analysis, and top mentions.
*   **Menu & Cart System:** Dynamic menu rendering and fully functional persistent cart management. 🛒
*   **Admin Controls:** Delete restaurants and manage operations directly from the UI.
*   **Local Database Seamlessness:** Automatic local MongoDB seeding—no complicated Atlas setup required!

---

## 🛠️ Technology Stack

**Frontend:**
*   React 19 (via Vite)
*   Redux Toolkit & React-Redux (State Management)
*   React Router DOM (Routing)
*   React Toastify (Notifications)
*   Bootstrap & Modern Custom CSS 🌈

**Backend:**
*   Node.js & Express.js
*   MongoDB (Local + EJSON dynamic import script)
*   Mongoose
*   Bcrypt & JSON Web Tokens (Security)
*   Cloudinary / Multer (Storage)

---

## 🚀 How to Run Locally

### 1. Prerequisites
*   [Node.js](https://nodejs.org/en/) installed on your machine.
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally.

### 2. Backend Setup
The backend is housed in the `Backend (1)` directory.

```bash
# Navigate to the backend directory
cd "Backend (1)"

# Install dependencies
npm install

# Seed the local Database!
# This connects to 127.0.0.1:27017 and imports all JSON backups for you.
node importDb.js

# Start the Backend Server (runs on port 4000)
npm run dev
```

### 3. Frontend Setup
The frontend is housed in the `OrderIt_Frontend` directory.

```bash
# Open a new terminal window/tab
# Navigate to the frontend directory
cd OrderIt_Frontend

# Install dependencies (use --force or --legacy-peer-deps if needed)
npm install

# Start the Vite Development Server (runs on port 5173)
npm run dev
```

### 4. Enjoy! 🎉
Open your browser and navigate to `http://localhost:5173/` to see the application in action.

---

## 🗂️ Folder Structure Roadmap
*   **`Backend (1)/`**: Core Express APIs, models, routes, connection scripts, and `config.env`.
*   **`OrderIt_Frontend/src/`**: All React components, Redux slices/actions, Layouts, CSS, and views.
*   **`Database-20260418/`**: Holds the original JSON dumps that the `importDb.js` script processes.

Happy Coding and Bon Appétit! 🍲
