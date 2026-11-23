const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { signToken, requireAdmin } = require("../auth");

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const [rows] = await pool.execute("SELECT admin_id, username, password_hash FROM admins WHERE username = ?", [
      username || "",
    ]);
    const admin = rows[0];
    const ok = admin && (await bcrypt.compare(password || "", admin.password_hash));
    if (!ok) return res.status(401).json({ error: "Incorrect password. Try again." });
    res.json({ token: signToken(admin) });
  } catch (e) { next(e); }
});

// GET /api/admin/stats  (admin) -> totals and product-wise sales
router.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    const [[t]] = await pool.query(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total), 0) AS total_sales,
              COALESCE(SUM(status <> 'Collected'), 0) AS pending_orders
       FROM orders`
    );
    const [products] = await pool.query(
      `SELECT m.name,
              SUM(oi.quantity) AS qty_sold,
              SUM(oi.quantity * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN menu_items m ON m.item_id = oi.item_id
       GROUP BY m.item_id, m.name
       ORDER BY qty_sold DESC, m.name`
    );
    res.json({
      total_orders: Number(t.total_orders),
      total_sales: Number(t.total_sales),
      pending_orders: Number(t.pending_orders),
      product_sales: products.map((p) => ({
        name: p.name,
        qty_sold: Number(p.qty_sold),
        revenue: Number(p.revenue),
      })),
    });
  } catch (e) { next(e); }
});

// GET /api/admin/users  (admin) -> all registered customers with their order count
router.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.created_at, COUNT(o.order_id) AS orders_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.user_id
       GROUP BY u.user_id, u.name, u.email, u.created_at
       ORDER BY u.user_id DESC`
    );
    res.json(rows.map((r) => ({ ...r, orders_count: Number(r.orders_count) })));
  } catch (e) { next(e); }
});

module.exports = router;
