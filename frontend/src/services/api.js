
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const client = axios.create({ baseURL: BASE_URL });

export const addFunds = (amount) =>
  client.post("/funds", { amount }).then((res) => res.data);

export const getDashboard = () =>
  client.get("/dashboard").then((res) => res.data);

export const getExpenses = () =>
  client.get("/expenses").then((res) => res.data);

export const getExpense = (id) =>
  client.get(`/expenses/${id}`).then((res) => res.data);

export const createExpense = (expense) =>
  client.post("/expenses", expense).then((res) => res.data);

export const updateExpense = (id, expense) =>
  client.put(`/expenses/${id}`, expense).then((res) => res.data);

export const deleteExpense = (id) =>
  client.delete(`/expenses/${id}`).then((res) => res.data);
