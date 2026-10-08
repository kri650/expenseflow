import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ExpenseCard from "../components/ExpenseCard.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import {
  getExpenses,
  updateExpense,
  deleteExpense,
  BASE_URL,
  EXPORT_URL,
} from "../services/api.js";

const CATEGORY_OPTIONS = ["All", "Food", "Shopping", "Travel", "Bills", "Education", "Others"];

// Each choice in the "Sort by" dropdown maps to the two query parameters
// the backend understands: sort_by (which field) and order (asc / desc).
const SORT_OPTIONS = {
  newest: { label: "Newest added", sort_by: "id", order: "desc" },
  oldest: { label: "Oldest added", sort_by: "id", order: "asc" },
  date_desc: { label: "Date: latest first", sort_by: "date", order: "desc" },
  date_asc: { label: "Date: earliest first", sort_by: "date", order: "asc" },
  amount_desc: { label: "Amount: high to low", sort_by: "amount", order: "desc" },
  amount_asc: { label: "Amount: low to high", sort_by: "amount", order: "asc" },
};

const PAGE_SIZE = 10;

export default function ExpenseHistory() {
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ---- Filter state ----
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);

  const [editingExpense, setEditingExpense] = useState(null); // null = no modal open
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null); // expense pending delete confirmation
  const [banner, setBanner] = useState(location.state?.message || "");

  // Wait 300ms after the user stops typing before searching, so we
  // don't send a request to the backend on every single keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Whenever a filter or the sort order changes, go back to page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, startDate, endDate, sortKey]);

  // Used to ignore slow, outdated responses: if the user changes a filter
  // while an earlier request is still running, only the newest one counts.
  const latestRequest = useRef(0);

  const loadExpenses = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);

    const sort = SORT_OPTIONS[sortKey];
    const params = {
      sort_by: sort.sort_by,
      order: sort.order,
      limit: PAGE_SIZE,
    };
    if (debouncedSearch) params.keyword = debouncedSearch;
    if (category !== "All") params.category = category;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    try {
      // The backend returns a plain list (no "total count"), so we also
      // peek at the NEXT page. If it has anything in it, the "Next"
      // button is enabled. Both requests run at the same time.
      const [data, nextPageData] = await Promise.all([
        getExpenses({ ...params, page }),
        getExpenses({ ...params, page: page + 1 }),
      ]);
      if (requestId !== latestRequest.current) return; // outdated response

      // Deleted the last item on a later page? Step back one page.
      if (data.length === 0 && page > 1) {
        setPage((p) => p - 1);
        return;
      }

      setHasNextPage(nextPageData.length > 0);
      setExpenses(data);
      setLoadError("");
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setLoadError(`Could not reach the backend at ${BASE_URL}.`);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [debouncedSearch, category, startDate, endDate, sortKey, page]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const hasActiveFilters =
    search || category !== "All" || startDate || endDate || sortKey !== "newest";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStartDate("");
    setEndDate("");
    setSortKey("newest");
  };

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

  const firstShown = (page - 1) * PAGE_SIZE + 1;
  const lastShown = (page - 1) * PAGE_SIZE + expenses.length;

  return (
    <div>
      <Navbar />
      <div className="page">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <h1>Expense History</h1>
          {/* Plain link: the browser downloads the CSV from the backend */}
          <a className="btn" href={EXPORT_URL} style={{ textDecoration: "none" }}>
            Export all as CSV
          </a>
        </div>

        {banner && <div className="banner banner-success">{banner}</div>}
        {loadError && <div className="banner banner-error">{loadError}</div>}

        {/* ---- Search + filter + sort controls ---- */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <label htmlFor="search">Search</label>
              <input
                id="search"
                placeholder="Name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="start-date">From date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="end-date">To date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="sort">Sort by</label>
              <select id="sort" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                  <option key={key} value={key}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={clearFilters} style={{ padding: "6px 12px" }}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        {loading && expenses.length === 0 && <p>Loading expenses...</p>}

        {!loading && expenses.length === 0 && !loadError && (
          <p style={{ fontSize: 14 }}>
            {hasActiveFilters
              ? "No expenses match your search or filters."
              : "No expenses logged yet."}
          </p>
        )}

        {/* Slightly fade the list while a new page or filter result loads */}
        <div style={{ opacity: loading && expenses.length > 0 ? 0.55 : 1, transition: "opacity 160ms ease" }}>
          {expenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {/* ---- Pagination ---- */}
        {(page > 1 || hasNextPage) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
              gap: 12,
            }}
          >
            <button
              className="btn"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Page {page}
              {expenses.length > 0 && ` · showing ${firstShown}–${lastShown}`}
            </span>
            <button
              className="btn"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
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