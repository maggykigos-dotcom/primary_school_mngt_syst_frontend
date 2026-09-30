import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import DataTable from "../../components/DataTable/DataTable";
import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart";
import { getResults } from "../../api/academicsAPI";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getResults();

        const data = Array.isArray(response)
          ? response
          : response?.results || [];

        setResults(data);
      } catch (err) {
        console.error("Failed to load results:", err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  // ==========================================================
  // PERFORMANCE DATA
  // Creates subject averages from the result records.
  // ==========================================================
  const performanceData = useMemo(() => {
    if (!results.length) {
      return [];
    }

    const grouped = {};

    results.forEach((result) => {
      const subject =
        result.subject_name ||
        result.subject?.name ||
        "Unknown Subject";

      const marks = Number(result.marks);

      if (Number.isNaN(marks)) {
        return;
      }

      if (!grouped[subject]) {
        grouped[subject] = {
          total: 0,
          count: 0,
        };
      }

      grouped[subject].total += marks;
      grouped[subject].count += 1;
    });

    return Object.entries(grouped).map(([subject, values]) => ({
      subject,
      performance: Math.round(values.total / values.count),
    }));
  }, [results]);

  // ==========================================================
  // GRADE CLASS
  // ==========================================================
  const getGradeClass = (grade) => {
    switch (grade) {
      case "A":
        return "grade-a";

      case "B":
        return "grade-b";

      case "C":
        return "grade-c";

      case "D":
        return "grade-d";

      case "E":
        return "grade-e";

      default:
        return "";
    }
  };

  // ==========================================================
  // AVERAGE
  // ==========================================================
  const averageMarks = useMemo(() => {
    if (!results.length) {
      return 0;
    }

    const validMarks = results
      .map((result) => Number(result.marks))
      .filter((marks) => !Number.isNaN(marks));

    if (!validMarks.length) {
      return 0;
    }

    const total = validMarks.reduce(
      (sum, marks) => sum + marks,
      0
    );

    return Math.round(total / validMarks.length);
  }, [results]);

  // ==========================================================
  // RESULT COUNT
  // ==========================================================
  const totalResults = results.length;

  // ==========================================================
  // LOADING
  // ==========================================================
  if (loading) {
    return (
      <DashboardLayout>
        <div className="results-page">
          <div className="results-loading">
            <div className="loading-spinner"></div>
            <p>Loading academic results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="results-page">

        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="results-header">
          <div>
            <h1>Academic Results</h1>
            <p>
              View examination marks, grades and academic
              performance.
            </p>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}
        {error && (
          <div className="results-error">
            <span>⚠️</span>
            <div>
              <strong>Unable to load results</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* ==============================================
                SUMMARY CARDS
            ============================================== */}
            <div className="results-summary">

              <div className="result-summary-card">
                <div className="summary-icon blue">
                  📚
                </div>

                <div>
                  <span>Total Results</span>
                  <strong>{totalResults}</strong>
                </div>
              </div>

              <div className="result-summary-card">
                <div className="summary-icon green">
                  📊
                </div>

                <div>
                  <span>Average Marks</span>
                  <strong>{averageMarks}%</strong>
                </div>
              </div>

              <div className="result-summary-card">
                <div className="summary-icon purple">
                  🏆
                </div>

                <div>
                  <span>Subjects</span>
                  <strong>{performanceData.length}</strong>
                </div>
              </div>

            </div>

            {/* ==============================================
                ACADEMIC PERFORMANCE
            ============================================== */}
            {results.length > 0 && (
              <div className="results-chart-section">
                <PerformanceChart data={performanceData} />
              </div>
            )}

            {/* ==============================================
                RESULTS TABLE
            ============================================== */}
            <div className="results-table-card">

              <div className="results-table-header">
                <div>
                  <h2>Examination Results</h2>
                  <p>
                    Individual subject examination performance
                  </p>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="results-empty">
                  <div className="empty-icon">📋</div>

                  <h3>No Results Available</h3>

                  <p>
                    Examination results will appear here once
                    they have been recorded.
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "student_name",
                      label: "Student",
                    },
                    {
                      key: "subject_name",
                      label: "Subject",
                    },
                    {
                      key: "class_name",
                      label: "Class",
                    },
                    {
                      key: "term",
                      label: "Term",
                    },
                    {
                      key: "session",
                      label: "Session",
                    },
                    {
                      key: "marks",
                      label: "Marks",
                    },
                    {
                      key: "grade",
                      label: "Grade",
                    },
                  ]}
                  data={results.map((result) => ({
                    ...result,

                    student_name:
                      result.student_name ||
                      result.student?.name ||
                      "Unknown Student",

                    subject_name:
                      result.subject_name ||
                      result.subject?.name ||
                      "Unknown Subject",

                    class_name:
                      result.class_name ||
                      result.school_class?.name ||
                      "Not assigned",

                    marks:
                      result.marks !== null &&
                      result.marks !== undefined
                        ? `${result.marks}%`
                        : "-",

                    grade: (
                      <span
                        className={`result-grade ${getGradeClass(
                          result.grade
                        )}`}
                      >
                        {result.grade || "-"}
                      </span>
                    ),
                  }))}
                />
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Results;



