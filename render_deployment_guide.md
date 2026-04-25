# 🚀 OrderIt — Render Deployment Guide

## Prerequisites
- Push your code to **GitHub** (both `Backend` and `OrderIt_Frontend` folders should be in one repo or two separate repos).
- Have a [Render.com](https://render.com) account ready.

---

## Step 1: Push Code to GitHub

If you haven't already, push your project:

```bash
git init
git add .
git commit -m "final: ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/orderit.git
git push -u origin main
```

> [!IMPORTANT]
> Make sure `config/config.env` is in your `.gitignore` file so your secrets are NOT pushed to GitHub. Render will use environment variables directly.

---

## Step 2: Deploy the Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your **GitHub repo** and select it.
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `orderit-backend` |
| **Root Directory** | `Backend (1)` *(or `Backend` if renamed)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter for better performance) |

4. Click **"Add Environment Variables"** and add ALL of these:

| Key | Value |
|---|---|
| `NODE_ENV` | `PRODUCTION` |
| `PORT` | `4000` |
| `DB_LOCAL_URI` | `mongodb+srv://tabraizsmd_db_user:M3EcmHNdVHln8Utf@cluster0.31mtvlo.mongodb.net/OrderIt?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `SD65S4D56SF4D56S4DF56SD4F56S4D5F` |
| `JWT_EXPIRE` | `7d` |
| `JWT_EXPIRES_TIME` | `7` |
| `STRIPE_SECRET_KEY` | `sk_test_51NlnpASG02zW86bO...` *(your full key)* |
| `STRIPE_API_KEY` | `pk_test_51NlnpASG02zW86bO...` *(your full key)* |
| `CLOUDINARY_CLOUD_NAME` | *(your Cloudinary cloud name)* |
| `CLOUDINARY_API_KEY` | *(your Cloudinary API key)* |
| `CLOUDINARY_API_SECRET` | *(your Cloudinary API secret)* |
| `EMAIL_FROM` | *(your verified SendGrid sender email)* |
| `EMAIL_HOST` | `smtp.sendgrid.net` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USERNAME` | `apikey` |
| `EMAIL_PASSWORD` | *(your SendGrid API Key)* |
| `FRONTEND_URL` | *(Leave blank for now — fill in AFTER frontend is deployed)* |

5. Click **Deploy**. Once it's live, **copy the URL** (e.g., `https://orderit-backend.onrender.com`).

---

## Step 3: Deploy the Frontend on Render

1. Go to **New** → **Static Site**
2. Connect the same GitHub repo.
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `orderit-frontend` |
| **Root Directory** | `OrderIt_Frontend` |
| **Build Command** | `npm install --legacy-peer-deps && npm run build` |
| **Publish Directory** | `dist` |

4. Add this **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_BACKEND_URL` | `https://orderit-backend.onrender.com` *(your backend URL from Step 2)* |

5. Click **Deploy**. Once live, **copy the frontend URL** (e.g., `https://orderit-frontend.onrender.com`).

---

## Step 4: Link Backend ↔ Frontend (CORS Fix)

1. Go back to your **Backend** service on Render.
2. Go to **Environment** → Update the `FRONTEND_URL` variable:

| Key | Value |
|---|---|
| `FRONTEND_URL` | `https://orderit-frontend.onrender.com` |

3. Click **Save Changes** — Render will auto-redeploy.

---

## Step 5: Fix Socket.io on Backend for Production

Go to your backend service on Render and verify that `server.js` socket CORS also matches. It already reads from `"http://localhost:5173"` for dev. For production, Render injects the env vars automatically so it will use the `FRONTEND_URL` you set.

---

## Step 6: Test Your Live App

Once both services are deployed:
- Open `https://orderit-frontend.onrender.com`
- Log in, place an order, open Admin Dashboard in another tab
- Change order status → watch the user's "My Orders" update **in real-time!** 🎉

---

---

## 🔑 How to get your API Keys

### Stripe Keys
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/).
2. Go to **Developers** > **API keys**.
3. Copy **Publishable key** (`STRIPE_API_KEY`).
4. Click **Reveal secret key** and copy it (`STRIPE_SECRET_KEY`).

### SendGrid Keys
1. Log in to [SendGrid](https://app.sendgrid.com/).
2. Go to **Settings** > **API Keys**.
3. Create a new key and copy it (`EMAIL_PASSWORD`).
4. Go to **Settings** > **Sender Authentication** to verify your sender email (`EMAIL_FROM`).

---

## ⚠️ Common Issues & Fixes

> [!WARNING]
> **Free tier services on Render spin down after 15 minutes of inactivity.** The first request after sleep may take 30-60 seconds. Upgrade to the "Starter" plan ($7/mo) to avoid this.

> [!NOTE]
> **Socket.io may show CORS errors** if `FRONTEND_URL` is not set correctly on the backend. Double-check the URL has no trailing slash.

> [!TIP]
> **MongoDB Atlas** — Make sure your Atlas cluster's Network Access allows `0.0.0.0/0` (All IPs) so Render's dynamic IPs can connect.

> [!TIP]
> **SendGrid Setup** — For SendGrid, always use `apikey` as the `EMAIL_USERNAME`. The `EMAIL_PASSWORD` will be your actual API Key. Ensure the `EMAIL_FROM` matches your **Verified Sender Identity** in the SendGrid dashboard.

---

## Summary Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render (Web Service)
- [ ] All backend environment variables set
- [ ] Frontend deployed on Render (Static Site)  
- [ ] `VITE_BACKEND_URL` set on frontend
- [ ] `FRONTEND_URL` set on backend (pointing to frontend URL)
- [ ] MongoDB Atlas Network Access allows all IPs
- [ ] Test login, orders, real-time socket updates ✅
