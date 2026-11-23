import { useState } from "react";
import { CATEGORY_ICONS, POPULAR } from "../data.js";
import ItemCard from "../components/ItemCard.jsx";

export default function MenuPage({ categories, menu, cart, setQty, cat, setCat }) {
  const [search, setSearch] = useState("");

  const shown = menu.filter(
    (m) => (cat === 0 || m.category_id === cat) && m.name.toLowerCase().includes(search.toLowerCase())
  );
  const countOf = (id) => menu.filter((m) => id === 0 || m.category_id === id).length;
  const current = categories.find((c) => c.category_id === cat);

  return (
    <>
      <div className="page-banner">
        <h1>Our menu</h1>
        <p>Everything served at the A Block Canteen.</p>
        <input className="search" placeholder="Search for sandwich, pasta, shake..."
          value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search items" />
      </div>

      <div className="pills">
        <button className={cat === 0 ? "active" : ""} onClick={() => setCat(0)}>All <span>{countOf(0)}</span></button>
        {categories.map((c) => (
          <button key={c.category_id} className={cat === c.category_id ? "active" : ""} onClick={() => setCat(c.category_id)}>
            {CATEGORY_ICONS[c.category_id]} {c.name} <span>{countOf(c.category_id)}</span>
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2>{cat === 0 ? "All items" : current ? current.name : ""}</h2>
        <span className="muted">{shown.length} {shown.length === 1 ? "item" : "items"}</span>
      </div>

      {shown.length === 0 && <p className="empty">No items found. Try a different search.</p>}

      <div className="grid">
        {shown.map((m) => (
          <ItemCard key={m.item_id} item={m} qty={cart[m.item_id] || 0} setQty={setQty} popular={POPULAR.includes(m.name)} />
        ))}
      </div>
    </>
  );
}
