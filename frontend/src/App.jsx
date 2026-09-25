import React, { lazy, Suspense, useState } from "react";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";

const FacultyDashboard = lazy(
  () => import("./pages/FacultyDashboard")
);

const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard")
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "";
  });

  const handleLogin = () => {
    const role = localStorage.getItem("userRole") || "";

    console.log("APP: LOGIN SUCCESS");
    console.log("APP: USER ROLE =", role);

    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    setUserRole("");
    setIsLoggedIn(false);
  };

  console.log("APP RENDER:", {
    isLoggedIn,
    userRole,
    hasToken: Boolean(
      localStorage.getItem("accessToken")
    ),
  });

  /*
   * LOGIN PAGE
   */
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  /*
   * STUDENT DASHBOARD
   */
  if (userRole === "student") {
    return (
      <Dashboard
        onLogout={handleLogout}
      />
    );
  }

  /*
   * FACULTY DASHBOARD
   */
  if (userRole === "faculty") {
    return (
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Arial",
              fontSize: "20px",
            }}
          >
            Loading Faculty Dashboard...
          </div>
        }
      >
        <FacultyDashboard
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  /*
   * ADMIN DASHBOARD
   */
  if (userRole === "admin") {
    return (
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Arial",
              fontSize: "20px",
            }}
          >
            Loading Admin Dashboard...
          </div>
        }
      >
        <AdminDashboard
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  /*
   * IF SOMETHING IS WRONG WITH THE STORED ROLE,
   * CLEAR LOGIN AND RETURN TO LOGIN PAGE.
   */
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("userRole");

  return <Login onLogin={handleLogin} />;
}

export default App;