import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";

function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [profiles, setProfiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "Admin";
  const token = localStorage.getItem("accessToken");

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

  /*
   * ---------------------------------------------------------
   * DRF RESPONSE HELPER
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
   * FETCH REAL ADMIN DATA
   * ---------------------------------------------------------
   */

  const fetchAdminData = async () => {
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
        profilesResponse,
        coursesResponse,
        lessonsResponse,
        assessmentsResponse,
        progressResponse,
        attemptsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/profiles/`, { headers }),
        fetch(`${API_BASE_URL}/courses/`, { headers }),
        fetch(`${API_BASE_URL}/lessons/`, { headers }),
        fetch(`${API_BASE_URL}/assessments/`, { headers }),
        fetch(`${API_BASE_URL}/progress/`, { headers }),
        fetch(`${API_BASE_URL}/attempts/`, { headers }),
      ]);

      console.log(
        "ADMIN PROFILES STATUS:",
        profilesResponse.status
      );

      console.log(
        "ADMIN COURSES STATUS:",
        coursesResponse.status
      );

      console.log(
        "ADMIN LESSONS STATUS:",
        lessonsResponse.status
      );

      console.log(
        "ADMIN ASSESSMENTS STATUS:",
        assessmentsResponse.status
      );

      console.log(
        "ADMIN PROGRESS STATUS:",
        progressResponse.status
      );

      console.log(
        "ADMIN ATTEMPTS STATUS:",
        attemptsResponse.status
      );

      /*
       * JWT SESSION CHECK
       */

      if (
        profilesResponse.status === 401 ||
        coursesResponse.status === 401 ||
        lessonsResponse.status === 401 ||
        assessmentsResponse.status === 401 ||
        progressResponse.status === 401 ||
        attemptsResponse.status === 401
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
       * READ JSON DATA
       */

      const [
        profilesData,
        coursesData,
        lessonsData,
        assessmentsData,
        progressData,
        attemptsData,
      ] = await Promise.all([
        profilesResponse.json(),
        coursesResponse.json(),
        lessonsResponse.json(),
        assessmentsResponse.json(),
        progressResponse.json(),
        attemptsResponse.json(),
      ]);

      /*
       * EXTRACT REAL DATA
       */

      const profileList = extractResults(profilesData);
      const courseList = extractResults(coursesData);
      const lessonList = extractResults(lessonsData);
      const assessmentList =
        extractResults(assessmentsData);
      const progressList =
        extractResults(progressData);
      const attemptList =
        extractResults(attemptsData);

      setProfiles(profileList);
      setCourses(courseList);
      setLessons(lessonList);
      setAssessments(assessmentList);
      setProgress(progressList);
      setAttempts(attemptList);

      console.log(
        "REAL ADMIN PROFILES:",
        profileList
      );

      console.log(
        "REAL ADMIN COURSES:",
        courseList
      );

      console.log(
        "REAL ADMIN LESSONS:",
        lessonList
      );

      console.log(
        "REAL ADMIN ASSESSMENTS:",
        assessmentList
      );

      console.log(
        "REAL ADMIN PROGRESS:",
        progressList
      );

      console.log(
        "REAL ADMIN ATTEMPTS:",
        attemptList
      );

    } catch (fetchError) {
      console.error(
        "Admin Dashboard API error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load admin data from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * LOAD DATA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchAdminData();
  }, []);

  /*
   * ---------------------------------------------------------
   * ROLE COUNTS
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

  const adminProfiles = useMemo(() => {
    return profiles.filter(
      (profile) => profile.role === "admin"
    );
  }, [profiles]);

  /*
   * ---------------------------------------------------------
   * PERFORMANCE CALCULATIONS
   * ---------------------------------------------------------
   */

  const averageScore = useMemo(() => {
    const scored = progress.filter(
      (item) => Number(item.score) > 0
    );

    if (scored.length === 0) {
      return 0;
    }

    const total = scored.reduce(
      (sum, item) =>
        sum + Number(item.score || 0),
      0
    );

    return Math.round(
      total / scored.length
    );
  }, [progress]);

  const completedLessons = useMemo(() => {
    return progress.filter(
      (item) => item.completed === true
    ).length;
  }, [progress]);

  const completionRate = useMemo(() => {
    if (progress.length === 0) {
      return 0;
    }

    return Math.round(
      (completedLessons / progress.length) * 100
    );
  }, [progress, completedLessons]);

  /*
   * ---------------------------------------------------------
   * CONTENT
   * ---------------------------------------------------------
   */

  const renderContent = () => {

    /*
     * -------------------------------------------------------
     * DASHBOARD
     * -------------------------------------------------------
     */

    if (activeSection === "dashboard") {
      return (
        <>
          <div className="admin-welcome">

            <div>
              <p className="admin-small-text">
                Administration Portal
              </p>

              <h1>
                Welcome, {username}
              </h1>

              <p>
                Manage and monitor the Adaptive
                Learning Platform using live backend
                data.
              </p>
            </div>

            <button
              className="admin-refresh-button"
              onClick={() => {
                setLoading(true);
                fetchAdminData();
              }}
            >
              ↻ Refresh Data
            </button>

          </div>

          {error && (
            <div className="admin-error">
              ⚠️ {error}
            </div>
          )}

          <div className="admin-grid">

            <div className="admin-card">
              <div className="admin-card-icon">
                👨‍🎓
              </div>

              <h3>
                Students
              </h3>

              <p>
                {studentProfiles.length} student
                {studentProfiles.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">
                👨‍🏫
              </div>

              <h3>
                Faculty
              </h3>

              <p>
                {facultyProfiles.length} faculty
                {facultyProfiles.length !== 1
                  ? " members"
                  : " member"}
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">
                📚
              </div>

              <h3>
                Courses
              </h3>

              <p>
                {courses.length} course
                {courses.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-card-icon">
                📝
              </div>

              <h3>
                Assessments
              </h3>

              <p>
                {assessments.length} assessment
                {assessments.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

          </div>

          <div className="admin-section-card">

            <div className="admin-section-header">
              <div>
                <h2>
                  Platform Analytics
                </h2>

                <p>
                  Live statistics from the backend
                </p>
              </div>
            </div>

            <div className="analytics-grid">

              <div className="analytics-item">
                <span>
                  Total Users
                </span>

                <strong>
                  {profiles.length}
                </strong>
              </div>

              <div className="analytics-item">
                <span>
                  Lessons
                </span>

                <strong>
                  {lessons.length}
                </strong>
              </div>

              <div className="analytics-item">
                <span>
                  Progress Records
                </span>

                <strong>
                  {progress.length}
                </strong>
              </div>

              <div className="analytics-item">
                <span>
                  Assessment Attempts
                </span>

                <strong>
                  {attempts.length}
                </strong>
              </div>

              <div className="analytics-item">
                <span>
                  Average Score
                </span>

                <strong>
                  {averageScore}%
                </strong>
              </div>

              <div className="analytics-item">
                <span>
                  Completion Rate
                </span>

                <strong>
                  {completionRate}%
                </strong>
              </div>

            </div>

          </div>
        </>
      );
    }

    /*
     * -------------------------------------------------------
     * STUDENTS
     * -------------------------------------------------------
     */

    if (activeSection === "students") {
      return (
        <div className="admin-section-card">

          <div className="admin-section-header">

            <div>
              <h2>
                Students
              </h2>

              <p>
                Student accounts retrieved from the
                backend.
              </p>
            </div>

            <div className="admin-count-badge">
              {studentProfiles.length} Students
            </div>

          </div>

          {studentProfiles.length === 0 ? (
            <div className="database-message">
              No student profiles found.
            </div>
          ) : (
            <div className="user-list">

              {studentProfiles.map((student) => {

                const studentProgress =
                  progress.filter(
                    (item) =>
                      Number(item.student) ===
                      Number(student.user)
                  );

                const completed =
                  studentProgress.filter(
                    (item) =>
                      item.completed === true
                  ).length;

                const scored =
                  studentProgress.filter(
                    (item) =>
                      Number(item.score) > 0
                  );

                const score =
                  scored.length > 0
                    ? Math.round(
                        scored.reduce(
                          (sum, item) =>
                            sum +
                            Number(
                              item.score || 0
                            ),
                          0
                        ) / scored.length
                      )
                    : 0;

                return (
                  <div
                    key={student.id}
                    className="user-item"
                  >

                    <div className="user-avatar student">
                      S
                    </div>

                    <div className="user-main">

                      <h3>
                        Student #{student.user}
                      </h3>

                      <p>
                        Profile ID: {student.id}
                      </p>

                    </div>

                    <div className="user-stat">
                      <span>
                        Progress
                      </span>

                      <strong>
                        {studentProgress.length}
                      </strong>
                    </div>

                    <div className="user-stat">
                      <span>
                        Completed
                      </span>

                      <strong>
                        {completed}
                      </strong>
                    </div>

                    <div className="user-stat">
                      <span>
                        Avg. Score
                      </span>

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
     * -------------------------------------------------------
     * FACULTY
     * -------------------------------------------------------
     */

    if (activeSection === "faculty") {
      return (
        <div className="admin-section-card">

          <div className="admin-section-header">

            <div>
              <h2>
                Faculty
              </h2>

              <p>
                Faculty accounts retrieved from the
                backend.
              </p>
            </div>

            <div className="admin-count-badge">
              {facultyProfiles.length} Faculty
            </div>

          </div>

          {facultyProfiles.length === 0 ? (
            <div className="database-message">
              No faculty profiles found.
            </div>
          ) : (
            <div className="user-list">

              {facultyProfiles.map((faculty) => (

                <div
                  key={faculty.id}
                  className="user-item"
                >

                  <div className="user-avatar faculty">
                    F
                  </div>

                  <div className="user-main">

                    <h3>
                      Faculty #{faculty.user}
                    </h3>

                    <p>
                      Profile ID: {faculty.id}
                    </p>

                  </div>

                  <div className="role-status">
                    Faculty
                  </div>

                </div>

              ))}

            </div>
          )}

        </div>
      );
    }

    /*
     * -------------------------------------------------------
     * COURSES
     * -------------------------------------------------------
     */

    if (activeSection === "courses") {
      return (
        <div className="admin-section-card">

          <div className="admin-section-header">

            <div>
              <h2>
                Courses
              </h2>

              <p>
                All courses currently stored in the
                backend.
              </p>
            </div>

            <div className="admin-count-badge">
              {courses.length} Courses
            </div>

          </div>

          {courses.length === 0 ? (
            <div className="database-message">
              No courses found.
            </div>
          ) : (
            <div className="course-list">

              {courses.map((course) => {

                const courseLessons =
                  lessons.filter(
                    (lesson) =>
                      Number(lesson.course) ===
                      Number(course.id)
                  );

                const courseAssessments =
                  assessments.filter(
                    (assessment) =>
                      Number(assessment.course) ===
                      Number(course.id)
                  );

                return (
                  <div
                    key={course.id}
                    className="course-item"
                  >

                    <div className="course-icon">
                      📚
                    </div>

                    <div className="course-main">

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.description ||
                          "No description available."}
                      </p>

                      <div className="course-meta">

                        <span>
                          📖{" "}
                          {courseLessons.length}
                          {" "}lesson
                          {courseLessons.length !== 1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          📝{" "}
                          {courseAssessments.length}
                          {" "}assessment
                          {courseAssessments.length !== 1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          ID: {course.id}
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
     * -------------------------------------------------------
     * ASSESSMENTS
     * -------------------------------------------------------
     */

    if (activeSection === "assessments") {
      return (
        <div className="admin-section-card">

          <div className="admin-section-header">

            <div>
              <h2>
                Assessments
              </h2>

              <p>
                Assessments stored in the backend.
              </p>
            </div>

            <div className="admin-count-badge">
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

                    <div className="assessment-main">

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
                          ⏱{" "}
                          {assessment.duration_minutes}
                          {" "}minutes
                        </span>

                        <span>
                          👥{" "}
                          {assessmentAttempts.length}
                          {" "}attempt
                          {assessmentAttempts.length !== 1
                            ? "s"
                            : ""}
                        </span>

                        <span>
                          Course:{" "}
                          {assessment.course}
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
     * -------------------------------------------------------
     * ANALYTICS
     * -------------------------------------------------------
     */

    if (activeSection === "analytics") {
      return (
        <div className="admin-section-card">

          <div className="admin-section-header">

            <div>
              <h2>
                Platform Analytics
              </h2>

              <p>
                Calculated from live backend records.
              </p>
            </div>

          </div>

          <div className="analytics-grid large">

            <div className="analytics-item">
              <span>
                Total Users
              </span>

              <strong>
                {profiles.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Students
              </span>

              <strong>
                {studentProfiles.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Faculty
              </span>

              <strong>
                {facultyProfiles.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Admins
              </span>

              <strong>
                {adminProfiles.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Courses
              </span>

              <strong>
                {courses.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Lessons
              </span>

              <strong>
                {lessons.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Assessments
              </span>

              <strong>
                {assessments.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Assessment Attempts
              </span>

              <strong>
                {attempts.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Progress Records
              </span>

              <strong>
                {progress.length}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Completed Lessons
              </span>

              <strong>
                {completedLessons}
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Average Score
              </span>

              <strong>
                {averageScore}%
              </strong>
            </div>

            <div className="analytics-item">
              <span>
                Completion Rate
              </span>

              <strong>
                {completionRate}%
              </strong>
            </div>

          </div>

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
      <div className="admin-loading-screen">

        <div className="admin-loading-logo">
          A
        </div>

        <h2>
          Connecting to LearnSmart backend...
        </h2>

        <p>
          Loading administrator data from the server
        </p>

      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN ADMIN DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <div className="admin-app">

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            A
          </div>

          <div>
            <h2>
              AdaptiveLearn
            </h2>

            <span>
              Admin Portal
            </span>
          </div>

        </div>

        <nav className="admin-nav">

          {menuItems.map((item) => (

            <button
              key={item.id}
              className={`admin-nav-item ${
                activeSection === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection(item.id)
              }
            >

              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          ))}

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
            onClick={onLogout}
          >

            <span>
              🚪
            </span>

            Logout

          </button>

        </div>

      </aside>

      <main className="admin-main">

        <header className="admin-header">

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

          <div className="admin-profile">

            <div className="admin-avatar">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-profile-info">

              <strong>
                {username}
              </strong>

              <span>
                Administrator
              </span>

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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
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

        .admin-refresh-button {
          border: none;
          background: #4f46e5;
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
        }

        .admin-refresh-button:hover {
          background: #4338ca;
        }

        .admin-error {
          padding: 14px 18px;
          background: #fff1f1;
          border: 1px solid #ffd4d4;
          color: #c43d3d;
          border-radius: 12px;
          margin-bottom: 20px;
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
          margin-bottom: 24px;
        }

        .admin-section-card h2 {
          margin: 0 0 8px;
          font-size: 19px;
        }

        .admin-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .admin-section-header p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .admin-count-badge {
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

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .analytics-grid.large {
          grid-template-columns: repeat(3, 1fr);
        }

        .analytics-item {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fafbff;
        }

        .analytics-item span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .analytics-item strong {
          font-size: 25px;
          color: #4f46e5;
        }

        .user-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .user-avatar.student {
          background: #eef2ff;
          color: #4f46e5;
        }

        .user-avatar.faculty {
          background: #e8f8f0;
          color: #15945b;
        }

        .user-main {
          flex: 1;
        }

        .user-main h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .user-main p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .user-stat {
          min-width: 100px;
          text-align: center;
        }

        .user-stat span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .user-stat strong {
          font-size: 17px;
        }

        .role-status {
          background: #e8f8f0;
          color: #15945b;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
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

        .course-icon {
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

        .course-main {
          flex: 1;
        }

        .course-main h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .course-main p {
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

        .assessment-main {
          flex: 1;
        }

        .assessment-main h3 {
          margin: 0 0 7px;
          font-size: 16px;
        }

        .assessment-main p {
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

        .admin-loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: Arial, Helvetica, sans-serif;
          background: #f6f8fc;
        }

        .admin-loading-logo {
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

        .admin-loading-screen h2 {
          margin: 0 0 8px;
          color: #111827;
        }

        .admin-loading-screen p {
          margin: 0;
          color: #6b7280;
        }

        @media (max-width: 1000px) {

          .analytics-grid,
          .analytics-grid.large {
            grid-template-columns: repeat(2, 1fr);
          }

          .user-item {
            flex-wrap: wrap;
          }

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

          .admin-welcome {
            flex-direction: column;
            align-items: flex-start;
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

          .admin-content {
            padding: 15px;
          }

          .admin-section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .analytics-grid,
          .analytics-grid.large {
            grid-template-columns: 1fr;
          }

          .user-item {
            align-items: flex-start;
          }

          .user-stat {
            text-align: left;
          }

        }

      `}</style>

    </div>
  );
}

export default AdminDashboard;
