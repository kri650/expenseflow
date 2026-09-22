# ExpenseFlow — Frontend

React app built with Vite. Talks to the FastAPI backend at `http://127.0.0.1:8000`.

## Setup

```bash
cd frontend
npm install
```

## Run

**Make sure the backend is running first** (see `../backend/README.md`),
then in a separate terminal:

```bash
npm run dev
```

Open **http://localhost:5173**

## Pages

| Route | Page |
|---|---|
| `/` | Landing |
| `/dashboard` | Dashboard |
| `/add-expense` | Add Expense |
| `/history` | Expense History |

## Structure

| Path | Responsibility |
|---|---|
| `src/services/api.js` | All Axios calls — the only file talking to the backend |
| `src/context/ThemeContext.jsx` | Light/dark mode state, shared app-wide |
| `src/components/` | Reusable pieces (Navbar, ExpenseForm, ExpenseCard) |
| `src/pages/` | The 4 pages above |
