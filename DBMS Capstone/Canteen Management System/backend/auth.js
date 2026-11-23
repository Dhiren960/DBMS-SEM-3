// JWT helpers. Two kinds of login: "user" (customer) and "admin".
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signUserToken(user) {
  return jwt.sign({ id: user.user_id, role: "user" }, SECRET, { expiresIn: "7d" });
}
function signToken(admin) {
  return jwt.sign({ id: admin.admin_id, role: "admin" }, SECRET, { expiresIn: "8h" });
}

function readToken(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return jwt.verify(token, SECRET);
}

function requireAdmin(req, res, next) {
  try {
    const payload = readToken(req);
    if (payload.role !== "admin") throw new Error("not admin");
    req.admin = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Admin login required." });
  }
}

function requireUser(req, res, next) {
  try {
    const payload = readToken(req);
    if (payload.role !== "user") throw new Error("not user");
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Please log in to continue." });
  }
}

module.exports = { signToken, signUserToken, requireAdmin, requireUser };
