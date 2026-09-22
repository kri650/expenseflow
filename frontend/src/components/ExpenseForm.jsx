
import { useState } from "react";

const CATEGORIES = ["Food", "Shopping", "Travel", "Bills", "Education", "Others"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Other"];

const emptyForm = {
  name: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10), // defaults to today, e.g. "2026-08-25"
  payment_method: "Cash",
  description: "",
};

export default function ExpenseForm({ initialValues, onSubmit, submitLabel = "Save Expense" }) {
  const [form, setForm] = useState(initialValues || emptyForm);
  const [errors, setErrors] = useState({});

  // Generic handler: works for every input because it reads the field's
  // `name` attribute to know which piece of state to update.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Expense name is required.";
    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
    }
    if (form.description && form.description.length > 200) {
      newErrors.description = "Description must be 200 characters or fewer.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Expense Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Lunch" />
        {errors.name && <div className="error-text">{errors.name}</div>}
      </div>

      <div className="field">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
        />
        {errors.amount && <div className="error-text">{errors.amount}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="payment_method">Payment Method</label>
        <select
          id="payment_method"
          name="payment_method"
          value={form.payment_method}
          onChange={handleChange}
        >
          {PAYMENT_METHODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Any extra notes..."
        />
        {errors.description && <div className="error-text">{errors.description}</div>}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={handleReset}>Reset</button>
      </div>
    </form>
  );
}
