# ExpenseFlow

A simple full-stack expense tracker: React (frontend) + FastAPI (backend) + a JSON file (storage).

Deployed frontend: https://expenseflow-ten-ruddy.vercel.app/dashboard
Deployed backend: https://expenseflow-7tdl.vercel.app

## Quick start

You need **two terminals** open at the same time — one for the backend, one for the frontend.

**Terminal 1 — backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs locally at http://127.0.0.1:8000

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173 ← **open this one in your browser**

The deployed frontend is available at:
https://expenseflow-ten-ruddy.vercel.app/dashboard

## Requirements on your machine

- **Python 3.9+** (check with `python3 --version`)
- **Node.js 18+** (check with `node --version`)

If you don't have these installed, search "install Python" / "install Node.js"
for your OS — both have simple installers.

## How it all connects

```
Browser (localhost:5173)
     |  you click things here
     v
React app  --- Axios request --->  FastAPI (localhost:8000)
     ^                                    |
     |                                    v
     '------ JSON response -------  data/data.json
```

The React app never touches the JSON file directly — every action goes
through the FastAPI backend.

In the current frontend code, API requests go to the deployed backend:
https://expenseflow-7tdl.vercel.app

## What's inside

- `backend/` — FastAPI server, see `backend/README.md`
- `frontend/` — React app, see `frontend/README.md`

Every file has comments explaining what it does and why — that's intentional,
since this is meant as a learning project, not just a working app.
