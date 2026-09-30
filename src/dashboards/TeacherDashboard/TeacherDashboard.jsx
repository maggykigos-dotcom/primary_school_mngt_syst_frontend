import {
useEffect,
useMemo,
useState,
} from "react";

import DashboardLayout
from "../../layouts/DashboardLayout/DashboardLayout.jsx";

import StatCard
from "../../components/StatCard/StatCard.jsx";

import DataTable
from "../../components/DataTable/DataTable.jsx";

import AttendanceChart
from "../../components/charts/AttendanceChart/AttendanceChart.jsx";

import PerformanceChart
from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

import {
getTeacherClasses,
getTeacherStudents,
getTeacherAssignments,
} from "../../api/teacherAPI";

import {
getAttendance,
getResults,
} from "../../api/academicsAPI";

import {
FaSchool,
FaUserGraduate,
FaClipboardList,
FaCalendarCheck,
} from "react-icons/fa";

import "./TeacherDashboard.css";

const TeacherDashboard = () => {

const [classes, setClasses] = useState([]);
const [students, setStudents] = useState([]);
const [assignments, setAssignments] = useState([]);
const [attendance, setAttendance] = useState([]);
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


// ==========================
// LOAD DASHBOARD DATA
// ==========================

useEffect(() => {

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                classData,
                studentData,
                assignmentData,
                attendanceData,
                resultData,
            ] = await Promise.all([

                getTeacherClasses(),
                getTeacherStudents(),
                getTeacherAssignments(),
                getAttendance(),
                getResults(),

            ]);


            console.log(
                "Teacher classes:",
                classData
            );

            console.log(
                "Teacher students:",
                studentData
            );

            console.log(
                "Teacher assignments:",
                assignmentData
            );

            console.log(
                "Teacher attendance:",
                attendanceData
            );

            console.log(
                "Teacher results:",
                resultData
            );


            // ==========================
            // NORMALIZE API RESPONSES
            // ==========================

            setClasses(
                Array.isArray(classData)
                    ? classData
                    : classData?.results || []
            );

            setStudents(
                Array.isArray(studentData)
                    ? studentData
                    : studentData?.results || []
            );

            setAssignments(
                Array.isArray(assignmentData)
                    ? assignmentData
                    : assignmentData?.results || []
            );

            setAttendance(
                Array.isArray(attendanceData)
                    ? attendanceData
                    : attendanceData?.results || []
            );

            setResults(
                Array.isArray(resultData)
                    ? resultData
                    : resultData?.results || []
            );

        } catch (error) {

            console.error(
                "Teacher dashboard loading error:",
                error.response?.data || error
            );

            setError(
                "Unable to load teacher dashboard data."
            );

            setClasses([]);
            setStudents([]);
            setAssignments([]);
            setAttendance([]);
            setResults([]);

        } finally {

            setLoading(false);

        }

    };

    loadData();

}, []);


// ==========================
// ATTENDANCE SUMMARY
// ==========================

const attendancePresent = attendance.filter(
    (record) =>
        record.status === "present" ||
        record.is_present === true
).length;

const attendanceTotal = attendance.length;

const attendancePercentage =
    attendanceTotal > 0
        ? Math.round(
            (attendancePresent / attendanceTotal) * 100
        )
        : 0;


// ==========================
// ACADEMIC PERFORMANCE
// ==========================

const performanceData = useMemo(() => {

    if (!Array.isArray(results) || results.length === 0) {
        return [];
    }

    const subjectMap = {};


    results.forEach((result) => {

        // ==========================
        // GET SUBJECT NAME
        // ==========================

        let subjectName = "";

        if (
            typeof result.subject === "object" &&
            result.subject !== null
        ) {

            subjectName =
                result.subject.name ||
                result.subject.subject_name ||
                result.subject.title ||
                "";

        } else if (result.subject) {

            subjectName = String(result.subject);

        }


        if (!subjectName) {

            subjectName =
                result.subject_name ||
                result.subjectName ||
                result.subject_title ||
                "";

        }


        // ==========================
        // FALLBACK FOR SUBJECT ID
        // ==========================

        if (!subjectName && result.subject_id) {

            subjectName = `Subject ${result.subject_id}`;

        }


        // Ignore records without
        // a recognizable subject.

        if (!subjectName) {
            return;
        }


        // ==========================
        // GET MARKS
        // ==========================

        const possibleMarks = [

            result.marks,
            result.mark,
            result.score,
            result.total_marks,
            result.percentage,
            result.average,

        ];

        let marks = null;


        for (const value of possibleMarks) {

            if (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                !Number.isNaN(Number(value))
            ) {

                marks = Number(value);
                break;

            }

        }


        // Ignore results without
        // valid marks.

        if (marks === null) {
            return;
        }


        // ==========================
        // KEEP MARKS IN 0–100 RANGE
        // ==========================

        if (marks < 0) {
            marks = 0;
        }

        if (marks > 100) {
            marks = 100;
        }


        // ==========================
        // GROUP BY SUBJECT
        // ==========================

        if (!subjectMap[subjectName]) {

            subjectMap[subjectName] = {
                total: 0,
                count: 0,
            };

        }


        subjectMap[subjectName].total += marks;
        subjectMap[subjectName].count += 1;

    });


    // ==========================
    // CALCULATE AVERAGES
    // ==========================

    return Object.entries(subjectMap)

        .map(([subject, values]) => ({

            subject,

            performance: Math.round(
                values.total / values.count
            ),

        }))

        .sort((a, b) =>
            a.subject.localeCompare(b.subject)
        );

}, [results]);


// ==========================
// STUDENT TABLE
// ==========================

const columns = [

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


return (

    <DashboardLayout>

        <div className="teacher-dashboard">

            {/* ==========================
                HEADER
            ========================== */}

            <div className="dashboard-header">

                <h1>
                    Teacher Dashboard
                </h1>

                <p>
                    Manage your classes and students
                </p>

            </div>


            {/* ==========================
                ERROR
            ========================== */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* ==========================
                STAT CARDS
            ========================== */}

            <div className="stats-grid">

                <StatCard
                    title="My Classes"
                    value={
                        loading
                            ? "..."
                            : classes.length
                    }
                    icon={<FaSchool />}
                />


                <StatCard
                    title="Students"
                    value={
                        loading
                            ? "..."
                            : students.length
                    }
                    icon={<FaUserGraduate />}
                    type="success"
                />


                <StatCard
                    title="Assignments"
                    value={
                        loading
                            ? "..."
                            : assignments.length
                    }
                    icon={<FaClipboardList />}
                    type="warning"
                />


                <StatCard
                    title="Attendance"
                    value={
                        loading
                            ? "..."
                            : `${attendancePercentage}%`
                    }
                    icon={<FaCalendarCheck />}
                    type="danger"
                />

            </div>


            {/* ==========================
                CHARTS
            ========================== */}

            <div className="charts-grid">

                <AttendanceChart
                    data={attendance}
                />

                <PerformanceChart
                    data={performanceData}
                />

            </div>


            {/* ==========================
                STUDENTS
            ========================== */}

            <div className="dashboard-panel">

                <h2>
                    My Students
                </h2>


                {loading ? (

                    <p>
                        Loading students...
                    </p>

                ) : students.length === 0 ? (

                    <p>
                        No students found.
                    </p>

                ) : (

                    <DataTable
                        columns={columns}
                        data={students}
                    />

                )}

            </div>

        </div>

    </DashboardLayout>

);


};

export default TeacherDashboard;







// import {
//     useEffect,
//     useMemo,
//     useState,
// } from "react";

// import DashboardLayout
//     from "../../layouts/DashboardLayout/DashboardLayout.jsx";

// import StatCard
//     from "../../components/StatCard/StatCard.jsx";

// import DataTable
//     from "../../components/DataTable/DataTable.jsx";

// import AttendanceChart
//     from "../../components/charts/AttendanceChart/AttendanceChart.jsx";

// import PerformanceChart
//     from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

// import {
//     getTeacherClasses,
//     getTeacherStudents,
//     getTeacherAssignments,
// } from "../../api/teacherAPI";

// import {
//     getAttendance,
//     getResults,
// } from "../../api/academicsAPI";

// import "./TeacherDashboard.css";


// const TeacherDashboard = () => {
//     const [classes, setClasses] = useState([]);
//     const [students, setStudents] = useState([]);
//     const [assignments, setAssignments] = useState([]);
//     const [attendance, setAttendance] = useState([]);
//     const [results, setResults] = useState([]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");


//     // ==========================
//     // LOAD DASHBOARD DATA
//     // ==========================

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const [
//                     classData,
//                     studentData,
//                     assignmentData,
//                     attendanceData,
//                     resultData,
//                 ] = await Promise.all([
//                     getTeacherClasses(),
//                     getTeacherStudents(),
//                     getTeacherAssignments(),
//                     getAttendance(),
//                     getResults(),
//                 ]);


//                 console.log(
//                     "Teacher classes:",
//                     classData
//                 );

//                 console.log(
//                     "Teacher students:",
//                     studentData
//                 );

//                 console.log(
//                     "Teacher assignments:",
//                     assignmentData
//                 );

//                 console.log(
//                     "Teacher attendance:",
//                     attendanceData
//                 );

//                 console.log(
//                     "Teacher results:",
//                     resultData
//                 );


//                 // ==========================
//                 // NORMALIZE API RESPONSES
//                 // ==========================

//                 setClasses(
//                     Array.isArray(classData)
//                         ? classData
//                         : classData?.results || []
//                 );

//                 setStudents(
//                     Array.isArray(studentData)
//                         ? studentData
//                         : studentData?.results || []
//                 );

//                 setAssignments(
//                     Array.isArray(assignmentData)
//                         ? assignmentData
//                         : assignmentData?.results || []
//                 );

//                 setAttendance(
//                     Array.isArray(attendanceData)
//                         ? attendanceData
//                         : attendanceData?.results || []
//                 );

//                 setResults(
//                     Array.isArray(resultData)
//                         ? resultData
//                         : resultData?.results || []
//                 );

//             } catch (error) {
//                 console.error(
//                     "Teacher dashboard loading error:",
//                     error.response?.data || error
//                 );

//                 setError(
//                     "Unable to load teacher dashboard data."
//                 );

//                 setClasses([]);
//                 setStudents([]);
//                 setAssignments([]);
//                 setAttendance([]);
//                 setResults([]);

//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadData();
//     }, []);


//     // ==========================
//     // ATTENDANCE SUMMARY
//     // ==========================

//     const attendancePresent = attendance.filter(
//         (record) =>
//             record.status === "present" ||
//             record.is_present === true
//     ).length;

//     const attendanceTotal = attendance.length;

//     const attendancePercentage =
//         attendanceTotal > 0
//             ? Math.round(
//                 (attendancePresent / attendanceTotal) * 100
//             )
//             : 0;


//     // ==========================
//     // ACADEMIC PERFORMANCE
//     // ==========================
//     //
//     // Convert existing examination
//     // results into:
//     //
//     // {
//     //     subject: "Mathematics",
//     //     performance: 78
//     // }
//     //
//     // This is what PerformanceChart expects.
//     // ==========================

//     const performanceData = useMemo(() => {
//         if (!Array.isArray(results) || results.length === 0) {
//             return [];
//         }

//         const subjectMap = {};


//         results.forEach((result) => {

//             // ==========================
//             // GET SUBJECT NAME
//             // ==========================

//             let subjectName = "";

//             if (
//                 typeof result.subject === "object" &&
//                 result.subject !== null
//             ) {
//                 subjectName =
//                     result.subject.name ||
//                     result.subject.subject_name ||
//                     result.subject.title ||
//                     "";
//             } else if (result.subject) {
//                 subjectName = String(result.subject);
//             }

//             if (!subjectName) {
//                 subjectName =
//                     result.subject_name ||
//                     result.subjectName ||
//                     result.subject_title ||
//                     "";
//             }


//             // ==========================
//             // FALLBACK FOR SUBJECT ID
//             // ==========================

//             if (!subjectName && result.subject_id) {
//                 subjectName = `Subject ${result.subject_id}`;
//             }


//             // Ignore records without
//             // a recognizable subject.
//             if (!subjectName) {
//                 return;
//             }


//             // ==========================
//             // GET MARKS
//             // ==========================

//             const possibleMarks = [
//                 result.marks,
//                 result.mark,
//                 result.score,
//                 result.total_marks,
//                 result.percentage,
//                 result.average,
//             ];

//             let marks = null;

//             for (const value of possibleMarks) {
//                 if (
//                     value !== null &&
//                     value !== undefined &&
//                     value !== "" &&
//                     !Number.isNaN(Number(value))
//                 ) {
//                     marks = Number(value);
//                     break;
//                 }
//             }


//             // Ignore results without
//             // valid marks.
//             if (marks === null) {
//                 return;
//             }


//             // ==========================
//             // KEEP MARKS IN 0–100 RANGE
//             // ==========================

//             if (marks < 0) {
//                 marks = 0;
//             }

//             if (marks > 100) {
//                 marks = 100;
//             }


//             // ==========================
//             // GROUP BY SUBJECT
//             // ==========================

//             if (!subjectMap[subjectName]) {
//                 subjectMap[subjectName] = {
//                     total: 0,
//                     count: 0,
//                 };
//             }

//             subjectMap[subjectName].total += marks;
//             subjectMap[subjectName].count += 1;
//         });


//         // ==========================
//         // CALCULATE AVERAGES
//         // ==========================

//         return Object.entries(subjectMap)
//             .map(([subject, values]) => ({
//                 subject,
//                 performance: Math.round(
//                     values.total / values.count
//                 ),
//             }))
//             .sort((a, b) =>
//                 a.subject.localeCompare(b.subject)
//             );

//     }, [results]);


//     // ==========================
//     // STUDENT TABLE
//     // ==========================

//     const columns = [
//         {
//             key: "admission_number",
//             label: "Admission No.",
//         },
//         {
//             key: "student_name",
//             label: "Student",
//         },
//         {
//             key: "class_name",
//             label: "Class",
//         },
//     ];


//     return (
//         <DashboardLayout>

//             <div className="teacher-dashboard">

//                 {/* ==========================
//                     HEADER
//                 ========================== */}

//                 <div className="dashboard-header">

//                     <h1>
//                         Teacher Dashboard
//                     </h1>

//                     <p>
//                         Manage your classes and students
//                     </p>

//                 </div>


//                 {/* ==========================
//                     ERROR
//                 ========================== */}

//                 {error && (
//                     <div className="dashboard-error">
//                         {error}
//                     </div>
//                 )}


//                 {/* ==========================
//                     STAT CARDS
//                 ========================== */}

//                 <div className="stats-grid">

//                     <StatCard
//                         title="My Classes"
//                         value={
//                             loading
//                                 ? "..."
//                                 : classes.length
//                         }
//                         icon="🏫"
//                     />


//                     <StatCard
//                         title="Students"
//                         value={
//                             loading
//                                 ? "..."
//                                 : students.length
//                         }
//                         icon="👨‍🎓"
//                         type="success"
//                     />


//                     <StatCard
//                         title="Assignments"
//                         value={
//                             loading
//                                 ? "..."
//                                 : assignments.length
//                         }
//                         icon="📝"
//                         type="warning"
//                     />


//                     <StatCard
//                         title="Attendance"
//                         value={
//                             loading
//                                 ? "..."
//                                 : `${attendancePercentage}%`
//                         }
//                         icon="📅"
//                         type="danger"
//                     />

//                 </div>


//                 {/* ==========================
//                     CHARTS
//                 ========================== */}

//                 <div className="charts-grid">

//                     <AttendanceChart
//                         data={attendance}
//                     />


//                     <PerformanceChart
//                         data={performanceData}
//                     />

//                 </div>


//                 {/* ==========================
//                     STUDENTS
//                 ========================== */}

//                 <div className="dashboard-panel">

//                     <h2>
//                         My Students
//                     </h2>


//                     {loading ? (

//                         <p>
//                             Loading students...
//                         </p>

//                     ) : students.length === 0 ? (

//                         <p>
//                             No students found.
//                         </p>

//                     ) : (

//                         <DataTable
//                             columns={columns}
//                             data={students}
//                         />

//                     )}

//                 </div>

//             </div>

//         </DashboardLayout>
//     );
// };


// export default TeacherDashboard;




