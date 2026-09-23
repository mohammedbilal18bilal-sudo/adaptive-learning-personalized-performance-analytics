import React from "react";

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="logo-section">
        <div className="logo-icon">🎓</div>

        <div>
          <h2>LearnSmart</h2>
          <p>Adaptive Learning Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        <a href="#" className="nav-item active">
          <span>🏠</span>
          <span>Dashboard</span>
        </a>

        <a href="#" className="nav-item">
          <span>📖</span>
          <span>My Courses</span>
        </a>

        <a href="#" className="nav-item">
          <span>📝</span>
          <span>Assessments</span>
        </a>

        <a href="#" className="nav-item">
          <span>📊</span>
          <span>Progress</span>
        </a>

        <a href="#" className="nav-item">
          <span>👤</span>
          <span>Profile</span>
        </a>

      </nav>

      {/* Logout */}
      <div className="logout-section">
        <a href="#" className="nav-item logout">
          <span>🚪</span>
          <span>Logout</span>
        </a>
      </div>

    </aside>
  );
}

export default Sidebar;