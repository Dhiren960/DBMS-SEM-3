import { useState } from "react";

// Email login and sign up. Accounts are saved in the users table (password stored as a hash).
export default function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setError(""); };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const message = mode === "login"
      ? await onLogin(form.email, form.password)
      : await onRegister(form.name, form.email, form.password);
    setBusy(false);
    if (message) setError(message);
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <img src="/images/cheese-pizza.jpg" alt="" />
        <div>
          <h2>Hungry? Skip the queue.</h2>
          <p>Create an account to order from the A Block Canteen and track your orders.</p>
        </div>
      </aside>

      <form className="auth-form" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign up</button>
        </div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>

        {mode === "signup" && (
          <div className="field"><label>Full name</label>
            <input value={form.name} onChange={set("name")} autoComplete="name" /></div>
        )}
        <div className="field"><label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></div>
        <div className="field"><label>Password</label>
          <input type="password" value={form.password} onChange={set("password")}
            autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "signup" ? "At least 6 characters" : ""} /></div>

        {error && <p className="error">{error}</p>}
        <button className="btn block big" type="submit" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
