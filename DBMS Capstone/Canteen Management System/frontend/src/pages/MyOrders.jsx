import { ORDER_STATUSES, rupees } from "../data.js";

export default function MyOrders({ user, orders, goLogin, goMenu }) {
  if (!user) {
    return (
      <div className="empty-state">
        <h2>Log in to see your orders</h2>
        <p>Your orders and token numbers appear here after you place them.</p>
        <button className="btn big" onClick={goLogin}>Log in</button>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <h2>No orders yet</h2>
        <p>Pick something tasty from the menu and your order will show up here.</p>
        <button className="btn big" onClick={goMenu}>Browse the menu</button>
      </div>
    );
  }
  return (
    <>
      <div className="section-head"><h1>My orders</h1></div>
      {orders.map((o) => {
        const step = ORDER_STATUSES.indexOf(o.status);
        return (
          <article className="my-order" key={o.order_id}>
            <div className="my-order-top">
              <div className="tk"><small>Token</small>{o.token_no}</div>
              <div className="grow">
                <b>{o.items.map((i) => i.quantity + " × " + i.name).join(", ")}</b>
                <small>
                  {new Date(o.created_at).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {o.payment_mode}
                </small>
              </div>
              <div className="my-total">{rupees(o.total)}</div>
            </div>
            <ol className="progress">
              {ORDER_STATUSES.map((s, i) => (
                <li key={s} className={i <= step ? "done" : ""}><span></span>{s}</li>
              ))}
            </ol>
          </article>
        );
      })}
    </>
  );
}
