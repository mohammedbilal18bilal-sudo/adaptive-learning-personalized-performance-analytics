import React, { useState } from "react";
import API_BASE_URL from "../services/api";

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "student",
      title: "Student Login",
      description:
        "Access courses, lessons and your learning progress.",
      icon: "🎓",
    },
    {
      id: "faculty",
      title: "Faculty Login",
      description:
        "Manage courses, assessments and student performance.",
      icon: "👨‍🏫",
    },
    {
      id: "admin",
      title: "Admin Login",
      description:
        "Manage users, courses and the learning platform.",
      icon: "⚙️",
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    console.log("LOGIN: STARTED");

    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      console.log("LOGIN: RESPONSE STATUS", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid username or password."
        );
      }

      if (!data.access || !data.refresh) {
        throw new Error(
          "Login succeeded, but authentication tokens were not received."
        );
      }

      /*
       * Save the JWT tokens received from the backend.
       */
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      /*
       * Save username and selected account type.
       */
      localStorage.setItem("username", username.trim());
      localStorage.setItem(
        "userRole",
        selectedRole ? selectedRole.id : "student"
      );

      console.log("LOGIN: TOKEN SAVED");
      console.log(
        "LOGIN: TOKEN EXISTS",
        Boolean(localStorage.getItem("accessToken"))
      );

      setLoading(false);

      /*
       * Tell App.jsx that login was successful.
       *
       * App.jsx will then change from Login
       * to Dashboard.
       */
      if (typeof onLogin === "function") {
        console.log("LOGIN: CALLING APP onLogin()");
        onLogin();
        return;
      }

      /*
       * Safety fallback in case Login is opened
       * without the onLogin prop.
       */
      console.log("LOGIN: onLogin unavailable");
      window.location.reload();
    } catch (loginError) {
      console.error("LOGIN ERROR:", loginError);

      setLoading(false);

      setError(
        loginError.message ||
          "Unable to connect to the server. Please try again."
      );
    }
  };

  return (
    <div className="role-login-page">

      {/* LEFT SIDE */}
      <section className="role-login-left">

        <div className="left-overlay"></div>

        <div className="left-content">

          <div className="learnsmart-logo">
            <div className="logo-box">L</div>
            <span>LearnSmart</span>
          </div>

          <div className="left-main-content">

            <p className="platform-label">
              ADAPTIVE LEARNING PLATFORM
            </p>

            <h1>
              Learn.
              <br />
              <span>Improve.</span>
              <br />
              Achieve.
            </h1>

            <p className="platform-description">
              A personalized learning platform designed to
              help students learn better, track their progress,
              and achieve their academic goals.
            </p>

          </div>

          <div className="left-bottom">
            <span>Learn Today.</span>
            <span>Build Tomorrow.</span>
          </div>

        </div>

      </section>

      {/* RIGHT SIDE */}
      <section className="role-login-right">

        {!selectedRole ? (

          /* ROLE SELECTION */
          <div className="role-selection">

            <div className="right-heading">

              <h1>Welcome to LearnSmart</h1>

              <p>
                Select your account type to continue
              </p>

            </div>

            <div className="role-list">

              {roles.map((role) => (

                <button
                  key={role.id}
                  type="button"
                  className="role-card"
                  onClick={() => handleRoleSelect(role)}
                >

                  <div className="role-icon">
                    {role.icon}
                  </div>

                  <div className="role-information">

                    <h2>{role.title}</h2>

                    <p>{role.description}</p>

                  </div>

                  <div className="role-arrow">
                    →
                  </div>

                </button>

              ))}

            </div>

            <p className="role-footer">
              © 2026 LearnSmart
            </p>

          </div>

        ) : (

          /* LOGIN FORM */
          <div className="actual-login">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back to account types
            </button>

            <div className="selected-role-heading">

              <div className="selected-role-icon">
                {selectedRole.icon}
              </div>

              <div>

                <p className="small-label">
                  LEARNSMART
                </p>

                <h1>{selectedRole.title}</h1>

                <p>
                  Sign in to continue to your account.
                </p>

              </div>

            </div>

            {error && (
              <div className="role-login-error">

                <span>!</span>

                <p>{error}</p>

              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              {/* USERNAME */}

              <div className="login-input-group">

                <label htmlFor="username">
                  Username
                </label>

                <div className="login-input-wrapper">

                  <span>👤</span>

                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    disabled={loading}
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="login-input-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input-wrapper">

                  <span>🔒</span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="role-login-button"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : `Sign In as ${selectedRole.title.replace(
                      " Login",
                      ""
                    )}`}

              </button>

            </form>

            <div className="login-security">
              🔐 Secure login to your LearnSmart account
            </div>

          </div>

        )}

      </section>

    </div>
  );
}

export default Login;