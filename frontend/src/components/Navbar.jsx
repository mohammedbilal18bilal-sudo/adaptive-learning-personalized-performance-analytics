import React from "react";

function Navbar() {
  return (
    <header className="navbar">

      {/* Search */}
      <div className="search-box">
        <span>🔍</span>

        <input
          type="text"
          placeholder="Search courses, lessons..."
        />
      </div>

      {/* Right side */}
      <div className="navbar-right">

        <div className="notification">
          🔔
          <span className="notification-dot">1</span>
        </div>

        <div className="profile-mini">

          <div className="profile-avatar">
            A
          </div>

          <div className="profile-info">
            <strong>Anshika</strong>
            <span>Student</span>
          </div>

          <span className="dropdown">⌄</span>

        </div>

      </div>

    </header>
  );
}

export default Navbar;