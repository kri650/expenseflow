
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ExpenseForm from "../components/ExpenseForm.jsx";
import { createExpense } from "../services/api.js";

export default function AddExpense() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    try {
      await createExpense(formData);
      // Redirect to history so the user immediately sees their new expense.
      // The `state` here lets History show a one-time success banner.
      navigate("/history", { state: { message: "Expense added successfully." } });
    } catch (err) {
      setError("Could not save the expense. Please check your inputs and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page" style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: 24 }}>Add Expense</h1>
        {error && <div className="banner banner-error">{error}</div>}
        <div className="card" style={{ padding: 24 }}>
          <ExpenseForm
            onSubmit={handleSubmit}
            submitLabel={submitting ? "Saving..." : "Save Expense"}
          />
        </div>
      </div>
    </div>
  );
}
