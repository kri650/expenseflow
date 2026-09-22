import json
import os
from typing import Optional
from models import ExpenseCreate, ExpenseUpdate, Expense

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "data.json")

def _read_data() -> dict:
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def _write_data(data: dict) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)



def add_funds(amount: float) -> float:
    data = _read_data()
    data["funds"] = data.get("funds", 0) + amount
    _write_data(data)
    return data["funds"]



def get_dashboard() -> dict:
    data = _read_data()
    expenses = data.get("expenses", [])

    total_funds = data.get("funds", 0)
    total_expenses = sum(e["amount"] for e in expenses) #generator expression
    remaining_balance = total_funds - total_expenses
    total_transactions = len(expenses)

    return {
        "total_funds": total_funds,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance,
        "total_transactions": total_transactions,
    }



def _generate_next_id(expenses: list) -> str:
   
    if not expenses:
        return "EXP-001"
    numbers = [int(e["id"].split("-")[1]) for e in expenses]
    next_number = max(numbers) + 1
    return f"EXP-{next_number:03d}" 


def create_expense(expense: ExpenseCreate) -> dict:
    data = _read_data()
    expenses = data.get("expenses", [])

    new_id = _generate_next_id(expenses)
    new_expense = {"id": new_id, **expense.dict()}

    expenses.append(new_expense)
    data["expenses"] = expenses
    _write_data(data)

    return new_expense


def get_all_expenses() -> list:
    data = _read_data()
    return data.get("expenses", [])


def get_expense_by_id(expense_id: str) -> Optional[dict]:
    expenses = get_all_expenses()
    for e in expenses:
        if e["id"] == expense_id:
            return e
    return None


def update_expense(expense_id: str, updated: ExpenseUpdate) -> Optional[dict]:
    data = _read_data()
    expenses = data.get("expenses", [])

    for i, e in enumerate(expenses):
        if e["id"] == expense_id:
            expenses[i] = {"id": expense_id, **updated.dict()}
            data["expenses"] = expenses
            _write_data(data)
            return expenses[i]

    return None  


def delete_expense(expense_id: str) -> bool:
    data = _read_data()
    expenses = data.get("expenses", [])

    new_expenses = [e for e in expenses if e["id"] != expense_id]
    if len(new_expenses) == len(expenses):
        return False  

    data["expenses"] = new_expenses
    _write_data(data)
    return True
