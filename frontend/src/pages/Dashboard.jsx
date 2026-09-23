import React, { useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import CourseCard from "../components/CourseCard";
import AssessmentCard from "../components/AssessmentCard";
import API_BASE_URL from "../services/api";

function Dashboard() {

  // Test connection with the deployed Django backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/courses/`)
      .then((response) => {
        console.log("Backend status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Backend response:", data);
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
      });
  }, []);

  return (
    <div className="app">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="main-area">

        {/* Navbar */}
        <Navbar />

        <main className="dashboard">

          {/* Welcome */}
          <section className="welcome-section">

            <h1>
              Welcome back, Anshika! 👋
            </h1>

            <p>
              Keep learning, keep growing. Here's your progress overview.
            </p>

          </section>


          {/* Statistics */}
          <section className="stats-grid">

            <StatCard
              icon="📚"
              value="4"
              title="Enrolled Courses"
              change="+1 this month"
            />

            <StatCard
              icon="✓"
              value="12"
              title="Lessons Completed"
              change="+3 this week"
            />

            <StatCard
              icon="📊"
              value="78%"
              title="Average Score"
              change="+5% improvement"
            />

            <StatCard
              icon="📝"
              value="5"
              title="Assessments Taken"
              change="2 pending"
            />

          </section>


          {/* Courses + Progress */}
          <section className="middle-grid">

            {/* Courses */}
            <div className="dashboard-card">

              <div className="card-header">

                <h3>My Courses</h3>

                <a href="#">
                  View All
                </a>

              </div>


              <CourseCard
                icon="🐍"
                title="Python for Data Science"
                completed="8"
                total="10"
                progress={80}
              />

              <CourseCard
                icon="🧠"
                title="Machine Learning Fundamentals"
                completed="6"
                total="12"
                progress={50}
              />

              <CourseCard
                icon="🌐"
                title="Web Development with Django"
                completed="4"
                total="8"
                progress={50}
              />

              <CourseCard
                icon="🗄️"
                title="Database Management Systems"
                completed="7"
                total="10"
                progress={70}
              />

            </div>


            {/* Overall Progress */}
            <div className="dashboard-card progress-card">

              <div className="card-header">

                <h3>Overall Progress</h3>

              </div>


              <div className="circle-progress">

                <div className="circle-inner">
                  <strong>65%</strong>
                  <span>Completed</span>
                </div>

              </div>


              <div className="progress-legend">

                <p>
                  <span className="dot blue"></span>
                  Completed Lessons
                  <strong>12</strong>
                </p>

                <p>
                  <span className="dot green"></span>
                  In Progress
                  <strong>6</strong>
                </p>

                <p>
                  <span className="dot purple"></span>
                  Not Started
                  <strong>4</strong>
                </p>

              </div>


              <div className="motivation">
                🎯
                <div>
                  <strong>You're doing great!</strong>
                  <p>
                    Keep going to complete your courses.
                  </p>
                </div>
              </div>

            </div>

          </section>


          {/* Bottom section */}
          <section className="bottom-grid">

            {/* Assessments */}
            <div className="dashboard-card">

              <div className="card-header">

                <h3>Upcoming Assessments</h3>

                <a href="#">
                  View All
                </a>

              </div>


              <AssessmentCard
                icon="📝"
                title="Python Basics Quiz"
                course="Python for Data Science"
                date="Sep 20, 2026"
                status="Start"
              />

              <AssessmentCard
                icon="📄"
                title="ML Concepts Test"
                course="Machine Learning Fundamentals"
                date="Sep 25, 2026"
                status="Pending"
              />

              <AssessmentCard
                icon="🗄️"
                title="Django Models Quiz"
                course="Web Development with Django"
                date="Oct 02, 2026"
                status="Pending"
              />

            </div>


            {/* Recent Activity */}
            <div className="dashboard-card">

              <div className="card-header">

                <h3>Recent Activity</h3>

                <a href="#">
                  View All
                </a>

              </div>


              <div className="activity">

                <div className="activity-item">
                  <span>✓</span>
                  <p>
                    Completed lesson: Data Cleaning Techniques
                  </p>
                  <small>2 hours ago</small>
                </div>

                <div className="activity-item">
                  <span>📝</span>
                  <p>
                    Attempted quiz: Python Basics
                  </p>
                  <small>Yesterday</small>
                </div>

                <div className="activity-item">
                  <span>📚</span>
                  <p>
                    Enrolled in Machine Learning Fundamentals
                  </p>
                  <small>2 days ago</small>
                </div>

                <div className="activity-item">
                  <span>✓</span>
                  <p>
                    Completed lesson: Introduction to Django
                  </p>
                  <small>3 days ago</small>
                </div>

              </div>

            </div>

          </section>


          {/* Personalized recommendation */}
          <section className="recommendation">

            <div>
              <span className="recommendation-icon">💡</span>
            </div>

            <div>
              <h3>Recommended For You</h3>

              <p>
                Based on your learning progress, we recommend
                revising Python Functions before moving to the next topic.
              </p>
            </div>

            <button>
              Start Learning
            </button>

          </section>


        </main>


        {/* Footer */}
        <footer>
          © 2026 LearnSmart. All rights reserved.
          <span>Learn Today. Build Tomorrow.</span>
        </footer>

      </div>

    </div>
  );
}

export default Dashboard;