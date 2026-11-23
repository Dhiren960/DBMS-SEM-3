export default function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>A Block Canteen</h4>
          <p>K.R. Mangalam University<br />Fresh food, ready fast.</p>
        </div>
        <div>
          <h5>Explore</h5>
          <button onClick={() => setPage("menu")}>Menu</button>
          <button onClick={() => setPage("orders")}>My orders</button>
          <button onClick={() => setPage("login")}>Log in / Sign up</button>
        </div>
        <div>
          <h5>Good to know</h5>
          <p>Veg and non-veg options<br />Pay by UPI, cash or card<br />Collect with your token number</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} A Block Canteen · Food images are for illustration only</div>
    </footer>
  );
}
