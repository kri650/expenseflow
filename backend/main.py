from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import FundsRequest, ExpenseCreate, ExpenseUpdate
import services

app = FastAPI(title="ExpenseFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://expenseflow-ten-ruddy.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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


@app.get("/expenses")
def list_expenses():
    return services.get_all_expenses()


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
