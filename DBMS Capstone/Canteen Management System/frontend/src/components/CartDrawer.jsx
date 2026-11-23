import { useState } from "react";
import { PAYMENT_MODES, rupees } from "../data.js";
import VegDot from "./VegDot.jsx";
import FoodImage from "./FoodImage.jsx";

export default function CartDrawer({ user, menu, cart, setQty, onClose, onPlace, onNeedLogin, placed }) {
  const [pay, setPay] = useState("UPI");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ item: menu.find((m) => m.item_id === Number(id)), qty }))
    .filter((l) => l.item && l.qty > 0);
  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  async function submit() {
    setBusy(true);
    try {
      await onPlace({ payment_mode: pay });
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <aside className="drawer" aria-label="Your order">
        <header>
          <h2>{placed ? "Order confirmed" : "Your cart"}</h2>
          <button className="btn ghost small" onClick={onClose}>Close</button>
        </header>

        {placed ? (
          <div className="body">
            <div className="token">
              <span>Your token number</span>
              <b>{placed.token_no}</b>
            </div>
            <p className="note">
              Thank you, {placed.customer_name}. Your total is <b>{rupees(placed.total)}</b> ({placed.payment_mode}).
              Collect your food from the counter when the status shows Ready. You can track it in My Orders.
            </p>
          </div>
        ) : lines.length === 0 ? (
          <div className="body"><p className="empty">Your cart is empty.</p></div>
        ) : (
          <>
            <div className="body">
              {lines.map(({ item, qty }) => (
                <div className="line" key={item.item_id}>
                  <span className="thumb"><FoodImage key={item.item_id + (item.image || "")} item={item} /></span>
                  <div className="grow">
                    <VegDot veg={item.is_veg} />{item.name}
                    <small>{rupees(item.price)} each</small>
                  </div>
                  <div className="stepper">
                    <button onClick={() => setQty(item.item_id, qty - 1)} aria-label="Remove one">−</button>
                    <b>{qty}</b>
                    <button onClick={() => setQty(item.item_id, qty + 1)} aria-label="Add one">+</button>
                  </div>
                </div>
              ))}

              {user && (
                <div className="field" style={{ marginTop: 20 }}>
                  <label>Payment method</label>
                  <div className="pay-options">
                    {PAYMENT_MODES.map((p) => (
                      <button key={p} type="button" className={pay === p ? "active" : ""} onClick={() => setPay(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <footer>
              {error && <p className="error">{error}</p>}
              <div className="total"><span>Total</span><span>{rupees(total)}</span></div>
              {user ? (
                <button className="btn block big" onClick={submit} disabled={busy}>{busy ? "Placing order..." : "Place order"}</button>
              ) : (
                <button className="btn block big" onClick={onNeedLogin}>Log in to place your order</button>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
