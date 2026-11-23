import { useState } from "react";
import { rupees } from "../data.js";
import VegDot from "./VegDot.jsx";
import FoodImage from "./FoodImage.jsx";
import Orders from "./Orders.jsx";

const TABS = [["overview", "Overview"], ["orders", "Orders"], ["menu", "Menu"], ["customers", "Customers"]];

export default function Admin({ categories, menu, stats, orders, users, onAdd, onToggle, onDelete, onStatus, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState({ name: "", price: "", category_id: 1, is_veg: true });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const s = stats || { total_orders: 0, pending_orders: 0, total_sales: 0, product_sales: [] };
  const top = s.product_sales[0];

  async function addItem(e) {
    e.preventDefault();
    if (!form.name.trim() || !(Number(form.price) > 0)) {
      setError("Enter an item name and a price above 0.");
      return;
    }
    const fd = new FormData(); // fields first, image last
    fd.append("name", form.name.trim());
    fd.append("price", form.price);
    fd.append("category_id", form.category_id);
    fd.append("is_veg", form.is_veg);
    if (file) fd.append("image", file);
    setBusy(true);
    try {
      await onAdd(fd);
      setForm({ ...form, name: "", price: "" });
      setFile(null);
      setFileKey((k) => k + 1);
      setError("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function run(action) {
    try { await action(); setError(""); } catch (err) { setError(err.message); }
  }

  return (
    <>
      <div className="section-head">
        <h1>Admin dashboard</h1>
        <button className="btn ghost small" onClick={onLogout}>Log out</button>
      </div>

      <div className="pills">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => { setTab(k); setError(""); }}>{label}</button>
        ))}
      </div>

      {error && <p className="error banner-error">{error}</p>}

      {tab === "overview" && (
        <>
          <div className="stats">
            <div className="stat"><b>{s.total_orders}</b><span>Orders placed</span></div>
            <div className="stat"><b>{s.pending_orders}</b><span>Pending orders</span></div>
            <div className="stat"><b>{rupees(s.total_sales)}</b><span>Total sales</span></div>
            <div className="stat"><b>{users.length}</b><span>Registered customers</span></div>
          </div>
          <div className="panel">
            <h3>Product sales{top ? " · top: " + top.name : ""}</h3>
            {s.product_sales.length === 0 ? (
              <p className="note">No orders yet. Sales per product will appear here after the first order.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product</th><th>Quantity sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {s.product_sales.map((p) => (
                      <tr key={p.name}><td>{p.name}</td><td>{p.qty_sold}</td><td>{rupees(p.revenue)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "orders" && <Orders orders={orders} onStatus={onStatus} />}

      {tab === "menu" && (
        <>
          <form className="panel" onSubmit={addItem}>
            <h3>Add item</h3>
            <div className="form-row">
              <div className="field"><label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Price (₹)</label>
                <input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="field"><label>Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
                  {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                </select></div>
              <div className="field"><label>Type</label>
                <select value={form.is_veg ? "veg" : "nonveg"} onChange={(e) => setForm({ ...form, is_veg: e.target.value === "veg" })}>
                  <option value="veg">Veg</option>
                  <option value="nonveg">Non-veg</option>
                </select></div>
              <div className="field"><label>Photo (optional)</label>
                <input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files[0] || null)} /></div>
              <button className="btn" type="submit" disabled={busy}>{busy ? "Adding..." : "Add item"}</button>
            </div>
          </form>

          <div className="panel">
            <h3>Menu items ({menu.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
                <tbody>
                  {menu.map((m) => (
                    <tr key={m.item_id}>
                      <td>
                        <span className="thumb"><FoodImage key={m.item_id + (m.image || "")} item={m} /></span>
                        <VegDot veg={m.is_veg} />{m.name}
                      </td>
                      <td>{m.category_name}</td>
                      <td>{rupees(m.price)}</td>
                      <td>
                        <button className="btn ghost small" onClick={() => run(() => onToggle(m))}>
                          {m.available ? "In stock" : "Sold out"}
                        </button>
                      </td>
                      <td>
                        <button className="btn danger small" onClick={() => run(() => onDelete(m.item_id))}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "customers" && (
        <div className="panel">
          <h3>Registered customers ({users.length})</h3>
          {users.length === 0 ? (
            <p className="note">No one has signed up yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>{u.orders_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
