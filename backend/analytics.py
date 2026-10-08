"""
analytics.py
------------
Reports calculated from the stored expenses.
It reads data through services.py, never the JSON file directly.
"""

import csv
import io
from collections import defaultdict

import services


def get_statistics() -> dict:
    """Total, average, highest and count of all expenses."""
    expenses = services.get_all_expenses()
    if not expenses:
        return {"total": 0, "average": 0, "highest": 0, "count": 0}

    amounts = [e["amount"] for e in expenses]
    total = sum(amounts)
    return {
        "total": total,
        "average": round(total / len(amounts), 2),
        "highest": max(amounts),
        "count": len(amounts),
    }


def get_monthly_summary() -> dict:
    """Total spending per month, e.g. {"2026-09": 4200}."""
    totals = defaultdict(float)
    for e in services.get_all_expenses():
        month = e["date"][:7]          # "2026-09-25" -> "2026-09"
        totals[month] += e["amount"]
    return dict(sorted(totals.items()))


def get_category_summary() -> dict:
    """Total spending per category, e.g. {"Food": 1200}."""
    totals = defaultdict(float)
    for e in services.get_all_expenses():
        totals[e["category"]] += e["amount"]
    return dict(totals)


def export_csv() -> str:
    """Return all expenses as CSV text."""
    expenses = services.get_all_expenses()
    columns = ["id", "name", "amount", "category", "date", "payment_method", "description"]

    buffer = io.StringIO()               # an in-memory "fake file"
    writer = csv.DictWriter(buffer, fieldnames=columns)
    writer.writeheader()
    writer.writerows(expenses)
    return buffer.getvalue()