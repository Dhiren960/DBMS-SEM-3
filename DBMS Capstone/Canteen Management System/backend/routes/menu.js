
const express = require("express");
const multer = require("multer");
const pool = require("../db");
const { requireAdmin } = require("../auth");

const router = express.Router();

// Vercel cannot save uploaded files permanently.
// Images are kept in memory and not stored.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
});

const toItem = (r) => ({
  item_id: r.item_id,
  name: r.name,
  category_id: r.category_id,
  category_name: r.category_name,
  price: Number(r.price),
  is_veg: !!r.is_veg,
  available: !!r.available,
  image: r.image,
});

// GET /api/menu - Get all menu items
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.item_id, m.name, m.category_id, c.name AS category_name,
              m.price, m.is_veg, m.available, m.image
       FROM menu_items m
       JOIN categories c ON c.category_id = m.category_id
       ORDER BY m.category_id, m.item_id`
    );

    res.json(rows.map(toItem));
  } catch (e) {
    next(e);
  }
});

// POST /api/menu - Add new menu item (admin)
router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const price = Number(req.body.price);
    const categoryId = Number(req.body.category_id);
    const isVeg =
      req.body.is_veg === "false" || req.body.is_veg === "0" ? 0 : 1;

    if (!name || !(price > 0) || !categoryId) {
      return res.status(400).json({
        error: "Name, price and category are required.",
      });
    }

    const image = null;

    const [r] = await pool.execute(
      "INSERT INTO menu_items (name, category_id, price, is_veg, image) VALUES (?, ?, ?, ?, ?)",
      [name, categoryId, price, isVeg, image]
    );

    res.status(201).json({ item_id: r.insertId });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "An item with this name already exists.",
      });
    }

    if (e.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Invalid category.",
      });
    }

    next(e);
  }
});

// PATCH /api/menu/:id - Update availability or price (admin)
router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const fields = [];
    const values = [];

    if (req.body.available !== undefined) {
      fields.push("available = ?");
      values.push(req.body.available ? 1 : 0);
    }

    if (req.body.price !== undefined) {
      const p = Number(req.body.price);

      if (!(p > 0)) {
        return res.status(400).json({
          error: "Price must be above 0.",
        });
      }

      fields.push("price = ?");
      values.push(p);
    }

    if (!fields.length) {
      return res.status(400).json({
        error: "Nothing to update.",
      });
    }

    values.push(Number(req.params.id));

    const [r] = await pool.execute(
      `UPDATE menu_items SET ${fields.join(", ")} WHERE item_id = ?`,
      values
    );

    if (!r.affectedRows) {
      return res.status(404).json({
        error: "Item not found.",
      });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/menu/:id - Delete menu item (admin)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [r] = await pool.execute(
      "DELETE FROM menu_items WHERE item_id = ?",
      [Number(req.params.id)]
    );

    if (!r.affectedRows) {
      return res.status(404).json({
        error: "Item not found.",
      });
    }

    res.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "This item is part of past orders, so it cannot be deleted. Mark it Sold out instead.",
      });
    }

    next(e);
  }
});

module.exports = router;
