import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";
import StatCard from "../../components/StatCard/StatCard.jsx";
import DataTable from "../../components/DataTable/DataTable.jsx";

import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";
import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

import {
  getStudents,
  getTeachers,
  getParents,
} from "../../api/adminAPI";

import {
  getClasses,
  getAttendance,
  getResults,
} from "../../api/academicsAPI";

import {
  FiUserPlus,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiCreditCard,
  FiHome,
} from "react-icons/fi";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // EXTRACT API DATA
  // ==========================================================

  const extractData = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
      return response.data.results;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      // --------------------------------------------------------
      // MAIN DASHBOARD DATA
      // --------------------------------------------------------

      try {
        const [
          studentResponse,
          teacherResponse,
          parentResponse,
          classResponse,
        ] = await Promise.all([
          getStudents(),
          getTeachers(),
          getParents(),
          getClasses(),
        ]);

        setStudents(extractData(studentResponse));
        setTeachers(extractData(teacherResponse));
        setParents(extractData(parentResponse));
        setClasses(extractData(classResponse));
      } catch (err) {
        console.error("Main dashboard data error:", err);

        setError(
          "Unable to load the main dashboard data. Please check that the backend is running and you are logged in."
        );
      }

      // --------------------------------------------------------
      // ATTENDANCE
      // --------------------------------------------------------

      try {
        const attendanceResponse = await getAttendance();

        console.log(
          "Attendance response:",
          attendanceResponse
        );

        setAttendance(
          extractData(attendanceResponse)
        );
      } catch (err) {
        console.error(
          "Attendance loading error:",
          err
        );

        setAttendance([]);
      }

      // --------------------------------------------------------
      // RESULTS
      // --------------------------------------------------------

      try {
        const resultsResponse = await getResults();

        console.log(
          "Results response:",
          resultsResponse
        );

        setResults(
          extractData(resultsResponse)
        );
      } catch (err) {
        console.error(
          "Results loading error:",
          err
        );

        setResults([]);
      }

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // ==========================================================
  // ATTENDANCE CHART DATA
  // ==========================================================

  const attendanceChartData = attendance.map(
    (record) => {
      let percentage = 0;

      if (record.status === "present") {
        percentage = 100;
      } else if (record.status === "late") {
        percentage = 50;
      } else if (record.status === "absent") {
        percentage = 0;
      }

      return {
        date: record.date,
        attendance: percentage,
      };
    }
  );

  // ==========================================================
  // PERFORMANCE CHART DATA
  // ==========================================================

  const performanceChartData = Object.values(
    results.reduce((acc, result) => {
      const subject =
        result.subject_name || "Unknown Subject";

      const marks = Number(result.marks) || 0;

      if (!acc[subject]) {
        acc[subject] = {
          subject,
          total: 0,
          count: 0,
        };
      }

      acc[subject].total += marks;
      acc[subject].count += 1;

      return acc;
    }, {})
  ).map((item) => ({
    subject: item.subject,
    performance: Number(
      (item.total / item.count).toFixed(1)
    ),
  }));

  // ==========================================================
  // STUDENT TABLE
  // ==========================================================

  const studentColumns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "admission_number",
      label: "Admission No.",
    },
    {
      key: "student_name",
      label: "Student",
    },
    {
      key: "class_name",
      label: "Class",
    },
  ];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardLayout>
      <div className="admin-dashboard">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>

            <p>
              School overview and management
            </p>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="stats-grid">

          <StatCard
            title="Students"
            value={
              loading
                ? "..."
                : students.length
            }
            icon={<FiUsers />}
          />

          <StatCard
            title="Teachers"
            value={
              loading
                ? "..."
                : teachers.length
            }
            icon={<FiUser />}
            type="success"
          />

          <StatCard
            title="Parents"
            value={
              loading
                ? "..."
                : parents.length
            }
            icon={<FiUsers />}
            type="warning"
          />

          <StatCard
            title="Classes"
            value={
              loading
                ? "..."
                : classes.length
            }
            icon={<FiHome />}
            type="danger"
          />

        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <div className="quick-actions-panel">

          <div className="quick-actions-header">
            <h2>Quick Actions</h2>

            <p>
              Common administrative tasks
            </p>
          </div>

          <div className="quick-actions-grid">

            {/* ADD STUDENT */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/students/add")
              }
            >
              <span className="quick-action-icon">
                <FiUserPlus />
              </span>

              <span className="quick-action-label">
                Add Student
              </span>
            </button>

            {/* ADD TEACHER */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/teachers/add")
              }
            >
              <span className="quick-action-icon">
                <FiUserPlus />
              </span>

              <span className="quick-action-label">
                Add Teacher
              </span>
            </button>

            {/* ADD PARENT */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/parents/add")
              }
            >
              <span className="quick-action-icon">
                <FiUserPlus />
              </span>

              <span className="quick-action-label">
                Add Parent
              </span>
            </button>

            {/* ADD CLASS */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/classes/add")
              }
            >
              <span className="quick-action-icon">
                <FiHome />
              </span>

              <span className="quick-action-label">
                Add Class
              </span>
            </button>

            {/* ADD SUBJECT */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/subjects/add")
              }
            >
              <span className="quick-action-icon">
                <FiBookOpen />
              </span>

              <span className="quick-action-label">
                Add Subject
              </span>
            </button>

            {/* RECORD PAYMENT */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/payments/add")
              }
            >
              <span className="quick-action-icon">
                <FiCreditCard />
              </span>

              <span className="quick-action-label">
                Record Payment
              </span>
            </button>

          </div>
        </div>

        {/* =====================================================
            CHARTS
        ====================================================== */}

        <div className="charts-grid">

          <AttendanceChart
            data={attendanceChartData}
          />

          <PerformanceChart
            data={performanceChartData}
          />

        </div>

        {/* =====================================================
            RECENT STUDENTS
        ====================================================== */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Recent Students
              </h2>

              <p>
                Recently registered students
              </p>
            </div>

          </div>

          <DataTable
            columns={studentColumns}
            data={students}
          />

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";
// import StatCard from "../../components/StatCard/StatCard.jsx";
// import DataTable from "../../components/DataTable/DataTable.jsx";

// import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";
// import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

// import {
//   getStudents,
//   getTeachers,
//   getParents,
// } from "../../api/adminAPI";

// import {
//   getClasses,
//   getAttendance,
//   getResults,
// } from "../../api/academicsAPI";

// import "./AdminDashboard.css";

// const AdminDashboard = () => {
//   const navigate = useNavigate();

//   const [students, setStudents] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [parents, setParents] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [attendance, setAttendance] = useState([]);
//   const [results, setResults] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ==========================================================
//   // EXTRACT API DATA
//   // ==========================================================

//   const extractData = (response) => {
//     if (Array.isArray(response)) {
//       return response;
//     }

//     if (Array.isArray(response?.data)) {
//       return response.data;
//     }

//     if (Array.isArray(response?.data?.results)) {
//       return response.data.results;
//     }

//     if (Array.isArray(response?.results)) {
//       return response.results;
//     }

//     return [];
//   };

//   // ==========================================================
//   // LOAD DASHBOARD DATA
//   // ==========================================================

//   useEffect(() => {
//     const loadDashboardData = async () => {
//       setLoading(true);
//       setError("");

//       // --------------------------------------------------------
//       // MAIN DASHBOARD DATA
//       // --------------------------------------------------------

//       try {
//         const [
//           studentResponse,
//           teacherResponse,
//           parentResponse,
//           classResponse,
//         ] = await Promise.all([
//           getStudents(),
//           getTeachers(),
//           getParents(),
//           getClasses(),
//         ]);

//         setStudents(extractData(studentResponse));
//         setTeachers(extractData(teacherResponse));
//         setParents(extractData(parentResponse));
//         setClasses(extractData(classResponse));
//       } catch (err) {
//         console.error(
//           "Main dashboard data error:",
//           err
//         );

//         setError(
//           "Unable to load the main dashboard data. Please check that the backend is running and you are logged in."
//         );
//       }

//       // --------------------------------------------------------
//       // ATTENDANCE
//       // --------------------------------------------------------

//       try {
//         const attendanceResponse =
//           await getAttendance();

//         console.log(
//           "Attendance response:",
//           attendanceResponse
//         );

//         setAttendance(
//           extractData(attendanceResponse)
//         );
//       } catch (err) {
//         console.error(
//           "Attendance loading error:",
//           err
//         );

//         setAttendance([]);
//       }

//       // --------------------------------------------------------
//       // RESULTS
//       // --------------------------------------------------------

//       try {
//         const resultsResponse =
//           await getResults();

//         console.log(
//           "Results response:",
//           resultsResponse
//         );

//         setResults(
//           extractData(resultsResponse)
//         );
//       } catch (err) {
//         console.error(
//           "Results loading error:",
//           err
//         );

//         setResults([]);
//       }

//       setLoading(false);
//     };

//     loadDashboardData();
//   }, []);

//   // ==========================================================
//   // ATTENDANCE CHART DATA
//   // ==========================================================

//   const attendanceChartData = attendance.map(
//     (record) => {
//       let percentage = 0;

//       if (record.status === "present") {
//         percentage = 100;
//       } else if (record.status === "late") {
//         percentage = 50;
//       } else if (record.status === "absent") {
//         percentage = 0;
//       }

//       return {
//         date: record.date,
//         attendance: percentage,
//       };
//     }
//   );

//   // ==========================================================
//   // PERFORMANCE CHART DATA
//   // ==========================================================

    
//   const performanceChartData = Object.values(
//     results.reduce((acc, result) => {
//       const subject =
//       result.subject_name || "Unknown Subject";

//       const marks = Number(result.marks) || 0;

//       if (!acc[subject]) {
//         acc[subject] = {
//           subject,
//           total: 0,
//           count: 0,
//         };
//       }

//       acc[subject].total += marks;
//       acc[subject].count += 1;

//       return acc;
//     }, {})
//   ).map((item) => ({
//     subject: item.subject,
//     performance: Number(
//       (item.total / item.count).toFixed(1)
//     ),
//   }));

//   // ==========================================================
//   // STUDENT TABLE
//   // ==========================================================

//   const studentColumns = [
//     {
//       key: "id",
//       label: "ID",
//     },
//     {
//       key: "admission_number",
//       label: "Admission No.",
//     },
//     {
//       key: "student_name",
//       label: "Student",
//     },
//     {
//       key: "class_name",
//       label: "Class",
//     },
//   ];

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <DashboardLayout>
//       <div className="admin-dashboard">

//         {/* HEADER */}
//         <div className="dashboard-header">
//           <div>
//             <h1>Admin Dashboard</h1>
//             <p>
//               School overview and management
//             </p>
//           </div>
//         </div>

//         {/* ERROR */}
//         {error && (
//           <div className="dashboard-error">
//             {error}
//           </div>
//         )}

//         {/* STATISTICS */}
//         <div className="stats-grid">

//           <StatCard
//             title="Students"
//             value={
//               loading
//                 ? "..."
//                 : students.length
//             }
//             icon="👨‍🎓"
//           />

//           <StatCard
//             title="Teachers"
//             value={
//               loading
//                 ? "..."
//                 : teachers.length
//             }
//             icon="👨‍🏫"
//             type="success"
//           />

//           <StatCard
//             title="Parents"
//             value={
//               loading
//                 ? "..."
//                 : parents.length
//             }
//             icon="👪"
//             type="warning"
//           />

//           <StatCard
//             title="Classes"
//             value={
//               loading
//                 ? "..."
//                 : classes.length
//             }
//             icon="🏫"
//             type="danger"
//           />

//         </div>

//         {/* QUICK ACTIONS */}
//         <div className="quick-actions-panel">

//           <div className="quick-actions-header">
//             <h2>Quick Actions</h2>

//             <p>
//               Common administrative tasks
//             </p>
//           </div>

//           <div className="quick-actions-grid">

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/students/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 👨‍🎓
//               </span>

//               <span className="quick-action-label">
//                 Add Student
//               </span>
//             </button>

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/teachers/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 👨‍🏫
//               </span>

//               <span className="quick-action-label">
//                 Add Teacher
//               </span>
//             </button>

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/parents/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 👪
//               </span>

//               <span className="quick-action-label">
//                 Add Parent
//               </span>
//             </button>

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/classes/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 🏫
//               </span>

//               <span className="quick-action-label">
//                 Add Class
//               </span>
//             </button>

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/subjects/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 📚
//               </span>

//               <span className="quick-action-label">
//                 Add Subject
//               </span>
//             </button>

//             <button
//               type="button"
//               className="quick-action"
//               onClick={() =>
//                 navigate("/admin/payments/add")
//               }
//             >
//               <span className="quick-action-icon">
//                 💳
//               </span>

//               <span className="quick-action-label">
//                 Record Payment
//               </span>
//             </button>

//           </div>
//         </div>

//         {/* CHARTS */}
//         <div className="charts-grid">

//           <AttendanceChart
//             data={attendanceChartData}
//           />

//           <PerformanceChart
//             data={performanceChartData}
//           />

//         </div>

//         {/* RECENT STUDENTS */}
//         <div className="dashboard-panel">

//           <div className="panel-header">
//             <div>
//               <h2>
//                 Recent Students
//               </h2>

//               <p>
//                 Recently registered students
//               </p>
//             </div>
//           </div>

//           <DataTable
//             columns={studentColumns}
//             data={students}
//           />

//         </div>

//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminDashboard;