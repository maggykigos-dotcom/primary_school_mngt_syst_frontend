import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getStudent } from "../../api/adminAPI";

import "./StudentView.css";

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD STUDENT
  // ======================================================

  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudent(id);

      console.log("STUDENT API RESPONSE:", response.data);

      setStudent(response.data);
    } catch (err) {
      console.error("Failed to load student:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load student information."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  // ======================================================
  // STUDENT NAME
  // ======================================================

  const getStudentName = () => {
    return student?.student_name || "Student";
  };

  // ======================================================
  // USERNAME
  // ======================================================

  const getUsername = () => {
    return student?.username_display || "-";
  };

  // ======================================================
  // FIRST NAME
  // ======================================================

  const getFirstName = () => {
    return student?.first_name_display || "-";
  };

  // ======================================================
  // LAST NAME
  // ======================================================

  const getLastName = () => {
    return student?.last_name_display || "-";
  };

  // ======================================================
  // EMAIL
  // ======================================================

  const getEmail = () => {
    return student?.email_display || "-";
  };

  // ======================================================
  // PHONE NUMBER
  // ======================================================

  const getPhone = () => {
    return student?.phone_number_display || "-";
  };

  // ======================================================
  // DATE OF BIRTH
  // ======================================================

  const getDateOfBirth = () => {
    return student?.date_of_birth_display || "-";
  };

  // ======================================================
  // ADDRESS
  // ======================================================

  const getAddress = () => {
    return student?.address_display || "-";
  };

  // ======================================================
  // CLASS NAME
  // ======================================================

  const getClassName = () => {
    if (!student) {
      return "-";
    }

    // Your API already returns:
    // "class_name": "Grade 1 - A"

    if (student.class_name) {
      return student.class_name;
    }

    // Fallback if school_class is ever returned as an object

    if (
      student.school_class &&
      typeof student.school_class === "object"
    ) {
      return (
        student.school_class.name ||
        student.school_class.class_name ||
        "-"
      );
    }

    return student.school_class || "-";
  };

  // ======================================================
  // PROFILE PICTURE
  // ======================================================

  const getProfilePicture = () => {
    return student?.profile_picture || null;
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="student-view-page">
        <div className="student-view-loading">
          Loading student information...
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="student-view-page">
        <div className="student-view-error">
          {error}
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/admin/students")}
        >
          ← Back to Students
        </button>
      </div>
    );
  }

  // ======================================================
  // STUDENT NOT FOUND
  // ======================================================

  if (!student) {
    return (
      <div className="student-view-page">
        <div className="student-view-error">
          Student not found.
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/admin/students")}
        >
          ← Back to Students
        </button>
      </div>
    );
  }

  // ======================================================
  // DISPLAY VALUES
  // ======================================================

  const studentName = getStudentName();
  const firstName = getFirstName();
  const profilePicture = getProfilePicture();

  return (
    <div className="student-view-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="student-view-header">

        <div>
          <h1>Student Details</h1>

          <p>
            View complete information about this student.
          </p>
        </div>

        <div className="student-view-actions">

          <button
            className="edit-student-button"
            onClick={() =>
              navigate(
                `/admin/students/edit/${student.id}`
              )
            }
          >
            ✏️ Edit Student
          </button>

          <button
            className="back-button"
            onClick={() =>
              navigate("/admin/students")
            }
          >
            ← Back
          </button>

        </div>

      </div>

      {/* ==================================================
          STUDENT PROFILE CARD
      ================================================== */}

      <div className="student-profile-card">

        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <div className="student-profile-header">

          <div className="student-avatar">

            {profilePicture ? (
              <img
                src={profilePicture}
                alt={studentName}
                className="student-profile-image"
              />
            ) : (
              firstName !== "-" ? (
                firstName
                  .charAt(0)
                  .toUpperCase()
              ) : (
                "S"
              )
            )}

          </div>

          <div>

            <h2>
              {studentName}
            </h2>

            <p>
              Admission Number:{" "}
              <strong>
                {student.admission_number || "-"}
              </strong>
            </p>

          </div>

        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="student-details-grid">

          {/* STUDENT ID */}
          <div className="student-detail-item">

            <span className="detail-label">
              Student ID
            </span>

            <span className="detail-value">
              {student.id || "-"}
            </span>

          </div>

          {/* ADMISSION NUMBER */}
          <div className="student-detail-item">

            <span className="detail-label">
              Admission Number
            </span>

            <span className="detail-value">
              {student.admission_number || "-"}
            </span>

          </div>

          {/* USERNAME */}
          <div className="student-detail-item">

            <span className="detail-label">
              Username
            </span>

            <span className="detail-value">
              {getUsername()}
            </span>

          </div>

          {/* FIRST NAME */}
          <div className="student-detail-item">

            <span className="detail-label">
              First Name
            </span>

            <span className="detail-value">
              {getFirstName()}
            </span>

          </div>

          {/* LAST NAME */}
          <div className="student-detail-item">

            <span className="detail-label">
              Last Name
            </span>

            <span className="detail-value">
              {getLastName()}
            </span>

          </div>

          {/* EMAIL */}
          <div className="student-detail-item">

            <span className="detail-label">
              Email
            </span>

            <span className="detail-value">
              {getEmail()}
            </span>

          </div>

          {/* PHONE */}
          <div className="student-detail-item">

            <span className="detail-label">
              Phone Number
            </span>

            <span className="detail-value">
              {getPhone()}
            </span>

          </div>

          {/* DATE OF BIRTH */}
          <div className="student-detail-item">

            <span className="detail-label">
              Date of Birth
            </span>

            <span className="detail-value">
              {getDateOfBirth()}
            </span>

          </div>

          {/* CLASS */}
          <div className="student-detail-item">

            <span className="detail-label">
              Class
            </span>

            <span className="detail-value">
              {getClassName()}
            </span>

          </div>

          {/* ROLE */}
          <div className="student-detail-item">

            <span className="detail-label">
              Role
            </span>

            <span className="detail-value">
              {student.role || "student"}
            </span>

          </div>

          {/* ADDRESS */}
          <div className="student-detail-item full-width">

            <span className="detail-label">
              Address
            </span>

            <span className="detail-value">
              {getAddress()}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentView;

