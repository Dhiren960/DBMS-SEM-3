import { useState } from "react";
import { ORDER_STATUSES, rupees } from "../data.js";

// Staff view: all orders, with a button to move each one to the next status
export default function Orders({ orders, onStatus }) {
  const [filter, setFilter] = useState("Active");

  const shown = orders
    .filter((o) => filter === "All" || (filter === "Active" ? o.status !== "Collected" : o.status === filter))
    .slice()
    .reverse();

  return (
    <>
      <div className="pills">
        {["Active", ...ORDER_STATUSES, "All"].map((f) => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="empty">No orders to show.</p>}
      {shown.map((o) => {
        const next = ORDER_STATUSES[ORDER_STATUSES.indexOf(o.status) + 1];
        return (
          <div className="order" key={o.order_id}>
            <div className="tk"><small>Token</small>{o.token_no}</div>
            <div className="grow">
              <b>{o.customer_name}</b> {o.email && <small>· {o.email}</small>}
              <div>{o.items.map((i) => i.quantity + " × " + i.name).join(", ")}</div>
              <small>
                {new Date(o.created_at).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {o.payment_mode} · {rupees(o.total)}
              </small>
            </div>
            <div className="actions">
              <span className={"badge " + o.status}>{o.status}</span>
              {next && <button className="btn small" onClick={() => onStatus(o.order_id, next)}>Mark {next}</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}
