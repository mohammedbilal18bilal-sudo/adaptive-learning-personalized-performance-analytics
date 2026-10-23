import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";
import Quiz from "./Quiz";

function Dashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(null);
  const [streakUnavailable, setStreakUnavailable] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [quizAssessment, setQuizAssessment] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hi! I’m LearnSmart AI. Ask me about your courses, lessons, progress, or assessments." },
  ]);
  const [chatSending, setChatSending] = useState(false);

  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username") || "Student";

  /*
   * ---------------------------------------------------------
   * FETCH REAL BACKEND DATA
   * ---------------------------------------------------------
   */

  const fetchDashboardData = async () => {
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

      console.log("Courses status:", coursesResponse.status);
      console.log("Lessons status:", lessonsResponse.status);
      console.log("Progress status:", progressResponse.status);
      console.log("Assessments status:", assessmentsResponse.status);
      console.log("Attempts status:", attemptsResponse.status);
      console.log("Profiles status:", profilesResponse.status);

      /*
       * If JWT is missing/expired.
       */
      if (
        coursesResponse.status === 401 ||
        lessonsResponse.status === 401 ||
        progressResponse.status === 401
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");

        setError("Your login session has expired. Please login again.");
        setLoading(false);

        return;
      }

      const coursesData = await coursesResponse.json();
      const lessonsData = await lessonsResponse.json();
      const progressData = await progressResponse.json();
      const assessmentsData = await assessmentsResponse.json();
      const attemptsData = await attemptsResponse.json();
      const profilesData = await profilesResponse.json();

      /*
       * DRF normally returns:
       *
       * {
       *   count,
       *   next,
       *   previous,
       *   results
       * }
       *
       * But this also supports a normal array.
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

      const courseList = extractResults(coursesData);
      const lessonList = extractResults(lessonsData);
      const progressList = extractResults(progressData);
      const assessmentList = extractResults(assessmentsData);
      const attemptList = extractResults(attemptsData);
      const profileList = extractResults(profilesData);

      /*
       * Find the logged-in student's profile.
       */
      const currentProfile =
        profileList.find(
          (item) =>
            item?.username === username ||
            item?.user_username === username ||
            item?.user === username
        ) || null;

      setCourses(courseList);
      setLessons(lessonList);
      setProgress(progressList);
      setAssessments(assessmentList);
      setAttempts(attemptList);
      setProfile(currentProfile);

      // Streak data is optional: a missing streak endpoint must not
      // prevent the rest of the dashboard from loading.
      try {
        const streakResponse = await fetch(`${API_BASE_URL}/streaks/`, {
          headers,
        });
        if (streakResponse.ok) {
          setStreak(await streakResponse.json());
          setStreakUnavailable(false);
        } else {
          setStreak(null);
          setStreakUnavailable(true);
        }
      } catch (streakFetchError) {
        console.warn("Streak API unavailable:", streakFetchError);
        setStreak(null);
        setStreakUnavailable(true);
      }

      console.log("REAL COURSES:", courseList);
      console.log("REAL LESSONS:", lessonList);
      console.log("REAL PROGRESS:", progressList);
      console.log("REAL ASSESSMENTS:", assessmentList);
      console.log("REAL ATTEMPTS:", attemptList);
      console.log("CURRENT PROFILE:", currentProfile);
    } catch (fetchError) {
      console.error("Dashboard API error:", fetchError);

      setError(
        "Unable to load dashboard data from the backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
   * ---------------------------------------------------------
   * BACKEND DATA CALCULATIONS
   * ---------------------------------------------------------
   */

  const completedLessons = useMemo(() => {
    return progress.filter((item) => item.completed === true);
  }, [progress]);

  const totalLessons = lessons.length;

  const completedCount = completedLessons.length;

  const overallProgress =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  const averageScore = useMemo(() => {
    const scored = progress.filter(
      (item) =>
        typeof item.score === "number" &&
        item.score > 0
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

  /*
   * Course progress.
   */
  const getCourseLessons = (courseId) => {
    return lessons.filter(
      (lesson) => Number(lesson.course) === Number(courseId)
    );
  };

  const getCourseProgress = (courseId) => {
    const courseLessons = getCourseLessons(courseId);

    if (courseLessons.length === 0) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
      };
    }

    const courseLessonIds = courseLessons.map(
      (lesson) => Number(lesson.id)
    );

    const courseProgress = progress.filter((item) =>
      courseLessonIds.includes(Number(item.lesson))
    );

    const completed = courseProgress.filter(
      (item) => item.completed === true
    ).length;

    return {
      total: courseLessons.length,
      completed,
      percentage: Math.round(
        (completed / courseLessons.length) * 100
      ),
    };
  };

  /*
   * Assessment attempt count.
   */
  const assessmentAttemptCount = attempts.length;

  /*
   * Filter programs using search.
   */
  const filteredCourses = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        String(course.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(course.description || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [courses, search]);

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const goToSection = (section) => {
    setSelectedCourse(null);
    setSelectedAssessment(null);
    setQuizAssessment(null);
    setActiveSection(section);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    window.location.reload();
  };

  /*
   * ---------------------------------------------------------
   * COURSE DETAILS
   * ---------------------------------------------------------
   */

  const openCourse = (course) => {
    setSelectedCourse(course);
    setSelectedAssessment(null);
    setActiveSection("course-details");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ---------------------------------------------------------
   * ASSESSMENT DETAILS
   * ---------------------------------------------------------
   */

  const openAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedCourse(null);
    setActiveSection("assessment-details");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ---------------------------------------------------------
   * START QUIZ
   * ---------------------------------------------------------
   */

  const openQuiz = (assessment) => {
    if (!assessment) {
      return;
    }

    setQuizAssessment(assessment);
    setSelectedCourse(null);
    setSelectedAssessment(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ---------------------------------------------------------
   * STYLING HELPERS
   * ---------------------------------------------------------
   */

  const getCourseIcon = (index) => {
    const icons = ["⌘", "◈", "◇", "▣", "◉", "✦"];
    return icons[index % icons.length];
  };

  const getAssessmentIcon = (index) => {
    const icons = ["▤", "✓", "▥", "✎"];
    return icons[index % icons.length];
  };

  const formatDate = (date) => {
    if (!date) {
      return "Available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Available";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * ---------------------------------------------------------
   * QUIZ
   * ---------------------------------------------------------
   */

  if (quizAssessment) {
    return (
      <Quiz
        assessment={quizAssessment}
        onBack={() => {
          setQuizAssessment(null);
          setActiveSection("assessment-details");
          setSelectedAssessment(quizAssessment);
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      />
    );
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */


  const sendChatMessage = async (event) => {
    if (event) event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatSending) return;
    setChatMessages((previous) => [...previous, { role: "user", text: message }]);
    setChatInput("");
    setChatSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.detail || `Chatbot request failed (${response.status}).`);
      }
      setChatMessages((previous) => [...previous, { role: "assistant", text: data.message || "I couldn't generate a reply. Please try again." }]);
    } catch (error) {
      setChatMessages((previous) => [...previous, { role: "assistant", text: `Sorry, I couldn't connect to the chatbot. ${error.message || "Check your login and backend connection."}` }]);
    } finally {
      setChatSending(false);
    }
  };

  if (loading) {
    return (
      <div className="ls-loading-screen">
        <div className="ls-loading-logo">L</div>
        <h2>Loading your dashboard...</h2>
        <p>Connecting to LearnSmart backend</p>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <div className="ls-app">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .ls-app {
          min-height: 100vh;
          display: flex;
          background: #f6f7fb;
          color: #20213b;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ls-sidebar {
          width: 270px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #ececf4;
          padding: 32px 20px;
          position: sticky;
          top: 0;
          align-self: flex-start;
        }

        .ls-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 14px;
          margin-bottom: 48px;
        }

        .ls-logo-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6255e8, #7669ed);
          color: white;
          font-size: 28px;
          font-weight: 800;
          box-shadow: 0 12px 25px rgba(98,85,232,0.22);
        }

        .ls-logo-title {
          font-size: 23px;
          font-weight: 800;
          color: #20213b;
        }

        .ls-logo-subtitle {
          color: #9b9db0;
          font-size: 12px;
          margin-top: 4px;
        }

        .ls-menu-title {
          color: #9b9db0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          margin: 0 16px 16px;
        }

        .ls-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .ls-nav-button {
          width: 100%;
          border: none;
          background: transparent;
          padding: 14px 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 15px;
          color: #70738a;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: 0.2s ease;
        }

        .ls-nav-button:hover {
          background: #f4f2ff;
          color: #5d51dc;
        }

        .ls-nav-button.active {
          background: #efedff;
          color: #5b4de0;
        }

        .ls-nav-icon {
          width: 24px;
          text-align: center;
          font-size: 18px;
        }

        .ls-account-title {
          margin-top: 38px;
        }

        .ls-help-card {
          margin-top: 28px;
          padding: 22px;
          border-radius: 20px;
          background: linear-gradient(
            145deg,
            #f4f1ff,
            #faf9ff
          );
        }

        .ls-help-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e7e3ff;
          color: #5d51df;
          font-weight: 800;
          font-size: 20px;
          margin-bottom: 14px;
        }

        .ls-help-card strong {
          display: block;
          margin-bottom: 8px;
        }

        .ls-help-card p {
          color: #888ba0;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .ls-main {
          flex: 1;
          min-width: 0;
        }

        .ls-topbar {
          height: 88px;
          background: white;
          border-bottom: 1px solid #ededf4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 42px;
          gap: 25px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .ls-search {
          width: 440px;
          max-width: 100%;
          height: 54px;
          border: 1px solid #e6e6ef;
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 0 18px;
          background: #fbfbfd;
        }

        .ls-search span {
          color: #8d90a5;
          margin-right: 10px;
          font-size: 18px;
        }

        .ls-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 14px;
          color: #33354d;
        }

        .ls-top-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .ls-refresh {
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f4f3ff;
          color: #5b50df;
          cursor: pointer;
          font-size: 18px;
        }

        .ls-user {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #dedee8;
          background: white;
          padding: 6px 12px 6px 7px;
          border-radius: 8px;
          min-width: 200px;
        }

        .ls-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ebe9ff;
          color: #5b4fe0;
          font-weight: 800;
          font-size: 18px;
        }

        .ls-user-name {
          font-size: 14px;
          font-weight: 700;
          color: #242640;
        }

        .ls-user-role {
          color: #9a9cae;
          font-size: 12px;
          margin-top: 3px;
        }

        .ls-user-arrow {
          margin-left: auto;
          color: #9294a7;
        }

        .ls-content {
          padding: 46px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .ls-welcome {
          min-height: 220px;
          border-radius: 24px;
          padding: 42px 46px;
          background: linear-gradient(
            115deg,
            #2e307d,
            #6254e5
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          box-shadow: 0 20px 45px rgba(70,65,170,0.18);
          margin-bottom: 30px;
        }

        .ls-eyebrow {
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 800;
          opacity: 0.8;
          margin-bottom: 17px;
        }

        .ls-welcome h1 {
          margin: 0 0 14px;
          font-size: 39px;
          line-height: 1.1;
        }

        .ls-welcome p {
          margin: 0;
          color: #d9d8ff;
          font-size: 15px;
        }

        .ls-welcome-box {
          width: 245px;
          height: 145px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #eeeeff;
          flex-shrink: 0;
        }

        .ls-welcome-star {
          font-size: 35px;
          margin-bottom: 10px;
        }

        .ls-welcome-box span {
          font-size: 12px;
        }

        .ls-error {
          padding: 15px 18px;
          background: #fff1f1;
          border: 1px solid #ffd4d4;
          color: #c43d3d;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .ls-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .ls-stat {
          background: white;
          border: 1px solid #ececf3;
          border-radius: 20px;
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .ls-stat-icon {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #efedff;
          color: #5d51dd;
          font-size: 24px;
          flex-shrink: 0;
        }

        .ls-stat:nth-child(2) .ls-stat-icon {
          background: #e9f3ff;
          color: #397dd7;
        }

        .ls-stat:nth-child(3) .ls-stat-icon {
          background: #e8f8f0;
          color: #1a9a61;
        }

        .ls-stat:nth-child(4) .ls-stat-icon {
          background: #fff1df;
          color: #e78a2b;
        }

        .ls-stat-label {
          color: #8e91a5;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .ls-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #20213b;
        }

        .ls-stat-small {
          color: #a0a2b2;
          font-size: 11px;
          margin-top: 5px;
        }

        .ls-grid-two {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.8fr);
          gap: 24px;
          margin-bottom: 30px;
        }

        .ls-card {
          background: white;
          border: 1px solid #ececf3;
          border-radius: 22px;
          padding: 28px;
        }

        .ls-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          gap: 15px;
        }

        .ls-card-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .ls-card-header p {
          margin: 6px 0 0;
          color: #9a9caf;
          font-size: 12px;
        }

        .ls-link {
          border: none;
          background: transparent;
          color: #5a4fe0;
          font-weight: 700;
          cursor: pointer;
        }

        .ls-course {
          border: 1px solid #ededf4;
          border-radius: 17px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          margin-bottom: 13px;
          transition: 0.2s ease;
        }

        .ls-course:hover {
          border-color: #cfc9ff;
          transform: translateY(-1px);
        }

        .ls-course-icon {
          width: 54px;
          height: 54px;
          border-radius: 15px;
          background: #efedff;
          color: #5b50dc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
        }

        .ls-course-main {
          flex: 1;
          min-width: 0;
        }

        .ls-course-title {
          font-weight: 700;
          color: #292b45;
          margin-bottom: 6px;
        }

        .ls-course-description {
          color: #9294a6;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ls-progress-line {
          height: 8px;
          border-radius: 20px;
          background: #eeeeF6;
          overflow: hidden;
          margin-top: 12px;
        }

        .ls-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #5d51df,
            #8378f0
          );
        }

        .ls-course-percent {
          color: #5a50dc;
          font-weight: 800;
          font-size: 13px;
          min-width: 45px;
          text-align: right;
        }

        .ls-circle-wrap {
          display: flex;
          justify-content: center;
          padding: 15px 0 25px;
        }

        .ls-circle {
          width: 190px;
          height: 190px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: conic-gradient(
            #5c51df var(--progress),
            #ededf4 0
          );
        }

        .ls-circle-inner {
          width: 145px;
          height: 145px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .ls-circle-inner strong {
          font-size: 34px;
        }

        .ls-circle-inner span {
          color: #999bad;
          font-size: 12px;
          margin-top: 4px;
        }

        .ls-progress-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid #f0f0f5;
          font-size: 13px;
        }

        .ls-progress-row:last-child {
          border-bottom: none;
        }

        .ls-progress-row span {
          color: #777a91;
        }

        .ls-progress-row strong {
          color: #252741;
        }

        .ls-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        .ls-assessment {
          border: 1px solid #ededf4;
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
          cursor: pointer;
        }

        .ls-assessment:hover {
          border-color: #cfc9ff;
          background: #fcfbff;
        }

        .ls-assessment-icon {
          width: 47px;
          height: 47px;
          border-radius: 13px;
          background: #fff0dc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dc8526;
          flex-shrink: 0;
        }

        .ls-assessment-main {
          flex: 1;
          min-width: 0;
        }

        .ls-assessment-title {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .ls-assessment-course {
          color: #9294a5;
          font-size: 11px;
        }

        .ls-assessment-date {
          color: #77798e;
          font-size: 11px;
          text-align: right;
        }

        .ls-activity {
          padding: 14px 0;
          border-bottom: 1px solid #eeeeF4;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .ls-activity:last-child {
          border-bottom: none;
        }

        .ls-activity-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #f0efff;
          color: #5d51dc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ls-activity p {
          margin: 0 0 5px;
          font-size: 13px;
          color: #4c4e65;
        }

        .ls-activity small {
          color: #a0a1b1;
          font-size: 10px;
        }

        .ls-recommendation {
          background: linear-gradient(
            110deg,
            #f1efff,
            #faf9ff
          );
          border: 1px solid #e6e3ff;
          border-radius: 20px;
          padding: 23px;
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .ls-recommendation-icon {
          width: 50px;
          height: 50px;
          background: #e2deff;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ls-recommendation-main {
          flex: 1;
        }

        .ls-recommendation h3 {
          margin: 0 0 6px;
        }

        .ls-recommendation p {
          margin: 0;
          color: #83859a;
          font-size: 12px;
        }

        .ls-primary-button {
          border: none;
          background: #5c50df;
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .ls-section-title {
          font-size: 28px;
          margin: 0 0 8px;
        }

        .ls-section-description {
          color: #8f91a4;
          margin-bottom: 28px;
        }

        .ls-course-detail {
          background: white;
          border: 1px solid #ededf3;
          border-radius: 22px;
          padding: 30px;
        }

        .ls-back-button {
          border: none;
          background: transparent;
          color: #5c50df;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          margin-bottom: 25px;
        }

        .ls-detail-title {
          font-size: 30px;
          margin: 0 0 12px;
        }

        .ls-detail-description {
          color: #85879b;
          line-height: 1.7;
          margin-bottom: 25px;
        }

        .ls-lesson {
          border: 1px solid #ededf4;
          border-radius: 15px;
          padding: 17px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ls-lesson-status {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f0efff;
          color: #5d51df;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .ls-lesson-status.completed {
          background: #e6f8ef;
          color: #15965b;
        }

        .ls-lesson-info {
          flex: 1;
        }

        .ls-lesson-info strong {
          display: block;
          margin-bottom: 4px;
        }

        .ls-lesson-info span {
          color: #999bad;
          font-size: 11px;
        }

        .ls-badge {
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          background: #f1f0ff;
          color: #5b50df;
        }

        .ls-profile {
          background: white;
          border: 1px solid #ededf4;
          border-radius: 22px;
          padding: 35px;
          max-width: 800px;
        }

        .ls-profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #ebe9ff;
          color: #5b50df;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .ls-profile-row {
          padding: 16px 0;
          border-bottom: 1px solid #eeeeF4;
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .ls-profile-row span {
          color: #9193a6;
        }

        .ls-profile-row strong {
          color: #282a44;
        }

        .ls-empty {
          padding: 45px 20px;
          text-align: center;
          color: #9496a8;
        }

        .ls-loading-screen {
          min-height: 100vh;
          background: #f6f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #20213b;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ls-loading-logo {
          width: 65px;
          height: 65px;
          border-radius: 20px;
          background: #6255e8;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .ls-loading-screen p {
          color: #9698aa;
        }

        @media (max-width: 1150px) {
          .ls-sidebar {
            width: 220px;
          }

          .ls-content {
            padding: 28px;
          }

          .ls-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .ls-grid-two {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 850px) {
          .ls-app {
            display: block;
          }

          .ls-sidebar {
            position: static;
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid #ededf4;
            padding: 20px;
          }

          .ls-logo {
            margin-bottom: 20px;
          }

          .ls-nav {
            flex-direction: row;
            overflow-x: auto;
          }

          .ls-nav-button {
            min-width: max-content;
          }

          .ls-menu-title,
          .ls-account-title,
          .ls-help-card {
            display: none;
          }

          .ls-topbar {
            position: static;
            height: auto;
            padding: 18px 22px;
            flex-wrap: wrap;
          }

          .ls-search {
            width: 100%;
          }

          .ls-top-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .ls-welcome {
            flex-direction: column;
            align-items: flex-start;
          }

          .ls-welcome-box {
            width: 100%;
          }

          .ls-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .ls-content {
            padding: 18px;
          }

          .ls-stats {
            grid-template-columns: 1fr;
          }

          .ls-welcome {
            padding: 28px;
          }

          .ls-welcome h1 {
            font-size: 29px;
          }

          .ls-user {
            min-width: 0;
          }

          .ls-grid-two {
            grid-template-columns: 1fr;
          }

          .ls-recommendation {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* LearnSmart student workspace — warm editorial visual system */
        .ls-app {
          --ls-ink: #20372d;
          --ls-muted: #778379;
          --ls-paper: #f6f5ef;
          --ls-green: #244b3a;
          --ls-green-deep: #18392c;
          --ls-lime: #d8e5a6;
          --ls-orange: #d9824b;
          background: var(--ls-paper);
          color: var(--ls-ink);
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }
        .ls-sidebar {
          width: 252px;
          background: var(--ls-green-deep);
          color: #f7f5eb;
          border-right: 0;
          padding: 30px 18px;
        }
        .ls-logo { padding: 0 10px; margin-bottom: 52px; }
        .ls-logo-box {
          width: 48px; height: 48px; border-radius: 14px;
          background: var(--ls-lime); color: var(--ls-green-deep);
          box-shadow: none; font-size: 25px;
        }
        .ls-logo-title { color: #fbf8ed; letter-spacing: -0.7px; }
        .ls-logo-subtitle { color: #b8c7b9; }
        .ls-menu-title { color: #91a99a; letter-spacing: 1.6px; font-size: 10px; }
        .ls-nav-button { color: #d2ddd3; border-radius: 10px; padding: 13px 14px; }
        .ls-nav-button:hover { background: #2c5140; color: #fff; }
        .ls-nav-button.active { background: var(--ls-lime); color: var(--ls-green-deep); }
        .ls-help-card { background: #254737; border: 1px solid #42624f; border-radius: 14px; }
        .ls-help-icon { background: var(--ls-lime); color: var(--ls-green-deep); }
        .ls-help-card p { color: #c0d0c2; }
        .ls-main { background: var(--ls-paper); }
        .ls-topbar {
          background: rgba(246,245,239,.96); border-bottom: 1px solid #e4e6dc;
          padding: 0 38px; backdrop-filter: blur(12px);
        }
        .ls-search { background: #fff; border: 1px solid #e0e4d9; border-radius: 10px; height: 48px; }
        .ls-search input { color: var(--ls-ink); }
        .ls-refresh { background: #e7eddd; color: var(--ls-green); border-radius: 12px; }
        .ls-user { border: 1px solid #e0e4d9; border-radius: 12px; background: #fff; }
        .ls-avatar { background: var(--ls-green); color: #fff; }
        .ls-user-name { color: var(--ls-ink); }
        .ls-user-role { color: var(--ls-muted); text-transform: capitalize; }
        .ls-content { padding: 38px; }
        .ls-welcome {
          min-height: 240px; border-radius: 18px; padding: 38px 42px;
          background: var(--ls-green); color: #fff; box-shadow: none;
          position: relative; overflow: hidden;
        }
        .ls-welcome::after {
          content: ""; position: absolute; width: 310px; height: 310px;
          right: 140px; top: -190px; border: 1px solid rgba(216,229,166,.3);
          border-radius: 50%; pointer-events: none;
        }
        .ls-eyebrow { color: var(--ls-lime); letter-spacing: 2.4px; font-size: 10px; }
        .ls-welcome h1 {
          font-family: Georgia, "Times New Roman", serif; font-weight: 500;
          letter-spacing: -1.1px; font-size: clamp(30px, 3vw, 42px); max-width: 650px;
        }
        .ls-welcome p { color: #d7e1d6; line-height: 1.7; max-width: 490px; }
        .ls-welcome-box {
          border: 1px solid rgba(216,229,166,.42); background: #2c5944;
          border-radius: 16px; width: 205px; height: 145px; z-index: 1;
        }
        .ls-welcome-star { color: var(--ls-lime); }
        .ls-stats { gap: 14px; }
        .ls-stat {
          background: #fff; border: 1px solid #e6e7de; border-radius: 14px;
          padding: 22px 18px; gap: 14px; box-shadow: 0 3px 12px rgba(30,53,39,.025);
        }
        .ls-stat-icon { background: #e9efdf; color: var(--ls-green); border-radius: 12px; width: 48px; height: 48px; }
        .ls-stat:nth-child(2) .ls-stat-icon { background: #f8e9dc; color: #ad6135; }
        .ls-stat:nth-child(3) .ls-stat-icon { background: #e4eee8; color: #2c674b; }
        .ls-stat:nth-child(4) .ls-stat-icon { background: #f4edcf; color: #8a7029; }
        .ls-stat-label { color: var(--ls-muted); }
        .ls-stat-value { color: var(--ls-ink); font-family: Georgia, "Times New Roman", serif; font-size: 30px; }
        .ls-stat-small { color: #9aa398; }
        .ls-card, .ls-course-detail, .ls-profile {
          background: #fff; border: 1px solid #e4e6dc; border-radius: 16px;
          box-shadow: 0 3px 12px rgba(30,53,39,.025);
        }
        .ls-card { padding: 25px; }
        .ls-card-header h2, .ls-detail-title, .ls-section-title { color: var(--ls-ink); }
        .ls-card-header h2 { font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 500; }
        .ls-card-header p, .ls-section-description { color: var(--ls-muted); }
        .ls-link, .ls-back-button { color: var(--ls-green); }
        .ls-course { border: 1px solid #e7e9e0; border-radius: 12px; padding: 15px; }
        .ls-course:hover, .ls-assessment:hover { border-color: #b8cba8; background: #fafbf6; }
        .ls-course-icon { background: #e8efdf; color: var(--ls-green); border-radius: 12px; }
        .ls-course-title, .ls-assessment-title { color: var(--ls-ink); }
        .ls-course-description, .ls-assessment-course { color: var(--ls-muted); }
        .ls-progress-line { background: #e9ece3; height: 7px; }
        .ls-progress-fill { background: var(--ls-green); }
        .ls-course-percent { color: var(--ls-green); }
        .ls-circle { background: conic-gradient(var(--ls-orange) var(--progress), #e9ece3 0); }
        .ls-circle-inner { background: #fff; }
        .ls-circle-inner strong { color: var(--ls-green); font-family: Georgia, "Times New Roman", serif; }
        .ls-progress-row { border-bottom-color: #edf0e8; }
        .ls-progress-row span { color: var(--ls-muted); }
        .ls-progress-row strong { color: var(--ls-ink); }
        .ls-assessment { border-color: #e7e9e0; border-radius: 12px; }
        .ls-assessment-icon { background: #f8e9dc; color: #ad6135; border-radius: 11px; }
        .ls-activity { border-bottom-color: #edf0e8; }
        .ls-activity-icon { background: #e8efdf; color: var(--ls-green); }
        .ls-activity p { color: #405348; }
        .ls-recommendation { background: #eaf0df; border: 1px solid #dbe5cc; border-radius: 15px; }
        .ls-recommendation-icon { background: #d9e5c5; color: var(--ls-green); border-radius: 12px; }
        .ls-recommendation h3 { color: var(--ls-ink); font-family: Georgia, "Times New Roman", serif; font-size: 21px; }
        .ls-recommendation p { color: #657568; line-height: 1.6; }
        .ls-primary-button { background: var(--ls-green); border-radius: 9px; }
        .ls-primary-button:hover { background: var(--ls-green-deep); }
        .ls-section-title { font-family: Georgia, "Times New Roman", serif; font-weight: 500; letter-spacing: -.6px; }
        .ls-course-detail, .ls-profile { padding: 30px; }
        .ls-detail-title { font-family: Georgia, "Times New Roman", serif; font-weight: 500; }
        .ls-detail-description { color: var(--ls-muted); line-height: 1.75; }
        .ls-lesson { border-color: #e7e9e0; border-radius: 12px; }
        .ls-lesson-status { background: #e8efdf; color: var(--ls-green); }
        .ls-lesson-status.completed { background: #e1eee5; color: #286b48; }
        .ls-badge { background: #e8efdf; color: var(--ls-green); }
        .ls-profile-avatar { background: var(--ls-green); color: #fff; }
        .ls-profile-row { border-bottom-color: #edf0e8; }
        .ls-profile-row span { color: var(--ls-muted); }
        .ls-profile-row strong { color: var(--ls-ink); }
        .ls-empty { color: #8a958a; }
        .ls-error { border-radius: 10px; }
        .ls-app footer { color: #879286 !important; }
        @media (max-width: 850px) {
          .ls-sidebar { background: var(--ls-green-deep); }
          .ls-topbar { padding: 18px 22px; }
          .ls-content { padding: 24px; }
          .ls-welcome { padding: 30px; }
        }
        @media (max-width: 600px) {
          .ls-content { padding: 16px; }
          .ls-welcome { padding: 25px 22px; }
          .ls-stat { padding: 18px; }
        }


        /* LearnSmart light-blue + white theme (high-specificity overrides) */
        .ls-app { background: #edf6ff !important; color: #17324d !important; }
        .ls-main, .ls-content { background: #edf6ff !important; }
        .ls-sidebar, .ls-topbar, .ls-card, .ls-course-detail, .ls-profile,
        .ls-stat, .ls-user, .ls-search, .ls-help-card { background-color: #ffffff !important; }
        .ls-sidebar { border-right-color: #d8e8f8 !important; }
        .ls-topbar { border-bottom-color: #d8e8f8 !important; }
        .ls-logo-box, .ls-loading-logo, .ls-avatar { background: linear-gradient(135deg, #3984d6, #67b7f5) !important; color: #ffffff !important; }
        .ls-logo-title, .ls-user-name, .ls-profile-row strong, .ls-card-header h2,
        .ls-detail-title, .ls-section-title, .ls-course-title, .ls-assessment-title,
        .ls-stat-value, .ls-stat-label, .ls-stat-small, .ls-profile-row, .ls-nav-button { color: #17324d !important; }
        .ls-logo-subtitle, .ls-user-role, .ls-profile-row span, .ls-card-header p,
        .ls-section-description, .ls-course-description, .ls-assessment-course { color: #647c93 !important; }
        .ls-nav-button.active { background: #e0f0ff !important; color: #2168ad !important; }
        .ls-nav-button:hover { background: #eff7ff !important; color: #2168ad !important; }
        .ls-welcome { background: linear-gradient(120deg, #d9edff, #f4faff) !important; color: #17324d !important; border: 1px solid #c9e3fa !important; }
        .ls-welcome h1, .ls-welcome p, .ls-welcome-box span { color: #17324d !important; }
        .ls-eyebrow, .ls-welcome-star { color: #2878c8 !important; }
        .ls-welcome-box { background: #ffffff !important; border-color: #c9e3fa !important; }
        .ls-stat-icon, .ls-course-icon, .ls-refresh, .ls-assessment-icon { background: #e4f2ff !important; color: #2878c8 !important; }
        .ls-progress-fill { background: #3984d6 !important; }
        .ls-link, .ls-back-button, .ls-course-percent { color: #2878c8 !important; }
        .ls-app button:not(.ls-chat-toggle):not(.ls-chat-close) { }
        .ls-loading-screen { background: #edf6ff !important; }
        .ls-chat-toggle { position: fixed; right: 26px; bottom: 24px; z-index: 9998; border: 0; border-radius: 999px; padding: 15px 20px; background: #2878c8; color: white; font-weight: 700; box-shadow: 0 8px 26px #174a7a35; cursor: pointer; }
        .ls-chat-panel { position: fixed; right: 24px; bottom: 86px; z-index: 9999; width: min(370px, calc(100vw - 32px)); height: min(510px, calc(100vh - 120px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #d4e7f8; border-radius: 18px; background: white; box-shadow: 0 16px 50px #17324d2b; font-family: Arial, Helvetica, sans-serif; }
        .ls-chat-head { padding: 15px 17px; display: flex; align-items: center; justify-content: space-between; background: #2878c8; color: white; }
        .ls-chat-head small { display: block; opacity: .85; margin-top: 3px; }
        .ls-chat-close { border: 0; background: transparent; color: white; font-size: 24px; cursor: pointer; }
        .ls-chat-log { flex: 1; overflow-y: auto; padding: 14px; background: #f3f9ff; display: flex; flex-direction: column; gap: 10px; }
        .ls-chat-bubble { max-width: 88%; white-space: pre-wrap; overflow-wrap: anywhere; padding: 10px 12px; border-radius: 13px; font-size: 13px; line-height: 1.5; }
        .ls-chat-bubble.assistant { align-self: flex-start; background: white; border: 1px solid #e0edf8; color: #22384d; }
        .ls-chat-bubble.user { align-self: flex-end; background: #dceeff; color: #173e66; }
        .ls-chat-form { display: flex; gap: 8px; padding: 11px; border-top: 1px solid #e0edf8; background: white; }
        .ls-chat-form input { min-width: 0; flex: 1; padding: 11px 12px; border: 1px solid #cfe0ef; border-radius: 10px; outline-color: #3984d6; }
        .ls-chat-form button { border: 0; border-radius: 10px; padding: 0 15px; background: #2878c8; color: white; font-weight: 700; cursor: pointer; }
        .ls-chat-form button:disabled { opacity: .55; cursor: wait; }

        /* Daily learning streak card and milestone graph */
        .ls-streak-card {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(260px, .9fr);
          gap: 26px;
          align-items: center;
          margin: 0 0 30px;
          padding: 26px 30px;
          border: 1px solid #cfe5fa;
          border-radius: 22px;
          background: linear-gradient(115deg, #ffffff 0%, #f1f8ff 100%);
          box-shadow: 0 8px 24px rgba(40, 120, 200, .07);
          min-width: 0;
        }
        .ls-streak-heading { display: flex; align-items: center; gap: 15px; min-width: 0; }
        .ls-streak-flame {
          width: 68px; height: 68px; flex: 0 0 68px; display: grid; place-items: center;
          border-radius: 20px; background: linear-gradient(145deg, #fff0d8, #ffe0c2);
          font-size: 38px; box-shadow: inset 0 0 0 1px #ffd5a5;
        }
        .ls-streak-eyebrow { margin: 0 0 5px; color: #2878c8; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .ls-streak-title { margin: 0; color: #17324d; font-size: 21px; font-weight: 800; }
        .ls-streak-subtitle { margin: 7px 0 0; color: #647c93; font-size: 13px; line-height: 1.5; }
        .ls-streak-metrics { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 22px; }
        .ls-streak-metric { display: flex; align-items: baseline; gap: 7px; color: #647c93; font-size: 12px; }
        .ls-streak-metric strong { color: #17324d; font-size: 25px; }
        .ls-streak-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; padding: 7px 10px; border-radius: 999px; background: #e6f6ed; color: #20764a; font-size: 12px; font-weight: 700; }
        .ls-streak-status.pending { background: #fff2df; color: #9a5a18; }
        .ls-streak-graph { min-width: 0; padding: 17px 18px 13px; border: 1px solid #dbeafa; border-radius: 17px; background: rgba(255,255,255,.9); }
        .ls-streak-graph-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; color: #17324d; font-size: 13px; font-weight: 800; }
        .ls-streak-graph-top span { color: #6b849c; font-size: 11px; font-weight: 600; }
        .ls-streak-bars { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); align-items: end; gap: 9px; height: 78px; }
        .ls-streak-bar-wrap { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 7px; height: 100%; min-width: 0; }
        .ls-streak-bar { width: 100%; max-width: 28px; min-height: 8px; border-radius: 7px 7px 3px 3px; background: #e3f0fc; border: 1px solid #cfe4f8; }
        .ls-streak-bar.reached { background: linear-gradient(180deg, #7cc3ff, #2878c8); border-color: #69b4f5; }
        .ls-streak-bar-label { color: #7790a7; font-size: 10px; }
        .ls-streak-goal { margin-top: 13px; display: flex; justify-content: space-between; gap: 12px; color: #647c93; font-size: 11px; }
        .ls-streak-goal strong { color: #2878c8; }
        .ls-streak-unavailable { margin: 0 0 30px; padding: 16px 20px; border: 1px dashed #c8deef; border-radius: 16px; background: #f8fbff; color: #647c93; font-size: 13px; }
        @media (max-width: 850px) { .ls-streak-card { grid-template-columns: 1fr; padding: 22px; } }
        @media (max-width: 600px) { .ls-streak-card { padding: 18px; gap: 18px; } .ls-streak-flame { width: 56px; height: 56px; flex-basis: 56px; font-size: 32px; border-radius: 16px; } .ls-streak-title { font-size: 18px; } .ls-streak-metrics { gap: 16px; } .ls-streak-bars { gap: 6px; } }

        /* Layout safety fixes: isolate dashboard from global app CSS */
        .ls-app, .ls-app * { box-sizing: border-box; }
        .ls-app { display: flex; align-items: stretch; width: 100%; max-width: 100%; min-height: 100vh; overflow-x: clip; }
        .ls-app > .ls-sidebar { flex: 0 0 270px; width: 270px; min-width: 270px; height: 100vh; overflow-y: auto; z-index: 20; }
        .ls-app > .ls-main { flex: 1 1 0; width: calc(100% - 270px); min-width: 0; max-width: calc(100% - 270px); overflow-x: clip; }
        .ls-app .ls-content { width: 100%; max-width: 1600px; min-width: 0; margin: 0 auto; padding: 32px; }
        .ls-app .ls-grid-two { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(280px, .9fr); align-items: start; gap: 24px; width: 100%; min-width: 0; margin: 0 0 30px; }
        .ls-app .ls-bottom-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 24px; width: 100%; min-width: 0; margin: 0 0 30px; }
        .ls-app .ls-card { position: relative; display: block; float: none; width: 100%; min-width: 0; max-width: 100%; height: auto; min-height: 0; margin: 0 0 24px; overflow-wrap: anywhere; }
        .ls-app .ls-grid-two > .ls-card, .ls-app .ls-bottom-grid > .ls-card { margin: 0; }
        .ls-app .ls-course { position: relative; display: flex; align-items: center; width: 100%; max-width: 100%; min-width: 0; height: auto; min-height: 0; margin: 0 0 13px; }
        .ls-app .ls-course-main { flex: 1 1 0; min-width: 0; width: 0; }
        .ls-app .ls-course-title { white-space: normal; overflow-wrap: anywhere; line-height: 1.35; }
        .ls-app .ls-course-description { display: block; width: 100%; max-width: 100%; white-space: normal; overflow: visible; text-overflow: clip; overflow-wrap: anywhere; line-height: 1.5; }
        .ls-app .ls-progress-line { position: relative; display: block; width: 100%; max-width: 100%; height: 8px; margin-top: 12px; overflow: hidden; }
        .ls-app .ls-progress-fill { display: block; max-width: 100%; height: 100%; }
        .ls-app .ls-course-percent { flex: 0 0 45px; min-width: 45px; text-align: right; }
        .ls-app .ls-circle-wrap { position: relative; display: flex; width: 100%; justify-content: center; align-items: center; }
        .ls-app .ls-circle { position: relative; flex: 0 0 190px; width: 190px; height: 190px; max-width: 100%; }
        .ls-app .ls-progress-row { position: relative; display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 12px; }
        .ls-app .ls-streak-card { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(250px, .85fr); align-items: center; gap: 24px; width: 100%; min-width: 0; height: auto; margin: 0 0 30px; }
        .ls-app .ls-topbar { width: 100%; min-width: 0; }
        .ls-app .ls-chat-toggle { position: fixed; right: 20px; bottom: 18px; z-index: 9998; }
        .ls-app .ls-chat-panel { position: fixed; right: 20px; bottom: 82px; z-index: 9999; }
        @media (max-width: 1150px) {
          .ls-app > .ls-sidebar { flex-basis: 220px; width: 220px; min-width: 220px; }
          .ls-app > .ls-main { width: calc(100% - 220px); max-width: calc(100% - 220px); }
          .ls-app .ls-content { padding: 24px; }
          .ls-app .ls-grid-two { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 850px) {
          .ls-app { display: block; }
          .ls-app > .ls-sidebar { width: 100%; min-width: 0; height: auto; min-height: 0; position: relative; overflow: visible; }
          .ls-app > .ls-main { width: 100%; max-width: 100%; }
          .ls-app .ls-content { padding: 20px; }
          .ls-app .ls-bottom-grid { grid-template-columns: minmax(0, 1fr); }
          .ls-app .ls-streak-card { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 600px) {
          .ls-app .ls-content { padding: 14px; }
          .ls-app .ls-card { padding: 18px; }
          .ls-app .ls-course { align-items: flex-start; gap: 10px; padding: 12px; }
          .ls-app .ls-course-icon { width: 42px; height: 42px; flex: 0 0 42px; }
          .ls-app .ls-course-percent { flex-basis: 38px; min-width: 38px; }
          .ls-app .ls-chat-toggle { right: 12px; bottom: 12px; padding: 12px 15px; }
          .ls-app .ls-chat-panel { right: 12px; bottom: 72px; width: calc(100vw - 24px); }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="ls-sidebar">

        <div className="ls-logo">

          <div className="ls-logo-box">
            L
          </div>

          <div>
            <div className="ls-logo-title">
              LearnSmart
            </div>

            <div className="ls-logo-subtitle">
              Learning Platform
            </div>
          </div>

        </div>

        <div className="ls-menu-title">
          MAIN MENU
        </div>

        <nav className="ls-nav">

          <button
            className={`ls-nav-button ${
              activeSection === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => goToSection("dashboard")}
          >
            <span className="ls-nav-icon">⌂</span>
            Dashboard
          </button>

          <button
            className={`ls-nav-button ${
              activeSection === "programs"
                ? "active"
                : ""
            }`}
            onClick={() => goToSection("programs")}
          >
            <span className="ls-nav-icon">▣</span>
            My Programs
          </button>

          <button
            className={`ls-nav-button ${
              activeSection === "assessments"
                ? "active"
                : ""
            }`}
            onClick={() => goToSection("assessments")}
          >
            <span className="ls-nav-icon">✓</span>
            Assessments
          </button>

          <button
            className={`ls-nav-button ${
              activeSection === "progress"
                ? "active"
                : ""
            }`}
            onClick={() => goToSection("progress")}
          >
            <span className="ls-nav-icon">◔</span>
            My Progress
          </button>

        </nav>

        <div className="ls-menu-title ls-account-title">
          ACCOUNT
        </div>

        <nav className="ls-nav">

          <button
            className={`ls-nav-button ${
              activeSection === "profile"
                ? "active"
                : ""
            }`}
            onClick={() => goToSection("profile")}
          >
            <span className="ls-nav-icon">♙</span>
            Profile
          </button>

          <button
            className="ls-nav-button"
            onClick={handleLogout}
          >
            <span className="ls-nav-icon">↪</span>
            Logout
          </button>

        </nav>

        <div className="ls-help-card">

          <div className="ls-help-icon">
            ?
          </div>

          <strong>
            Need help?
          </strong>

          <p>
            Continue your learning journey with LearnSmart.
          </p>

        </div>

      </aside>

      {/* MAIN */}
      <div className="ls-main">

        {/* TOP BAR */}
        <header className="ls-topbar">

          <div className="ls-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search courses, lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="ls-top-actions">

            <button
              className="ls-refresh"
              onClick={handleRefresh}
              title="Refresh dashboard data"
            >
              {refreshing ? "…" : "⟳"}
            </button>

            <div className="ls-user">

              <div className="ls-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="ls-user-name">
                  {username}
                </div>

                <div className="ls-user-role">
                  {profile?.role || "Student"}
                </div>
              </div>

              <span className="ls-user-arrow">
                ▾
              </span>

            </div>

          </div>

        </header>

        <main className="ls-content">

          {error && (
            <div className="ls-error">
              {error}
            </div>
          )}

          {/* =====================================================
              MAIN DASHBOARD
          ====================================================== */}

          {activeSection === "dashboard" && (

            <>
              <section className="ls-welcome">

                <div>

                  <div className="ls-eyebrow">
                    STUDENT DASHBOARD
                  </div>

                  <h1>
                    Good morning, {username} 👋
                  </h1>

                  <p>
                    Continue your learning journey and keep
                    building your skills.
                  </p>

                </div>

                <div className="ls-welcome-box">

                  <div className="ls-welcome-star">
                    ✦
                  </div>

                  <span>
                    Keep learning
                  </span>

                </div>

              </section>

              {/* STATISTICS */}

              <section className="ls-stats">

                <div className="ls-stat">

                  <div className="ls-stat-icon">
                    ▣
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Enrolled Programs
                    </div>

                    <div className="ls-stat-value">
                      {courses.length}
                    </div>

                    <div className="ls-stat-small">
                      Available programs
                    </div>
                  </div>

                </div>

                <div className="ls-stat">

                  <div className="ls-stat-icon">
                    ✓
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Lessons Completed
                    </div>

                    <div className="ls-stat-value">
                      {completedCount}
                    </div>

                    <div className="ls-stat-small">
                      {totalLessons} total lessons
                    </div>
                  </div>

                </div>

                <div className="ls-stat">

                  <div className="ls-stat-icon">
                    %
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Average Score
                    </div>

                    <div className="ls-stat-value">
                      {averageScore}%
                    </div>

                    <div className="ls-stat-small">
                      Based on progress
                    </div>
                  </div>

                </div>

                <div className="ls-stat">

                  <div className="ls-stat-icon">
                    ▤
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Assessments
                    </div>

                    <div className="ls-stat-value">
                      {assessmentAttemptCount}
                    </div>

                    <div className="ls-stat-small">
                      Attempts recorded
                    </div>
                  </div>

                </div>

              </section>

              {/* DAILY LEARNING STREAK + 7-DAY MILESTONE GRAPH */}
              {streak ? (
                <section className="ls-streak-card" aria-label="Learning streak">
                  <div>
                    <div className="ls-streak-heading">
                      <div className="ls-streak-flame" role="img" aria-label="Fire">
                        🔥
                      </div>
                      <div>
                        <p className="ls-streak-eyebrow">Your learning streak</p>
                        <h2 className="ls-streak-title">
                          {Number(streak.current_streak || 0) > 0
                            ? `${streak.current_streak} day${Number(streak.current_streak) === 1 ? "" : "s"} in a row!`
                            : "Start your streak today"}
                        </h2>
                        <p className="ls-streak-subtitle">
                          Small daily steps build strong learning habits. Come back tomorrow to keep it going.
                        </p>
                      </div>
                    </div>
                    <div className="ls-streak-metrics">
                      <div className="ls-streak-metric"><strong>{Number(streak.current_streak || 0)}</strong> current days</div>
                      <div className="ls-streak-metric"><strong>{Number(streak.longest_streak || 0)}</strong> personal best</div>
                    </div>
                    <div className={`ls-streak-status ${streak.active_today ? "" : "pending"}`}>
                      <span>{streak.active_today ? "✓" : "•"}</span>
                      {streak.active_today ? "You've learned today — streak secured!" : "Complete a learning activity today to check in."}
                    </div>
                  </div>

                  <div className="ls-streak-graph">
                    <div className="ls-streak-graph-top">
                      <div>7-day milestone</div>
                      <span>{Math.min(Number(streak.current_streak || 0), 7)} / 7 days</span>
                    </div>
                    <div className="ls-streak-bars" role="img" aria-label={`${Math.min(Number(streak.current_streak || 0), 7)} of 7 days toward the streak milestone`}>
                      {Array.from({ length: 7 }, (_, index) => {
                        const dayNumber = index + 1;
                        const reached = Number(streak.current_streak || 0) >= dayNumber;
                        return (
                          <div className="ls-streak-bar-wrap" key={dayNumber}>
                            <div
                              className={`ls-streak-bar ${reached ? "reached" : ""}`}
                              style={{ height: `${18 + dayNumber * 7}px` }}
                              title={`Day ${dayNumber}${reached ? " reached" : " goal"}`}
                            />
                            <span className="ls-streak-bar-label">{dayNumber}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="ls-streak-goal">
                      <span>Keep the momentum going</span>
                      <strong>{Number(streak.current_streak || 0) >= 7 ? "Milestone reached 🎉" : `${7 - Math.min(Number(streak.current_streak || 0), 7)} to go`}</strong>
                    </div>
                  </div>
                </section>
              ) : streakUnavailable ? (
                <div className="ls-streak-unavailable">
                  🔥 Streak tracking will appear here once the <code>/api/streaks/</code> endpoint is enabled and activity is being recorded.
                </div>
              ) : null}

              {/* PROGRAMS + OVERALL PROGRESS */}

              <section className="ls-grid-two">

                <div className="ls-card">

                  <div className="ls-card-header">

                    <div>
                      <h2>
                        My Programs
                      </h2>

                      <p>
                        Continue where you left off.
                      </p>
                    </div>

                    <button
                      className="ls-link"
                      onClick={() => goToSection("programs")}
                    >
                      View all →
                    </button>

                  </div>

                  {courses.length === 0 ? (

                    <div className="ls-empty">
                      No courses are available yet.
                    </div>

                  ) : (

                    courses.slice(0, 5).map(
                      (course, index) => {

                        const courseProgress =
                          getCourseProgress(course.id);

                        return (
                          <div
                            className="ls-course"
                            key={course.id}
                            onClick={() =>
                              openCourse(course)
                            }
                          >

                            <div className="ls-course-icon">
                              {getCourseIcon(index)}
                            </div>

                            <div className="ls-course-main">

                              <div className="ls-course-title">
                                {course.title}
                              </div>

                              <div className="ls-course-description">
                                {course.description ||
                                  "Continue learning this program."}
                              </div>

                              <div className="ls-progress-line">

                                <div
                                  className="ls-progress-fill"
                                  style={{
                                    width: `${courseProgress.percentage}%`,
                                  }}
                                />

                              </div>

                            </div>

                            <div className="ls-course-percent">
                              {courseProgress.percentage}%
                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

                {/* OVERALL PROGRESS */}

                <div className="ls-card">

                  <div className="ls-card-header">

                    <div>
                      <h2>
                        Overall Progress
                      </h2>

                      <p>
                        Your learning activity
                      </p>
                    </div>

                  </div>

                  <div className="ls-circle-wrap">

                    <div
                      className="ls-circle"
                      style={{
                        "--progress": `${overallProgress * 3.6}deg`,
                      }}
                    >

                      <div className="ls-circle-inner">

                        <strong>
                          {overallProgress}%
                        </strong>

                        <span>
                          Completed
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="ls-progress-row">
                    <span>
                      Completed Lessons
                    </span>
                    <strong>
                      {completedCount}
                    </strong>
                  </div>

                  <div className="ls-progress-row">
                    <span>
                      In Progress
                    </span>
                    <strong>
                      {Math.max(
                        progress.length - completedCount,
                        0
                      )}
                    </strong>
                  </div>

                  <div className="ls-progress-row">
                    <span>
                      Not Started
                    </span>
                    <strong>
                      {Math.max(
                        totalLessons - progress.length,
                        0
                      )}
                    </strong>
                  </div>

                </div>

              </section>

              {/* ASSESSMENTS + ACTIVITY */}

              <section className="ls-bottom-grid">

                <div className="ls-card">

                  <div className="ls-card-header">

                    <div>
                      <h2>
                        Assessments
                      </h2>

                      <p>
                        Available assessments from your courses.
                      </p>
                    </div>

                    <button
                      className="ls-link"
                      onClick={() =>
                        goToSection("assessments")
                      }
                    >
                      View all →
                    </button>

                  </div>

                  {assessments.length === 0 ? (

                    <div className="ls-empty">
                      No assessments available.
                    </div>

                  ) : (

                    assessments.slice(0, 4).map(
                      (assessment, index) => {

                        const course = courses.find(
                          (item) =>
                            Number(item.id) ===
                            Number(assessment.course)
                        );

                        return (
                          <div
                            className="ls-assessment"
                            key={assessment.id}
                            onClick={() =>
                              openAssessment(
                                assessment
                              )
                            }
                          >

                            <div className="ls-assessment-icon">
                              {getAssessmentIcon(index)}
                            </div>

                            <div className="ls-assessment-main">

                              <div className="ls-assessment-title">
                                {assessment.title}
                              </div>

                              <div className="ls-assessment-course">
                                {course?.title ||
                                  "Course assessment"}
                              </div>

                            </div>

                            <div className="ls-assessment-date">
                              {assessment.duration_minutes
                                ? `${assessment.duration_minutes} min`
                                : formatDate(
                                    assessment.created_at
                                  )}
                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

                <div className="ls-card">

                  <div className="ls-card-header">

                    <div>
                      <h2>
                        Recent Activity
                      </h2>

                      <p>
                        Your latest learning activity.
                      </p>
                    </div>

                  </div>

                  {progress.length === 0 ? (

                    <div className="ls-empty">
                      No learning activity yet.
                    </div>

                  ) : (

                    progress
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(
                            b.last_accessed || 0
                          ) -
                          new Date(
                            a.last_accessed || 0
                          )
                      )
                      .slice(0, 5)
                      .map((item) => {

                        const lesson = lessons.find(
                          (lessonItem) =>
                            Number(lessonItem.id) ===
                            Number(item.lesson)
                        );

                        return (
                          <div
                            className="ls-activity"
                            key={item.id}
                          >

                            <div className="ls-activity-icon">
                              {item.completed
                                ? "✓"
                                : "◔"}
                            </div>

                            <div>

                              <p>
                                {item.completed
                                  ? `Completed lesson: ${
                                      lesson?.title ||
                                      "Lesson"
                                    }`
                                  : `Learning: ${
                                      lesson?.title ||
                                      "Lesson"
                                    }`}
                              </p>

                              <small>
                                {item.last_accessed
                                  ? formatDate(
                                      item.last_accessed
                                    )
                                  : "Recently"}
                              </small>

                            </div>

                          </div>
                        );
                      })
                  )}

                </div>

              </section>

              <section className="ls-recommendation">

                <div className="ls-recommendation-icon">
                  💡
                </div>

                <div className="ls-recommendation-main">

                  <h3>
                    Keep learning
                  </h3>

                  <p>
                    Continue with your available programs
                    and complete your remaining lessons.
                  </p>

                </div>

                <button
                  className="ls-primary-button"
                  onClick={() =>
                    goToSection("programs")
                  }
                >
                  Start Learning
                </button>

              </section>
            </>
          )}

          {/* =====================================================
              MY PROGRAMS
          ====================================================== */}

          {activeSection === "programs" && (

            <section>

              <h1 className="ls-section-title">
                My Programs
              </h1>

              <p className="ls-section-description">
                All programs currently available from the backend.
              </p>

              {filteredCourses.length === 0 ? (

                <div className="ls-card ls-empty">
                  No matching programs found.
                </div>

              ) : (

                <div className="ls-grid-two">

                  {filteredCourses.map(
                    (course, index) => {

                      const courseProgress =
                        getCourseProgress(course.id);

                      return (
                        <div
                          className="ls-card"
                          key={course.id}
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            openCourse(course)
                          }
                        >

                          <div className="ls-course-icon">
                            {getCourseIcon(index)}
                          </div>

                          <h2 style={{ marginTop: 18 }}>
                            {course.title}
                          </h2>

                          <p
                            style={{
                              color: "#8c8ea2",
                              lineHeight: 1.6,
                            }}
                          >
                            {course.description ||
                              "No description available."}
                          </p>

                          <div
                            className="ls-progress-line"
                            style={{
                              marginTop: 20,
                            }}
                          >

                            <div
                              className="ls-progress-fill"
                              style={{
                                width: `${courseProgress.percentage}%`,
                              }}
                            />

                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              justifyContent:
                                "space-between",
                              fontSize: 12,
                              color: "#888a9c",
                            }}
                          >

                            <span>
                              {courseProgress.completed} /{" "}
                              {courseProgress.total} lessons
                            </span>

                            <strong
                              style={{
                                color: "#5c50df",
                              }}
                            >
                              {courseProgress.percentage}%
                            </strong>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>
          )}

          {/* =====================================================
              ASSESSMENTS
          ====================================================== */}

          {activeSection === "assessments" && (

            <section>

              <h1 className="ls-section-title">
                Assessments
              </h1>

              <p className="ls-section-description">
                Assessments available from your learning platform.
              </p>

              {assessments.length === 0 ? (

                <div className="ls-card ls-empty">
                  No assessments available.
                </div>

              ) : (

                <div className="ls-card">

                  {assessments.map(
                    (assessment, index) => {

                      const course = courses.find(
                        (item) =>
                          Number(item.id) ===
                          Number(assessment.course)
                      );

                      const attempt = attempts
                        .filter(
                          (item) =>
                            Number(item.assessment) ===
                            Number(assessment.id)
                        )
                        .sort(
                          (a, b) =>
                            new Date(
                              b.submitted_at || 0
                            ) -
                            new Date(
                              a.submitted_at || 0
                            )
                        )[0];

                      return (
                        <div
                          className="ls-assessment"
                          key={assessment.id}
                          onClick={() =>
                            openAssessment(
                              assessment
                            )
                          }
                        >

                          <div className="ls-assessment-icon">
                            {getAssessmentIcon(index)}
                          </div>

                          <div className="ls-assessment-main">

                            <div className="ls-assessment-title">
                              {assessment.title}
                            </div>

                            <div className="ls-assessment-course">
                              {course?.title ||
                                "Course"}
                            </div>

                          </div>

                          <div className="ls-assessment-date">

                            {attempt ? (
                              <>
                                Score:{" "}
                                {Math.round(
                                  Number(
                                    attempt.percentage || 0
                                  )
                                )}
                                %
                              </>
                            ) : (
                              <>
                                {assessment.duration_minutes ||
                                  30}{" "}
                                min
                              </>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>
          )}

          {/* =====================================================
              PROGRESS
          ====================================================== */}

          {activeSection === "progress" && (

            <section>

              <h1 className="ls-section-title">
                My Progress
              </h1>

              <p className="ls-section-description">
                Your progress calculated from the backend lesson
                and progress records.
              </p>

              <div className="ls-stats">

                <div className="ls-stat">
                  <div className="ls-stat-icon">
                    ✓
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Completed
                    </div>

                    <div className="ls-stat-value">
                      {completedCount}
                    </div>
                  </div>
                </div>

                <div className="ls-stat">
                  <div className="ls-stat-icon">
                    ◔
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      In Progress
                    </div>

                    <div className="ls-stat-value">
                      {Math.max(
                        progress.length -
                          completedCount,
                        0
                      )}
                    </div>
                  </div>
                </div>

                <div className="ls-stat">
                  <div className="ls-stat-icon">
                    %
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Overall Progress
                    </div>

                    <div className="ls-stat-value">
                      {overallProgress}%
                    </div>
                  </div>
                </div>

                <div className="ls-stat">
                  <div className="ls-stat-icon">
                    ★
                  </div>

                  <div>
                    <div className="ls-stat-label">
                      Average Score
                    </div>

                    <div className="ls-stat-value">
                      {averageScore}%
                    </div>
                  </div>
                </div>

              </div>

              <div className="ls-card">

                <div className="ls-card-header">

                  <div>
                    <h2>
                      Course Progress
                    </h2>

                    <p>
                      Click a program to view its lessons.
                    </p>
                  </div>

                </div>

                {courses.map(
                  (course, index) => {

                    const courseProgress =
                      getCourseProgress(course.id);

                    return (
                      <div
                        className="ls-course"
                        key={course.id}
                        onClick={() =>
                          openCourse(course)
                        }
                      >

                        <div className="ls-course-icon">
                          {getCourseIcon(index)}
                        </div>

                        <div className="ls-course-main">

                          <div className="ls-course-title">
                            {course.title}
                          </div>

                          <div className="ls-progress-line">

                            <div
                              className="ls-progress-fill"
                              style={{
                                width: `${courseProgress.percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="ls-course-percent">
                          {courseProgress.percentage}%
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

          {/* =====================================================
              PROFILE
          ====================================================== */}

          {activeSection === "profile" && (

            <section>

              <h1 className="ls-section-title">
                Profile
              </h1>

              <p className="ls-section-description">
                Your LearnSmart account information.
              </p>

              <div className="ls-profile">

                <div className="ls-profile-avatar">
                  {username
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h2>
                  {username}
                </h2>

                <div className="ls-profile-row">
                  <span>
                    Username
                  </span>

                  <strong>
                    {username}
                  </strong>
                </div>

                <div className="ls-profile-row">
                  <span>
                    Role
                  </span>

                  <strong>
                    {profile?.role || "Student"}
                  </strong>
                </div>

                <div className="ls-profile-row">
                  <span>
                    Programs
                  </span>

                  <strong>
                    {courses.length}
                  </strong>
                </div>

                <div className="ls-profile-row">
                  <span>
                    Completed Lessons
                  </span>

                  <strong>
                    {completedCount}
                  </strong>
                </div>

              </div>

            </section>
          )}

          {/* =====================================================
              COURSE DETAILS
          ====================================================== */}

          {activeSection === "course-details" &&
            selectedCourse && (

              <section>

                <button
                  className="ls-back-button"
                  onClick={() =>
                    goToSection("programs")
                  }
                >
                  ← Back to My Programs
                </button>

                <div className="ls-course-detail">

                  <div className="ls-course-icon">
                    {getCourseIcon(
                      Number(selectedCourse.id) || 0
                    )}
                  </div>

                  <h1 className="ls-detail-title">
                    {selectedCourse.title}
                  </h1>

                  <p className="ls-detail-description">
                    {selectedCourse.description ||
                      "No course description available."}
                  </p>

                  {(() => {
                    const courseAssessment =
                      assessments.find(
                        (assessment) =>
                          Number(assessment.course) ===
                          Number(selectedCourse.id)
                      );

                    if (!courseAssessment) {
                      return null;
                    }

                    return (
                      <div
                        style={{
                          margin: "20px 0 28px",
                          padding: "18px",
                          borderRadius: "16px",
                          background: "#f5f3ff",
                          border: "1px solid #e2ddff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "18px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#292b45",
                              marginBottom: "6px",
                            }}
                          >
                            {courseAssessment.title}
                          </strong>

                          <span
                            style={{
                              color: "#77798d",
                              fontSize: "13px",
                            }}
                          >
                            Assessment available for this course.
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            openQuiz(courseAssessment)
                          }
                          style={{
                            border: "none",
                            background: "linear-gradient(135deg, #5d51df, #7669ed)",
                            color: "white",
                            padding: "13px 22px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "700",
                          }}
                        >
                          Start Quiz →
                        </button>
                      </div>
                    );
                  })()}

                  {(() => {

                    const courseLessons =
                      getCourseLessons(
                        selectedCourse.id
                      );

                    const courseProgress =
                      getCourseProgress(
                        selectedCourse.id
                      );

                    return (
                      <>
                        <div
                          style={{
                            marginBottom: 25,
                            color: "#77798d",
                            fontSize: 13,
                          }}
                        >
                          Progress:{" "}
                          <strong>
                            {courseProgress.completed}
                          </strong>{" "}
                          of{" "}
                          <strong>
                            {courseProgress.total}
                          </strong>{" "}
                          lessons completed
                        </div>

                        {courseLessons.length ===
                        0 ? (

                          <div className="ls-empty">
                            No lessons available for this
                            course.
                          </div>

                        ) : (

                          courseLessons
                            .slice()
                            .sort(
                              (a, b) =>
                                Number(a.order || 0) -
                                Number(b.order || 0)
                            )
                            .map(
                              (
                                lesson,
                                index
                              ) => {

                                const lessonProgress =
                                  progress.find(
                                    (item) =>
                                      Number(
                                        item.lesson
                                      ) ===
                                      Number(
                                        lesson.id
                                      )
                                  );

                                return (
                                  <div
                                    className="ls-lesson"
                                    key={
                                      lesson.id
                                    }
                                  >

                                    <div
                                      className={`ls-lesson-status ${
                                        lessonProgress
                                          ?.completed
                                          ? "completed"
                                          : ""
                                      }`}
                                    >
                                      {lessonProgress
                                        ?.completed
                                        ? "✓"
                                        : index +
                                          1}
                                    </div>

                                    <div className="ls-lesson-info">

                                      <strong>
                                        {lesson.title}
                                      </strong>

                                      <span>
                                        Difficulty:{" "}
                                        {lesson.difficulty ||
                                          1}
                                        {" • "}
                                        Order:{" "}
                                        {lesson.order ||
                                          index +
                                            1}
                                      </span>

                                    </div>

                                    <div className="ls-badge">
                                      {lessonProgress
                                        ?.completed
                                        ? "Completed"
                                        : "Not completed"}
                                    </div>

                                  </div>
                                );
                              }
                            )
                        )}
                      </>
                    );
                  })()}

                </div>

              </section>
            )}

          {/* =====================================================
              ASSESSMENT DETAILS
          ====================================================== */}

          {activeSection === "assessment-details" &&
            selectedAssessment && (

              <section>

                <button
                  className="ls-back-button"
                  onClick={() =>
                    goToSection("assessments")
                  }
                >
                  ← Back to Assessments
                </button>

                <div className="ls-course-detail">

                  <div className="ls-course-icon">
                    ▤
                  </div>

                  <h1 className="ls-detail-title">
                    {selectedAssessment.title}
                  </h1>

                  <p className="ls-detail-description">
                    {selectedAssessment.description ||
                      "No assessment description available."}
                  </p>

                  <button
                    onClick={() =>
                      openQuiz(selectedAssessment)
                    }
                    style={{
                      margin: "8px 0 24px",
                      border: "none",
                      background: "linear-gradient(135deg, #5d51df, #7669ed)",
                      color: "white",
                      padding: "14px 24px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    Start Quiz →
                  </button>

                  <div className="ls-profile-row">
                    <span>
                      Total Marks
                    </span>

                    <strong>
                      {selectedAssessment.total_marks ||
                        100}
                    </strong>
                  </div>

                  <div className="ls-profile-row">
                    <span>
                      Duration
                    </span>

                    <strong>
                      {selectedAssessment.duration_minutes ||
                        30}{" "}
                      minutes
                    </strong>
                  </div>

                  <div className="ls-profile-row">
                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        selectedAssessment.created_at
                      )}
                    </strong>
                  </div>

                  {(() => {

                    const assessmentAttempts =
                      attempts.filter(
                        (item) =>
                          Number(
                            item.assessment
                          ) ===
                          Number(
                            selectedAssessment.id
                          )
                      );

                    return (
                      <div
                        style={{
                          marginTop: 30,
                        }}
                      >

                        <h2>
                          Your Attempts
                        </h2>

                        {assessmentAttempts.length ===
                        0 ? (

                          <div className="ls-empty">
                            You have not attempted this
                            assessment yet.
                          </div>

                        ) : (

                          assessmentAttempts.map(
                            (attempt) => (

                              <div
                                className="ls-lesson"
                                key={
                                  attempt.id
                                }
                              >

                                <div className="ls-lesson-status completed">
                                  ✓
                                </div>

                                <div className="ls-lesson-info">

                                  <strong>
                                    Score:{" "}
                                    {attempt.score}
                                  </strong>

                                  <span>
                                    Submitted:{" "}
                                    {formatDate(
                                      attempt.submitted_at
                                    )}
                                  </span>

                                </div>

                                <div className="ls-badge">
                                  {Math.round(
                                    Number(
                                      attempt.percentage ||
                                        0
                                    )
                                  )}
                                  %
                                </div>

                              </div>
                            )
                          )
                        )}

                      </div>
                    );
                  })()}

                </div>

              </section>
            )}

        </main>

        <footer
          style={{
            padding: "20px 46px 35px",
            color: "#9a9cac",
            fontSize: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 15,
          }}
        >
          <span>
            © 2026 LearnSmart. All rights reserved.
          </span>

          <span>
            Learn Today. Build Tomorrow.
          </span>
        </footer>

      </div>


      {chatOpen ? (
        <section className="ls-chat-panel" aria-label="LearnSmart AI chatbot">
          <div className="ls-chat-head"><div><strong>LearnSmart AI</strong><small>Course and performance assistant</small></div><button className="ls-chat-close" type="button" onClick={() => setChatOpen(false)} aria-label="Close chatbot">×</button></div>
          <div className="ls-chat-log">
            {chatMessages.map((item, index) => <div key={`${item.role}-${index}`} className={`ls-chat-bubble ${item.role}`}>{item.text}</div>)}
            {chatSending && <div className="ls-chat-bubble assistant">Thinking…</div>}
          </div>
          <form className="ls-chat-form" onSubmit={sendChatMessage}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask LearnSmart AI…" aria-label="Message chatbot"/><button type="submit" disabled={chatSending || !chatInput.trim()}>Send</button></form>
        </section>
      ) : null}
      <button className="ls-chat-toggle" type="button" onClick={() => setChatOpen((open) => !open)}>{chatOpen ? "Close AI chat" : "💬 Ask LearnSmart AI"}</button>
    </div>
  );
}

export default Dashboard;