const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { signUserToken, requireUser } = require("../auth");

const router = express.Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (u) => ({ user_id: u.user_id, name: u.name, email: u.email });

// POST /api/auth/register  { name, email, password }
router.post("/register", async (req, res, next) => {
  try {
    const name = ((req.body && req.body.name) || "").trim();
    const email = ((req.body && req.body.email) || "").trim().toLowerCase();
    const password = (req.body && req.body.password) || "";
    if (!name) return res.status(400).json({ error: "Please enter your name." });
    if (!EMAIL.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hash]);
    const user = { user_id: r.insertId, name, email };
    res.status(201).json({ token: signUserToken(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "This email is already registered. Please log in." });
    next(e);
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res, next) => {
  try {
    const email = ((req.body && req.body.email) || "").trim().toLowerCase();
    const password = (req.body && req.body.password) || "";
    const [rows] = await pool.execute("SELECT user_id, name, email, password_hash FROM users WHERE email = ?", [email]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: "Wrong email or password." });
    res.json({ token: signUserToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

// GET /api/auth/me -> who is logged in
router.get("/me", requireUser, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT user_id, name, email FROM users WHERE user_id = ?", [req.user.id]);
    if (!rows[0]) return res.status(401).json({ error: "Please log in again." });
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

module.exports = router;
