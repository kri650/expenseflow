"""
services.py
------------
This file is the "brain" of the backend. It's the only part of the code
that touches the JSON file directly. main.py (the API routes) calls these
functions instead of reading/writing the file itself - that way all the
file-handling logic lives in ONE place.
"""

import json
import os
from typing import Optional
from models import ExpenseCreate, ExpenseUpdate, Expense

# Path to our "database" file, relative to this script's location.
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "data.json")


# ---------- Low-level file helpers ----------

def _read_data() -> dict:
    """Load the entire JSON file into a Python dictionary."""
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def _write_data(data: dict) -> None:
    """Save a Python dictionary back into the JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ---------- Funds ----------

def add_funds(amount: float) -> float:
    """Add `amount` to the current funds total. Returns the new total."""
    data = _read_data()
    data["funds"] = data.get("funds", 0) + amount
    _write_data(data)
    return data["funds"]


# ---------- Dashboard ----------

def get_dashboard() -> dict:
    """Calculate the four dashboard numbers from stored data."""
    data = _read_data()
    expenses = data.get("expenses", [])

    total_funds = data.get("funds", 0)
    total_expenses = sum(e["amount"] for e in expenses)
    remaining_balance = total_funds - total_expenses
    total_transactions = len(expenses)

    return {
        "total_funds": total_funds,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance,
        "total_transactions": total_transactions,
    }


# ---------- Expenses (CRUD) ----------

def _generate_next_id(expenses: list) -> str:
    """
    Create the next Expense ID, e.g. EXP-001, EXP-002, ...
    We look at the highest existing number and add 1.
    """
    if not expenses:
        return "EXP-001"
    numbers = [int(e["id"].split("-")[1]) for e in expenses]
    next_number = max(numbers) + 1
    return f"EXP-{next_number:03d}"  # :03d pads with zeros, e.g. 3 -> "003"


def create_expense(expense: ExpenseCreate) -> dict:
    """Add a new expense to storage and return it (with its new ID)."""
    data = _read_data()
    expenses = data.get("expenses", [])

    new_id = _generate_next_id(expenses)
    new_expense = {"id": new_id, **expense.dict()}

    expenses.append(new_expense)
    data["expenses"] = expenses
    _write_data(data)

    return new_expense


def get_all_expenses() -> list:
    """Return every stored expense."""
    data = _read_data()
    return data.get("expenses", [])


def get_expense_by_id(expense_id: str) -> Optional[dict]:
    """Find one expense by its ID. Returns None if not found."""
    expenses = get_all_expenses()
    for e in expenses:
        if e["id"] == expense_id:
            return e
    return None


def search_expenses(
    category: Optional[str] = None,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    keyword: Optional[str] = None,
    sort_by: str = "id",
    order: str = "asc",
    page: int = 1,
    limit: Optional[int] = None,
) -> list:
    """Filter, sort and paginate expenses."""
    expenses = get_all_expenses()

    # --- Filtering (each filter only runs if the user supplied it) ---
    if category:
        expenses = [e for e in expenses if e["category"].lower() == category.lower()]
    if date:
        expenses = [e for e in expenses if e["date"] == date]
    if start_date:
        expenses = [e for e in expenses if e["date"] >= start_date]
    if end_date:
        expenses = [e for e in expenses if e["date"] <= end_date]
    if keyword:
        k = keyword.lower()
        expenses = [
            e for e in expenses
            if k in e["name"].lower() or k in (e.get("description") or "").lower()
        ]

    # --- Sorting ---
    expenses = sorted(expenses, key=lambda e: e[sort_by], reverse=(order == "desc"))

    # --- Pagination ---
    if limit:
        start = (page - 1) * limit
        expenses = expenses[start:start + limit]

    return expenses


def update_expense(expense_id: str, updated: ExpenseUpdate) -> Optional[dict]:
    """Replace an existing expense's fields, keeping its original ID."""
    data = _read_data()
    expenses = data.get("expenses", [])

    for i, e in enumerate(expenses):
        if e["id"] == expense_id:
            expenses[i] = {"id": expense_id, **updated.dict()}
            data["expenses"] = expenses
            _write_data(data)
            return expenses[i]

    return None  # not found


def delete_expense(expense_id: str) -> bool:
    """Remove an expense by ID. Returns True if something was deleted."""
    data = _read_data()
    expenses = data.get("expenses", [])

    new_expenses = [e for e in expenses if e["id"] != expense_id]
    if len(new_expenses) == len(expenses):
        return False  # nothing was removed - id didn't exist

    data["expenses"] = new_expenses
    _write_data(data)
    return True