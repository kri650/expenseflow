
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
          ExpenseFlow
        </div>
        <button className="btn" onClick={toggleTheme}>
          {theme === "light" ? " Dark" : " Light"}
        </button>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div
          className="amount"
          style={{ fontSize: 13, letterSpacing: 2, color: "var(--ink-soft)", marginBottom: 18 }}
        >
          FUNDS · EXPENSES · BALANCE
        </div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", maxWidth: 640, lineHeight: 1.15 }}>
          Keep every rupee accounted for.
        </h1>
        <p style={{ maxWidth: 480, marginTop: 18, fontSize: 16 }}>
          ExpenseFlow is a simple ledger for your day-to-day spending — add
          funds, log expenses, and see exactly where your money goes.
        </p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 32, padding: "12px 28px", fontSize: 15 }}
          onClick={() => navigate("/dashboard")}
        >
          Get Started →
        </button>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: 12.5,
          color: "var(--ink-soft)",
          borderTop: "1px solid var(--border)",
        }}
      >
        ExpenseFlow · Personal Expense Management System
      </footer>
    </div>
  );
}
