
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ExpenseCard from "../components/ExpenseCard.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import { getExpenses, updateExpense, deleteExpense, BASE_URL } from "../services/api.js";

const CATEGORY_OPTIONS = ["All", "Food", "Shopping", "Travel", "Bills", "Education", "Others"];

export default function ExpenseHistory() {
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [editingExpense, setEditingExpense] = useState(null); // null = no modal open
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null); // expense pending delete confirmation
  const [banner, setBanner] = useState(location.state?.message || "");

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      setLoadError("");
    } catch (err) {
      setLoadError(`Could not reach the backend at ${BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // useMemo recalculates the filtered list only when expenses/search/category
  // actually change, instead of on every re-render - a small performance habit.
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
      .slice()
      .reverse(); // show newest first
  }, [expenses, search, category]);

  // ---- Edit flow ----
  const handleEditClick = (expense) => {
    setEditError("");
    setEditingExpense(expense);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateExpense(editingExpense.id, formData);
      setEditingExpense(null);
      setBanner("Expense updated successfully.");
      loadExpenses();
    } catch (err) {
      setEditError("Could not update the expense. Please try again.");
    }
  };

  // ---- Delete flow ----
  const handleDeleteClick = (expense) => setDeleteTarget(expense);

  const confirmDelete = async () => {
    try {
      await deleteExpense(deleteTarget.id);
      setDeleteTarget(null);
      setBanner("Expense deleted successfully.");
      loadExpenses();
    } catch (err) {
      setDeleteTarget(null);
      setBanner(""); // clear, then show error below instead
      setLoadError("Could not delete the expense. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 style={{ marginBottom: 24 }}>Expense History</h1>

        {banner && <div className="banner banner-success">{banner}</div>}
        {loadError && <div className="banner banner-error">{loadError}</div>}

        {/* ---- Search + filter controls ---- */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            style={{ maxWidth: 280 }}
            placeholder="Search by expense name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select style={{ maxWidth: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading && <p>Loading expenses...</p>}

        {!loading && filteredExpenses.length === 0 && (
          <p style={{ fontSize: 14 }}>No expenses match your search/filter.</p>
        )}

        {!loading &&
          filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
      </div>

      {/* ---- Edit modal ---- */}
      {editingExpense && (
        <Modal onClose={() => setEditingExpense(null)} title={`Edit ${editingExpense.id}`}>
          {editError && <div className="banner banner-error">{editError}</div>}
          <ExpenseForm
            initialValues={editingExpense}
            onSubmit={handleEditSubmit}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {/* ---- Delete confirmation dialog ---- */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} title="Delete Expense">
          <p style={{ marginBottom: 20 }}>
            Are you sure you want to delete this expense?
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// A tiny reusable modal/overlay - kept in this file since it's only
// used here, unlike Navbar/ExpenseCard/ExpenseForm which are shared
// across multiple pages.
function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()} // prevent clicks inside from closing the modal
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button className="btn" onClick={onClose} style={{ padding: "4px 10px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
