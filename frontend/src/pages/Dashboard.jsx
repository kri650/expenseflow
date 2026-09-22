/**
 * Dashboard.jsx
 * -------------
 * This page shows a summary: total funds, total spent, balance, and
 * the 5 most recent expenses. It's a good example of the full request
 * cycle described in the spec:
 *
 *   Page loads -> useEffect runs -> calls api.js -> Axios hits FastAPI
 *   -> FastAPI reads data.json -> sends JSON back -> we store it in
 *   state with useState -> React re-renders the cards with real numbers.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ExpenseCard from "../components/ExpenseCard.jsx";
import { getDashboard, getExpenses, addFunds, BASE_URL } from "../services/api.js";

export default function Dashboard() {
  const navigate = useNavigate();

  // `null` while loading, then filled with { total_funds, total_expenses, ... }
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [fundsInput, setFundsInput] = useState("");
  const [fundsError, setFundsError] = useState("");
  const [fundsSuccess, setFundsSuccess] = useState("");
  const [submittingFunds, setSubmittingFunds] = useState(false);

  // Fetches everything the dashboard needs. We pull this into its own
  // function so we can call it again after adding funds, to refresh
  // the numbers on screen.
  const loadDashboardData = async () => {
    try {
      const [dashboardData, expenses] = await Promise.all([getDashboard(), getExpenses()]);
      setSummary(dashboardData);
      // Most recent 5: expenses are appended in creation order, so we
      // reverse and slice to get the latest 5 first.
      setRecentExpenses([...expenses].reverse().slice(0, 5));
      setLoadError("");
    } catch (err) {
      setLoadError(`Could not reach the backend at ${BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  // useEffect with an empty [] dependency array runs once, right after
  // this component first appears on screen - perfect for an initial data fetch.
  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setFundsError("");
    setFundsSuccess("");

    const amount = Number(fundsInput);
    if (!fundsInput || amount <= 0) {
      setFundsError("Amount must be greater than 0.");
      return;
    }

    setSubmittingFunds(true);
    try {
      await addFunds(amount);
      setFundsSuccess("Funds added successfully.");
      setFundsInput("");
      await loadDashboardData(); // refresh cards with new totals
    } catch (err) {
      setFundsError("Something went wrong adding funds. Please try again.");
    } finally {
      setSubmittingFunds(false);
    }
  };

  const cards = summary
    ? [
        { label: "Total Funds", value: summary.total_funds, tone: "positive" },
        { label: "Total Expenses", value: summary.total_expenses, tone: "negative" },
        { label: "Remaining Balance", value: summary.remaining_balance, tone: summary.remaining_balance >= 0 ? "positive" : "negative" },
        { label: "Total Transactions", value: summary.total_transactions, isCount: true },
      ]
    : [];

  return (
    <div>
      <Navbar />
      <div className="page">
        <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

        {loading && <p>Loading your numbers...</p>}
        {loadError && <div className="banner banner-error">{loadError}</div>}

        {!loading && !loadError && (
          <>
            {/* ---- Summary cards ---- */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {cards.map((card) => (
                <div key={card.label} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div
                    className={card.isCount ? undefined : `amount ${card.tone}`}
                    style={{ fontSize: 24, fontFamily: card.isCount ? "var(--font-mono)" : undefined }}
                  >
                    {card.isCount ? card.value : `₹${card.value.toLocaleString("en-IN")}`}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
              {/* ---- Add funds ---- */}
              <div className="card" style={{ padding: 20, height: "fit-content" }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add Funds</h3>
                <form onSubmit={handleAddFunds}>
                  <div className="field">
                    <label htmlFor="funds">Amount (₹)</label>
                    <input
                      id="funds"
                      type="number"
                      step="0.01"
                      value={fundsInput}
                      onChange={(e) => setFundsInput(e.target.value)}
                      placeholder="e.g. 5000"
                    />
                    {fundsError && <div className="error-text">{fundsError}</div>}
                  </div>
                  {fundsSuccess && <div className="banner banner-success">{fundsSuccess}</div>}
                  <button type="submit" className="btn btn-primary" disabled={submittingFunds} style={{ width: "100%" }}>
                    {submittingFunds ? "Adding..." : "Add Funds"}
                  </button>
                </form>
              </div>

              {/* ---- Recent expenses ---- */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16 }}>Recent Expenses</h3>
                  <button className="btn" onClick={() => navigate("/history")}>
                    View All Expenses
                  </button>
                </div>

                {recentExpenses.length === 0 ? (
                  <p style={{ fontSize: 14 }}>No expenses logged yet. Add your first one!</p>
                ) : (
                  recentExpenses.map((exp) => <ExpenseCard key={exp.id} expense={exp} />)
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
