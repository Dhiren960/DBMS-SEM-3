import { useState } from "react";

// The password is checked by the back end (bcrypt hash in the admins table).
export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const message = await onLogin(password);
    setBusy(false);
    if (message) setError(message);
  }

  return (
    <form className="login" onSubmit={submit}>
      <h2>Admin login</h2>
      <p>Enter the admin password to manage the menu.</p>
      <div className="field">
        <label>Password</label>
        <input type="password" value={password} autoFocus
          onChange={(e) => { setPassword(e.target.value); setError(""); }} />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn block" type="submit" disabled={busy}>{busy ? "Checking..." : "Log in"}</button>
    </form>
  );
}
