
export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        marginBottom: 10,
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{expense.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
          {expense.category} · {expense.date} · {expense.payment_method}
          {expense.id ? ` · ${expense.id}` : ""}
        </div>
      </div>

      <div className="amount negative" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
        -₹{expense.amount.toLocaleString("en-IN")}
      </div>

      {showActions && (
        <div style={{ display: "flex", gap: 8 }}>
          {onEdit && (
            <button className="btn" onClick={() => onEdit(expense)} style={{ padding: "6px 12px" }}>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(expense)}
              style={{ padding: "6px 12px" }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
