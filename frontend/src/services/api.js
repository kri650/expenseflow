import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://expenseflow-7tdl.vercel.app";

const client = axios.create({ baseURL: BASE_URL });

export const addFunds = (amount) =>
  client.post("/funds", { amount }).then((res) => res.data);

export const getDashboard = () =>
  client.get("/dashboard").then((res) => res.data);

// NEW: accepts optional filters. Axios turns the params object into a
// query string (?category=Food&sort_by=amount...) and skips any value
// that is undefined, so calling getExpenses() with no arguments still
// returns every expense, exactly like before.
export const getExpenses = (params = {}) =>
  client.get("/expenses", { params }).then((res) => res.data);

export const getExpense = (id) =>
  client.get(`/expenses/${id}`).then((res) => res.data);

export const createExpense = (expense) =>
  client.post("/expenses", expense).then((res) => res.data);

export const updateExpense = (id, expense) =>
  client.put(`/expenses/${id}`, expense).then((res) => res.data);

export const deleteExpense = (id) =>
  client.delete(`/expenses/${id}`).then((res) => res.data);

// ---- NEW: reports ----

export const getStatistics = () =>
  client.get("/reports/statistics").then((res) => res.data);

export const getMonthlySummary = () =>
  client.get("/reports/monthly").then((res) => res.data);

export const getCategorySummary = () =>
  client.get("/reports/category").then((res) => res.data);

// The CSV download is a plain link, not an Axios call: the backend sends
// a "Content-Disposition: attachment" header, so the browser downloads
// the file as soon as it opens this URL.
export const EXPORT_URL = `${BASE_URL}/reports/export`;