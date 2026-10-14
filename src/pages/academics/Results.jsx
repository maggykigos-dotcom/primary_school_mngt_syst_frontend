
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

  const [studentFilter, setStudentFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

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

  // Normalize result fields for consistent filtering and display.
  const normalizedResults = useMemo(() => {
    return results.map((result) => ({
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

      term: result.term || "",

      session:
        result.session !== null &&
        result.session !== undefined
          ? String(result.session)
          : "",

      marks:
        result.marks !== null &&
        result.marks !== undefined &&
        result.marks !== ""
          ? Number(result.marks)
          : null,
    }));
  }, [results]);

  // Build filter choices from the results available to this user.
  const filterOptions = useMemo(() => {
    const uniqueValues = (field) =>
      [...new Set(
        normalizedResults
          .map((result) => result[field])
          .filter((value) => value !== "" && value !== null)
      )].sort((a, b) =>
        String(a).localeCompare(String(b), undefined, {
          numeric: true,
        })
      );

    return {
      students: uniqueValues("student_name"),
      subjects: uniqueValues("subject_name"),
      classes: uniqueValues("class_name"),
      terms: uniqueValues("term"),
      sessions: uniqueValues("session"),
    };
  }, [normalizedResults]);

  // Apply all selected filters together.
  const filteredResults = useMemo(() => {
    const search = studentFilter.trim().toLowerCase();

    return normalizedResults.filter((result) => {
      const matchesStudent =
        !search ||
        result.student_name.toLowerCase().includes(search);

      const matchesSubject =
        !subjectFilter ||
        result.subject_name === subjectFilter;

      const matchesClass =
        !classFilter ||
        result.class_name === classFilter;

      const matchesTerm =
        !termFilter ||
        result.term === termFilter;

      const matchesSession =
        !sessionFilter ||
        result.session === sessionFilter;

      return (
        matchesStudent &&
        matchesSubject &&
        matchesClass &&
        matchesTerm &&
        matchesSession
      );
    });
  }, [
    normalizedResults,
    studentFilter,
    subjectFilter,
    classFilter,
    termFilter,
    sessionFilter,
  ]);

  // Performance chart uses only the filtered results.
  const performanceData = useMemo(() => {
    const grouped = {};

    filteredResults.forEach((result) => {
      const marks = result.marks;

      if (marks === null || !Number.isFinite(marks)) {
        return;
      }

      const subject = result.subject_name;

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
  }, [filteredResults]);

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

  const averageMarks = useMemo(() => {
    const validMarks = filteredResults
      .map((result) => result.marks)
      .filter(
        (marks) => marks !== null && Number.isFinite(marks)
      );

    if (!validMarks.length) {
      return 0;
    }

    const total = validMarks.reduce(
      (sum, marks) => sum + marks,
      0
    );

    return Math.round(total / validMarks.length);
  }, [filteredResults]);

  const clearFilters = () => {
    setStudentFilter("");
    setSubjectFilter("");
    setClassFilter("");
    setTermFilter("");
    setSessionFilter("");
  };

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
        <div className="results-header">
          <div>
            <h1>Academic Results</h1>
            <p>
              View and filter examination marks, grades and
              academic performance.
            </p>
          </div>
        </div>

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
            {/* FILTERS */}
            <div className="results-filters">
              <div className="results-filters-heading">
                <div>
                  <h2>Filter Results</h2>
                  <p>
                    Narrow results by student, subject, class,
                    term or session.
                  </p>
                </div>

                <button
                  type="button"
                  className="results-clear-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>

              <div className="results-filter-grid">
                <div className="results-filter-field">
                  <label htmlFor="student-filter">
                    Student
                  </label>
                  <input
                    id="student-filter"
                    type="text"
                    placeholder="Search student name..."
                    value={studentFilter}
                    onChange={(e) =>
                      setStudentFilter(e.target.value)
                    }
                  />
                </div>

                <div className="results-filter-field">
                  <label htmlFor="subject-filter">
                    Subject
                  </label>
                  <select
                    id="subject-filter"
                    value={subjectFilter}
                    onChange={(e) =>
                      setSubjectFilter(e.target.value)
                    }
                  >
                    <option value="">All Subjects</option>
                    {filterOptions.subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="results-filter-field">
                  <label htmlFor="class-filter">Class</label>
                  <select
                    id="class-filter"
                    value={classFilter}
                    onChange={(e) =>
                      setClassFilter(e.target.value)
                    }
                  >
                    <option value="">All Classes</option>
                    {filterOptions.classes.map((schoolClass) => (
                      <option
                        key={schoolClass}
                        value={schoolClass}
                      >
                        {schoolClass}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="results-filter-field">
                  <label htmlFor="term-filter">Term</label>
                  <select
                    id="term-filter"
                    value={termFilter}
                    onChange={(e) =>
                      setTermFilter(e.target.value)
                    }
                  >
                    <option value="">All Terms</option>
                    {filterOptions.terms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="results-filter-field">
                  <label htmlFor="session-filter">
                    Academic Year
                  </label>
                  <select
                    id="session-filter"
                    value={sessionFilter}
                    onChange={(e) =>
                      setSessionFilter(e.target.value)
                    }
                  >
                    <option value="">All Years</option>
                    {filterOptions.sessions.map((session) => (
                      <option key={session} value={session}>
                        {session}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="results-filter-count">
                Showing <strong>{filteredResults.length}</strong>{" "}
                of <strong>{results.length}</strong> results
              </p>
            </div>

            {/* SUMMARY CARDS */}
            <div className="results-summary">
              <div className="result-summary-card">
                <div className="summary-icon blue">📚</div>
                <div>
                  <span>Total Results</span>
                  <strong>{filteredResults.length}</strong>
                </div>
              </div>

              <div className="result-summary-card">
                <div className="summary-icon green">📊</div>
                <div>
                  <span>Average Marks</span>
                  <strong>{averageMarks}%</strong>
                </div>
              </div>

              <div className="result-summary-card">
                <div className="summary-icon purple">🏆</div>
                <div>
                  <span>Subjects</span>
                  <strong>{performanceData.length}</strong>
                </div>
              </div>
            </div>

            {/* PERFORMANCE CHART */}
            {filteredResults.length > 0 && (
              <div className="results-chart-section">
                <PerformanceChart data={performanceData} />
              </div>
            )}

            {/* RESULTS TABLE */}
            <div className="results-table-card">
              <div className="results-table-header">
                <div>
                  <h2>Examination Results</h2>
                  <p>
                    Individual subject examination performance
                  </p>
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <div className="results-empty">
                  <div className="empty-icon">📋</div>
                  <h3>No Matching Results</h3>
                  <p>
                    No examination results match your selected
                    filters. Try changing or clearing the filters.
                  </p>
                  <button
                    type="button"
                    className="results-clear-button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { key: "student_name", label: "Student" },
                    { key: "subject_name", label: "Subject" },
                    { key: "class_name", label: "Class" },
                    { key: "term", label: "Term" },
                    { key: "session", label: "Session" },
                    { key: "marks", label: "Marks" },
                    { key: "grade", label: "Grade" },
                  ]}
                  data={filteredResults.map((result) => ({
                    ...result,

                    marks:
                      result.marks !== null &&
                      Number.isFinite(result.marks)
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




// import { useEffect, useMemo, useState } from "react";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";
// import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart";
// import { getResults } from "../../api/academicsAPI";
// import "./Results.css";

// const Results = () => {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadResults = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await getResults();

//         const data = Array.isArray(response)
//           ? response
//           : response?.results || [];

//         setResults(data);
//       } catch (err) {
//         console.error("Failed to load results:", err);
//         setError("Failed to load results. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadResults();
//   }, []);

//   // ==========================================================
//   // PERFORMANCE DATA
//   // Creates subject averages from the result records.
//   // ==========================================================
//   const performanceData = useMemo(() => {
//     if (!results.length) {
//       return [];
//     }

//     const grouped = {};

//     results.forEach((result) => {
//       const subject =
//         result.subject_name ||
//         result.subject?.name ||
//         "Unknown Subject";

//       const marks = Number(result.marks);

//       if (Number.isNaN(marks)) {
//         return;
//       }

//       if (!grouped[subject]) {
//         grouped[subject] = {
//           total: 0,
//           count: 0,
//         };
//       }

//       grouped[subject].total += marks;
//       grouped[subject].count += 1;
//     });

//     return Object.entries(grouped).map(([subject, values]) => ({
//       subject,
//       performance: Math.round(values.total / values.count),
//     }));
//   }, [results]);

//   // ==========================================================
//   // GRADE CLASS
//   // ==========================================================
//   const getGradeClass = (grade) => {
//     switch (grade) {
//       case "A":
//         return "grade-a";

//       case "B":
//         return "grade-b";

//       case "C":
//         return "grade-c";

//       case "D":
//         return "grade-d";

//       case "E":
//         return "grade-e";

//       default:
//         return "";
//     }
//   };

//   // ==========================================================
//   // AVERAGE
//   // ==========================================================
//   const averageMarks = useMemo(() => {
//     if (!results.length) {
//       return 0;
//     }

//     const validMarks = results
//       .map((result) => Number(result.marks))
//       .filter((marks) => !Number.isNaN(marks));

//     if (!validMarks.length) {
//       return 0;
//     }

//     const total = validMarks.reduce(
//       (sum, marks) => sum + marks,
//       0
//     );

//     return Math.round(total / validMarks.length);
//   }, [results]);

//   // ==========================================================
//   // RESULT COUNT
//   // ==========================================================
//   const totalResults = results.length;

//   // ==========================================================
//   // LOADING
//   // ==========================================================
//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="results-page">
//           <div className="results-loading">
//             <div className="loading-spinner"></div>
//             <p>Loading academic results...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="results-page">

//         {/* ==================================================
//             HEADER
//         ================================================== */}
//         <div className="results-header">
//           <div>
//             <h1>Academic Results</h1>
//             <p>
//               View examination marks, grades and academic
//               performance.
//             </p>
//           </div>
//         </div>

//         {/* ==================================================
//             ERROR
//         ================================================== */}
//         {error && (
//           <div className="results-error">
//             <span>⚠️</span>
//             <div>
//               <strong>Unable to load results</strong>
//               <p>{error}</p>
//             </div>
//           </div>
//         )}

//         {!error && (
//           <>
//             {/* ==============================================
//                 SUMMARY CARDS
//             ============================================== */}
//             <div className="results-summary">

//               <div className="result-summary-card">
//                 <div className="summary-icon blue">
//                   📚
//                 </div>

//                 <div>
//                   <span>Total Results</span>
//                   <strong>{totalResults}</strong>
//                 </div>
//               </div>

//               <div className="result-summary-card">
//                 <div className="summary-icon green">
//                   📊
//                 </div>

//                 <div>
//                   <span>Average Marks</span>
//                   <strong>{averageMarks}%</strong>
//                 </div>
//               </div>

//               <div className="result-summary-card">
//                 <div className="summary-icon purple">
//                   🏆
//                 </div>

//                 <div>
//                   <span>Subjects</span>
//                   <strong>{performanceData.length}</strong>
//                 </div>
//               </div>

//             </div>

//             {/* ==============================================
//                 ACADEMIC PERFORMANCE
//             ============================================== */}
//             {results.length > 0 && (
//               <div className="results-chart-section">
//                 <PerformanceChart data={performanceData} />
//               </div>
//             )}

//             {/* ==============================================
//                 RESULTS TABLE
//             ============================================== */}
//             <div className="results-table-card">

//               <div className="results-table-header">
//                 <div>
//                   <h2>Examination Results</h2>
//                   <p>
//                     Individual subject examination performance
//                   </p>
//                 </div>
//               </div>

//               {results.length === 0 ? (
//                 <div className="results-empty">
//                   <div className="empty-icon">📋</div>

//                   <h3>No Results Available</h3>

//                   <p>
//                     Examination results will appear here once
//                     they have been recorded.
//                   </p>
//                 </div>
//               ) : (
//                 <DataTable
//                   columns={[
//                     {
//                       key: "student_name",
//                       label: "Student",
//                     },
//                     {
//                       key: "subject_name",
//                       label: "Subject",
//                     },
//                     {
//                       key: "class_name",
//                       label: "Class",
//                     },
//                     {
//                       key: "term",
//                       label: "Term",
//                     },
//                     {
//                       key: "session",
//                       label: "Session",
//                     },
//                     {
//                       key: "marks",
//                       label: "Marks",
//                     },
//                     {
//                       key: "grade",
//                       label: "Grade",
//                     },
//                   ]}
//                   data={results.map((result) => ({
//                     ...result,

//                     student_name:
//                       result.student_name ||
//                       result.student?.name ||
//                       "Unknown Student",

//                     subject_name:
//                       result.subject_name ||
//                       result.subject?.name ||
//                       "Unknown Subject",

//                     class_name:
//                       result.class_name ||
//                       result.school_class?.name ||
//                       "Not assigned",

//                     marks:
//                       result.marks !== null &&
//                       result.marks !== undefined
//                         ? `${result.marks}%`
//                         : "-",

//                     grade: (
//                       <span
//                         className={`result-grade ${getGradeClass(
//                           result.grade
//                         )}`}
//                       >
//                         {result.grade || "-"}
//                       </span>
//                     ),
//                   }))}
//                 />
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Results;



