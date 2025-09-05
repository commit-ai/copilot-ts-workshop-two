import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(); // No authentication, just continue
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/login-logo.png" alt="Login Logo" />
      </div>
      <h1 className="login-title">SUPERHEROES</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-icon">
            <svg width="24" height="24" fill="#bfcad6" viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <span className="input-icon">
            <svg width="24" height="24" fill="#bfcad6" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2v-2a2 2 0 10-4 0v2a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2zm-8-2a4 4 0 118 0v2H6V9z"/></svg>
          </span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="login-btn" type="submit">LOG IN</button>
      </form>
      <div className="forgot-password">Forgot password?</div>
    </div>
  );
}

export default Login;
