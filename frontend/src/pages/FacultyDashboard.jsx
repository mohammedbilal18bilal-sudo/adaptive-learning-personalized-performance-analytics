import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";

function FacultyDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "Faculty";
  const token = localStorage.getItem("accessToken");

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

  /*
   * ---------------------------------------------------------
   * HELPER FOR DRF RESPONSE
   * ---------------------------------------------------------
   */

  const extractResults = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  /*
   * ---------------------------------------------------------
   * FETCH REAL BACKEND DATA
   * ---------------------------------------------------------
   */

  const fetchFacultyData = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [
        coursesResponse,
        lessonsResponse,
        progressResponse,
        assessmentsResponse,
        attemptsResponse,
        profilesResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/`, { headers }),
        fetch(`${API_BASE_URL}/lessons/`, { headers }),
        fetch(`${API_BASE_URL}/progress/`, { headers }),
        fetch(`${API_BASE_URL}/assessments/`, { headers }),
        fetch(`${API_BASE_URL}/attempts/`, { headers }),
        fetch(`${API_BASE_URL}/profiles/`, { headers }),
      ]);

      console.log(
        "FACULTY COURSES STATUS:",
        coursesResponse.status
      );

      console.log(
        "FACULTY LESSONS STATUS:",
        lessonsResponse.status
      );

      console.log(
        "FACULTY PROGRESS STATUS:",
        progressResponse.status
      );

      console.log(
        "FACULTY ASSESSMENTS STATUS:",
        assessmentsResponse.status
      );

      console.log(
        "FACULTY ATTEMPTS STATUS:",
        attemptsResponse.status
      );

      console.log(
        "FACULTY PROFILES STATUS:",
        profilesResponse.status
      );

      /*
       * JWT SESSION CHECK
       */

      if (
        coursesResponse.status === 401 ||
        lessonsResponse.status === 401 ||
        progressResponse.status === 401 ||
        assessmentsResponse.status === 401 ||
        attemptsResponse.status === 401 ||
        profilesResponse.status === 401
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");

        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      /*
       * READ JSON RESPONSES
       */

      const [
        coursesData,
        lessonsData,
        progressData,
        assessmentsData,
        attemptsData,
        profilesData,
      ] = await Promise.all([
        coursesResponse.json(),
        lessonsResponse.json(),
        progressResponse.json(),
        assessmentsResponse.json(),
        attemptsResponse.json(),
        profilesResponse.json(),
      ]);

      /*
       * SAVE REAL BACKEND DATA
       */

      const courseList = extractResults(coursesData);
      const lessonList = extractResults(lessonsData);
      const progressList = extractResults(progressData);
      const assessmentList = extractResults(assessmentsData);
      const attemptList = extractResults(attemptsData);
      const profileList = extractResults(profilesData);

      setCourses(courseList);
      setLessons(lessonList);
      setProgress(progressList);
      setAssessments(assessmentList);
      setAttempts(attemptList);
      setProfiles(profileList);

      console.log("REAL FACULTY COURSES:", courseList);
      console.log("REAL FACULTY LESSONS:", lessonList);
      console.log("REAL FACULTY PROGRESS:", progressList);
      console.log(
        "REAL FACULTY ASSESSMENTS:",
        assessmentList
      );
      console.log("REAL FACULTY ATTEMPTS:", attemptList);
      console.log("REAL FACULTY PROFILES:", profileList);

    } catch (fetchError) {
      console.error(
        "Faculty Dashboard API error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load faculty data from the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOAD DATA WHEN FACULTY DASHBOARD OPENS
   */

  useEffect(() => {
    fetchFacultyData();
  }, []);

  /*
   * ---------------------------------------------------------
   * CALCULATIONS
   * ---------------------------------------------------------
   */

  const studentProfiles = useMemo(() => {
    return profiles.filter(
      (profile) => profile.role === "student"
    );
  }, [profiles]);

  const facultyProfiles = useMemo(() => {
    return profiles.filter(
      (profile) => profile.role === "faculty"
    );
  }, [profiles]);

  const averageScore = useMemo(() => {
    const scored = progress.filter(
      (item) => Number(item.score) > 0
    );

    if (scored.length === 0) {
      return 0;
    }

    const total = scored.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    return Math.round(total / scored.length);
  }, [progress]);

  const completedLessons = useMemo(() => {
    return progress.filter(
      (item) => item.completed === true
    ).length;
  }, [progress]);

  /*
   * ---------------------------------------------------------
   * COURSE LESSON COUNT
   * ---------------------------------------------------------
   */

  const getCourseLessons = (courseId) => {
    return lessons.filter(
      (lesson) =>
        Number(lesson.course) === Number(courseId)
    );
  };

  /*
   * ---------------------------------------------------------
   * STUDENT PROGRESS
   * ---------------------------------------------------------
   */

  const getStudentProgress = (studentId) => {
    return progress.filter(
      (item) =>
        Number(item.student) === Number(studentId)
    );
  };

  const getStudentAverageScore = (studentId) => {
    const studentProgress =
      getStudentProgress(studentId);

    const scored = studentProgress.filter(
      (item) => Number(item.score) > 0
    );

    if (scored.length === 0) {
      return 0;
    }

    const total = scored.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    );

    return Math.round(total / scored.length);
  };

  const getStudentCompletedLessons = (studentId) => {
    return getStudentProgress(studentId).filter(
      (item) => item.completed === true
    ).length;
  };

  /*
   * ---------------------------------------------------------
   * CONTENT
   * ---------------------------------------------------------
   */

  const renderContent = () => {

    /*
     * DASHBOARD
     */

    if (activeSection === "dashboard") {
      return (
        <>
          <div className="faculty-welcome">
            <div>
              <p className="faculty-small-text">
                Faculty Portal
              </p>

              <h1>Welcome, {username}</h1>

              <p>
                Manage your courses, assessments and
                student performance using live backend
                data.
              </p>
            </div>

            <button
              className="faculty-refresh-button"
              onClick={() => {
                setLoading(true);
                fetchFacultyData();
              }}
            >
              ↻ Refresh Data
            </button>
          </div>

          {error && (
            <div className="faculty-error">
              ⚠️ {error}
            </div>
          )}

          <div className="faculty-grid">

            <div className="faculty-card">
              <div className="faculty-card-icon">
                📚
              </div>

              <h3>My Courses</h3>

              <p>
                {courses.length} course
                {courses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">
                👨‍🎓
              </div>

              <h3>Students</h3>

              <p>
                {studentProfiles.length} student
                {studentProfiles.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">
                📝
              </div>

              <h3>Assessments</h3>

              <p>
                {assessments.length} assessment
                {assessments.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="faculty-card">
              <div className="faculty-card-icon">
                📊
              </div>

              <h3>Average Score</h3>

              <p>{averageScore}%</p>
            </div>

          </div>

          <div className="faculty-section-card">

            <div className="faculty-section-header">
              <div>
                <h2>Recent Activity</h2>

                <p>
                  Live assessment activity from the backend
                </p>
              </div>
            </div>

            {attempts.length === 0 ? (
              <div className="database-message">
                No assessment attempts found.
              </div>
            ) : (
              <div className="activity-list">

                {attempts
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className="activity-item"
                    >
                      <div className="activity-icon">
                        📝
                      </div>

                      <div className="activity-content">
                        <strong>
                          Student #{attempt.student}
                        </strong>

                        <span>
                          Assessment #{attempt.assessment}
                        </span>
                      </div>

                      <div className="activity-score">
                        {attempt.percentage ?? attempt.score}%
                      </div>
                    </div>
                  ))}

              </div>
            )}

          </div>
        </>
      );
    }

    /*
     * COURSES
     */

    if (activeSection === "courses") {
      return (
        <div className="faculty-section-card">

          <div className="faculty-section-header">
            <div>
              <h2>My Courses</h2>

              <p>
                Courses retrieved from the Django backend
              </p>
            </div>

            <div className="faculty-count-badge">
              {courses.length} Courses
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="database-message">
              No courses found in the backend.
            </div>
          ) : (
            <div className="course-list">

              {courses.map((course) => {

                const courseLessons =
                  getCourseLessons(course.id);

                return (
                  <div
                    key={course.id}
                    className="course-item"
                  >

                    <div className="course-item-icon">
                      📚
                    </div>

                    <div className="course-item-content">

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.description ||
                          "No description available."}
                      </p>

                      <div className="course-meta">
                        <span>
                          📖 {courseLessons.length} lesson
                          {courseLessons.length !== 1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          Course ID: {course.id}
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      );
    }

    /*
     * STUDENTS
     */

    if (activeSection === "students") {
      return (
        <div className="faculty-section-card">

          <div className="faculty-section-header">
            <div>
              <h2>Students</h2>

              <p>
                Student profiles and learning progress
              </p>
            </div>

            <div className="faculty-count-badge">
              {studentProfiles.length} Students
            </div>
          </div>

          {studentProfiles.length === 0 ? (
            <div className="database-message">
              No student profiles found.
            </div>
          ) : (
            <div className="student-list">

              {studentProfiles.map((student) => {

                const studentProgress =
                  getStudentProgress(student.user);

                const completed =
                  getStudentCompletedLessons(
                    student.user
                  );

                const score =
                  getStudentAverageScore(
                    student.user
                  );

                return (
                  <div
                    key={student.id}
                    className="student-item"
                  >

                    <div className="student-avatar">
                      S
                    </div>

                    <div className="student-info">

                      <h3>
                        Student #{student.user}
                      </h3>

                      <p>
                        Profile ID: {student.id}
                      </p>

                    </div>

                    <div className="student-stat">
                      <span>Progress Records</span>
                      <strong>
                        {studentProgress.length}
                      </strong>
                    </div>

                    <div className="student-stat">
                      <span>Completed</span>
                      <strong>
                        {completed}
                      </strong>
                    </div>

                    <div className="student-stat">
                      <span>Average Score</span>
                      <strong>
                        {score}%
                      </strong>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      );
    }

    /*
     * ASSESSMENTS
     */

    if (activeSection === "assessments") {
      return (
        <div className="faculty-section-card">

          <div className="faculty-section-header">
            <div>
              <h2>Assessments</h2>

              <p>
                Assessments available in the backend
              </p>
            </div>

            <div className="faculty-count-badge">
              {assessments.length} Assessments
            </div>
          </div>

          {assessments.length === 0 ? (
            <div className="database-message">
              No assessments found.
            </div>
          ) : (
            <div className="assessment-list">

              {assessments.map((assessment) => {

                const assessmentAttempts =
                  attempts.filter(
                    (attempt) =>
                      Number(attempt.assessment) ===
                      Number(assessment.id)
                  );

                return (
                  <div
                    key={assessment.id}
                    className="assessment-item"
                  >

                    <div className="assessment-icon">
                      📝
                    </div>

                    <div className="assessment-content">

                      <h3>
                        {assessment.title}
                      </h3>

                      <p>
                        {assessment.description ||
                          "No description available."}
                      </p>

                      <div className="assessment-meta">

                        <span>
                          🎯 Total Marks:{" "}
                          {assessment.total_marks}
                        </span>

                        <span>
                          ⏱ Duration:{" "}
                          {assessment.duration_minutes} min
                        </span>

                        <span>
                          👥 Attempts:{" "}
                          {assessmentAttempts.length}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      );
    }

    /*
     * PERFORMANCE
     */

    if (activeSection === "performance") {
      return (
        <div className="faculty-section-card">

          <div className="faculty-section-header">
            <div>
              <h2>Student Performance</h2>

              <p>
                Performance analytics calculated from
                backend progress records
              </p>
            </div>
          </div>

          <div className="performance-summary">

            <div className="performance-summary-card">
              <span>Total Students</span>
              <strong>
                {studentProfiles.length}
              </strong>
            </div>

            <div className="performance-summary-card">
              <span>Progress Records</span>
              <strong>
                {progress.length}
              </strong>
            </div>

            <div className="performance-summary-card">
              <span>Completed Lessons</span>
              <strong>
                {completedLessons}
              </strong>
            </div>

            <div className="performance-summary-card">
              <span>Average Score</span>
              <strong>
                {averageScore}%
              </strong>
            </div>

          </div>

          {studentProfiles.length === 0 ? (
            <div className="database-message">
              No student performance data found.
            </div>
          ) : (
            <div className="performance-list">

              {studentProfiles.map((student) => {

                const studentProgress =
                  getStudentProgress(student.user);

                const completed =
                  getStudentCompletedLessons(
                    student.user
                  );

                const score =
                  getStudentAverageScore(
                    student.user
                  );

                return (
                  <div
                    key={student.id}
                    className="performance-item"
                  >

                    <div className="performance-student">

                      <div className="student-avatar">
                        S
                      </div>

                      <div>
                        <strong>
                          Student #{student.user}
                        </strong>

                        <span>
                          {studentProgress.length} progress
                          record
                          {studentProgress.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                    </div>

                    <div className="performance-stat">
                      <span>Completed</span>

                      <strong>
                        {completed}
                      </strong>
                    </div>

                    <div className="performance-stat">
                      <span>Average Score</span>

                      <strong>
                        {score}%
                      </strong>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      );
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * LOADING SCREEN
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="faculty-loading-screen">

        <div className="faculty-loading-logo">
          A
        </div>

        <h2>
          Connecting to LearnSmart backend...
        </h2>

        <p>
          Loading faculty data from the server
        </p>

      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN FACULTY DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <div className="faculty-app">

      <aside className="faculty-sidebar">

        <div className="faculty-logo">

          <div className="faculty-logo-icon">
            A
          </div>

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
                activeSection === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection(item.id)
              }
            >

              <span className="faculty-nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

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
              {
                menuItems.find(
                  (item) =>
                    item.id === activeSection
                )?.label || "Dashboard"
              }
            </h2>
          </div>

          <div className="faculty-profile">

            <div className="faculty-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="faculty-profile-info">

              <strong>
                {username}
              </strong>

              <span>
                Faculty
              </span>

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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
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

        .faculty-refresh-button {
          border: none;
          background: #4f46e5;
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
        }

        .faculty-refresh-button:hover {
          background: #4338ca;
        }

        .faculty-error {
          padding: 14px 18px;
          background: #fff1f1;
          border: 1px solid #ffd4d4;
          color: #c43d3d;
          border-radius: 12px;
          margin-bottom: 20px;
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
          margin-bottom: 24px;
        }

        .faculty-section-card h2 {
          margin: 0 0 8px;
          font-size: 19px;
        }

        .faculty-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .faculty-section-header p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .faculty-count-badge {
          background: #eef2ff;
          color: #4f46e5;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
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

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .activity-content strong {
          font-size: 14px;
        }

        .activity-content span {
          color: #6b7280;
          font-size: 12px;
        }

        .activity-score {
          font-weight: 700;
          color: #4f46e5;
        }

        .course-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .course-item {
          display: flex;
          gap: 16px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .course-item-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .course-item-content {
          flex: 1;
        }

        .course-item-content h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .course-item-content p {
          margin: 0 0 12px;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }

        .course-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          color: #6b7280;
          font-size: 12px;
        }

        .student-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .student-item {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .student-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .student-info {
          flex: 1;
        }

        .student-info h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .student-info p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .student-stat {
          min-width: 110px;
          text-align: center;
        }

        .student-stat span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .student-stat strong {
          font-size: 17px;
        }

        .assessment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .assessment-item {
          display: flex;
          gap: 16px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .assessment-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #fff1df;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .assessment-content {
          flex: 1;
        }

        .assessment-content h3 {
          margin: 0 0 7px;
          font-size: 16px;
        }

        .assessment-content p {
          margin: 0 0 12px;
          color: #6b7280;
          font-size: 13px;
        }

        .assessment-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          color: #6b7280;
          font-size: 12px;
        }

        .performance-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .performance-summary-card {
          padding: 18px;
          border-radius: 12px;
          background: #f8f9ff;
          border: 1px solid #e5e7eb;
        }

        .performance-summary-card span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .performance-summary-card strong {
          font-size: 24px;
          color: #4f46e5;
        }

        .performance-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .performance-student {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .performance-student div:last-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .performance-student span {
          color: #6b7280;
          font-size: 12px;
        }

        .performance-stat {
          min-width: 130px;
          text-align: center;
        }

        .performance-stat span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .performance-stat strong {
          font-size: 18px;
          color: #111827;
        }

        .faculty-loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: Arial, Helvetica, sans-serif;
          background: #f6f8fc;
        }

        .faculty-loading-logo {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .faculty-loading-screen h2 {
          margin: 0 0 8px;
          color: #111827;
        }

        .faculty-loading-screen p {
          margin: 0;
          color: #6b7280;
        }

        @media (max-width: 1000px) {

          .performance-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .student-item {
            flex-wrap: wrap;
          }

          .student-stat {
            min-width: 100px;
          }

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

          .faculty-welcome {
            flex-direction: column;
            align-items: flex-start;
          }

          .performance-summary {
            grid-template-columns: 1fr 1fr;
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

          .faculty-content {
            padding: 15px;
          }

          .faculty-section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .student-item {
            align-items: flex-start;
          }

          .student-stat {
            text-align: left;
          }

          .performance-summary {
            grid-template-columns: 1fr;
          }

          .performance-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .performance-stat {
            text-align: left;
          }

        }

      `}</style>

    </div>
  );
}

export default FacultyDashboard;
