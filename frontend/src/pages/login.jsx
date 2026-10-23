
import React, { useState } from "react";
import "./login.css";
import API_BASE_URL from "../services/api";

const portals = [
  {
    id: "student",
    title: "Student Portal",
    description: "Access courses, lessons, and your learning progress.",
    icon: "student",
  },
  {
    id: "faculty",
    title: "Faculty Portal",
    description: "Manage courses, assessments, and student performance.",
    icon: "faculty",
  },
  {
    id: "admin",
    title: "Admin Portal",
    description: "Manage users and configure the learning platform.",
    icon: "admin",
  },
];

function PortalIcon({ type }) {
  if (type === "student") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="16" r="8" />
        <path d="M9 40v-4a15 15 0 0 1 30 0v4z" />
      </svg>
    );
  }

  if (type === "faculty") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="5" y="7" width="15" height="23" rx="2" />
        <path d="M9 13h7M9 18h7M9 23h5" />
        <rect x="24" y="8" width="19" height="16" rx="2" />
        <path d="M33.5 24v6M28 30h11M12 35h24M18 35l-3 4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="5" y="6" width="38" height="27" rx="3" />
      <path d="M12 14h24M12 20h18M12 26h14M24 33v7M17 40h14" />
    </svg>
  );
}

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Invalid username or password."
        );
      }

      if (!data.access) {
        throw new Error("Access token was not returned by the server.");
      }

      localStorage.setItem("accessToken", data.access);

      if (data.refresh) {
        localStorage.setItem("refreshToken", data.refresh);
      }

      localStorage.setItem("username", username);
      localStorage.setItem("userRole", selectedRole);

      if (typeof onLogin === "function") {
        onLogin();
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetLogin = () => {
    setSelectedRole("");
    setUsername("");
    setPassword("");
    setError("");
  };

  const selectedPortal = portals.find(
    (portal) => portal.id === selectedRole
  );

  return (
    <div className="learnsmart-page">
      <header className="ls-header">
        <button
          className="ls-brand"
          type="button"
          onClick={resetLogin}
          aria-label="LearnSmart home"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M4 9c8-4 15-3 20 2v30c-5-5-12-6-20-2z" />
            <path d="M44 9c-8-4-15-3-20 2v30c5-5 12-6 20-2z" />
          </svg>
          <span>
            Learn<span>Smart</span>
          </span>
        </button>

        <a className="ls-impact" href="#impact">
          Impact
        </a>
      </header>

      <main className="ls-main">
        <section className="ls-intro">
          <p className="ls-eyebrow">ADAPTIVE LEARNING PLATFORM</p>

          <h1>
            Welcome to <span>LearnSmart</span>
          </h1>

          <p className="ls-subtitle">
            {selectedPortal
              ? `Sign in to your ${selectedPortal.title}`
              : "Select your portal to continue"}
          </p>
        </section>

        {!selectedRole ? (
          <section
            className="ls-portals"
            aria-label="Choose your portal"
          >
            {portals.map((portal) => (
              <article className="ls-card" key={portal.id}>
                <div className="ls-icon">
                  <PortalIcon type={portal.icon} />
                </div>

                <h2>{portal.title}</h2>

                <p>{portal.description}</p>

                <button
                  type="button"
                  className="ls-continue"
                  onClick={() => {
                    setSelectedRole(portal.id);
                    setError("");
                  }}
                >
                  Continue <span aria-hidden="true">›</span>
                </button>
              </article>
            ))}
          </section>
        ) : (
          <section className="ls-login-wrap">
            <form className="ls-login-card" onSubmit={handleLogin}>
              <div className="ls-icon ls-login-icon">
                <PortalIcon type={selectedPortal.icon} />
              </div>

              <h2>{selectedPortal.title}</h2>

              <p className="ls-form-description">
                Enter your credentials to continue.
              </p>

              <label htmlFor="ls-username">Username</label>

              <input
                id="ls-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="ls-password">Password</label>

              <input
                id="ls-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              {error && (
                <p className="ls-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="ls-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                className="ls-back"
                onClick={resetLogin}
              >
                ← Back to portal selection
              </button>
            </form>
          </section>
        )}

        <p className="ls-tagline" id="impact">
          <span className="ls-dot" />
          One platform. Personalized learning. Better outcomes.
        </p>
      </main>

      <footer className="ls-footer">
        © 2026 LearnSmart · Adaptive Learning Platform
      </footer>
    </div>
  );
}
