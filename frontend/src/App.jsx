import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import ExpenseHistory from "./pages/ExpenseHistory.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/history" element={<ExpenseHistory />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}