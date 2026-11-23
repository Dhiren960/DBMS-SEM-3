import { useState, useEffect } from "react";
import { api, setUserToken, setAdminToken, hasUserToken, hasAdminToken } from "./api.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Admin from "./components/Admin.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import Home from "./pages/Home.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import MyOrders from "./pages/MyOrders.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [menuCat, setMenuCat] = useState(0);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [serverError, setServerError] = useState("");

  const [user, setUser] = useState(null);          // logged-in customer
  const [myOrders, setMyOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(hasAdminToken());
  const [adminOrders, setAdminOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  /* ---------- loading data ---------- */
  async function loadMenu() {
    try {
      const [c, m] = await Promise.all([api.categories(), api.menu()]);
      setCategories(c);
      setMenu(m);
      setServerError("");
    } catch (e) {
      setServerError("Cannot reach the server. Start the back end (npm start in the backend folder), then refresh.");
    }
  }
  async function loadMyOrders() {
    try { setMyOrders(await api.myOrders()); } catch (e) {}
  }
  async function loadAdmin() {
    try {
      const [o, s, u] = await Promise.all([api.allOrders(), api.stats(), api.users()]);
      setAdminOrders(o);
      setStats(s);
      setUsers(u);
    } catch (e) {
      if (e.status === 401) adminLogout();
    }
  }

  // when the site opens: menu, and restore the customer's login if there is one
  useEffect(() => {
    loadMenu();
    if (hasUserToken()) {
      api.me().then(setUser).catch(() => setUserToken(""));
    }
  }, []);

  // keep orders fresh every 5 seconds while they are on screen
  useEffect(() => {
    if (user) loadMyOrders();
    if (isAdmin && page === "admin") loadAdmin();
    const timer = setInterval(() => {
      if (user && page === "orders") loadMyOrders();
      if (isAdmin && page === "admin") loadAdmin();
    }, 5000);
    return () => clearInterval(timer);
  }, [user, isAdmin, page]);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  /* ---------- navigation ---------- */
  function goMenu(cat) {
    setMenuCat(cat || 0);
    setPage("menu");
  }

  /* ---------- cart ---------- */
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  function setQty(id, qty) {
    const next = { ...cart };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    setCart(next);
  }

  async function placeOrder({ payment_mode }) {
    const items = Object.entries(cart).map(([id, quantity]) => ({ item_id: Number(id), quantity }));
    const order = await api.placeOrder({ payment_mode, items });
    setPlaced(order);
    setCart({});
    loadMyOrders();
  }

  function closeCart() {
    setCartOpen(false);
    setPlaced(null);
  }

  /* ---------- customer login ---------- */
  async function login(email, password) {
    try {
      const r = await api.login(email, password);
      setUserToken(r.token);
      setUser(r.user);
      setPage(cartCount > 0 ? "menu" : "home");
      if (cartCount > 0) setCartOpen(true);
      return "";
    } catch (e) {
      return e.message;
    }
  }
  async function register(name, email, password) {
    try {
      const r = await api.register(name, email, password);
      setUserToken(r.token);
      setUser(r.user);
      setPage(cartCount > 0 ? "menu" : "home");
      if (cartCount > 0) setCartOpen(true);
      return "";
    } catch (e) {
      return e.message;
    }
  }
  function logout() {
    setUserToken("");
    setUser(null);
    setMyOrders([]);
    setPage("home");
  }

  /* ---------- admin ---------- */
  async function adminLogin(password) {
    try {
      const r = await api.adminLogin(password);
      setAdminToken(r.token);
      setIsAdmin(true);
      return "";
    } catch (e) {
      return e.message;
    }
  }
  function adminLogout() {
    setAdminToken("");
    setIsAdmin(false);
    setStats(null);
    setAdminOrders([]);
    setUsers([]);
  }
  async function addItem(formData) { await api.addItem(formData); await loadMenu(); loadAdmin(); }
  async function toggleItem(item) { await api.updateItem(item.item_id, { available: !item.available }); await loadMenu(); }
  async function deleteItem(id) { await api.deleteItem(id); await loadMenu(); }
  async function changeStatus(id, status) {
    try { await api.setStatus(id, status); } catch (e) {}
    loadAdmin();
  }

  return (
    <>
      <Header page={page} setPage={setPage} user={user} onLogout={logout}
        cartCount={cartCount} openCart={() => setCartOpen(true)} />

      <main className={page === "home" ? "wide" : ""}>
        {serverError && <p className="banner">{serverError}</p>}

        {page === "home" && (
          <Home categories={categories} menu={menu} cart={cart} setQty={setQty} goMenu={goMenu} />
        )}
        {page === "menu" && (
          <MenuPage categories={categories} menu={menu} cart={cart} setQty={setQty} cat={menuCat} setCat={setMenuCat} />
        )}
        {page === "login" && (user
          ? <div className="empty-state"><h2>You are logged in as {user.name}</h2><p>{user.email}</p>
              <button className="btn big" onClick={() => setPage("menu")}>Go to the menu</button></div>
          : <AuthPage onLogin={login} onRegister={register} />)}
        {page === "orders" && (
          <MyOrders user={user} orders={myOrders} goLogin={() => setPage("login")} goMenu={() => goMenu(0)} />
        )}
        {page === "admin" &&
          (isAdmin ? (
            <Admin categories={categories} menu={menu} stats={stats} orders={adminOrders} users={users}
              onAdd={addItem} onToggle={toggleItem} onDelete={deleteItem} onStatus={changeStatus} onLogout={adminLogout} />
          ) : (
            <AdminLogin onLogin={adminLogin} />
          ))}
      </main>

      <Footer setPage={setPage} />

      {cartOpen && (
        <CartDrawer user={user} menu={menu} cart={cart} setQty={setQty} onClose={closeCart}
          onPlace={placeOrder} placed={placed}
          onNeedLogin={() => { setCartOpen(false); setPage("login"); }} />
      )}
    </>
  );
}
