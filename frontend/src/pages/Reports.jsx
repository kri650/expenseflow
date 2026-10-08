/**
 * Reports.jsx
 * -----------
 * Shows spending analysis from the backend's /reports/... endpoints:
 *   - overall statistics (total, average, highest, count)
 *   - spending per month
 *   - spending per category
 * plus a button to download everything as a CSV file.
 */

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import {
  getStatistics,
  getMonthlySummary,
  getCategorySummary,
  BASE_URL,
  EXPORT_URL,
} from "../services/api.js";

const formatMoney = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

// The backend sends months like "2026-09". Turn that into "Sep 2026".
const formatMonth = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState({});
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        // Fire all three requests at the same time instead of one by one.
        const [statsData, monthlyData, categoryData] = await Promise.all([
          getStatistics(),
          getMonthlySummary(),
          getCategorySummary(),
        ]);
        setStats(statsData);
        setMonthly(monthlyData);
        setCategories(categoryData);
        setLoadError("");
      } catch (err) {
        setLoadError(`Could not load reports from the backend at ${BASE_URL}.`);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const statCards = stats
    ? [
        { label: "Total Spent", value: formatMoney(stats.total), isAmount: true },
        { label: "Average per Expense", value: formatMoney(stats.average), isAmount: true },
        { label: "Highest Expense", value: formatMoney(stats.highest), isAmount: true },
        { label: "Number of Expenses", value: stats.count, isAmount: false },
      ]
    : [];

  const hasData = stats && stats.count > 0;

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
          <h1>Reports</h1>
          <a className="btn" href={EXPORT_URL} style={{ textDecoration: "none" }}>
            Export all as CSV
          </a>
        </div>

        {loading && <p>Loading reports...</p>}
        {loadError && <div className="banner banner-error">{loadError}</div>}

        {!loading && !loadError && !hasData && (
          <p style={{ fontSize: 14 }}>
            No expenses to report on yet. Add an expense and your reports will appear here.
          </p>
        )}

        {!loading && !loadError && hasData && (
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
              {statCards.map((card) => (
                <div key={card.label} className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div
                    className={card.isAmount ? "amount negative" : undefined}
                    style={{
                      fontSize: 24,
                      fontFamily: card.isAmount ? undefined : "var(--font-mono)",
                    }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              <BreakdownCard
                title="Spending by month"
                data={monthly}
                formatLabel={formatMonth}
              />
              <BreakdownCard
                title="Spending by category"
                data={categories}
                sortByAmount
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Shows one row per key with a horizontal bar. The longest bar is the
// biggest value; every other bar is sized relative to it.
function BreakdownCard({ title, data, formatLabel = (k) => k, sortByAmount = false }) {
  let entries = Object.entries(data);
  if (sortByAmount) entries = entries.sort((a, b) => b[1] - a[1]); // biggest first

  const largest = Math.max(...entries.map(([, value]) => value), 1);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 16, marginBottom: 16 }}>{title}</h3>

      {entries.length === 0 && <p style={{ fontSize: 14 }}>Nothing to show yet.</p>}

      {entries.map(([key, value]) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 13.5,
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 500 }}>{formatLabel(key)}</span>
            <span className="amount" style={{ fontSize: 13 }}>
              {formatMoney(value)}
              <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
                {" "}({Math.round((value / total) * 100)}%)
              </span>
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "var(--surface-alt)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(value / largest) * 100}%`,
                height: "100%",
                background: "var(--accent)",
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}