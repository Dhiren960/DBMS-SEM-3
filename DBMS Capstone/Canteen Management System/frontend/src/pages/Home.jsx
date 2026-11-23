import { CATEGORY_PHOTOS, HERO_PHOTOS, POPULAR } from "../data.js";
import ItemCard from "../components/ItemCard.jsx";

export default function Home({ categories, menu, cart, setQty, goMenu }) {
  const popular = POPULAR.map((n) => menu.find((m) => m.name === n)).filter(Boolean).slice(0, 8);
  const countOf = (id) => menu.filter((m) => m.category_id === id).length;

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">K.R. Mangalam University · A Block Canteen</span>
          <h1>Fresh food.<br />Fast service.<br /><em>Zero queue.</em></h1>
          <p>Order your favourite sandwiches, pasta, shakes and more from your phone, then collect them with your token number.</p>
          <div className="hero-cta">
            <button className="btn big" onClick={() => goMenu(0)}>Order now</button>
            <button className="btn ghost big" onClick={() => goMenu(0)}>View full menu</button>
          </div>
          <ul className="chips">
            <li>{menu.length || 58}+ items</li>
            <li>Veg &amp; non-veg</li>
            <li>UPI · Cash · Card</li>
          </ul>
        </div>
        <div className="hero-art" aria-hidden="true">
          {HERO_PHOTOS.map((src, i) => <img key={src} src={src} alt="" className={"h" + i} />)}
          <span className="float-badge">Ready in minutes</span>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <section className="section">
        <div className="section-head">
          <h2>Browse by category</h2>
          <button className="link-btn" onClick={() => goMenu(0)}>See everything</button>
        </div>
        <div className="cat-tiles">
          {categories.map((c) => (
            <button key={c.category_id} className="cat-tile" onClick={() => goMenu(c.category_id)}>
              <img src={CATEGORY_PHOTOS[c.category_id]} alt="" loading="lazy" />
              <span className="cat-tile-label"><b>{c.name}</b><small>{countOf(c.category_id)} items</small></span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- popular ---------- */}
      {popular.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Popular right now</h2>
            <button className="link-btn" onClick={() => goMenu(0)}>View all</button>
          </div>
          <div className="grid">
            {popular.map((m) => (
              <ItemCard key={m.item_id} item={m} qty={cart[m.item_id] || 0} setQty={setQty} popular />
            ))}
          </div>
        </section>
      )}

      {/* ---------- how it works ---------- */}
      <section className="section how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step"><span>1</span><h3>Choose</h3><p>Pick what you like from the menu and add it to your cart.</p></div>
          <div className="step"><span>2</span><h3>Order &amp; pay</h3><p>Log in with your email, choose UPI, cash or card and place the order.</p></div>
          <div className="step"><span>3</span><h3>Collect</h3><p>Get a token number. Collect your food when the status shows Ready.</p></div>
        </div>
      </section>
    </>
  );
}
