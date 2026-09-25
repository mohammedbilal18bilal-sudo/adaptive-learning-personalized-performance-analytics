import React, { useState } from "react";

function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const username = localStorage.getItem("username") || "Admin";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      id: "students",
      label: "Students",
      icon: "👨‍🎓",
    },
    {
      id: "faculty",
      label: "Faculty",
      icon: "👨‍🏫",
    },
    {
      id: "courses",
      label: "Courses",
      icon: "📚",
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: "📝",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📊",
    },
  ];

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <>
          <div className="admin-welcome">
            <div>
              <p className="admin-small-text">Administration Portal</p>

              <h1>Welcome, {username}</h1>

              <p>
                Manage and monitor the Adaptive Learning Platform.
              </p>
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-card">
              <div className="admin-card-icon">👨‍🎓</div>
              <h3>Students</h3>
              <p>Database not connected</p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">👨‍🏫</div>
              <h3>Faculty</h3>
              <p>Database not connected</p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">📚</div>
              <h3>Courses</h3>
              <p>Database not connected</p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">📝</div>
              <h3>Assessments</h3>
              <p>Database not connected</p>
            </div>
          </div>

          <div className="admin-section-card">
            <h2>Platform Analytics</h2>

            <div className="database-message">
              Database not connected
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "students") {
      return (
        <div className="admin-section-card">
          <h2>Students</h2>

          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "faculty") {
      return (
        <div className="admin-section-card">
          <h2>Faculty</h2>

          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="admin-section-card">
          <h2>Courses</h2>

          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "assessments") {
      return (
        <div className="admin-section-card">
          <h2>Assessments</h2>

          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "analytics") {
      return (
        <div className="admin-section-card">
          <h2>Analytics</h2>

          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">A</div>

          <div>
            <h2>AdaptiveLearn</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            className="admin-logout"
            onClick={onLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2>
              {menuItems.find(
                (item) => item.id === activeSection
              )?.label || "Dashboard"}
            </h2>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="admin-profile-info">
              <strong>{username}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {renderContent()}
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-app {
          min-height: 100vh;
          display: flex;
          background: #f6f8fc;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
        }

        .admin-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 28px;
          border-bottom: 1px solid #eef0f4;
        }

        .admin-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: bold;
        }

        .admin-logo h2 {
          margin: 0;
          font-size: 18px;
        }

        .admin-logo span {
          font-size: 12px;
          color: #6b7280;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 25px;
        }

        .admin-nav-item {
          width: 100%;
          border: none;
          background: transparent;
          padding: 13px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
          text-align: left;
          transition: 0.2s;
        }

        .admin-nav-item:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .admin-nav-item.active {
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 600;
        }

        .admin-nav-icon {
          font-size: 18px;
          width: 24px;
        }

        .admin-sidebar-bottom {
          margin-top: auto;
        }

        .admin-logout {
          width: 100%;
          border: none;
          background: transparent;
          padding: 13px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #dc2626;
          cursor: pointer;
          text-align: left;
        }

        .admin-logout:hover {
          background: #fef2f2;
        }

        .admin-main {
          margin-left: 260px;
          width: calc(100% - 260px);
          min-height: 100vh;
        }

        .admin-header {
          height: 76px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
        }

        .admin-header h2 {
          margin: 0;
          font-size: 21px;
          color: #111827;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .admin-profile-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .admin-profile-info strong {
          font-size: 14px;
        }

        .admin-profile-info span {
          font-size: 12px;
          color: #6b7280;
        }

        .admin-content {
          padding: 32px;
        }

        .admin-welcome {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .admin-small-text {
          margin: 0 0 8px;
          color: #4f46e5;
          font-size: 13px;
          font-weight: 600;
        }

        .admin-welcome h1 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .admin-welcome p {
          color: #6b7280;
          margin-bottom: 0;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .admin-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          min-height: 155px;
        }

        .admin-card-icon {
          font-size: 28px;
          margin-bottom: 15px;
        }

        .admin-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
        }

        .admin-card p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .admin-section-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 26px;
        }

        .admin-section-card h2 {
          margin: 0 0 20px;
          font-size: 19px;
        }

        .database-message {
          min-height: 100px;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          background: #fafafa;
          font-size: 15px;
        }

        @media (max-width: 800px) {
          .admin-sidebar {
            width: 210px;
          }

          .admin-main {
            margin-left: 210px;
            width: calc(100% - 210px);
          }

          .admin-grid {
            grid-template-columns: 1fr;
          }

          .admin-content {
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .admin-sidebar {
            width: 70px;
            padding: 15px 8px;
          }

          .admin-logo div:not(.admin-logo-icon),
          .admin-nav-item span:not(.admin-nav-icon),
          .admin-logout {
            display: none;
          }

          .admin-nav-item {
            justify-content: center;
          }

          .admin-main {
            margin-left: 70px;
            width: calc(100% - 70px);
          }

          .admin-profile-info {
            display: none;
          }

          .admin-header {
            padding: 0 18px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;