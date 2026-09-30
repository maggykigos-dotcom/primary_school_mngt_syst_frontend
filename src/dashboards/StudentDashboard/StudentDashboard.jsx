import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";

import StatCard from "../../components/StatCard/StatCard.jsx";

import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";

import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

import { getStudentDashboardData } from "../../api/studentAPI.js";

import {
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaBookOpen,
  FaClock,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaClipboardCheck,
  FaGift,
  FaMoneyBillWave,
  FaExclamationCircle,
  FaCheckCircle,
  FaRedoAlt,
} from "react-icons/fa";

import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const dashboardData = await getStudentDashboardData();

        console.log("========== FINAL STUDENT DASHBOARD ==========");
        console.log("PROFILE:", dashboardData?.profile);
        console.log("ATTENDANCE:", dashboardData?.attendance);
        console.log("RESULTS:", dashboardData?.results);
        console.log("ASSIGNMENTS:", dashboardData?.assignments);
        console.log("TIMETABLE:", dashboardData?.timetable);
        console.log("FEES:", dashboardData?.fees);
        console.log("=============================================");

        setData(dashboardData);
      } catch (err) {
        console.error("Student dashboard error:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load dashboard data. Please check that the backend is running and you are logged in."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ============================================================
  // PROFILE
  // ============================================================

  const profile = data?.profile || {};

  const studentName =
    profile?.full_name ||
    profile?.name ||
    profile?.student_name ||
    profile?.user?.full_name ||
    profile?.user?.name ||
    `${profile?.user?.first_name || ""} ${
      profile?.user?.last_name || ""
    }`.trim() ||
    "Student";

  const admissionNumber =
    profile?.admission_number ||
    profile?.student?.admission_number ||
    "N/A";

  const className =
    profile?.school_class_name ||
    profile?.class_name ||
    profile?.school_class?.name ||
    profile?.school_class ||
    "N/A";

  const gradeName =
    profile?.grade_name ||
    profile?.grade?.name ||
    "";

  // ============================================================
  // ATTENDANCE RECORDS
  // ============================================================

  const attendanceRecords = useMemo(() => {
    const attendance = data?.attendance;

    if (Array.isArray(attendance)) {
      return attendance;
    }

    if (Array.isArray(attendance?.results)) {
      return attendance.results;
    }

    if (Array.isArray(attendance?.data)) {
      return attendance.data;
    }

    if (Array.isArray(attendance?.trend)) {
      return attendance.trend;
    }

    return [];
  }, [data]);

  // ============================================================
  // ATTENDANCE STATUS HELPER
  // ============================================================

  const getAttendanceStatus = (record) => {
    const status = String(
      record?.status ||
        record?.attendance_status ||
        record?.attendanceStatus ||
        ""
    ).toLowerCase();

    if (
      status === "present" ||
      status === "late" ||
      status === "excused"
    ) {
      return "present";
    }

    if (
      status === "absent" ||
      status === "missing"
    ) {
      return "absent";
    }

    if (
      record?.is_present === true ||
      record?.present === true
    ) {
      return "present";
    }

    if (
      record?.is_absent === true ||
      record?.absent === true
    ) {
      return "absent";
    }

    return "unknown";
  };

  // ============================================================
  // ATTENDANCE PERCENTAGE
  // ============================================================

  const attendancePercentage = useMemo(() => {
    const attendance = data?.attendance;

    // If backend gives a direct percentage, use it.
    if (
      attendance &&
      !Array.isArray(attendance) &&
      attendance.percentage !== undefined &&
      attendance.percentage !== null
    ) {
      return Number(attendance.percentage);
    }

    if (
      attendance &&
      !Array.isArray(attendance) &&
      attendance.attendance_percentage !== undefined &&
      attendance.attendance_percentage !== null
    ) {
      return Number(attendance.attendance_percentage);
    }

    if (attendanceRecords.length === 0) {
      return 0;
    }

    const validRecords = attendanceRecords.filter(
      (record) => getAttendanceStatus(record) !== "unknown"
    );

    if (validRecords.length === 0) {
      return 0;
    }

    const presentCount = validRecords.filter(
      (record) => getAttendanceStatus(record) === "present"
    ).length;

    return (presentCount / validRecords.length) * 100;
  }, [data, attendanceRecords]);

  // ============================================================
  // ATTENDANCE CHART DATA
  // ============================================================

  const attendanceChartData = useMemo(() => {
    if (attendanceRecords.length === 0) {
      return [];
    }

    const dailyData = {};

    attendanceRecords.forEach((record) => {
      const rawDate =
        record?.date ||
        record?.attendance_date ||
        record?.day ||
        record?.created_at;

      if (!rawDate) {
        return;
      }

      const date = String(rawDate).split("T")[0];

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          present: 0,
          absent: 0,
          excused: 0,
          total: 0,
        };
      }

      dailyData[date].total += 1;

      const status = String(
        record?.status ||
          record?.attendance_status ||
          ""
      ).toLowerCase();

      if (
        status === "present" ||
        status === "late"
      ) {
        dailyData[date].present += 1;
      } else if (status === "absent") {
        dailyData[date].absent += 1;
      } else if (status === "excused") {
        dailyData[date].excused += 1;
      } else if (
        record?.is_present === true ||
        record?.present === true
      ) {
        dailyData[date].present += 1;
      } else if (
        record?.is_absent === true ||
        record?.absent === true
      ) {
        dailyData[date].absent += 1;
      }
    });

    return Object.values(dailyData)
      .map((day) => {
        const attendance =
          day.total > 0
            ? Math.round(
                (day.present / day.total) * 100
              )
            : 0;

        return {
          date: day.date,
          attendance,
          present: day.present,
          absent: day.absent,
          excused: day.excused,
          total: day.total,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );
  }, [attendanceRecords]);

  // ============================================================
  // RESULTS
  // ============================================================

  const resultRecords = useMemo(() => {
    const results = data?.results;

    if (Array.isArray(results)) {
      return results;
    }

    if (Array.isArray(results?.results)) {
      return results.results;
    }

    if (Array.isArray(results?.data)) {
      return results.data;
    }

    if (Array.isArray(results?.subjects)) {
      return results.subjects;
    }

    return [];
  }, [data]);

  // ============================================================
  // TERM AVERAGE
  // ============================================================

  const termAverage = useMemo(() => {
    const results = data?.results;

    if (
      results &&
      !Array.isArray(results) &&
      results.average !== undefined &&
      results.average !== null
    ) {
      return Number(results.average);
    }

    if (
      results &&
      !Array.isArray(results) &&
      results.average_marks !== undefined &&
      results.average_marks !== null
    ) {
      return Number(results.average_marks);
    }

    const marks = resultRecords
      .map(
        (result) =>
          result?.marks ??
          result?.score ??
          result?.average_marks ??
          result?.percentage
      )
      .filter(
        (mark) =>
          mark !== undefined &&
          mark !== null &&
          !Number.isNaN(Number(mark))
      )
      .map(Number);

    if (marks.length === 0) {
      return 0;
    }

    return (
      marks.reduce(
        (sum, mark) => sum + mark,
        0
      ) / marks.length
    );
  }, [data, resultRecords]);

  // ============================================================
  // PERFORMANCE CHART DATA
  // ============================================================

  const performanceChartData = useMemo(() => {
    if (resultRecords.length === 0) {
      return [];
    }

    const subjectGroups = {};

    resultRecords.forEach((result) => {
      const subject =
        result?.subject_name ||
        result?.subject?.name ||
        result?.subject ||
        result?.name;

      const score =
        result?.marks ??
        result?.score ??
        result?.average_marks ??
        result?.percentage;

      if (
        !subject ||
        score === undefined ||
        score === null ||
        Number.isNaN(Number(score))
      ) {
        return;
      }

      const subjectName = String(subject);

      if (!subjectGroups[subjectName]) {
        subjectGroups[subjectName] = [];
      }

      subjectGroups[subjectName].push(
        Number(score)
      );
    });

    return Object.entries(subjectGroups).map(
      ([subject, scores]) => {
        const average =
          scores.reduce(
            (sum, score) => sum + score,
            0
          ) / scores.length;

        return {
          subject,
          performance: Math.round(average),
        };
      }
    );
  }, [resultRecords]);

  // ============================================================
  // ASSIGNMENTS
  // ============================================================

  const assignments = useMemo(() => {
    const assignmentData = data?.assignments;

    if (Array.isArray(assignmentData)) {
      return assignmentData;
    }

    if (Array.isArray(assignmentData?.results)) {
      return assignmentData.results;
    }

    if (Array.isArray(assignmentData?.data)) {
      return assignmentData.data;
    }

    return [];
  }, [data]);

  // ============================================================
  // TIMETABLE
  // ============================================================

  const timetable = useMemo(() => {
    const timetableData = data?.timetable;

    if (Array.isArray(timetableData)) {
      return timetableData;
    }

    if (Array.isArray(timetableData?.results)) {
      return timetableData.results;
    }

    if (Array.isArray(timetableData?.data)) {
      return timetableData.data;
    }

    return [];
  }, [data]);

  // ============================================================
  // FEES
  // ============================================================

  const feeRecords = useMemo(() => {
    const fees = data?.fees;

    if (Array.isArray(fees)) {
      return fees;
    }

    if (Array.isArray(fees?.results)) {
      return fees.results;
    }

    if (Array.isArray(fees?.data)) {
      return fees.data;
    }

    return [];
  }, [data]);

  const feeBalance = useMemo(() => {
    const fees = data?.fees;

    if (
      fees &&
      !Array.isArray(fees) &&
      fees.balance !== undefined
    ) {
      return Number(fees.balance);
    }

    if (
      fees &&
      !Array.isArray(fees) &&
      fees.outstanding_balance !== undefined
    ) {
      return Number(fees.outstanding_balance);
    }

    if (feeRecords.length > 0) {
      const balanceRecord = feeRecords.find(
        (fee) =>
          fee?.balance !== undefined ||
          fee?.outstanding_balance !== undefined
      );

      if (balanceRecord) {
        return Number(
          balanceRecord.balance ??
            balanceRecord.outstanding_balance ??
            0
        );
      }
    }

    return 0;
  }, [data, feeRecords]);

  // ============================================================
  // COUNTS
  // ============================================================

  const homeworkCount = assignments.length;
  const todayClasses = timetable.length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="student-dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="student-dashboard">
          <div className="dashboard-error">
            <div className="error-icon">
              <FaExclamationCircle />
            </div>

            <h2>
              Unable to load dashboard
            </h2>

            <p>{error}</p>

            <button
              className="retry-button"
              onClick={() =>
                window.location.reload()
              }
            >
              <FaRedoAlt />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <DashboardLayout>
      <div className="student-dashboard">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="student-dashboard-header">
          <p className="dashboard-welcome">
            Welcome back <FaGraduationCap />
          </p>

          <h1>{studentName}</h1>

          <div className="student-meta">
            <span>
              <strong>
                Admission No:
              </strong>{" "}
              {admissionNumber}
            </span>

            <span>
              <strong>
                Class:
              </strong>{" "}
              {gradeName
                ? `${gradeName} - ${className}`
                : className}
            </span>
          </div>
        </div>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="student-stats-grid">

          <StatCard
            title="Attendance"
            value={`${attendancePercentage.toFixed(
              0
            )}%`}
            icon={<FaCalendarCheck />}
          />

          <StatCard
            title="Term Average"
            value={termAverage.toFixed(0)}
            icon={<FaChartLine />}
          />

          <StatCard
            title="Homework"
            value={homeworkCount}
            icon={<FaClipboardList />}
          />

          <StatCard
            title="Today's Classes"
            value={todayClasses}
            icon={<FaBookOpen />}
          />

        </div>

        {/* =====================================================
            CHARTS
        ====================================================== */}

        <section className="charts-section">
          <div className="charts-grid">

            <div className="dashboard-card chart-card">
              <PerformanceChart
                data={performanceChartData}
              />
            </div>

            <div className="dashboard-card chart-card">
              <AttendanceChart
                data={attendanceChartData}
              />
            </div>

          </div>
        </section>

        {/* =====================================================
            TODAY'S TIMETABLE
        ====================================================== */}

        <section className="dashboard-card timetable-section">

          <div className="section-header">
            <div>
              <h2>
                Today's Timetable
              </h2>

              <p>
                Your classes for today
              </p>
            </div>

            <span className="section-icon">
              <FaClock />
            </span>
          </div>

          {timetable.length > 0 ? (
            <div className="timetable-list">

              {timetable.map(
                (item, index) => {

                  const subject =
                    item?.subject_name ||
                    item?.subject?.name ||
                    item?.subject ||
                    "Subject";

                  const teacher =
                    item?.teacher_name ||
                    item?.teacher?.name ||
                    item?.teacher ||
                    "Teacher";

                  const startTime =
                    item?.start_time ||
                    item?.start ||
                    "";

                  const endTime =
                    item?.end_time ||
                    item?.end ||
                    "";

                  return (
                    <div
                      className="timetable-item"
                      key={
                        item?.id || index
                      }
                    >

                      <div className="timetable-time">
                        <span>
                          {startTime ||
                            "--:--"}
                        </span>

                        {endTime && (
                          <small>
                            {endTime}
                          </small>
                        )}
                      </div>

                      <div className="timetable-divider"></div>

                      <div className="timetable-details">
                        <h3>
                          {subject}
                        </h3>

                        <p>
                          <FaChalkboardTeacher />{" "}
                          {teacher}
                        </p>
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="empty-state">

              <div className="empty-icon">
                <FaBookOpen />
              </div>

              <h3>
                No classes scheduled
              </h3>

              <p>
                You don't have any timetable
                entries for today.
              </p>

            </div>
          )}

        </section>

        {/* =====================================================
            ASSIGNMENTS
        ====================================================== */}

        <section className="dashboard-card assignments-section">

          <div className="section-header">
            <div>
              <h2>
                Homework / Assignments
              </h2>

              <p>
                Keep track of your upcoming work
              </p>
            </div>

            <span className="section-icon">
              <FaClipboardList />
            </span>
          </div>

          {assignments.length > 0 ? (
            <div className="assignments-list">

              {assignments.map(
                (assignment, index) => {

                  const title =
                    assignment?.title ||
                    assignment?.name ||
                    "Assignment";

                  const subject =
                    assignment?.subject_name ||
                    assignment?.subject?.name ||
                    assignment?.subject ||
                    "Subject";

                  const dueDate =
                    assignment?.due_date ||
                    assignment?.deadline ||
                    assignment?.due ||
                    "";

                  return (
                    <div
                      className="assignment-item"
                      key={
                        assignment?.id ||
                        index
                      }
                    >

                      <div className="assignment-icon">
                        <FaClipboardCheck />
                      </div>

                      <div className="assignment-info">
                        <h3>
                          {title}
                        </h3>

                        <p>
                          {subject}
                        </p>
                      </div>

                      <div className="assignment-due">

                        <span>
                          Due
                        </span>

                        <strong>
                          {dueDate
                            ? new Date(
                                dueDate
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Not specified"}
                        </strong>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          ) : (
            <div className="empty-state">

              <div className="empty-icon">
                <FaGift />
              </div>

              <h3>
                No assignments
              </h3>

              <p>
                You currently have no assignments.
              </p>

            </div>
          )}

        </section>

        {/* =====================================================
            SCHOOL FEES
        ====================================================== */}

        <section className="dashboard-card fees-section">

          <div className="section-header">
            <div>
              <h2>
                School Fees
              </h2>

              <p>
                Your current fee balance and records
              </p>
            </div>

            <span className="section-icon">
              <FaMoneyBillWave />
            </span>
          </div>

          <div className="fees-summary">

            <div className="fee-balance-card">

              <span className="fee-label">
                Outstanding Balance
              </span>

              <strong className="fee-amount">
                KES{" "}
                {feeBalance.toLocaleString(
                  "en-KE"
                )}
              </strong>

            </div>

            <div
              className={`fee-status ${
                feeBalance > 0
                  ? "fee-pending"
                  : "fee-paid"
              }`}
            >

              {feeBalance > 0 ? (
                <>
                  <FaExclamationCircle />
                  Payment outstanding
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Fees fully paid
                </>
              )}

            </div>

          </div>

          {feeRecords.length > 0 && (
            <div className="fee-records">

              <h3>
                Recent Fee Records
              </h3>

              <div className="fee-record-list">

                {feeRecords
                  .slice(0, 5)
                  .map(
                    (payment, index) => {

                      const amount =
                        payment?.amount ??
                        payment?.paid_amount ??
                        0;

                      const date =
                        payment?.date ||
                        payment?.created_at ||
                        "";

                      const method =
                        payment?.payment_method ||
                        payment?.method ||
                        "Payment";

                      const status =
                        payment?.status ||
                        "Successful";

                      return (
                        <div
                          className="fee-record-item"
                          key={
                            payment?.id ||
                            index
                          }
                        >

                          <div>
                            <strong>
                              KES{" "}
                              {Number(
                                amount
                              ).toLocaleString(
                                "en-KE"
                              )}
                            </strong>

                            <span>
                              {method}
                            </span>
                          </div>

                          <div className="fee-record-right">

                            <span>
                              {date
                                ? new Date(
                                    date
                                  ).toLocaleDateString(
                                    "en-GB"
                                  )
                                : ""}
                            </span>

                            <span className="payment-status">
                              {status}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

              </div>

            </div>
          )}

        </section>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;


// import { useEffect, useMemo, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";
// import StatCard from "../../components/StatCard/StatCard.jsx";

// import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";
// import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

// import { getStudentDashboardData } from "../../api/studentAPI.js";

// import "./StudentDashboard.css";

// const StudentDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ============================================================
//   // LOAD DASHBOARD
//   // ============================================================

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const dashboardData = await getStudentDashboardData();

//         console.log("========== FINAL STUDENT DASHBOARD ==========");
//         console.log("PROFILE:", dashboardData?.profile);
//         console.log("ATTENDANCE:", dashboardData?.attendance);
//         console.log("RESULTS:", dashboardData?.results);
//         console.log("ASSIGNMENTS:", dashboardData?.assignments);
//         console.log("TIMETABLE:", dashboardData?.timetable);
//         console.log("FEES:", dashboardData?.fees);
//         console.log("=============================================");

//         setData(dashboardData);
//       } catch (err) {
//         console.error("Student dashboard error:", err);

//         setError(
//           err?.response?.data?.detail ||
//             "Unable to load dashboard data. Please check that the backend is running and you are logged in."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   // ============================================================
//   // PROFILE
//   // ============================================================

//   const profile = data?.profile || {};

//   const studentName =
//     profile?.full_name ||
//     profile?.name ||
//     profile?.student_name ||
//     profile?.user?.full_name ||
//     profile?.user?.name ||
//     `${profile?.user?.first_name || ""} ${
//       profile?.user?.last_name || ""
//     }`.trim() ||
//     "Student";

//   const admissionNumber =
//     profile?.admission_number ||
//     profile?.student?.admission_number ||
//     "N/A";

//   const className =
//     profile?.school_class_name ||
//     profile?.class_name ||
//     profile?.school_class?.name ||
//     profile?.school_class ||
//     "N/A";

//   const gradeName =
//     profile?.grade_name ||
//     profile?.grade?.name ||
//     "";

//   // ============================================================
//   // ATTENDANCE RECORDS
//   // ============================================================

//   const attendanceRecords = useMemo(() => {
//     const attendance = data?.attendance;

//     if (Array.isArray(attendance)) {
//       return attendance;
//     }

//     if (Array.isArray(attendance?.results)) {
//       return attendance.results;
//     }

//     if (Array.isArray(attendance?.data)) {
//       return attendance.data;
//     }

//     if (Array.isArray(attendance?.trend)) {
//       return attendance.trend;
//     }

//     return [];
//   }, [data]);

//   // ============================================================
//   // ATTENDANCE STATUS HELPER
//   // ============================================================

//   const getAttendanceStatus = (record) => {
//     const status = String(
//       record?.status ||
//         record?.attendance_status ||
//         record?.attendanceStatus ||
//         ""
//     ).toLowerCase();

//     if (
//       status === "present" ||
//       status === "late" ||
//       status === "excused"
//     ) {
//       return "present";
//     }

//     if (
//       status === "absent" ||
//       status === "missing"
//     ) {
//       return "absent";
//     }

//     if (
//       record?.is_present === true ||
//       record?.present === true
//     ) {
//       return "present";
//     }

//     if (
//       record?.is_absent === true ||
//       record?.absent === true
//     ) {
//       return "absent";
//     }

//     return "unknown";
//   };

//   // ============================================================
//   // ATTENDANCE PERCENTAGE
//   // ============================================================

//   const attendancePercentage = useMemo(() => {
//     const attendance = data?.attendance;

//     // If backend gives a direct percentage, use it.
//     if (
//       attendance &&
//       !Array.isArray(attendance) &&
//       attendance.percentage !== undefined &&
//       attendance.percentage !== null
//     ) {
//       return Number(attendance.percentage);
//     }

//     if (
//       attendance &&
//       !Array.isArray(attendance) &&
//       attendance.attendance_percentage !== undefined &&
//       attendance.attendance_percentage !== null
//     ) {
//       return Number(attendance.attendance_percentage);
//     }

//     if (attendanceRecords.length === 0) {
//       return 0;
//     }

//     const validRecords = attendanceRecords.filter(
//       (record) => getAttendanceStatus(record) !== "unknown"
//     );

//     if (validRecords.length === 0) {
//       return 0;
//     }

//     const presentCount = validRecords.filter(
//       (record) => getAttendanceStatus(record) === "present"
//     ).length;

//     return (presentCount / validRecords.length) * 100;
//   }, [data, attendanceRecords]);

//   // ============================================================
//   // ATTENDANCE CHART DATA
//   // ============================================================

//   const attendanceChartData = useMemo(() => {
//     if (attendanceRecords.length === 0) {
//       return [];
//     }

//     const dailyData = {};

//     attendanceRecords.forEach((record) => {
//       const rawDate =
//         record?.date ||
//         record?.attendance_date ||
//         record?.day ||
//         record?.created_at;

//       if (!rawDate) {
//         return;
//       }

//       const date = String(rawDate).split("T")[0];

//       if (!dailyData[date]) {
//         dailyData[date] = {
//           date,
//           present: 0,
//           absent: 0,
//           excused: 0,
//           total: 0,
//         };
//       }

//       dailyData[date].total += 1;

//       const status = String(
//         record?.status ||
//           record?.attendance_status ||
//           ""
//       ).toLowerCase();

//       if (
//         status === "present" ||
//         status === "late"
//       ) {
//         dailyData[date].present += 1;
//       } else if (status === "absent") {
//         dailyData[date].absent += 1;
//       } else if (status === "excused") {
//         dailyData[date].excused += 1;
//       } else if (
//         record?.is_present === true ||
//         record?.present === true
//       ) {
//         dailyData[date].present += 1;
//       } else if (
//         record?.is_absent === true ||
//         record?.absent === true
//       ) {
//         dailyData[date].absent += 1;
//       }
//     });

//     return Object.values(dailyData)
//       .map((day) => {
//         const attendance =
//           day.total > 0
//             ? Math.round(
//                 (day.present / day.total) * 100
//               )
//             : 0;

//         return {
//           date: day.date,
//           attendance,
//           present: day.present,
//           absent: day.absent,
//           excused: day.excused,
//           total: day.total,
//         };
//       })
//       .sort(
//         (a, b) =>
//           new Date(a.date) - new Date(b.date)
//       );
//   }, [attendanceRecords]);

//   // ============================================================
//   // RESULTS
//   // ============================================================

//   const resultRecords = useMemo(() => {
//     const results = data?.results;

//     if (Array.isArray(results)) {
//       return results;
//     }

//     if (Array.isArray(results?.results)) {
//       return results.results;
//     }

//     if (Array.isArray(results?.data)) {
//       return results.data;
//     }

//     if (Array.isArray(results?.subjects)) {
//       return results.subjects;
//     }

//     return [];
//   }, [data]);

//   // ============================================================
//   // TERM AVERAGE
//   // ============================================================

//   const termAverage = useMemo(() => {
//     const results = data?.results;

//     if (
//       results &&
//       !Array.isArray(results) &&
//       results.average !== undefined &&
//       results.average !== null
//     ) {
//       return Number(results.average);
//     }

//     if (
//       results &&
//       !Array.isArray(results) &&
//       results.average_marks !== undefined &&
//       results.average_marks !== null
//     ) {
//       return Number(results.average_marks);
//     }

//     const marks = resultRecords
//       .map(
//         (result) =>
//           result?.marks ??
//           result?.score ??
//           result?.average_marks ??
//           result?.percentage
//       )
//       .filter(
//         (mark) =>
//           mark !== undefined &&
//           mark !== null &&
//           !Number.isNaN(Number(mark))
//       )
//       .map(Number);

//     if (marks.length === 0) {
//       return 0;
//     }

//     return (
//       marks.reduce(
//         (sum, mark) => sum + mark,
//         0
//       ) / marks.length
//     );
//   }, [data, resultRecords]);

//   // ============================================================
//   // PERFORMANCE CHART DATA
//   // IMPORTANT:
//   // PerformanceChart expects:
//   // {
//   //   subject: "...",
//   //   performance: 75
//   // }
//   // ============================================================

//   const performanceChartData = useMemo(() => {
//     if (resultRecords.length === 0) {
//       return [];
//     }

//     // Group results by subject.
//     const subjectGroups = {};

//     resultRecords.forEach((result) => {
//       const subject =
//         result?.subject_name ||
//         result?.subject?.name ||
//         result?.subject ||
//         result?.name;

//       const score =
//         result?.marks ??
//         result?.score ??
//         result?.average_marks ??
//         result?.percentage;

//       if (
//         !subject ||
//         score === undefined ||
//         score === null ||
//         Number.isNaN(Number(score))
//       ) {
//         return;
//       }

//       const subjectName = String(subject);

//       if (!subjectGroups[subjectName]) {
//         subjectGroups[subjectName] = [];
//       }

//       subjectGroups[subjectName].push(Number(score));
//     });

//     return Object.entries(subjectGroups).map(
//       ([subject, scores]) => {
//         const average =
//           scores.reduce(
//             (sum, score) => sum + score,
//             0
//           ) / scores.length;

//         return {
//           subject,
//           performance: Math.round(average),
//         };
//       }
//     );
//   }, [resultRecords]);

//   // ============================================================
//   // ASSIGNMENTS
//   // ============================================================

//   const assignments = useMemo(() => {
//     const assignmentData = data?.assignments;

//     if (Array.isArray(assignmentData)) {
//       return assignmentData;
//     }

//     if (Array.isArray(assignmentData?.results)) {
//       return assignmentData.results;
//     }

//     if (Array.isArray(assignmentData?.data)) {
//       return assignmentData.data;
//     }

//     return [];
//   }, [data]);

//   // ============================================================
//   // TIMETABLE
//   // ============================================================

//   const timetable = useMemo(() => {
//     const timetableData = data?.timetable;

//     if (Array.isArray(timetableData)) {
//       return timetableData;
//     }

//     if (Array.isArray(timetableData?.results)) {
//       return timetableData.results;
//     }

//     if (Array.isArray(timetableData?.data)) {
//       return timetableData.data;
//     }

//     return [];
//   }, [data]);

//   // ============================================================
//   // FEES
//   // ============================================================

//   const feeRecords = useMemo(() => {
//     const fees = data?.fees;

//     if (Array.isArray(fees)) {
//       return fees;
//     }

//     if (Array.isArray(fees?.results)) {
//       return fees.results;
//     }

//     if (Array.isArray(fees?.data)) {
//       return fees.data;
//     }

//     return [];
//   }, [data]);

//   const feeBalance = useMemo(() => {
//     const fees = data?.fees;

//     if (
//       fees &&
//       !Array.isArray(fees) &&
//       fees.balance !== undefined
//     ) {
//       return Number(fees.balance);
//     }

//     if (
//       fees &&
//       !Array.isArray(fees) &&
//       fees.outstanding_balance !== undefined
//     ) {
//       return Number(fees.outstanding_balance);
//     }

//     if (feeRecords.length > 0) {
//       const balanceRecord = feeRecords.find(
//         (fee) =>
//           fee?.balance !== undefined ||
//           fee?.outstanding_balance !== undefined
//       );

//       if (balanceRecord) {
//         return Number(
//           balanceRecord.balance ??
//             balanceRecord.outstanding_balance ??
//             0
//         );
//       }
//     }

//     return 0;
//   }, [data, feeRecords]);

//   // ============================================================
//   // COUNTS
//   // ============================================================

//   const homeworkCount = assignments.length;
//   const todayClasses = timetable.length;

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="student-dashboard-loading">
//           <div className="loading-spinner"></div>
//           <p>Loading your dashboard...</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // ============================================================
//   // ERROR
//   // ============================================================

//   if (error && !data) {
//     return (
//       <DashboardLayout>
//         <div className="student-dashboard">
//           <div className="dashboard-error">
//             <div className="error-icon">
//               ⚠️
//             </div>

//             <h2>
//               Unable to load dashboard
//             </h2>

//             <p>{error}</p>

//             <button
//               className="retry-button"
//               onClick={() =>
//                 window.location.reload()
//               }
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // ============================================================
//   // DASHBOARD
//   // ============================================================

//   return (
//     <DashboardLayout>
//       <div className="student-dashboard">

//         {/* =====================================================
//             HEADER
//         ====================================================== */}

//         <div className="student-dashboard-header">
//           <p className="dashboard-welcome">
//             Welcome back 👋
//           </p>

//           <h1>{studentName}</h1>

//           <div className="student-meta">
//             <span>
//               <strong>
//                 Admission No:
//               </strong>{" "}
//               {admissionNumber}
//             </span>

//             <span>
//               <strong>
//                 Class:
//               </strong>{" "}
//               {gradeName
//                 ? `${gradeName} - ${className}`
//                 : className}
//             </span>
//           </div>
//         </div>

//         {/* =====================================================
//             STAT CARDS
//         ====================================================== */}

//         <div className="student-stats-grid">
//           <StatCard
//             title="Attendance"
//             value={`${attendancePercentage.toFixed(
//               0
//             )}%`}
//             icon="📅"
//           />

//           <StatCard
//             title="Term Average"
//             value={termAverage.toFixed(0)}
//             icon="📊"
//           />

//           <StatCard
//             title="Homework"
//             value={homeworkCount}
//             icon="📝"
//           />

//           <StatCard
//             title="Today's Classes"
//             value={todayClasses}
//             icon="📚"
//           />
//         </div>

//         {/* =====================================================
//             CHARTS
//         ====================================================== */}

//         <section className="charts-section">
//           <div className="charts-grid">

//             <div className="dashboard-card chart-card">
//               <PerformanceChart
//                 data={performanceChartData}
//               />
//             </div>

//             <div className="dashboard-card chart-card">
//               <AttendanceChart
//                 data={attendanceChartData}
//               />
//             </div>

//           </div>
//         </section>

//         {/* =====================================================
//             TODAY'S TIMETABLE
//         ====================================================== */}

//         <section className="dashboard-card timetable-section">

//           <div className="section-header">
//             <div>
//               <h2>
//                 Today's Timetable
//               </h2>

//               <p>
//                 Your classes for today
//               </p>
//             </div>

//             <span className="section-icon">
//               🕐
//             </span>
//           </div>

//           {timetable.length > 0 ? (
//             <div className="timetable-list">

//               {timetable.map(
//                 (item, index) => {
//                   const subject =
//                     item?.subject_name ||
//                     item?.subject?.name ||
//                     item?.subject ||
//                     "Subject";

//                   const teacher =
//                     item?.teacher_name ||
//                     item?.teacher?.name ||
//                     item?.teacher ||
//                     "Teacher";

//                   const startTime =
//                     item?.start_time ||
//                     item?.start ||
//                     "";

//                   const endTime =
//                     item?.end_time ||
//                     item?.end ||
//                     "";

//                   return (
//                     <div
//                       className="timetable-item"
//                       key={
//                         item?.id || index
//                       }
//                     >
//                       <div className="timetable-time">
//                         <span>
//                           {startTime ||
//                             "--:--"}
//                         </span>

//                         {endTime && (
//                           <small>
//                             {endTime}
//                           </small>
//                         )}
//                       </div>

//                       <div className="timetable-divider"></div>

//                       <div className="timetable-details">
//                         <h3>
//                           {subject}
//                         </h3>

//                         <p>
//                           👨‍🏫 {teacher}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 }
//               )}

//             </div>
//           ) : (
//             <div className="empty-state">
//               <div className="empty-icon">
//                 📚
//               </div>

//               <h3>
//                 No classes scheduled
//               </h3>

//               <p>
//                 You don't have any timetable
//                 entries for today.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* =====================================================
//             ASSIGNMENTS
//         ====================================================== */}

//         <section className="dashboard-card assignments-section">

//           <div className="section-header">
//             <div>
//               <h2>
//                 Homework / Assignments
//               </h2>

//               <p>
//                 Keep track of your upcoming work
//               </p>
//             </div>

//             <span className="section-icon">
//               📝
//             </span>
//           </div>

//           {assignments.length > 0 ? (
//             <div className="assignments-list">

//               {assignments.map(
//                 (assignment, index) => {
//                   const title =
//                     assignment?.title ||
//                     assignment?.name ||
//                     "Assignment";

//                   const subject =
//                     assignment?.subject_name ||
//                     assignment?.subject?.name ||
//                     assignment?.subject ||
//                     "Subject";

//                   const dueDate =
//                     assignment?.due_date ||
//                     assignment?.deadline ||
//                     assignment?.due ||
//                     "";

//                   return (
//                     <div
//                       className="assignment-item"
//                       key={
//                         assignment?.id ||
//                         index
//                       }
//                     >
//                       <div className="assignment-icon">
//                         📝
//                       </div>

//                       <div className="assignment-info">
//                         <h3>
//                           {title}
//                         </h3>

//                         <p>
//                           {subject}
//                         </p>
//                       </div>

//                       <div className="assignment-due">
//                         <span>
//                           Due
//                         </span>

//                         <strong>
//                           {dueDate
//                             ? new Date(
//                                 dueDate
//                               ).toLocaleDateString(
//                                 "en-GB",
//                                 {
//                                   day: "2-digit",
//                                   month: "short",
//                                   year: "numeric",
//                                 }
//                               )
//                             : "Not specified"}
//                         </strong>
//                       </div>
//                     </div>
//                   );
//                 }
//               )}

//             </div>
//           ) : (
//             <div className="empty-state">
//               <div className="empty-icon">
//                 🎉
//               </div>

//               <h3>
//                 No assignments
//               </h3>

//               <p>
//                 You currently have no assignments.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* =====================================================
//             SCHOOL FEES
//         ====================================================== */}

//         <section className="dashboard-card fees-section">

//           <div className="section-header">
//             <div>
//               <h2>
//                 School Fees
//               </h2>

//               <p>
//                 Your current fee balance and records
//               </p>
//             </div>

//             <span className="section-icon">
//               💰
//             </span>
//           </div>

//           <div className="fees-summary">

//             <div className="fee-balance-card">
//               <span className="fee-label">
//                 Outstanding Balance
//               </span>

//               <strong className="fee-amount">
//                 KES{" "}
//                 {feeBalance.toLocaleString(
//                   "en-KE"
//                 )}
//               </strong>
//             </div>

//             <div
//               className={`fee-status ${
//                 feeBalance > 0
//                   ? "fee-pending"
//                   : "fee-paid"
//               }`}
//             >
//               {feeBalance > 0
//                 ? "Payment outstanding"
//                 : "Fees fully paid"}
//             </div>

//           </div>

//           {feeRecords.length > 0 && (
//             <div className="fee-records">

//               <h3>
//                 Recent Fee Records
//               </h3>

//               <div className="fee-record-list">

//                 {feeRecords
//                   .slice(0, 5)
//                   .map(
//                     (payment, index) => {
//                       const amount =
//                         payment?.amount ??
//                         payment?.paid_amount ??
//                         0;

//                       const date =
//                         payment?.date ||
//                         payment?.created_at ||
//                         "";

//                       const method =
//                         payment?.payment_method ||
//                         payment?.method ||
//                         "Payment";

//                       const status =
//                         payment?.status ||
//                         "Successful";

//                       return (
//                         <div
//                           className="fee-record-item"
//                           key={
//                             payment?.id ||
//                             index
//                           }
//                         >
//                           <div>
//                             <strong>
//                               KES{" "}
//                               {Number(
//                                 amount
//                               ).toLocaleString(
//                                 "en-KE"
//                               )}
//                             </strong>

//                             <span>
//                               {method}
//                             </span>
//                           </div>

//                           <div className="fee-record-right">
//                             <span>
//                               {date
//                                 ? new Date(
//                                     date
//                                   ).toLocaleDateString(
//                                     "en-GB"
//                                   )
//                                 : ""}
//                             </span>

//                             <span className="payment-status">
//                               {status}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     }
//                   )}

//               </div>
//             </div>
//           )}

//         </section>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default StudentDashboard;

