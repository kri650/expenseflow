

import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation(); // tells us which page is currently active

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/add-expense", label: "Add Expense" },
    { to: "/history", label: "History" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <Link
        to="/dashboard"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 700,
          textDecoration: "none",
          color: "var(--ink)",
        }}
      >
        ExpenseFlow
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color:
                location.pathname === link.to
                  ? "var(--accent)"
                  : "var(--ink-soft)",
              background:
                location.pathname === link.to ? "var(--accent-soft)" : "transparent",
            }}
          >
            {link.label}
          </Link>
        ))}

        <button
          className="btn"
          onClick={toggleTheme}
          style={{ marginLeft: 12 }}
          aria-label="Toggle light/dark theme"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
}
