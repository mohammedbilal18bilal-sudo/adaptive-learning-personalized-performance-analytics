import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL =
  "https://adaptive-learning-personalized.onrender.com/api";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "students", label: "Students", icon: "♙" },
  { id: "faculty", label: "Faculty", icon: "♧" },
  { id: "courses", label: "Courses", icon: "▤" },
  { id: "lessons", label: "Lessons", icon: "▱" },
  { id: "assessments", label: "Assessments", icon: "✓" },
  { id: "questions", label: "Question Bank", icon: "?" },
  { id: "attempts", label: "Attempts", icon: "◷" },
  { id: "progress", label: "Student Progress", icon: "↗" },
];

const ENDPOINTS = {
  students: "profiles",
  faculty: "profiles",
  courses: "courses",
  lessons: "lessons",
  assessments: "assessments",
  questions: "questions",
  attempts: "attempts",
  progress: "progress",
};

function getRecords(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return null;
}

function getTitle(item, index) {
  return String(
    item.title ||
      item.name ||
      item.username ||
      item.course_name ||
      item.email ||
      item.id ||
      "Record " + (index + 1)
  );
}

function getRole(item) {
  return String(
    item.role ||
      item.user_type ||
      item.account_type ||
      item.profile_type ||
      (item.user && item.user.role) ||
      ""
  ).toLowerCase();
}

function safeValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  async function loadData() {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access");

    if (!token) {
      setErrors({
        authentication: "Login token missing. Please log in again.",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    const newData = {};
    const newErrors = {};

    const endpoints = Object.entries(ENDPOINTS);

    await Promise.all(
      endpoints.map(async function ([key, endpoint]) {
        try {
          const response = await fetch(
            API_URL + "/" + endpoint + "/",
            {
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }

          const result = await response.json();
          const records = getRecords(result);

          if (!records) {
            throw new Error("Unexpected API response format");
          }

          newData[key] = records;
        } catch (error) {
          newErrors[key] = error.message;
        }
      })
    );

    setData(newData);
    setErrors(newErrors);
    setLoading(false);
  }

  useEffect(function () {
    loadData();
  }, []);

  const profiles = data.students || [];

  const students = profiles.filter(function (item) {
    return getRole(item).includes("student");
  });

  const faculty = profiles.filter(function (item) {
    const role = getRole(item);
    return (
      role.includes("faculty") ||
      role.includes("teacher") ||
      role.includes("instructor")
    );
  });

  function openSection(id) {
    setSection(id);
    setSearch("");
    setSelected(null);
  }

  function getCurrentRecords() {
    if (section === "students") return students;
    if (section === "faculty") return faculty;
    return data[section] || [];
  }

  const currentRecords = getCurrentRecords();

  const filteredRecords = currentRecords.filter(function (item) {
    return JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function getCount(key) {
    if (loading && !data[key]) return "Loading";
    if (errors[key]) return "Unavailable";

    if (key === "students") return students.length;
    if (key === "faculty") return faculty.length;

    return Array.isArray(data[key]) ? data[key].length : "Unavailable";
  }

  const currentTitle =
    SECTIONS.find(function (item) {
      return item.id === section;
    })?.label || "Overview";

  return (
    <div className="ls-admin">

      <aside className="ls-sidebar">
        <div className="ls-brand">
          <div className="ls-logo">L</div>
          <div>
            <strong>LearnSmart</strong>
            <small>ADMINISTRATION</small>
          </div>
        </div>

        <div className="ls-menu-title">WORKSPACE</div>

        {SECTIONS.map(function (item) {
          return (
            <button
              key={item.id}
              className={
                section === item.id
                  ? "ls-nav ls-nav-active"
                  : "ls-nav"
              }
              onClick={function () {
                openSection(item.id);
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div className="ls-sidebar-bottom">
          <div className="ls-admin-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>LearnSmart Platform</small>
          </div>
        </div>

        <button
          className="ls-logout"
          onClick={function () {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("access");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("refresh");
            localStorage.removeItem("userRole");
            window.location.href = "/";
          }}
        >
          ↪ Log out
        </button>
      </aside>

      <main className="ls-main">
        <header className="ls-header">
          <div>
            <div className="ls-breadcrumb">
              Administration / {currentTitle}
            </div>
            <h1>{currentTitle}</h1>
          </div>

          <button
            className="ls-refresh"
            onClick={loadData}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        <div className="ls-content">
          {errors.authentication && (
            <div className="ls-error">
              {errors.authentication}
            </div>
          )}

          {section === "overview" ? (
            <>
              <section className="ls-banner">
                <span className="ls-eyebrow">
                  ADMINISTRATOR WORKSPACE
                </span>
                <h2>Welcome to LearnSmart</h2>
                <p>
                  Manage courses, lessons, assessments and
                  explore student and faculty records.
                </p>
                <button
                  className="ls-primary"
                  onClick={function () {
                    openSection("students");
                  }}
                >
                  Explore students →
                </button>
              </section>

              <div className="ls-section-heading">
                <div>
                  <h2>Platform Overview</h2>
                  <p>
                    Information retrieved from your backend APIs.
                  </p>
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="ls-error">
                  Some API requests failed. Unavailable counts
                  are not replaced with sample data.
                  <button onClick={loadData}>Retry</button>
                </div>
              )}

              <div className="ls-stat-grid">
                {[
                  {
                    id: "students",
                    label: "Students",
                    icon: "♙",
                  },
                  {
                    id: "faculty",
                    label: "Faculty",
                    icon: "♧",
                  },
                  {
                    id: "courses",
                    label: "Courses",
                    icon: "▤",
                  },
                  {
                    id: "assessments",
                    label: "Assessments",
                    icon: "✓",
                  },
                ].map(function (item) {
                  return (
                    <button
                      className="ls-stat"
                      key={item.id}
                      onClick={function () {
                        openSection(item.id);
                      }}
                    >
                      <span className="ls-stat-icon">
                        {item.icon}
                      </span>
                      <span className="ls-stat-label">
                        {item.label}
                      </span>
                      <strong>{getCount(item.id)}</strong>
                      <small>View records →</small>
                    </button>
                  );
                })}
              </div>

              <div className="ls-section-heading">
                <div>
                  <h2>Manage Resources</h2>
                  <p>Choose a section to explore its records.</p>
                </div>
              </div>

              <div className="ls-resource-grid">
                {SECTIONS.filter(function (item) {
                  return item.id !== "overview";
                }).map(function (item) {
                  return (
                    <button
                      className="ls-resource"
                      key={item.id}
                      onClick={function () {
                        openSection(item.id);
                      }}
                    >
                      <span className="ls-resource-icon">
                        {item.icon}
                      </span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>
                          {getCount(item.id)} records
                        </small>
                      </span>
                      <b>→</b>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="ls-section-heading">
                <div>
                  <h2>{currentTitle}</h2>
                  <p>
                    Browse and inspect records from the backend.
                  </p>
                </div>
                <span className="ls-count">
                  {filteredRecords.length} records
                </span>
              </div>

              {errors[section] && (
                <div className="ls-error">
                  Could not load this section: {errors[section]}
                  <button onClick={loadData}>Retry</button>
                </div>
              )}

              <div className="ls-search-row">
                <input
                  value={search}
                  onChange={function (event) {
                    setSearch(event.target.value);
                  }}
                  placeholder={"Search " + currentTitle + "..."}
                />

                <button
                  className="ls-refresh"
                  onClick={loadData}
                  disabled={loading}
                >
                  Reload
                </button>
              </div>

              {loading && !data[section] ? (
                <div className="ls-empty">
                  Loading records...
                </div>
              ) : errors[section] ? (
                <div className="ls-empty">
                  Records are unavailable. Check your login
                  permissions and backend response.
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="ls-empty">
                  {search
                    ? "No matching records found."
                    : "No records returned by this API."}
                </div>
              ) : (
                <div className="ls-record-grid">
                  {filteredRecords.map(function (item, index) {
                    return (
                      <button
                        className="ls-record"
                        key={
                          item.id !== undefined
                            ? item.id
                            : section + "-" + index
                        }
                        onClick={function () {
                          setSelected(item);
                        }}
                      >
                        <span className="ls-record-icon">
                          {currentTitle.charAt(0)}
                        </span>
                        <h3>{getTitle(item, index)}</h3>
                        <p>
                          {safeValue(
                            item.email ||
                              item.description ||
                              item.username ||
                              item.status ||
                              item.id
                          )}
                        </p>
                        <span className="ls-view-details">
                          View details →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <footer className="ls-footer">
            <span>LearnSmart Administration</span>
            <span>Connected backend data</span>
          </footer>
        </div>
      </main>

      {selected && (
        <div
          className="ls-modal-backdrop"
          onClick={function () {
            setSelected(null);
          }}
        >
          <section
            className="ls-modal"
            onClick={function (event) {
              event.stopPropagation();
            }}
          >
            <div className="ls-modal-header">
              <div>
                <small>RECORD DETAILS</small>
                <h2>{getTitle(selected, 0)}</h2>
              </div>
              <button
                onClick={function () {
                  setSelected(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="ls-modal-body">
              {Object.entries(selected).map(function ([key, value]) {
                return (
                  <div className="ls-detail-row" key={key}>
                    <strong>{key.replace(/_/g, " ")}</strong>
                    <pre>{safeValue(value)}</pre>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
