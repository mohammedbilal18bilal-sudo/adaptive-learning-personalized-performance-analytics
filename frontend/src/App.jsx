import React, { lazy, Suspense, useState } from "react";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const FacultyDashboard = lazy(() =>
  import("./pages/FacultyDashboard")
);

const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard")
);

function LoadingScreen({ role }) {
  return (
    <div className="app-loading-screen">
      <div className="loading-card">
        <div className="loading-logo">L</div>

        <h1 className="loading-brand">
          Learn<span>Smart</span>
        </h1>

        <p className="loading-description">
          Adaptive Learning &amp; Performance Analytics
        </p>

        <div className="loading-spinner"></div>

        <h2>Loading {role}</h2>

        <p className="loading-message">
          Preparing your personalized experience...
        </p>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("accessToken"))
  );

  const [userRole, setUserRole] = useState(() =>
    (localStorage.getItem("userRole") || "").toLowerCase()
  );

  function handleLogin() {
    const role = (
      localStorage.getItem("userRole") || ""
    ).toLowerCase();

    setUserRole(role);
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    setUserRole("");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === "student") {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (userRole === "faculty") {
    return (
      <Suspense
        fallback={<LoadingScreen role="Faculty Dashboard" />}
      >
        <FacultyDashboard onLogout={handleLogout} />
      </Suspense>
    );
  }

  if (userRole === "admin") {
    return (
      <Suspense
        fallback={<LoadingScreen role="Admin Dashboard" />}
      >
        <AdminDashboard onLogout={handleLogout} />
      </Suspense>
    );
  }

  // Unknown role: return to login
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("userRole");

  return <Login onLogin={handleLogin} />;
}

export default App;