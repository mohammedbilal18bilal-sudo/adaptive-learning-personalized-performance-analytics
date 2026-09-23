import React from "react";

function StatCard({ icon, value, title, change }) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <h2>{value}</h2>

        <p>{title}</p>

        <span>{change}</span>

      </div>

    </div>
  );
}

export default StatCard;