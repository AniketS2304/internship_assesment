# ⚡ TaskFlow — Full Stack Task Manager

A fully functional full-stack web application built as an internship assessment.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark Theme + Glassmorphism) |
| Backend | Node.js + Express |
| Database | SQLite (via sqlite3) |
| Auth | JWT + bcrypt |

## 🚀 Local Setup

### Prerequisites
- Node.js v16+
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit JWT_SECRET
npm start
```

Server runs at: **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login and get JWT |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/tasks | ✅ | Get all tasks |
| POST | /api/tasks | ✅ | Create task |
| PUT | /api/tasks/:id | ✅ | Update task |
| DELETE | /api/tasks/:id | ✅ | Delete task |

---

## ☁️ Deployment Guide

### Frontend → Vercel

1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set env var: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo, set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add env vars:
   - `JWT_SECRET` = (any long random string)
   - `FRONTEND_URL` = (your Vercel URL)
6. Deploy!

---

## ✨ Features

- ✅ Real user authentication (register/login/logout)
- ✅ JWT-based session management
- ✅ Full CRUD task management
- ✅ Filter tasks by status & priority
- ✅ Search tasks in real-time
- ✅ Mark tasks as done/pending with one click
- ✅ Beautiful dark UI with glassmorphism
- ✅ Responsive mobile layout
- ✅ Toast notifications
- ✅ Protected routes
# internship_assesment
