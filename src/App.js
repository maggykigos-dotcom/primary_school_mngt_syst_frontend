import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useContext } from "react";

import ProtectedRoute from "./routes/ProtectedRoute";

import { AuthContext } from "./context/AuthContext";

import "./App.css";

// =========================
// AUTHENTICATION
// =========================

import Login from "./pages/auth/Login/Login";

// =========================
// DASHBOARDS
// =========================

import AdminDashboard from "./dashboards/AdminDashboard/AdminDashboard";

import TeacherDashboard from "./dashboards/TeacherDashboard/TeacherDashboard";

import ParentDashboard from "./dashboards/ParentDashboard/ParentDashboard";

import StudentDashboard from "./dashboards/StudentDashboard/StudentDashboard";

import BursarDashboard from "./dashboards/BursarDashboard/BursarDashboard";

// =========================
// STUDENTS
// =========================

import StudentForm from "./pages/students/StudentForm";

import StudentManagement from "./pages/students/StudentManagement";

import StudentEdit from "./pages/students/StudentEdit";

import StudentView from "./pages/students/StudentView";

// =========================
// TEACHERS
// =========================

import Teachers from "./pages/Teachers/Teachers";

import TeacherForm from "./pages/Teachers/TeacherForm";

import TeacherView from "./pages/Teachers/TeacherView";

import TeacherEdit from "./pages/Teachers/TeacherEdit";

// =========================
// PARENTS
// =========================

import Parent from "./pages/parents/Parent";

import ParentForm from "./pages/parents/ParentForm";

import ParentPerformance from "./pages/parents/ParentPerformance";
import ParentView from "./pages/parents/ParentView";
import ParentEdit from "./pages/parents/ParentEdit";

// =========================
// ACADEMICS
// =========================

import Attendance from "./pages/academics/Attendance";

import Assignment from "./pages/academics/Assignment";

import StudentQuiz from "./pages/academics/StudentQuiz";

import Results from "./pages/academics/Results";

import GradeForm from "./pages/academics/GradeForm";

import SchoolClassForm from "./pages/academics/SchoolClassForm";

import SubjectForm from "./pages/academics/SubjectForm";

import AttendanceForm from "./pages/academics/AttendanceForm";

import ResultForm from "./pages/academics/ResultForm";

import AssignmentForm from "./pages/academics/AssignmentForm";

import TimeTableForm from "./pages/academics/TimeTableForm";

import TimetableView from "./pages/academics/TimetableView";

import AdminTimetable from "./pages/academics/AdminTimetable";

// =========================
// FINANCE
// =========================

import Fees from "./pages/finance/Fees";

import Payments from "./pages/finance/Payments";

import MpesaPayment from "./pages/finance/MpesaPayment";

import FeeForm from "./pages/finance/FeeForm";

import PaymentForm from "./pages/finance/PaymentForm";

// =========================
// COMMUNICATION
// =========================

import Messages from "./pages/communications/Messages";

import Notifications from "./pages/communications/Notifications";

import CreateConversationForm from "./pages/communications/CreateConversationForm";


function App() {

    const { user } = useContext(AuthContext);

    // ==========================================
    // SEND USER TO CORRECT DASHBOARD
    // ==========================================

    const getDashboardPath = () => {

        if (!user) {
            return "/login";
        }

        switch (user.role) {

            case "admin":
                return "/admin";

            case "teacher":
                return "/teacher";

            case "parent":
                return "/parent";

            case "student":
                return "/student";

            case "bursar":
                return "/bursar";

            default:
                return "/login";
        }
    };


    return (

        <BrowserRouter>

            <Routes>

                {/* ==================================================
                    LOGIN
                ================================================== */}

                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate
                                to={getDashboardPath()}
                                replace
                            />
                        ) : (
                            <Login />
                        )
                    }
                />


                {/* ==================================================
                    ROOT
                ================================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to={getDashboardPath()}
                            replace
                        />
                    }
                />


                {/* ==================================================
                    OLD DASHBOARD ROUTE
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <Navigate
                            to={getDashboardPath()}
                            replace
                        />
                    }
                />


                {/* ==================================================
                    ADMIN DASHBOARD
                ================================================== */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    TEACHER DASHBOARD
                ================================================== */}

                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <TeacherDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    PARENT DASHBOARD
                ================================================== */}

                <Route
                    path="/parent"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <ParentDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    STUDENT DASHBOARD
                ================================================== */}

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    BURSAR DASHBOARD
                ================================================== */}

                <Route
                    path="/bursar"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <BursarDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - STUDENTS
                ================================================== */}

                {/* Student Management / List */}

                <Route
                    path="/admin/students"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <StudentManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Add Student */}

                <Route
                    path="/admin/students/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <StudentForm />
                        </ProtectedRoute>
                    }
                />

                {/* Edit Student */}

                <Route
                    path="/admin/students/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <StudentEdit />
                        </ProtectedRoute>
                    }
                />

                {/* View Student */}

                <Route
                    path="/admin/students/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <StudentView />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - TEACHERS
                ================================================== */}

                {/* Teacher Management / List */}

                <Route
                    path="/admin/teachers"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Teachers />
                        </ProtectedRoute>
                    }
                />

                {/* Existing Add Teacher */}

                <Route
                    path="/admin/teachers/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <TeacherForm />
                        </ProtectedRoute>
                    }
                />

                {/* NEW - View Teacher */}

                <Route
                    path="/admin/teachers/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <TeacherView />
                        </ProtectedRoute>
                    }
                />

                {/* NEW - Edit Teacher */}

                <Route
                    path="/admin/teachers/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <TeacherEdit />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - PARENTS
                ================================================== */}

                <Route
                    path="/admin/parents"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Parent />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/parents/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <ParentForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/parents/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <ParentView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/parents/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <ParentEdit />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - CLASSES
                ================================================== */}

                <Route
                    path="/admin/classes"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SchoolClassForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/classes/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SchoolClassForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - SUBJECTS
                ================================================== */}

                <Route
                    path="/admin/subjects"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SubjectForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/subjects/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SubjectForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN - GRADES
                ================================================== */}

                <Route
                    path="/admin/grades/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <GradeForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ATTENDANCE
                ================================================== */}

                <Route
                    path="/admin/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance/add"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin", "teacher"]}
                        >
                            <AttendanceForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    HOMEWORK / ASSIGNMENTS
                ================================================== */}

                <Route
                    path="/admin/homework"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Assignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/homework"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <Assignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/homework"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Assignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/homework"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <Assignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assignments"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                                "teacher",
                                "parent",
                                "student",
                            ]}
                        >
                            <Assignment />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    STUDENT - VIEW QUIZ
                ================================================== */}

                <Route
                    path="/assignments/:assignmentId/quiz"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <StudentQuiz />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/assignments/add"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin", "teacher"]}
                        >
                            <AssignmentForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    RESULTS
                ================================================== */}

                <Route
                    path="/admin/results"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/results"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/results"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/results"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/results"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                                "teacher",
                                "parent",
                                "student",
                            ]}
                        >
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/results/add"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin", "teacher"]}
                        >
                            <ResultForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/performance"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <ParentPerformance />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    TIMETABLE
                ================================================== */}

                <Route
                    path="/admin/timetable"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminTimetable />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/timetable"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <TimetableView viewType="teacher" />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/timetable"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <TimetableView viewType="parent" />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/timetable"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <TimetableView viewType="student" />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/timetable/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <TimeTableForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    FINANCE - FEES
                ================================================== */}

                <Route
                    path="/admin/fees"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Fees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/fees"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Fees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/fees"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin", "parent"]}
                        >
                            <Fees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/fees/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <FeeForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    BURSAR - FINANCE
                ================================================== */}

                <Route
                    path="/bursar/fees"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <Fees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bursar/fees/add"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <FeeForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bursar/payments"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <Payments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bursar/payments/add"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <PaymentForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bursar/mpesa"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <MpesaPayment />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    PAYMENTS
                ================================================== */}

                <Route
                    path="/admin/payments"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Payments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/payments"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Payments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/payments/add"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <PaymentForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    M-PESA
                ================================================== */}

                <Route
                    path="/parent/mpesa"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <MpesaPayment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/mpesa"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <MpesaPayment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mpesa"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin", "parent"]}
                        >
                            <MpesaPayment />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    MESSAGES
                ================================================== */}

                <Route
                    path="/admin/messages"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/messages"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/parent/messages"
                    element={
                        <ProtectedRoute allowedRoles={["parent"]}>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/messages"
                    element={
                        <ProtectedRoute allowedRoles={["student"]}>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bursar/messages"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/messages"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                                "teacher",
                                "parent",
                                "student",
                                "bursar",
                            ]}
                        >
                            <Messages />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                                "teacher",
                                "parent",
                                "student",
                                "bursar",
                            ]}
                        >
                            <Notifications />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    CREATE CONVERSATION
                ================================================== */}

                <Route
                    path="/bursar/conversations/create"
                    element={
                        <ProtectedRoute allowedRoles={["bursar"]}>
                            <CreateConversationForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/conversations/create"
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                                "teacher",
                                "parent",
                                "bursar",
                            ]}
                        >
                            <CreateConversationForm />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    UNAUTHORIZED
                ================================================== */}

                <Route
                    path="/unauthorized"
                    element={
                        <div className="unauthorized-page">

                            <h1>403</h1>

                            <h2>Access Denied</h2>

                            <p>
                                You don't have permission to access this page.
                            </p>

                        </div>
                    }
                />


                {/* ==================================================
                    404
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={getDashboardPath()}
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;




// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useContext } from "react";

// import ProtectedRoute from "./routes/ProtectedRoute";
// import { AuthContext } from "./context/AuthContext";

// import "./App.css";

// // =========================
// // AUTHENTICATION
// // =========================

// import Login from "./pages/auth/Login/Login";

// // =========================
// // DASHBOARDS
// // =========================

// import AdminDashboard from "./dashboards/AdminDashboard/AdminDashboard";
// import TeacherDashboard from "./dashboards/TeacherDashboard/TeacherDashboard";
// import ParentDashboard from "./dashboards/ParentDashboard/ParentDashboard";
// import StudentDashboard from "./dashboards/StudentDashboard/StudentDashboard";
// import BursarDashboard from "./dashboards/BursarDashboard/BursarDashboard";

// // =========================
// // STUDENTS
// // =========================


// import StudentForm from "./pages/students/StudentForm";
// import StudentManagement from "./pages/students/StudentManagement";
// import StudentEdit from "./pages/students/StudentEdit";
// import StudentView from "./pages/students/StudentView";

// // =========================
// // TEACHERS
// // =========================

// import Teachers from "./pages/Teachers/Teachers";
// import TeacherForm from "./pages/Teachers/TeacherForm";

// // =========================
// // PARENTS
// // =========================

// import Parent from "./pages/parents/Parent";
// import ParentForm from "./pages/parents/ParentForm";
// import ParentPerformance from "./pages/parents/ParentPerformance";

// // =========================
// // ACADEMICS
// // =========================

// import Attendance from "./pages/academics/Attendance";
// import Assignment from "./pages/academics/Assignment";
// import StudentQuiz from "./pages/academics/StudentQuiz";
// import Results from "./pages/academics/Results";

// import GradeForm from "./pages/academics/GradeForm";
// import SchoolClassForm from "./pages/academics/SchoolClassForm";
// import SubjectForm from "./pages/academics/SubjectForm";

// import AttendanceForm from "./pages/academics/AttendanceForm";
// import ResultForm from "./pages/academics/ResultForm";
// import AssignmentForm from "./pages/academics/AssignmentForm";

// import TimeTableForm from "./pages/academics/TimeTableForm";
// import TimetableView from "./pages/academics/TimetableView";
// import AdminTimetable from "./pages/academics/AdminTimetable";

// // =========================
// // FINANCE
// // =========================

// import Fees from "./pages/finance/Fees";
// import Payments from "./pages/finance/Payments";
// import MpesaPayment from "./pages/finance/MpesaPayment";

// import FeeForm from "./pages/finance/FeeForm";
// import PaymentForm from "./pages/finance/PaymentForm";

// // =========================
// // COMMUNICATION
// // =========================

// import Messages from "./pages/communications/Messages";
// import Notifications from "./pages/communications/Notifications";
// import CreateConversationForm from "./pages/communications/CreateConversationForm";


// function App() {
//     const { user } = useContext(AuthContext);

//     // ==========================================
//     // SEND USER TO CORRECT DASHBOARD
//     // ==========================================

//     const getDashboardPath = () => {
//         if (!user) return "/login";

//         switch (user.role) {
//             case "admin":
//                 return "/admin";

//             case "teacher":
//                 return "/teacher";

//             case "parent":
//                 return "/parent";

//             case "student":
//                 return "/student";

//             case "bursar":
//                 return "/bursar";

//             default:
//                 return "/login";
//         }
//     };


//     return (
//         <BrowserRouter>
//             <Routes>

//                 {/* ==================================================
//                     LOGIN
//                 ================================================== */}

//                 <Route
//                     path="/login"
//                     element={
//                         user ? (
//                             <Navigate
//                                 to={getDashboardPath()}
//                                 replace
//                             />
//                         ) : (
//                             <Login />
//                         )
//                     }
//                 />


//                 {/* ==================================================
//                     ROOT
//                 ================================================== */}

//                 <Route
//                     path="/"
//                     element={
//                         <Navigate
//                             to={getDashboardPath()}
//                             replace
//                         />
//                     }
//                 />


//                 {/* ==================================================
//                     OLD DASHBOARD ROUTE
//                 ================================================== */}

//                 <Route
//                     path="/dashboard"
//                     element={
//                         <Navigate
//                             to={getDashboardPath()}
//                             replace
//                         />
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN DASHBOARD
//                 ================================================== */}

//                 <Route
//                     path="/admin"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <AdminDashboard />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     TEACHER DASHBOARD
//                 ================================================== */}

//                 <Route
//                     path="/teacher"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <TeacherDashboard />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     PARENT DASHBOARD
//                 ================================================== */}

//                 <Route
//                     path="/parent"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <ParentDashboard />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     STUDENT DASHBOARD
//                 ================================================== */}

//                 <Route
//                     path="/student"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <StudentDashboard />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     BURSAR DASHBOARD
//                 ================================================== */}

//                 <Route
//                     path="/bursar"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <BursarDashboard />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - STUDENTS
//                 ================================================== */}

//                 {/* Student Management / List */}
//                 <Route
//                     path="/admin/students"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <StudentManagement />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* Add Student */}
//                 <Route
//                     path="/admin/students/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <StudentForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* Edit Student */}
//                 <Route
//                     path="/admin/students/edit/:id"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <StudentEdit />
//                         </ProtectedRoute>
//                     }
//                 />

//                 {/* View Student */}
//                 <Route
//                     path="/admin/students/:id"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <StudentView />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - TEACHERS
//                 ================================================== */}

//                 <Route
//                     path="/admin/teachers"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Teachers />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/teachers/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <TeacherForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - PARENTS
//                 ================================================== */}

//                 <Route
//                     path="/admin/parents"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Parent />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/parents/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <ParentForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - CLASSES
//                 ================================================== */}

//                 <Route
//                     path="/admin/classes"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <SchoolClassForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/classes/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <SchoolClassForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - SUBJECTS
//                 ================================================== */}

//                 <Route
//                     path="/admin/subjects"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <SubjectForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/subjects/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <SubjectForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ADMIN - GRADES
//                 ================================================== */}

//                 <Route
//                     path="/admin/grades/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <GradeForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     ATTENDANCE
//                 ================================================== */}

//                 <Route
//                     path="/admin/attendance"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Attendance />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/teacher/attendance"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <Attendance />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/attendance"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Attendance />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/student/attendance"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <Attendance />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/attendance/add"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={["admin", "teacher"]}
//                         >
//                             <AttendanceForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     HOMEWORK / ASSIGNMENTS
//                 ================================================== */}

//                 <Route
//                     path="/admin/homework"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Assignment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/teacher/homework"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <Assignment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/homework"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Assignment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/student/homework"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <Assignment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/assignments"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={[
//                                 "admin",
//                                 "teacher",
//                                 "parent",
//                                 "student",
//                             ]}
//                         >
//                             <Assignment />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     STUDENT - VIEW QUIZ
//                 ================================================== */}

//                 <Route
//                     path="/assignments/:assignmentId/quiz"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <StudentQuiz />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/assignments/add"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={["admin", "teacher"]}
//                         >
//                             <AssignmentForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     RESULTS
//                 ================================================== */}

//                 <Route
//                     path="/admin/results"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Results />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/teacher/results"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <Results />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/results"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Results />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/student/results"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <Results />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/results"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={[
//                                 "admin",
//                                 "teacher",
//                                 "parent",
//                                 "student",
//                             ]}
//                         >
//                             <Results />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/results/add"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={["admin", "teacher"]}
//                         >
//                             <ResultForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/performance"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <ParentPerformance />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     TIMETABLE
//                 ================================================== */}

//                 <Route
//                     path="/admin/timetable"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <AdminTimetable />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/teacher/timetable"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <TimetableView viewType="teacher" />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/timetable"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <TimetableView viewType="parent" />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/student/timetable"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <TimetableView viewType="student" />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/timetable/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <TimeTableForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     FINANCE - FEES
//                 ================================================== */}

//                 <Route
//                     path="/admin/fees"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Fees />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/fees"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Fees />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/fees"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={["admin", "parent"]}
//                         >
//                             <Fees />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/fees/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <FeeForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     BURSAR - FINANCE
//                 ================================================== */}

//                 <Route
//                     path="/bursar/fees"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <Fees />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/bursar/fees/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <FeeForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/bursar/payments"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <Payments />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/bursar/payments/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <PaymentForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/bursar/mpesa"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <MpesaPayment />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     PAYMENTS
//                 ================================================== */}

//                 <Route
//                     path="/admin/payments"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Payments />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/payments"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Payments />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/payments/add"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <PaymentForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     M-PESA
//                 ================================================== */}

//                 <Route
//                     path="/parent/mpesa"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <MpesaPayment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/admin/mpesa"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <MpesaPayment />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/mpesa"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={["admin", "parent"]}
//                         >
//                             <MpesaPayment />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     MESSAGES
//                 ================================================== */}

//                 <Route
//                     path="/admin/messages"
//                     element={
//                         <ProtectedRoute allowedRoles={["admin"]}>
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/teacher/messages"
//                     element={
//                         <ProtectedRoute allowedRoles={["teacher"]}>
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/parent/messages"
//                     element={
//                         <ProtectedRoute allowedRoles={["parent"]}>
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/student/messages"
//                     element={
//                         <ProtectedRoute allowedRoles={["student"]}>
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/bursar/messages"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/messages"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={[
//                                 "admin",
//                                 "teacher",
//                                 "parent",
//                                 "student",
//                                 "bursar",
//                             ]}
//                         >
//                             <Messages />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     NOTIFICATIONS
//                 ================================================== */}

//                 <Route
//                     path="/notifications"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={[
//                                 "admin",
//                                 "teacher",
//                                 "parent",
//                                 "student",
//                                 "bursar",
//                             ]}
//                         >
//                             <Notifications />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     CREATE CONVERSATION
//                 ================================================== */}

//                 <Route
//                     path="/bursar/conversations/create"
//                     element={
//                         <ProtectedRoute allowedRoles={["bursar"]}>
//                             <CreateConversationForm />
//                         </ProtectedRoute>
//                     }
//                 />

//                 <Route
//                     path="/conversations/create"
//                     element={
//                         <ProtectedRoute
//                             allowedRoles={[
//                                 "admin",
//                                 "teacher",
//                                 "parent",
//                                 "bursar",
//                             ]}
//                         >
//                             <CreateConversationForm />
//                         </ProtectedRoute>
//                     }
//                 />


//                 {/* ==================================================
//                     UNAUTHORIZED
//                 ================================================== */}

//                 <Route
//                     path="/unauthorized"
//                     element={
//                         <div className="unauthorized-page">
//                             <h1>403</h1>
//                             <h2>Access Denied</h2>
//                             <p>
//                                 You don't have permission to access this page.
//                             </p>
//                         </div>
//                     }
//                 />


//                 {/* ==================================================
//                     404
//                 ================================================== */}

//                 <Route
//                     path="*"
//                     element={
//                         <Navigate
//                             to={getDashboardPath()}
//                             replace
//                         />
//                     }
//                 />

//             </Routes>
//         </BrowserRouter>
//     );
// }

// export default App;



