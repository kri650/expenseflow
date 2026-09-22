# ExpenseFlow — Backend

FastAPI server that handles all data operations. Stores data in `data/data.json`.

Deployed URL: https://expenseflow-7tdl.vercel.app

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

The server starts at **http://127.0.0.1:8000**

Open **http://127.0.0.1:8000/docs** — FastAPI auto-generates an interactive
page where you can try every endpoint directly in the browser, no frontend
needed. Great for testing while you learn.

## Files

| File | Responsibility |
|---|---|
| `main.py` | Defines the 7 API routes (URLs the frontend calls) |
| `models.py` | Pydantic models — validates incoming request data |
| `services.py` | Reads/writes `data.json`, all business logic |
| `data/data.json` | The "database" — funds + all expenses |
