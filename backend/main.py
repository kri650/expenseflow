from typing import Optional, Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from models import FundsRequest, ExpenseCreate, ExpenseUpdate
import services
import analytics

app = FastAPI(title="ExpenseFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://expenseflow-ten-ruddy.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://expenseflow.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ExpenseFlow API"}


@app.post("/funds")
def add_funds(payload: FundsRequest):
    new_total = services.add_funds(payload.amount)
    return {"message": "Funds added successfully", "total_funds": new_total}


@app.get("/dashboard")
def get_dashboard():
    return services.get_dashboard()


@app.post("/expenses", status_code=201)
def create_expense(expense: ExpenseCreate):
    return services.create_expense(expense)


# NEW: same route, now with optional filters/sorting/pagination.
# With no query parameters it returns the full list exactly as before,
# so the live React app keeps working.
@app.get("/expenses")
def list_expenses(
    category: Optional[str] = None,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    keyword: Optional[str] = None,
    sort_by: Literal["id", "date", "amount", "name", "category"] = "id",
    order: Literal["asc", "desc"] = "asc",
    page: int = Query(1, ge=1),
    limit: Optional[int] = Query(None, ge=1, le=100),
):
    return services.search_expenses(
        category, date, start_date, end_date, keyword, sort_by, order, page, limit
    )


@app.get("/expenses/{expense_id}")
def get_expense(expense_id: str):
    expense = services.get_expense_by_id(expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return expense


@app.put("/expenses/{expense_id}")
def update_expense(expense_id: str, expense: ExpenseUpdate):
    updated = services.update_expense(expense_id, expense)
    if updated is None:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return updated


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    deleted = services.delete_expense(expense_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return {"message": "Expense deleted successfully"}


# NEW: reports
@app.get("/reports/statistics")
def report_statistics():
    return analytics.get_statistics()


@app.get("/reports/monthly")
def report_monthly():
    return analytics.get_monthly_summary()


@app.get("/reports/category")
def report_category():
    return analytics.get_category_summary()


@app.get("/reports/export")
def report_export():
    return Response(
        content=analytics.export_csv(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"},
    )