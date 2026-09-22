# ExpenseFlow — Frontend

React app built with Vite. Talks to the deployed FastAPI backend at
`https://expenseflow-7tdl.vercel.app`.

Deployed frontend: https://expenseflow-ten-ruddy.vercel.app/dashboard

## Setup

```bash
cd frontend
npm install
```

## Run

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
