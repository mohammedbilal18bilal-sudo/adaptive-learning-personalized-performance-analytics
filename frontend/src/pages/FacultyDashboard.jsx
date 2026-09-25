import React, { useState } from "react";

function FacultyDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const username = localStorage.getItem("username") || "Faculty";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      id: "courses",
      label: "My Courses",
      icon: "📚",
    },
    {
      id: "students",
      label: "Students",
      icon: "👨‍🎓",
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: "📝",
    },
    {
      id: "performance",
      label: "Student Performance",
      icon: "📊",
    },
  ];

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <>
          <div className="faculty-welcome">
            <div>
              <p className="faculty-small-text">Faculty Portal</p>
              <h1>Welcome, {username}</h1>
              <p>
                Manage your courses, assessments and student performance.
              </p>
            </div>
          </div>

          <div className="faculty-grid">
            <div className="faculty-card">
              <div className="faculty-card-icon">📚</div>
              <h3>My Courses</h3>
              <p>Database not connected</p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">👨‍🎓</div>
              <h3>Students</h3>
              <p>Database not connected</p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">📝</div>
              <h3>Assessments</h3>
              <p>Database not connected</p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">📊</div>
              <h3>Student Performance</h3>
              <p>Database not connected</p>
            </div>
          </div>

          <div className="faculty-section-card">
            <h2>Recent Activity</h2>
            <div className="database-message">
              Database not connected
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="faculty-section-card">
          <h2>My Courses</h2>
          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "students") {
      return (
        <div className="faculty-section-card">
          <h2>Students</h2>
          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "assessments") {
      return (
        <div className="faculty-section-card">
          <h2>Assessments</h2>
          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    if (activeSection === "performance") {
      return (
        <div className="faculty-section-card">
          <h2>Student Performance</h2>
          <div className="database-message">
            Database not connected
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="faculty-app">
      <aside className="faculty-sidebar">
        <div className="faculty-logo">
          <div className="faculty-logo-icon">A</div>

          <div>
            <h2>AdaptiveLearn</h2>
            <span>Faculty Portal</span>
          </div>
        </div>

        <nav className="faculty-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`faculty-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="faculty-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="faculty-sidebar-bottom">
          <button
            className="faculty-logout"
            onClick={onLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="faculty-main">
        <header className="faculty-header">
          <div>
            <h2>
              {menuItems.find(
                (item) => item.id === activeSection
              )?.label || "Dashboard"}
            </h2>
          </div>

          <div className="faculty-profile">
            <div className="faculty-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="faculty-profile-info">
              <strong>{username}</strong>
              <span>Faculty</span>
            </div>
          </div>
        </header>

        <section className="faculty-content">
          {renderContent()}
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .faculty-app {
          min-height: 100vh;
          display: flex;
          background: #f6f8fc;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
        }

        .faculty-sidebar {
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

        .faculty-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 28px;
          border-bottom: 1px solid #eef0f4;
        }

        .faculty-logo-icon {
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

        .faculty-logo h2 {
          margin: 0;
          font-size: 18px;
        }

        .faculty-logo span {
          font-size: 12px;
          color: #6b7280;
        }

        .faculty-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 25px;
        }

        .faculty-nav-item {
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

        .faculty-nav-item:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .faculty-nav-item.active {
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 600;
        }

        .faculty-nav-icon {
          font-size: 18px;
          width: 24px;
        }

        .faculty-sidebar-bottom {
          margin-top: auto;
        }

        .faculty-logout {
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

        .faculty-logout:hover {
          background: #fef2f2;
        }

        .faculty-main {
          margin-left: 260px;
          width: calc(100% - 260px);
          min-height: 100vh;
        }

        .faculty-header {
          height: 76px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
        }

        .faculty-header h2 {
          margin: 0;
          font-size: 21px;
          color: #111827;
        }

        .faculty-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .faculty-avatar {
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

        .faculty-profile-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .faculty-profile-info strong {
          font-size: 14px;
        }

        .faculty-profile-info span {
          font-size: 12px;
          color: #6b7280;
        }

        .faculty-content {
          padding: 32px;
        }

        .faculty-welcome {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
        }

        .faculty-small-text {
          margin: 0 0 8px;
          color: #4f46e5;
          font-size: 13px;
          font-weight: 600;
        }

        .faculty-welcome h1 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .faculty-welcome p {
          color: #6b7280;
          margin-bottom: 0;
        }

        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .faculty-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          min-height: 155px;
        }

        .faculty-card-icon {
          font-size: 28px;
          margin-bottom: 15px;
        }

        .faculty-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
        }

        .faculty-card p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .faculty-section-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 26px;
        }

        .faculty-section-card h2 {
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
          .faculty-sidebar {
            width: 210px;
          }

          .faculty-main {
            margin-left: 210px;
            width: calc(100% - 210px);
          }

          .faculty-grid {
            grid-template-columns: 1fr;
          }

          .faculty-content {
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .faculty-sidebar {
            width: 70px;
            padding: 15px 8px;
          }

          .faculty-logo div:not(.faculty-logo-icon),
          .faculty-nav-item span:not(.faculty-nav-icon),
          .faculty-logout {
            display: none;
          }

          .faculty-nav-item {
            justify-content: center;
          }

          .faculty-main {
            margin-left: 70px;
            width: calc(100% - 70px);
          }

          .faculty-profile-info {
            display: none;
          }

          .faculty-header {
            padding: 0 18px;
          }
        }
      `}</style>
    </div>
  );
}

export default FacultyDashboard;