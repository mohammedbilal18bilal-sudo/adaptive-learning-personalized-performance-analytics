import React from "react";

function CourseCard({ icon, title, completed, total, progress }) {
  return (
    <div className="course-row">

      <div className="course-icon">
        {icon}
      </div>

      <div className="course-info">

        <h4>{title}</h4>

        <p>
          {completed}/{total} lessons
        </p>

      </div>

      <div className="course-progress">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

      </div>

      <div className="progress-number">
        {progress}%
      </div>

      <button className="continue-btn">
        Continue
      </button>

    </div>
  );
}

export default CourseCard;