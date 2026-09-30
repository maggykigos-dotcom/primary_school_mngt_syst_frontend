import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import "./AttendanceForm.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AttendanceForm = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(getToday());

  const [attendance, setAttendance] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --------------------------------------------------
  // AUTH HEADERS
  // --------------------------------------------------
  const getHeaders = () => {
    const token = localStorage.getItem("access_token");

    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  // --------------------------------------------------
  // LOAD CLASSES
  // --------------------------------------------------
  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}academics/attendance/classes/`,
          {
            headers: getHeaders(),
          }
        );

        setClasses(response.data || []);
      } catch (err) {
        console.error("Error loading classes:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load classes. Please try again."
        );
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  // --------------------------------------------------
  // LOAD STUDENTS WHEN CLASS CHANGES
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedClass) {
      setAttendance([]);
      return;
    }

    const selected = classes.find(
      (item) => String(item.id) === String(selectedClass)
    );

    if (!selected) {
      setAttendance([]);
      return;
    }

    setLoadingStudents(true);
    setMessage("");
    setError("");

    const students = selected.students || [];

    const formattedStudents = students.map((student) => ({
      student: student.id,

      name:
        student.name ||
        student.full_name ||
        student.student_name ||
        "Unknown Student",

      admission_number:
        student.admission_number ||
        student.admission_no ||
        "—",

      // NEW: keep the student's profile picture
      profile_picture: student.profile_picture || null,

      status: "present",

      reason: "",
    }));

    setAttendance(formattedStudents);
    setLoadingStudents(false);
  }, [selectedClass, classes]);

  // --------------------------------------------------
  // FILTER STUDENTS
  // --------------------------------------------------
  const filteredAttendance = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return attendance;
    }

    return attendance.filter((student) => {
      return (
        student.name.toLowerCase().includes(search) ||
        student.admission_number.toLowerCase().includes(search)
      );
    });
  }, [attendance, searchTerm]);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------
  const counts = useMemo(() => {
    return {
      total: attendance.length,

      present: attendance.filter(
        (student) => student.status === "present"
      ).length,

      absent: attendance.filter(
        (student) => student.status === "absent"
      ).length,

      late: attendance.filter(
        (student) => student.status === "late"
      ).length,

      excused: attendance.filter(
        (student) => student.status === "excused"
      ).length,
    };
  }, [attendance]);

  // --------------------------------------------------
  // CHECKBOX CHANGE
  // --------------------------------------------------
  const handleCheckboxChange = (studentId) => {
    setAttendance((current) =>
      current.map((student) => {
        if (student.student !== studentId) {
          return student;
        }

        const isCurrentlyPresent =
          student.status === "present";

        return {
          ...student,

          status: isCurrentlyPresent
            ? "absent"
            : "present",

          reason: isCurrentlyPresent
            ? student.reason
            : "",
        };
      })
    );

    setMessage("");
    setError("");
  };

  // --------------------------------------------------
  // STATUS CHANGE
  // --------------------------------------------------
  const handleStatusChange = (
    studentId,
    newStatus
  ) => {
    setAttendance((current) =>
      current.map((student) =>
        student.student === studentId
          ? {
              ...student,
              status: newStatus,
            }
          : student
      )
    );

    setMessage("");
    setError("");
  };

  // --------------------------------------------------
  // REASON CHANGE
  // --------------------------------------------------
  const handleReasonChange = (
    studentId,
    value
  ) => {
    setAttendance((current) =>
      current.map((student) =>
        student.student === studentId
          ? {
              ...student,
              reason: value,
            }
          : student
      )
    );
  };

  // --------------------------------------------------
  // MARK ALL PRESENT
  // --------------------------------------------------
  const markAllPresent = () => {
    setAttendance((current) =>
      current.map((student) => ({
        ...student,
        status: "present",
        reason: "",
      }))
    );

    setMessage("");
    setError("");
  };

  // --------------------------------------------------
  // MARK ALL ABSENT
  // --------------------------------------------------
  const markAllAbsent = () => {
    setAttendance((current) =>
      current.map((student) => ({
        ...student,
        status: "absent",
      }))
    );

    setMessage("");
    setError("");
  };

  // --------------------------------------------------
  // SAVE ATTENDANCE
  // --------------------------------------------------
  const handleSave = async () => {
    setMessage("");
    setError("");

    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }

    if (!date) {
      setError("Please select an attendance date.");
      return;
    }

    if (attendance.length === 0) {
      setError("There are no students in this class.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        school_class: Number(selectedClass),

        date: date,

        attendance: attendance.map((student) => ({
          student: Number(student.student),
          status: student.status,
          reason: student.reason || "",
        })),
      };

      const response = await axios.post(
        `${API_BASE_URL}academics/attendance/bulk/`,
        payload,
        {
          headers: getHeaders(),
        }
      );

      setMessage(
        response.data?.message ||
          "Attendance saved successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Error saving attendance:", err);

      const responseData = err.response?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError(
          "Unable to save attendance. Please check your information and try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // SELECTED CLASS NAME
  // --------------------------------------------------
  const selectedClassName = useMemo(() => {
    const selected = classes.find(
      (item) =>
        String(item.id) === String(selectedClass)
    );

    return selected?.name || "";
  }, [classes, selectedClass]);

  return (
    <DashboardLayout>
      <div className="attendance-form-page">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}
        <div className="attendance-page-header">
          <div>
            <h1>📋 Student Attendance</h1>

            <p>
              Record daily attendance using the spreadsheet below.
            </p>
          </div>

          <button
            type="button"
            className="save-attendance-top"
            onClick={handleSave}
            disabled={
              saving || attendance.length === 0
            }
          >
            {saving
              ? "Saving..."
              : "💾 Save Attendance"}
          </button>
        </div>

        {/* ==================================================
            MESSAGES
        ================================================== */}
        {message && (
          <div className="attendance-message success-message">
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="attendance-message error-message">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            CONTROL BAR
        ================================================== */}
        <div className="attendance-controls">

          <div className="attendance-control-group">
            <label htmlFor="attendance-class">
              Class
            </label>

            <select
              id="attendance-class"
              value={selectedClass}
              onChange={(event) => {
                setSelectedClass(
                  event.target.value
                );
                setMessage("");
                setError("");
              }}
              disabled={loadingClasses}
            >
              <option value="">
                {loadingClasses
                  ? "Loading classes..."
                  : "Select class"}
              </option>

              {classes.map((schoolClass) => (
                <option
                  key={schoolClass.id}
                  value={schoolClass.id}
                >
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </div>

          <div className="attendance-control-group">
            <label htmlFor="attendance-date">
              Date
            </label>

            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setMessage("");
                setError("");
              }}
            />
          </div>

          <div className="attendance-control-group search-control">
            <label htmlFor="attendance-search">
              Search Student
            </label>

            <input
              id="attendance-search"
              type="text"
              placeholder="Name or admission number..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </div>

        {/* ==================================================
            ACTION BAR
        ================================================== */}
        <div className="attendance-action-bar">

          <div className="attendance-selection-info">
            {selectedClass ? (
              <>
                <strong>
                  {selectedClassName}
                </strong>

                <span className="separator">
                  •
                </span>

                <span>
                  {counts.total} student
                  {counts.total !== 1
                    ? "s"
                    : ""}
                </span>

                {searchTerm && (
                  <>
                    <span className="separator">
                      •
                    </span>

                    <span>
                      Showing{" "}
                      {filteredAttendance.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span>
                Select a class to begin attendance.
              </span>
            )}
          </div>

          <div className="bulk-actions">

            <button
              type="button"
              className="mark-present-button"
              onClick={markAllPresent}
              disabled={attendance.length === 0}
            >
              ✓ Mark All Present
            </button>

            <button
              type="button"
              className="mark-absent-button"
              onClick={markAllAbsent}
              disabled={attendance.length === 0}
            >
              ✕ Mark All Absent
            </button>

          </div>
        </div>

        {/* ==================================================
            EXCEL TABLE
        ================================================== */}
        <div className="attendance-spreadsheet-wrapper">

          <table className="attendance-spreadsheet">

            <thead>
              <tr>

                <th className="column-number">
                  #
                </th>

                <th className="column-student">
                  Student
                </th>

                <th className="column-admission">
                  Admission No.
                </th>

                <th className="column-present">
                  Present
                </th>

                <th className="column-status">
                  Status
                </th>

                <th className="column-reason">
                  Reason
                </th>

              </tr>
            </thead>

            <tbody>

              {loadingStudents ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-cell"
                  >
                    <div className="table-loading">

                      <div className="loading-spinner"></div>

                      <span>
                        Loading students...
                      </span>

                    </div>
                  </td>
                </tr>

              ) : !selectedClass ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-cell"
                  >
                    <div className="empty-state">

                      <span className="empty-icon">
                        📚
                      </span>

                      <strong>
                        Select a class
                      </strong>

                      <span>
                        Choose a class above to load
                        its students.
                      </span>

                    </div>
                  </td>
                </tr>

              ) : filteredAttendance.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table-cell"
                  >
                    <div className="empty-state">

                      <span className="empty-icon">
                        🔍
                      </span>

                      <strong>
                        No students found
                      </strong>

                      <span>
                        Try another search.
                      </span>

                    </div>
                  </td>
                </tr>

              ) : (

                filteredAttendance.map(
                  (student, index) => {

                    const isPresent =
                      student.status ===
                      "present";

                    return (
                      <tr
                        key={student.student}
                        className={
                          isPresent
                            ? "student-row row-present"
                            : "student-row"
                        }
                      >

                        {/* NUMBER */}
                        <td className="number-cell">
                          {index + 1}
                        </td>

                        {/* STUDENT */}
                        <td className="student-cell">

                          <div className="student-name-wrapper">

                            <div className="student-avatar">

                              {student.profile_picture ? (

                                <img
                                  src={
                                    student.profile_picture
                                  }
                                  alt={
                                    student.name
                                  }
                                  className="student-profile-picture"
                                />

                              ) : (

                                <span>
                                  {student.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}
                                </span>

                              )}

                            </div>

                            <span className="student-name">
                              {student.name}
                            </span>

                          </div>

                        </td>

                        {/* ADMISSION NUMBER */}
                        <td className="admission-cell">
                          {student.admission_number}
                        </td>

                        {/* PRESENT CHECKBOX */}
                        <td className="present-cell">

                          <label className="attendance-checkbox">

                            <input
                              type="checkbox"
                              checked={isPresent}
                              onChange={() =>
                                handleCheckboxChange(
                                  student.student
                                )
                              }
                            />

                            <span className="custom-checkbox">
                              {isPresent && "✓"}
                            </span>

                          </label>

                        </td>

                        {/* STATUS */}
                        <td className="status-cell">

                          <select
                            value={student.status}
                            onChange={(event) =>
                              handleStatusChange(
                                student.student,
                                event.target.value
                              )
                            }
                            className={`status-select status-${student.status}`}
                          >
                            <option value="present">
                              Present
                            </option>

                            <option value="absent">
                              Absent
                            </option>

                            <option value="late">
                              Late
                            </option>

                            <option value="excused">
                              Excused
                            </option>
                          </select>

                        </td>

                        {/* REASON */}
                        <td className="reason-cell">

                          <input
                            type="text"
                            value={student.reason}
                            onChange={(event) =>
                              handleReasonChange(
                                student.student,
                                event.target.value
                              )
                            }
                            placeholder={
                              student.status ===
                              "present"
                                ? "—"
                                : "Enter reason..."
                            }
                          />

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

            {/* ==================================================
                TOTAL ROW
            ================================================== */}
            {attendance.length > 0 && (
              <tfoot>

                <tr className="attendance-total-row">

                  <td></td>

                  <td>
                    <strong>
                      TOTAL
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {counts.total} Students
                    </strong>
                  </td>

                  <td>
                    <strong className="total-present">
                      {counts.present}
                    </strong>
                  </td>

                  <td>
                    <div className="total-statuses">

                      <span className="mini-total present-total">
                        P: {counts.present}
                      </span>

                      <span className="mini-total absent-total">
                        A: {counts.absent}
                      </span>

                      <span className="mini-total late-total">
                        L: {counts.late}
                      </span>

                      <span className="mini-total excused-total">
                        E: {counts.excused}
                      </span>

                    </div>
                  </td>

                  <td></td>

                </tr>

              </tfoot>
            )}

          </table>

        </div>

        {/* ==================================================
            BOTTOM SUMMARY
        ================================================== */}
        {attendance.length > 0 && (
          <div className="attendance-bottom-bar">

            <div className="bottom-summary">

              <div className="summary-item">
                <span className="summary-dot total-dot"></span>
                <span>Total</span>
                <strong>
                  {counts.total}
                </strong>
              </div>

              <div className="summary-item">
                <span className="summary-dot present-dot"></span>
                <span>Present</span>
                <strong>
                  {counts.present}
                </strong>
              </div>

              <div className="summary-item">
                <span className="summary-dot absent-dot"></span>
                <span>Absent</span>
                <strong>
                  {counts.absent}
                </strong>
              </div>

              <div className="summary-item">
                <span className="summary-dot late-dot"></span>
                <span>Late</span>
                <strong>
                  {counts.late}
                </strong>
              </div>

              <div className="summary-item">
                <span className="summary-dot excused-dot"></span>
                <span>Excused</span>
                <strong>
                  {counts.excused}
                </strong>
              </div>

            </div>

            <button
              type="button"
              className="save-attendance-bottom"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving Attendance..."
                : "💾 Save Attendance"}
            </button>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AttendanceForm;


// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import "./AttendanceForm.css";

// const API_BASE_URL = "http://127.0.0.1:8000/api/";

// const getToday = () => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, "0");
//   const day = String(today.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const AttendanceForm = () => {
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [date, setDate] = useState(getToday());

//   const [attendance, setAttendance] = useState([]);

//   const [searchTerm, setSearchTerm] = useState("");

//   const [loadingClasses, setLoadingClasses] = useState(true);
//   const [loadingStudents, setLoadingStudents] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // --------------------------------------------------
//   // AUTH HEADERS
//   // --------------------------------------------------
//   const getHeaders = () => {
//     const token = localStorage.getItem("access_token");

//     return {
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "application/json",
//     };
//   };

//   // --------------------------------------------------
//   // LOAD CLASSES
//   // --------------------------------------------------
//   useEffect(() => {
//     const loadClasses = async () => {
//       setLoadingClasses(true);
//       setError("");

//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}academics/attendance/classes/`,
//           {
//             headers: getHeaders(),
//           }
//         );

//         setClasses(response.data || []);
//       } catch (err) {
//         console.error("Error loading classes:", err);

//         setError(
//           err.response?.data?.detail ||
//             "Unable to load classes. Please try again."
//         );
//       } finally {
//         setLoadingClasses(false);
//       }
//     };

//     loadClasses();
//   }, []);

//   // --------------------------------------------------
//   // LOAD STUDENTS WHEN CLASS CHANGES
//   // --------------------------------------------------
//   useEffect(() => {
//     if (!selectedClass) {
//       setAttendance([]);
//       return;
//     }

//     const selected = classes.find(
//       (item) => String(item.id) === String(selectedClass)
//     );

//     if (!selected) {
//       setAttendance([]);
//       return;
//     }

//     setLoadingStudents(true);
//     setMessage("");
//     setError("");

//     const students = selected.students || [];

//     const formattedStudents = students.map((student) => ({
//       student: student.id,
//       name:
//         student.name ||
//         student.full_name ||
//         student.student_name ||
//         "Unknown Student",
//       admission_number:
//         student.admission_number ||
//         student.admission_no ||
//         "—",
//       status: "present",
//       reason: "",
//     }));

//     setAttendance(formattedStudents);
//     setLoadingStudents(false);
//   }, [selectedClass, classes]);

//   // --------------------------------------------------
//   // FILTER STUDENTS
//   // --------------------------------------------------
//   const filteredAttendance = useMemo(() => {
//     const search = searchTerm.trim().toLowerCase();

//     if (!search) {
//       return attendance;
//     }

//     return attendance.filter((student) => {
//       return (
//         student.name.toLowerCase().includes(search) ||
//         student.admission_number.toLowerCase().includes(search)
//       );
//     });
//   }, [attendance, searchTerm]);

//   // --------------------------------------------------
//   // COUNTS
//   // --------------------------------------------------
//   const counts = useMemo(() => {
//     return {
//       total: attendance.length,
//       present: attendance.filter(
//         (student) => student.status === "present"
//       ).length,
//       absent: attendance.filter(
//         (student) => student.status === "absent"
//       ).length,
//       late: attendance.filter(
//         (student) => student.status === "late"
//       ).length,
//       excused: attendance.filter(
//         (student) => student.status === "excused"
//       ).length,
//     };
//   }, [attendance]);

//   // --------------------------------------------------
//   // CHECKBOX CHANGE
//   // --------------------------------------------------
//   const handleCheckboxChange = (studentId) => {
//     setAttendance((current) =>
//       current.map((student) => {
//         if (student.student !== studentId) {
//           return student;
//         }

//         const isCurrentlyPresent =
//           student.status === "present";

//         return {
//           ...student,
//           status: isCurrentlyPresent ? "absent" : "present",
//           reason: isCurrentlyPresent ? student.reason : "",
//         };
//       })
//     );

//     setMessage("");
//     setError("");
//   };

//   // --------------------------------------------------
//   // STATUS CHANGE
//   // --------------------------------------------------
//   const handleStatusChange = (studentId, newStatus) => {
//     setAttendance((current) =>
//       current.map((student) =>
//         student.student === studentId
//           ? {
//               ...student,
//               status: newStatus,
//             }
//           : student
//       )
//     );

//     setMessage("");
//     setError("");
//   };

//   // --------------------------------------------------
//   // REASON CHANGE
//   // --------------------------------------------------
//   const handleReasonChange = (studentId, value) => {
//     setAttendance((current) =>
//       current.map((student) =>
//         student.student === studentId
//           ? {
//               ...student,
//               reason: value,
//             }
//           : student
//       )
//     );
//   };

//   // --------------------------------------------------
//   // MARK ALL PRESENT
//   // --------------------------------------------------
//   const markAllPresent = () => {
//     setAttendance((current) =>
//       current.map((student) => ({
//         ...student,
//         status: "present",
//         reason: "",
//       }))
//     );

//     setMessage("");
//     setError("");
//   };

//   // --------------------------------------------------
//   // MARK ALL ABSENT
//   // --------------------------------------------------
//   const markAllAbsent = () => {
//     setAttendance((current) =>
//       current.map((student) => ({
//         ...student,
//         status: "absent",
//       }))
//     );

//     setMessage("");
//     setError("");
//   };

//   // --------------------------------------------------
//   // SAVE ATTENDANCE
//   // --------------------------------------------------
//   const handleSave = async () => {
//     setMessage("");
//     setError("");

//     if (!selectedClass) {
//       setError("Please select a class.");
//       return;
//     }

//     if (!date) {
//       setError("Please select an attendance date.");
//       return;
//     }

//     if (attendance.length === 0) {
//       setError("There are no students in this class.");
//       return;
//     }

//     setSaving(true);

//     try {
//       const payload = {
//         school_class: Number(selectedClass),
//         date: date,
//         attendance: attendance.map((student) => ({
//           student: Number(student.student),
//           status: student.status,
//           reason: student.reason || "",
//         })),
//       };

//       const response = await axios.post(
//         `${API_BASE_URL}academics/attendance/bulk/`,
//         payload,
//         {
//           headers: getHeaders(),
//         }
//       );

//       setMessage(
//         response.data?.message ||
//           "Attendance saved successfully."
//       );

//       // Keep the entered attendance visible after saving.
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });
//     } catch (err) {
//       console.error("Error saving attendance:", err);

//       const responseData = err.response?.data;

//       if (typeof responseData === "string") {
//         setError(responseData);
//       } else if (responseData?.detail) {
//         setError(responseData.detail);
//       } else if (responseData?.message) {
//         setError(responseData.message);
//       } else {
//         setError(
//           "Unable to save attendance. Please check your information and try again."
//         );
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // --------------------------------------------------
//   // SELECTED CLASS NAME
//   // --------------------------------------------------
//   const selectedClassName = useMemo(() => {
//     const selected = classes.find(
//       (item) => String(item.id) === String(selectedClass)
//     );

//     return selected?.name || "";
//   }, [classes, selectedClass]);

//   return (
//     <DashboardLayout>
//       <div className="attendance-form-page">

//         {/* ==================================================
//             PAGE HEADER
//         ================================================== */}
//         <div className="attendance-page-header">
//           <div>
//             <h1>📋 Student Attendance</h1>

//             <p>
//               Record daily attendance using the spreadsheet below.
//             </p>
//           </div>

//           <button
//             type="button"
//             className="save-attendance-top"
//             onClick={handleSave}
//             disabled={saving || attendance.length === 0}
//           >
//             {saving ? "Saving..." : "💾 Save Attendance"}
//           </button>
//         </div>

//         {/* ==================================================
//             MESSAGES
//         ================================================== */}
//         {message && (
//           <div className="attendance-message success-message">
//             <span>✓</span>
//             <span>{message}</span>
//           </div>
//         )}

//         {error && (
//           <div className="attendance-message error-message">
//             <span>!</span>
//             <span>{error}</span>
//           </div>
//         )}

//         {/* ==================================================
//             CONTROL BAR
//         ================================================== */}
//         <div className="attendance-controls">

//           <div className="attendance-control-group">
//             <label htmlFor="attendance-class">
//               Class
//             </label>

//             <select
//               id="attendance-class"
//               value={selectedClass}
//               onChange={(event) => {
//                 setSelectedClass(event.target.value);
//                 setMessage("");
//                 setError("");
//               }}
//               disabled={loadingClasses}
//             >
//               <option value="">
//                 {loadingClasses
//                   ? "Loading classes..."
//                   : "Select class"}
//               </option>

//               {classes.map((schoolClass) => (
//                 <option
//                   key={schoolClass.id}
//                   value={schoolClass.id}
//                 >
//                   {schoolClass.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="attendance-control-group">
//             <label htmlFor="attendance-date">
//               Date
//             </label>

//             <input
//               id="attendance-date"
//               type="date"
//               value={date}
//               onChange={(event) => {
//                 setDate(event.target.value);
//                 setMessage("");
//                 setError("");
//               }}
//             />
//           </div>

//           <div className="attendance-control-group search-control">
//             <label htmlFor="attendance-search">
//               Search Student
//             </label>

//             <input
//               id="attendance-search"
//               type="text"
//               placeholder="Name or admission number..."
//               value={searchTerm}
//               onChange={(event) =>
//                 setSearchTerm(event.target.value)
//               }
//             />
//           </div>

//         </div>

//         {/* ==================================================
//             ACTION BAR
//         ================================================== */}
//         <div className="attendance-action-bar">

//           <div className="attendance-selection-info">
//             {selectedClass ? (
//               <>
//                 <strong>{selectedClassName}</strong>

//                 <span className="separator">•</span>

//                 <span>
//                   {counts.total} student
//                   {counts.total !== 1 ? "s" : ""}
//                 </span>

//                 {searchTerm && (
//                   <>
//                     <span className="separator">•</span>

//                     <span>
//                       Showing {filteredAttendance.length}
//                     </span>
//                   </>
//                 )}
//               </>
//             ) : (
//               <span>
//                 Select a class to begin attendance.
//               </span>
//             )}
//           </div>

//           <div className="bulk-actions">

//             <button
//               type="button"
//               className="mark-present-button"
//               onClick={markAllPresent}
//               disabled={attendance.length === 0}
//             >
//               ✓ Mark All Present
//             </button>

//             <button
//               type="button"
//               className="mark-absent-button"
//               onClick={markAllAbsent}
//               disabled={attendance.length === 0}
//             >
//               ✕ Mark All Absent
//             </button>

//           </div>
//         </div>

//         {/* ==================================================
//             EXCEL TABLE
//         ================================================== */}
//         <div className="attendance-spreadsheet-wrapper">

//           <table className="attendance-spreadsheet">

//             <thead>
//               <tr>
//                 <th className="column-number">
//                   #
//                 </th>

//                 <th className="column-student">
//                   Student
//                 </th>

//                 <th className="column-admission">
//                   Admission No.
//                 </th>

//                 <th className="column-present">
//                   Present
//                 </th>

//                 <th className="column-status">
//                   Status
//                 </th>

//                 <th className="column-reason">
//                   Reason
//                 </th>
//               </tr>
//             </thead>

//             <tbody>

//               {loadingStudents ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="empty-table-cell"
//                   >
//                     <div className="table-loading">
//                       <div className="loading-spinner"></div>

//                       <span>
//                         Loading students...
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : !selectedClass ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="empty-table-cell"
//                   >
//                     <div className="empty-state">
//                       <span className="empty-icon">
//                         📚
//                       </span>

//                       <strong>
//                         Select a class
//                       </strong>

//                       <span>
//                         Choose a class above to load its
//                         students.
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredAttendance.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="empty-table-cell"
//                   >
//                     <div className="empty-state">
//                       <span className="empty-icon">
//                         🔍
//                       </span>

//                       <strong>
//                         No students found
//                       </strong>

//                       <span>
//                         Try another search.
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredAttendance.map(
//                   (student, index) => {

//                     const isPresent =
//                       student.status === "present";

//                     return (
//                       <tr
//                         key={student.student}
//                         className={
//                           isPresent
//                             ? "student-row row-present"
//                             : "student-row"
//                         }
//                       >

//                         {/* NUMBER */}
//                         <td className="number-cell">
//                           {index + 1}
//                         </td>

//                         {/* STUDENT */}
//                         <td className="student-cell">

//                           <div className="student-name-wrapper">

//                             <div className="student-avatar">
//                               {student.name
//                                 ?.charAt(0)
//                                 ?.toUpperCase() || "S"}
//                             </div>

//                             <span className="student-name">
//                               {student.name}
//                             </span>

//                           </div>

//                         </td>

//                         {/* ADMISSION NUMBER */}
//                         <td className="admission-cell">
//                           {student.admission_number}
//                         </td>

//                         {/* PRESENT CHECKBOX */}
//                         <td className="present-cell">

//                           <label className="attendance-checkbox">

//                             <input
//                               type="checkbox"
//                               checked={isPresent}
//                               onChange={() =>
//                                 handleCheckboxChange(
//                                   student.student
//                                 )
//                               }
//                             />

//                             <span className="custom-checkbox">
//                               {isPresent && "✓"}
//                             </span>

//                           </label>

//                         </td>

//                         {/* STATUS */}
//                         <td className="status-cell">

//                           <select
//                             value={student.status}
//                             onChange={(event) =>
//                               handleStatusChange(
//                                 student.student,
//                                 event.target.value
//                               )
//                             }
//                             className={`status-select status-${student.status}`}
//                           >
//                             <option value="present">
//                               Present
//                             </option>

//                             <option value="absent">
//                               Absent
//                             </option>

//                             <option value="late">
//                               Late
//                             </option>

//                             <option value="excused">
//                               Excused
//                             </option>
//                           </select>

//                         </td>

//                         {/* REASON */}
//                         <td className="reason-cell">

//                           <input
//                             type="text"
//                             value={student.reason}
//                             onChange={(event) =>
//                               handleReasonChange(
//                                 student.student,
//                                 event.target.value
//                               )
//                             }
//                             placeholder={
//                               student.status === "present"
//                                 ? "—"
//                                 : "Enter reason..."
//                             }
//                           />

//                         </td>

//                       </tr>
//                     );
//                   }
//                 )
//               )}

//             </tbody>

//             {/* ==================================================
//                 TOTAL ROW
//             ================================================== */}
//             {attendance.length > 0 && (
//               <tfoot>

//                 <tr className="attendance-total-row">

//                   <td></td>

//                   <td>
//                     <strong>
//                       TOTAL
//                     </strong>
//                   </td>

//                   <td>
//                     <strong>
//                       {counts.total} Students
//                     </strong>
//                   </td>

//                   <td>
//                     <strong className="total-present">
//                       {counts.present}
//                     </strong>
//                   </td>

//                   <td>
//                     <div className="total-statuses">

//                       <span className="mini-total present-total">
//                         P: {counts.present}
//                       </span>

//                       <span className="mini-total absent-total">
//                         A: {counts.absent}
//                       </span>

//                       <span className="mini-total late-total">
//                         L: {counts.late}
//                       </span>

//                       <span className="mini-total excused-total">
//                         E: {counts.excused}
//                       </span>

//                     </div>
//                   </td>

//                   <td></td>

//                 </tr>

//               </tfoot>
//             )}

//           </table>

//         </div>

//         {/* ==================================================
//             BOTTOM SUMMARY
//         ================================================== */}
//         {attendance.length > 0 && (
//           <div className="attendance-bottom-bar">

//             <div className="bottom-summary">

//               <div className="summary-item">
//                 <span className="summary-dot total-dot"></span>
//                 <span>Total</span>
//                 <strong>{counts.total}</strong>
//               </div>

//               <div className="summary-item">
//                 <span className="summary-dot present-dot"></span>
//                 <span>Present</span>
//                 <strong>{counts.present}</strong>
//               </div>

//               <div className="summary-item">
//                 <span className="summary-dot absent-dot"></span>
//                 <span>Absent</span>
//                 <strong>{counts.absent}</strong>
//               </div>

//               <div className="summary-item">
//                 <span className="summary-dot late-dot"></span>
//                 <span>Late</span>
//                 <strong>{counts.late}</strong>
//               </div>

//               <div className="summary-item">
//                 <span className="summary-dot excused-dot"></span>
//                 <span>Excused</span>
//                 <strong>{counts.excused}</strong>
//               </div>

//             </div>

//             <button
//               type="button"
//               className="save-attendance-bottom"
//               onClick={handleSave}
//               disabled={saving}
//             >
//               {saving
//                 ? "Saving Attendance..."
//                 : "💾 Save Attendance"}
//             </button>

//           </div>
//         )}

//       </div>
//     </DashboardLayout>
//   );
// };

// export default AttendanceForm;

