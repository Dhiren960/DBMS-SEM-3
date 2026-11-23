export default function Header({ page, setPage, user, onLogout, cartCount, openCart }) {
  const links = [["home", "Home"], ["menu", "Menu"], ["orders", "My Orders"], ["admin", "Admin"]];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => setPage("home")} aria-label="Go to home">
          <span className="brand-mark">A</span>
          <span className="brand-text">
            <b>A Block Canteen</b>
            <small>K.R. Mangalam University</small>
          </span>
        </button>

        <nav className="nav">
          {links.map(([k, label]) => (
            <button key={k} className={page === k ? "active" : ""} onClick={() => setPage(k)}>{label}</button>
          ))}
        </nav>

        <div className="top-actions">
          {user ? (
            <div className="account">
              <span className="avatar" title={user.email}>{user.name.charAt(0).toUpperCase()}</span>
              <span className="account-name">{user.name.split(" ")[0]}</span>
              <button className="link-btn" onClick={onLogout}>Log out</button>
            </div>
          ) : (
            <button className="btn ghost small" onClick={() => setPage("login")}>Log in</button>
          )}
          <button className="cart-btn" onClick={openCart}>
            Cart{cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
