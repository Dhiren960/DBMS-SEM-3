// All calls to the back end API are here.
// Two kinds of login: customer (email) and admin (password).
let userToken = "";
let adminToken = "";
try {
  userToken = localStorage.getItem("canteen_user_token") || "";
  adminToken = sessionStorage.getItem("canteen_admin_token") || "";
} catch (e) {}

export function setUserToken(t) {
  userToken = t;
  try { t ? localStorage.setItem("canteen_user_token", t) : localStorage.removeItem("canteen_user_token"); } catch (e) {}
}
export function setAdminToken(t) {
  adminToken = t;
  try { t ? sessionStorage.setItem("canteen_admin_token", t) : sessionStorage.removeItem("canteen_admin_token"); } catch (e) {}
}
export const hasUserToken = () => !!userToken;
export const hasAdminToken = () => !!adminToken;

async function request(path, options = {}, as = "user") {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = as === "admin" ? adminToken : userToken;
  if (token) headers.Authorization = "Bearer " + token;

  const res = await fetch("/api" + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const err = new Error((data && data.error) || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}
const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  // public
  categories: () => request("/categories"),
  menu: () => request("/menu"),
  // customer
  register: (name, email, password) => request("/auth/register", json("POST", { name, email, password })),
  login: (email, password) => request("/auth/login", json("POST", { email, password })),
  me: () => request("/auth/me"),
  placeOrder: (body) => request("/orders", json("POST", body)),
  myOrders: () => request("/orders/mine"),
  // admin
  adminLogin: (password) => request("/admin/login", json("POST", { username: "admin", password }), "admin"),
  stats: () => request("/admin/stats", {}, "admin"),
  users: () => request("/admin/users", {}, "admin"),
  allOrders: () => request("/orders", {}, "admin"),
  setStatus: (id, status) => request(`/orders/${id}/status`, json("PATCH", { status }), "admin"),
  addItem: (formData) => request("/menu", { method: "POST", body: formData }, "admin"),
  updateItem: (id, body) => request(`/menu/${id}`, json("PATCH", body), "admin"),
  deleteItem: (id) => request(`/menu/${id}`, { method: "DELETE" }, "admin"),
};
