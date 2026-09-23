import React from "react";

function AssessmentCard({ icon, title, course, date, status }) {
  return (
    <div className="assessment-row">

      <div className="assessment-icon">
        {icon}
      </div>

      <div className="assessment-info">

        <h4>{title}</h4>

        <p>{course}</p>

      </div>

      <div className="assessment-date">
        📅 {date}
      </div>

      <button
        className={
          status === "Start"
            ? "assessment-btn start"
            : "assessment-btn pending"
        }
      >
        {status}
      </button>

    </div>
  );
}

export default AssessmentCard;