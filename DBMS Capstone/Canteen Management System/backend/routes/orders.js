const express = require("express");
const pool = require("../db");
const { requireAdmin, requireUser } = require("../auth");

const router = express.Router();
const STATUSES = ["Placed", "Preparing", "Ready", "Collected"];
const PAYMENTS = ["UPI", "Cash", "Card"];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}


// attach the items of each order (JOIN with menu_items)
async function withItems(orders) {
  let items = [];
  if (orders.length) {
    [items] = await pool.query(
      `SELECT oi.order_id, oi.item_id, m.name, oi.quantity, oi.unit_price
       FROM order_items oi
       JOIN menu_items m ON m.item_id = oi.item_id
       WHERE oi.order_id IN (?)`,
      [orders.map((o) => o.order_id)]
    );
  }
  const byOrder = {};
  items.forEach((i) => {
    (byOrder[i.order_id] = byOrder[i.order_id] || []).push({
      item_id: i.item_id, name: i.name, quantity: i.quantity, unit_price: Number(i.unit_price),
    });
  });
  return orders.map((o) => ({ ...o, total: Number(o.total), items: byOrder[o.order_id] || [] }));
}

// GET /api/orders -> all orders (admin)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.order_id, o.token_no, o.customer_name, u.email, o.payment_mode, o.status, o.total, o.created_at
       FROM orders o LEFT JOIN users u ON u.user_id = o.user_id
       ORDER BY o.order_id ASC`
    );
    res.json(await withItems(orders));
  } catch (e) { next(e); }
});

// GET /api/orders/mine -> the logged-in customer's own orders
router.get("/mine", requireUser, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT order_id, token_no, customer_name, payment_mode, status, total, created_at
       FROM orders WHERE user_id = ? ORDER BY order_id DESC`,
      [req.user.id]
    );
    res.json(await withItems(orders));
  } catch (e) { next(e); }
});

// POST /api/orders -> place an order (uses a TRANSACTION)
router.post("/", requireUser, async (req, res, next) => {
  const payment = req.body && req.body.payment_mode;
  const items = req.body && req.body.items;

  if (!PAYMENTS.includes(payment)) return res.status(400).json({ error: "Invalid payment mode." });
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Order is empty." });

  const qtyById = new Map();
  for (const i of items) {
    const id = Number(i.item_id);
    const q = Number(i.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(q) || q < 1 || q > 50) {
      return res.status(400).json({ error: "Invalid item or quantity." });
    }
    qtyById.set(id, (qtyById.get(id) || 0) + q);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Prices come from the database, never from the browser
    const ids = [...qtyById.keys()];
    const [rows] = await conn.query(
      "SELECT item_id, name, price, available FROM menu_items WHERE item_id IN (?)",
      [ids]
    );
    if (rows.length !== ids.length) throw httpError(400, "Some items are no longer on the menu.");
    const soldOut = rows.find((r) => !r.available);
    if (soldOut) throw httpError(400, soldOut.name + " is sold out.");

    const total = rows.reduce((sum, r) => sum + Number(r.price) * qtyById.get(r.item_id), 0);

    const [[u]] = await conn.query("SELECT name FROM users WHERE user_id = ?", [req.user.id]);
    if (!u) throw httpError(401, "Please log in again.");
    const name = u.name;

    const [o] = await conn.execute(
      "INSERT INTO orders (user_id, token_no, customer_name, payment_mode, total) VALUES (?, 0, ?, ?, ?)",
      [req.user.id, name, payment, total]
    );
    const orderId = o.insertId;

    await conn.query("INSERT INTO order_items (order_id, item_id, quantity, unit_price) VALUES ?", [
      rows.map((r) => [orderId, r.item_id, qtyById.get(r.item_id), Number(r.price)]),
    ]);

    const token = ((orderId - 1) % 99) + 1; // token 1-99, repeats after 99 orders
    await conn.execute("UPDATE orders SET token_no = ? WHERE order_id = ?", [token, orderId]);

    await conn.commit(); // both tables saved together
    res.status(201).json({
      order_id: orderId,
      token_no: token,
      customer_name: name,
      payment_mode: payment,
      status: "Placed",
      total,
    });
  } catch (e) {
    await conn.rollback(); // nothing is saved if anything fails
    if (e.status) return res.status(e.status).json({ error: e.message });
    next(e);
  } finally {
    conn.release();
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const status = req.body && req.body.status;
    if (!STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status." });
    const [r] = await pool.execute("UPDATE orders SET status = ? WHERE order_id = ?", [status, Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: "Order not found." });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
