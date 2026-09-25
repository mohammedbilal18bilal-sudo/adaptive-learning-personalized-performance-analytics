import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../services/api";

function Quiz({ assessment, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  /*
   * ---------------------------------------------------------
   * FETCH REAL QUESTIONS FROM BACKEND
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!assessment?.id) {
        setError("No assessment was selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/questions/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Questions API status:",
          response.status
        );

        const data = await response.json();

        console.log(
          "QUESTIONS FROM BACKEND:",
          data
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError(
              "Your login session has expired. Please login again."
            );
          } else {
            setError(
              "Unable to load questions from the backend."
            );
          }

          setLoading(false);
          return;
        }

        /*
         * DRF can return either:
         *
         * [...]
         *
         * or:
         *
         * {
         *   count: ...,
         *   results: [...]
         * }
         */

        const questionList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        /*
         * Only show questions belonging to
         * the selected assessment.
         */

        const assessmentQuestions =
          questionList.filter(
            (question) =>
              Number(question.assessment) ===
              Number(assessment.id)
          );

        console.log(
          "QUESTIONS FOR SELECTED ASSESSMENT:",
          assessmentQuestions
        );

        setQuestions(assessmentQuestions);
      } catch (fetchError) {
        console.error(
          "Question API error:",
          fetchError
        );

        setError(
          "Unable to connect to the questions backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [assessment, token]);

  /*
   * ---------------------------------------------------------
   * CURRENT QUESTION
   * ---------------------------------------------------------
   */

  const question = questions[currentQuestion];

  /*
   * ---------------------------------------------------------
   * OPTIONS
   * ---------------------------------------------------------
   */

  const options = useMemo(() => {
    if (!question) {
      return [];
    }

    return [
      {
        key: "A",
        value: question.option_a,
      },
      {
        key: "B",
        value: question.option_b,
      },
      {
        key: "C",
        value: question.option_c,
      },
      {
        key: "D",
        value: question.option_d,
      },
    ].filter(
      (option) =>
        option.value !== null &&
        option.value !== undefined &&
        String(option.value).trim() !== ""
    );
  }, [question]);

  /*
   * ---------------------------------------------------------
   * SELECT ANSWER
   * ---------------------------------------------------------
   */

  const selectAnswer = (optionKey) => {
    if (!question) {
      return;
    }

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: optionKey,
    }));
  };

  /*
   * ---------------------------------------------------------
   * NEXT QUESTION
   * ---------------------------------------------------------
   */

  const handleNext = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * ---------------------------------------------------------
   * PREVIOUS QUESTION
   * ---------------------------------------------------------
   */

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) => previous - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "45px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "17px",
              background:
                "linear-gradient(135deg, #6255e8, #7669ed)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "800",
              margin: "0 auto 20px",
            }}
          >
            L
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#20213b",
            }}
          >
            Loading Quiz...
          </h2>

          <p
            style={{
              margin: 0,
              color: "#9092a5",
            }}
          >
            Loading questions from backend
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            background: "white",
            padding: "40px",
            borderRadius: "22px",
            textAlign: "center",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "15px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              color: "#292b45",
              marginBottom: "10px",
            }}
          >
            Unable to Load Quiz
          </h2>

          <p
            style={{
              color: "#8c8fa3",
              lineHeight: 1.6,
              marginBottom: "25px",
            }}
          >
            {error}
          </p>

          <button
            onClick={onBack}
            style={{
              border: "none",
              background:
                "linear-gradient(135deg, #5d51df, #7669ed)",
              color: "white",
              padding: "13px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * NO QUESTIONS
   * ---------------------------------------------------------
   */

  if (questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          padding: "40px",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "white",
            color: "#5b50dc",
            padding: "12px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          ← Back to Assessment
        </button>

        <div
          style={{
            maxWidth: "850px",
            margin: "0 auto",
            background: "white",
            borderRadius: "24px",
            padding: "50px",
            textAlign: "center",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            📝
          </div>

          <h2
            style={{
              color: "#292b45",
              marginBottom: "10px",
            }}
          >
            No Questions Available
          </h2>

          <p
            style={{
              color: "#8c8fa3",
              lineHeight: 1.6,
            }}
          >
            There are currently no questions
            available for this assessment in
            the backend.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * QUIZ
   * ---------------------------------------------------------
   */

  const selectedAnswer =
    answers[question.id];

  const progressPercentage =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#20213b",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          background: "white",
          borderBottom:
            "1px solid #ececf3",
          padding:
            "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "13px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #6255e8, #7669ed)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "23px",
            }}
          >
            L
          </div>

          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "18px",
              }}
            >
              LearnSmart
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#999bad",
                marginTop: "2px",
              }}
            >
              Learning Platform
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          style={{
            border: "1px solid #e2e2ec",
            background: "white",
            color: "#5b50dc",
            padding: "11px 18px",
            borderRadius: "11px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          ← Back
        </button>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main
        style={{
          width: "100%",
          maxWidth: "950px",
          margin: "0 auto",
          padding: "40px 25px 60px",
        }}
      >
        {/* Assessment title */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              color: "#5b50dc",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            ASSESSMENT
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "30px",
              color: "#252741",
            }}
          >
            {assessment?.title ||
              "Assessment"}
          </h1>

          {assessment?.description && (
            <p
              style={{
                margin: 0,
                color: "#8d90a4",
                lineHeight: 1.6,
              }}
            >
              {assessment.description}
            </p>
          )}
        </div>

        {/* =================================================
            PROGRESS
        ================================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "20px 23px",
            marginBottom: "22px",
            border:
              "1px solid #ececf3",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <strong
              style={{
                fontSize: "14px",
              }}
            >
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </strong>

            <span
              style={{
                color: "#5b50dc",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              {Math.round(
                progressPercentage
              )}
              %
            </span>
          </div>

          <div
            style={{
              height: "8px",
              background: "#eeeeF6",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercentage}%`,
                background:
                  "linear-gradient(90deg, #5d51df, #8378f0)",
                borderRadius: "20px",
                transition:
                  "width 0.25s ease",
              }}
            />
          </div>
        </div>

        {/* =================================================
            QUESTION CARD
        ================================================== */}

        <section
          style={{
            background: "white",
            borderRadius: "24px",
            border:
              "1px solid #ececf3",
            padding: "35px",
            boxShadow:
              "0 12px 35px rgba(30,30,70,0.05)",
          }}
        >
          {/* Question number */}

          <div
            style={{
              color: "#5b50dc",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1px",
              marginBottom: "15px",
            }}
          >
            QUESTION {currentQuestion + 1}
          </div>

          {/* Question text */}

          <h2
            style={{
              margin: "0 0 30px",
              fontSize: "23px",
              lineHeight: 1.5,
              color: "#252741",
            }}
          >
            {question.question_text}
          </h2>

          {/* Options */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {options.map((option) => {
              const isSelected =
                selectedAnswer ===
                option.key;

              return (
                <button
                  key={option.key}
                  onClick={() =>
                    selectAnswer(
                      option.key
                    )
                  }
                  style={{
                    width: "100%",
                    border: isSelected
                      ? "2px solid #6255e8"
                      : "1px solid #e3e3ec",
                    background:
                      isSelected
                        ? "#f1efff"
                        : "white",
                    borderRadius: "15px",
                    padding: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition:
                      "0.2s ease",
                  }}
                >
                  {/* Option letter */}

                  <span
                    style={{
                      width: "40px",
                      height: "40px",
                      minWidth: "40px",
                      borderRadius: "12px",
                      background:
                        isSelected
                          ? "#6255e8"
                          : "#f2f2f7",
                      color: isSelected
                        ? "white"
                        : "#64677d",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontWeight: "800",
                    }}
                  >
                    {option.key}
                  </span>

                  {/* Option text */}

                  <span
                    style={{
                      flex: 1,
                      color: "#36384f",
                      fontSize: "15px",
                      lineHeight: 1.5,
                    }}
                  >
                    {option.value}
                  </span>

                  {/* Selected mark */}

                  {isSelected && (
                    <span
                      style={{
                        color: "#6255e8",
                        fontWeight: "900",
                        fontSize: "20px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: "35px",
              paddingTop: "25px",
              borderTop:
                "1px solid #eeeeF4",
              gap: "15px",
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={
                currentQuestion === 0
              }
              style={{
                border:
                  "1px solid #dedee8",
                background:
                  currentQuestion === 0
                    ? "#f5f5f8"
                    : "white",
                color:
                  currentQuestion === 0
                    ? "#b1b2bd"
                    : "#555873",
                padding:
                  "13px 22px",
                borderRadius: "12px",
                cursor:
                  currentQuestion === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "700",
              }}
            >
              ← Previous
            </button>

            <span
              style={{
                color: "#999bad",
                fontSize: "12px",
              }}
            >
              {selectedAnswer
                ? "Answer selected"
                : "Select an answer"}
            </span>

            {currentQuestion <
            questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                style={{
                  border: "none",
                  background:
                    !selectedAnswer
                      ? "#cfcfe0"
                      : "linear-gradient(135deg, #5d51df, #7669ed)",
                  color: "white",
                  padding:
                    "13px 25px",
                  borderRadius: "12px",
                  cursor:
                    !selectedAnswer
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700",
                }}
              >
                Next →
              </button>
            ) : (
              <button
                disabled
                style={{
                  border: "none",
                  background: "#cfcfe0",
                  color: "white",
                  padding:
                    "13px 25px",
                  borderRadius: "12px",
                  cursor: "not-allowed",
                  fontWeight: "700",
                }}
                title="Submission will be connected after the backend attempt format is confirmed."
              >
                Finish
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            QUESTION INDICATORS
        ================================================== */}

        <div
          style={{
            marginTop: "22px",
            background: "white",
            borderRadius: "20px",
            border:
              "1px solid #ececf3",
            padding: "22px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#9294a6",
              fontWeight: "700",
              marginBottom: "14px",
            }}
          >
            QUESTIONS
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "9px",
            }}
          >
            {questions.map(
              (item, index) => {
                const answered =
                  answers[item.id] !==
                  undefined;

                const active =
                  index ===
                  currentQuestion;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentQuestion(
                        index
                      );

                      window.scrollTo({
                        top: 0,
                        behavior:
                          "smooth",
                      });
                    }}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius:
                        "10px",
                      border: active
                        ? "2px solid #6255e8"
                        : "1px solid #dedee8",
                      background: active
                        ? "#6255e8"
                        : answered
                        ? "#e9e6ff"
                        : "white",
                      color: active
                        ? "white"
                        : answered
                        ? "#5b50dc"
                        : "#74768b",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    {index + 1}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            BACKEND NOTICE
        ================================================== */}

        <div
          style={{
            marginTop: "18px",
            padding: "15px 18px",
            borderRadius: "13px",
            background: "#f5f4ff",
            color: "#777895",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          Questions and answer options are
          loaded directly from the learning
          platform backend.
        </div>
      </main>
    </div>
  );
}

export default Quiz;