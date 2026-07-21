"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icons";

export default function Topbar({ profile, authed, onLogin, onLogout }) {
  const pathname = usePathname();
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const menuRef = useRef(null);

  const initials = (profile?.name || "ME")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const ids = ["home", "skills", "projects", "contact"];
    const onScroll = () => {
      let cur = "home";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const nav = [
    { id: "home", label: "Home", Icon: Icon.Home },
    { id: "skills", label: "Skills", Icon: Icon.Brain },
    { id: "projects", label: "Projects", Icon: Icon.Briefcase },
    { id: "contact", label: "Contact", Icon: Icon.Mail },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Login failed");
      } else {
        setShowLogin(false);
        setMenuOpen(false);
        setUsername("");
        setPassword("");
        onLogin && onLogin();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setMenuOpen(false);
    onLogout && onLogout();
  };

  // Smooth-scroll to a section on the home page.
  // - For "home", always go to the very top (and re-run even if already there).
  // - For other sections, scroll so the heading sits just below the sticky topbar.
  const handleNavClick = (e, id) => {
    if (pathname !== "/") return; // let the browser navigate to /#id first
    e.preventDefault();
    const TOPBAR_OFFSET = 80;
    const target =
      id === "home"
        ? 0
        : (() => {
            const el = document.getElementById(id);
            return el ? Math.max(0, el.offsetTop - TOPBAR_OFFSET) : 0;
          })();
    window.scrollTo({ top: target, behavior: "smooth" });
    // keep URL hash in sync without a hard jump
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-logo">{initials}</div>
          <div className="search-wrap">
            <Icon.Search size={16} className="search-ico" />
            <input type="text" className="search-box" placeholder="Search..." />
          </div>
        </div>

        <nav className="topnav">
          {nav.map((n) => (
            <a
              key={n.id}
              href={pathname === "/" ? `#${n.id}` : `/#${n.id}`}
              className={`nav-item ${
                pathname === "/" && active === n.id ? "active" : ""
              }`}
              onClick={(e) => handleNavClick(e, n.id)}
            >
              <n.Icon size={22} />
              <span className="nav-label">{n.label}</span>
            </a>
          ))}

          {/* Dashboard link — admin only */}
          {authed && (
            <a
              href="/dashboard"
              className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}
            >
              <Icon.Briefcase size={22} />
              <span className="nav-label">Dashboard</span>
            </a>
          )}

          {/* Me dropdown */}
          <div className="me-wrap" ref={menuRef}>
            <button
              className={`nav-item profile-mini ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile?.avatar} alt="me" className="mini-avatar" />
              <span className="nav-label">Me</span>
              <Icon.ChevronDown size={14} />
            </button>

            {menuOpen && (
              <div className="dropdown">
                {!authed ? (
                  <>
                    <div className="dropdown-header">
                      <Icon.Lock size={18} />
                      <span>Visitor view</span>
                    </div>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowLogin(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Icon.Lock size={18} />
                      <span>Admin Login</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="dropdown-header">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile?.avatar}
                        alt=""
                        className="mini-avatar"
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                          Admin
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--li-text-soft)",
                          }}
                        >
                          Edit mode active
                        </div>
                      </div>
                    </div>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowCredentials(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Icon.Lock size={18} />
                      <span>Change Credentials</span>
                    </button>
                    <button
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <Icon.LogOut size={18} />
                      <span>Sign out</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Login modal */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target.className === "modal-overlay" && setShowLogin(false)
          }
        >
          <form className="modal login-modal" onSubmit={handleLogin}>
            <div className="card-head" style={{ marginBottom: "0.75rem" }}>
              <h2>
                <Icon.Lock size={20} /> Admin Login
              </h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowLogin(false)}
              >
                <Icon.X size={18} />
              </button>
            </div>
            <p
              className="muted"
              style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}
            >
              Sign in to edit your portfolio content.
            </p>
            <div className="field">
              <label>Username or Email</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div
                style={{
                  color: "var(--li-red)",
                  fontSize: "0.82rem",
                  marginBottom: "0.5rem",
                }}
              >
                {error}
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Credentials modal */}
      {showCredentials && (
        <ChangeCredentialsModal
          onClose={() => setShowCredentials(false)}
          onLogout={() => {
            setShowCredentials(false);
            onLogout && onLogout();
          }}
        />
      )}
    </header>
  );
}

/* ============ CHANGE CREDENTIALS MODAL ============ */
function ChangeCredentialsModal({ onClose, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update credentials");
      } else {
        setMsg(
          "Credentials updated. Please log in again with your new username.",
        );
        setCurrentPassword("");
        setNewUsername("");
        setNewPassword("");
        // Force re-login with new credentials
        setTimeout(() => onLogout(), 2200);
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.className === "modal-overlay" && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="card-head" style={{ marginBottom: "0.75rem" }}>
          <h2>
            <Icon.Lock size={20} /> Change Credentials
          </h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            <Icon.X size={18} />
          </button>
        </div>
        <p
          className="muted"
          style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}
        >
          Securely update your admin username and password. You'll be signed out
          and asked to log in again.
        </p>
        <div className="field">
          <label>Current Password</label>
          <input
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>New Username</label>
          <input
            className="input"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="new_admin"
            required
          />
        </div>
        <div className="field">
          <label>New Password</label>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error && (
          <div
            style={{
              color: "var(--li-red)",
              fontSize: "0.82rem",
              marginBottom: "0.5rem",
            }}
          >
            {error}
          </div>
        )}
        {msg && (
          <div
            style={{
              color: "var(--li-green)",
              fontSize: "0.82rem",
              marginBottom: "0.5rem",
            }}
          >
            {msg}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Updating..." : "Update Credentials"}
          </button>
        </div>
      </form>
    </div>
  );
}
