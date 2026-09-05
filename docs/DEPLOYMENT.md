# Deployment Guide — Revenue Recovery Brain

This guide provides step-by-step instructions for deploying the **Revenue Recovery Brain** platform to production environments.

---

## Architecture Overview

| Component | Technology | Recommended Host | Production Command |
| :--- | :--- | :--- | :--- |
| **Backend API** | Python 3.11, FastAPI, SQLAlchemy | Render, Railway, AWS ECS | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Frontend UI** | React 19, Vite, TypeScript | Vercel, Netlify, Render Static | `npm run build` (outputs to `/dist`) |
| **Storage / Ledgers** | SQLite / PostgreSQL | Render Managed Postgres / Persistent Disk | Auto-seeded on startup |

---

## Option 1: 1-Click Full-Stack Deployment on Render (Recommended)

The repository includes a ready-to-deploy `render.yaml` Blueprint that provisions both backend and frontend services.

1. Push this repository to your GitHub account.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New** → **Blueprint**.
4. Connect your GitHub repository: `Razorpay-Recovery-Brain`.
5. Render will automatically detect `render.yaml` and configure:
   - **`revenue-recovery-api`**: Python web service with health checks at `/health`.
   - **`revenue-recovery-frontend`**: Static web app automatically wired with the backend's live URL (`VITE_API_BASE_URL`).
6. Set the required environment variables when prompted:
   - `RAZORPAY_KEY_ID`: Your Razorpay test or live Key ID.
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret.
   - `RAZORPAY_WEBHOOK_SECRET`: Webhook verification secret.
   - `TWILIO_ACCOUNT_SID` *(optional for voice)*
   - `TWILIO_AUTH_TOKEN` *(optional for voice)*
   - `TWILIO_FROM_NUMBER` *(optional for voice)*
7. Click **Apply**. Deployment will complete in under 3 minutes.

---

## Option 2: Split Deployment (Vercel Frontend + Render Backend)

### Step A: Deploy the Backend on Render or Railway
1. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to `Python 3`.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add environment variables from `.env.example`.
7. Note down your backend URL (e.g., `https://revenue-recovery-api.onrender.com`).

### Step B: Deploy the Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com) → **Add New Project**.
2. Select the repository: `Razorpay-Recovery-Brain`.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://revenue-recovery-api.onrender.com` (your backend URL).
8. Click **Deploy**. Vercel will automatically handle client-side routing via `frontend/vercel.json`.

---

## Option 3: Docker Container Deployment

The repository includes multi-stage Dockerfiles and `docker-compose.yml` for containerized environments.

### Local or Cloud VM (Single Command):
```bash
# Clone the repository
git clone https://github.com/himanshu-2l/Razorpay-Recovery-Brain.git
cd Razorpay-Recovery-Brain

# Start Postgres, Backend, and Frontend containers
docker compose up -d --build
```

### Endpoints:
- **Frontend Dashboard & Showcase**: `http://localhost:5173`
- **FastAPI Documentation (Swagger)**: `http://localhost:8000/docs`
- **API Health Check**: `http://localhost:8000/health`

---

## Option 4: Production Environment Variables Reference

| Variable | Description | Required? |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public URL of the FastAPI backend | Yes (Frontend) |
| `PORT` | HTTP port for FastAPI (default: `8000`) | Managed by host |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID | Recommended |
| `RAZORPAY_KEY_SECRET` | Razorpay Merchant Key Secret | Recommended |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify incoming Razorpay webhook HMACs | Recommended |
| `DATABASE_URL` | PostgreSQL connection URL (falls back to SQLite if omitted) | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio SID for automated voice calls | Optional |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Optional |
| `TWILIO_FROM_NUMBER` | Outbound Twilio caller phone number | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key for advanced case summarization | Optional |

---

## Post-Deployment Verification

1. **Verify Backend Health**:
   ```bash
   curl https://<your-backend-url>/health
   # Expected response: {"status":"healthy","timestamp":...}
   ```

2. **Verify Frontend Connectivity**:
   - Open your deployed frontend URL.
   - Navigate to the **"Live Simulator Sandbox"** section.
   - Click **"Run Intercept"** or switch to the **Operations Console** to ensure real-time API communication and case telemetry render correctly.
