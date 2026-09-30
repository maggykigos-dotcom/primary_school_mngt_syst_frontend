import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudent,
  updateStudent,
} from "../../api/adminAPI";

import "./StudentEdit.css";

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    school_class: "",
    password: "",
  });

  /* =====================================================
     LOAD EXISTING STUDENT
     ===================================================== */

  const loadStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudent(id);

      const student = response.data;

      console.log("EDIT STUDENT DATA:", student);

      /*
       * The backend currently sends the user details
       * using *_display fields.
       *
       * We use those values to populate the form.
       */

      setFormData({
        username: student.username_display || "",
        first_name: student.first_name_display || "",
        last_name: student.last_name_display || "",
        email: student.email_display || "",
        phone_number: student.phone_number_display || "",
        date_of_birth: student.date_of_birth_display || "",
        address: student.address_display || "",
        school_class:
          typeof student.school_class === "object"
            ? student.school_class?.id || ""
            : student.school_class || "",
        password: "",
      });

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


  /* =====================================================
     HANDLE INPUT CHANGES
     ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     SUBMIT FORM
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Create a copy of the form data.
       */

      const dataToSend = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_birth:
          formData.date_of_birth || null,
        address: formData.address,
        school_class:
          formData.school_class || null,
      };

      /*
       * Only send password if the administrator
       * actually entered a new password.
       *
       * An existing password is NEVER displayed.
       */

      if (formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }

      console.log("UPDATING STUDENT:", dataToSend);

      await updateStudent(id, dataToSend);

      setSuccess("Student information updated successfully.");

      /*
       * Wait briefly so the success message can
       * be seen before returning to the list.
       */

      setTimeout(() => {
        navigate("/admin/students");
      }, 1200);

    } catch (err) {
      console.error("Failed to update student:", err);

      console.log(
        "UPDATE ERROR:",
        err.response?.data
      );

      const backendError = err.response?.data;

      if (typeof backendError === "object") {
        const messages = Object.entries(backendError)
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages || "Failed to update student."
        );
      } else {
        setError(
          backendError ||
            "Failed to update student."
        );
      }

    } finally {
      setSaving(false);
    }
  };


  /* =====================================================
     LOADING SCREEN
     ===================================================== */

  if (loading) {
    return (
      <div className="student-edit-page">
        <div className="student-edit-loading">
          <div className="loading-spinner"></div>

          <p>Loading student information...</p>
        </div>
      </div>
    );
  }


  /* =====================================================
     FORM
     ===================================================== */

  return (
    <div className="student-edit-page">

      {/* HEADER */}

      <div className="student-edit-header">

        <div>
          <h1>✏️ Edit Student</h1>

          <p>
            Update the student's existing information.
          </p>
        </div>

        <button
          type="button"
          className="student-edit-back-button"
          onClick={() =>
            navigate("/admin/students")
          }
        >
          ← Back to Students
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="student-edit-error">
          ⚠️ {error}
        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="student-edit-success">
          ✅ {success}
        </div>
      )}


      {/* FORM CARD */}

      <form
        className="student-edit-card"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            PERSONAL INFORMATION
            ================================================= */}

        <div className="edit-section">

          <div className="edit-section-title">
            <span className="section-icon">👤</span>

            <div>
              <h2>Personal Information</h2>

              <p>
                Update the student's basic details.
              </p>
            </div>
          </div>


          <div className="edit-form-grid">

            {/* FIRST NAME */}

            <div className="edit-form-group">

              <label htmlFor="first_name">
                First Name
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
              />

            </div>


            {/* LAST NAME */}

            <div className="edit-form-group">

              <label htmlFor="last_name">
                Last Name
              </label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
              />

            </div>


            {/* USERNAME */}

            <div className="edit-form-group">

              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="edit-form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
              />

            </div>


            {/* PHONE */}

            <div className="edit-form-group">

              <label htmlFor="phone_number">
                Phone Number
              </label>

              <input
                id="phone_number"
                name="phone_number"
                type="text"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Phone number"
              />

            </div>


            {/* DATE OF BIRTH */}

            <div className="edit-form-group">

              <label htmlFor="date_of_birth">
                Date of Birth
              </label>

              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth || ""}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>


        {/* =================================================
            SCHOOL INFORMATION
            ================================================= */}

        <div className="edit-section">

          <div className="edit-section-title">
            <span className="section-icon">🎓</span>

            <div>
              <h2>School Information</h2>

              <p>
                Update the student's class.
              </p>
            </div>
          </div>


          <div className="edit-form-grid">

            <div className="edit-form-group">

              <label htmlFor="school_class">
                Class
              </label>

              <input
                id="school_class"
                name="school_class"
                type="number"
                value={formData.school_class}
                onChange={handleChange}
                placeholder="Class ID"
              />

              <small>
                Current class ID:{" "}
                {formData.school_class || "Not assigned"}
              </small>

            </div>

          </div>

        </div>


        {/* =================================================
            ADDRESS
            ================================================= */}

        <div className="edit-section">

          <div className="edit-section-title">
            <span className="section-icon">🏠</span>

            <div>
              <h2>Address</h2>

              <p>
                Update the student's home address.
              </p>
            </div>
          </div>


          <div className="edit-form-group">

            <label htmlFor="address">
              Address Details
            </label>

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter student's address"
              rows="4"
            />

          </div>

        </div>


        {/* =================================================
            PASSWORD
            ================================================= */}

        <div className="edit-section password-section">

          <div className="edit-section-title">

            <span className="section-icon">
              🔐
            </span>

            <div>
              <h2>Password</h2>

              <p>
                Leave this blank if you do not want
                to change the student's password.
              </p>
            </div>

          </div>


          <div className="edit-form-group">

            <label htmlFor="password">
              New Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a new password only if changing it"
            />

            <small>
              🔒 The current password is never displayed.
            </small>

          </div>

        </div>


        {/* =================================================
            BUTTONS
            ================================================= */}

        <div className="edit-form-actions">

          <button
            type="button"
            className="cancel-edit-button"
            onClick={() =>
              navigate("/admin/students")
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="save-student-button"
            disabled={saving}
          >
            {saving
              ? "Saving Changes..."
              : "💾 Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default StudentEdit;




// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   getStudent,
//   updateStudent,
// } from "../../api/adminAPI";

// import API from "../../api/axios";

// import "../../Styles/form.css";

// const StudentEdit = () => {
//   const { id } = useParams();

//   const navigate = useNavigate();

//   const [classes, setClasses] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const [formData, setFormData] = useState({
//     username: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     date_of_birth: "",
//     address: "",
//     school_class: "",
//   });


//   // ======================================================
//   // LOAD STUDENT
//   // ======================================================

//   useEffect(() => {

//     const loadStudent = async () => {

//       try {

//         setLoading(true);

//         const response = await getStudent(id);

//         const student = response.data;

//         setFormData({
//           username: student.username || "",

//           first_name:
//             student.first_name || "",

//           last_name:
//             student.last_name || "",

//           email:
//             student.email || "",

//           phone_number:
//             student.phone_number || "",

//           date_of_birth:
//             student.date_of_birth || "",

//           address:
//             student.address || "",

//           school_class:
//             student.school_class || "",
//         });

//       } catch (error) {

//         console.error(
//           "Failed to load student:",
//           error.response?.data || error
//         );

//         setError(
//           "Failed to load student information."
//         );

//       } finally {

//         setLoading(false);

//       }

//     };

//     loadStudent();

//   }, [id]);


//   // ======================================================
//   // LOAD SCHOOL CLASSES
//   // ======================================================

//   useEffect(() => {

//     API
//       .get("/academics/classes/")
//       .then((response) => {

//         const data =
//           Array.isArray(response.data)
//             ? response.data
//             : response.data?.results || [];

//         setClasses(data);

//       })
//       .catch((error) => {

//         console.error(
//           "Failed to load classes:",
//           error
//         );

//       });

//   }, []);


//   // ======================================================
//   // HANDLE INPUT
//   // ======================================================

//   const handleChange = (event) => {

//     const {
//       name,
//       value,
//     } = event.target;

//     setFormData((previousData) => ({
//       ...previousData,
//       [name]: value,
//     }));

//   };


//   // ======================================================
//   // UPDATE STUDENT
//   // ======================================================

//   const handleSubmit = async (event) => {

//     event.preventDefault();

//     if (submitting) {
//       return;
//     }

//     setSubmitting(true);

//     setMessage("");
//     setError("");

//     try {

//       await updateStudent(id, {

//         username:
//           formData.username.trim(),

//         first_name:
//           formData.first_name.trim(),

//         last_name:
//           formData.last_name.trim(),

//         email:
//           formData.email.trim(),

//         phone_number:
//           formData.phone_number.trim(),

//         date_of_birth:
//           formData.date_of_birth || null,

//         address:
//           formData.address.trim(),

//         school_class:
//           formData.school_class
//             ? Number(formData.school_class)
//             : null,
//       });


//       setMessage(
//         "Student updated successfully."
//       );


//       // Go back after a short delay

//       setTimeout(() => {

//         navigate("/admin/students");

//       }, 1000);


//     } catch (error) {

//       console.error(
//         "Student update error:",
//         error.response?.data || error
//       );

//       const errorData =
//         error.response?.data;


//       if (
//         errorData &&
//         typeof errorData === "object"
//       ) {

//         const messages =
//           Object.entries(errorData)
//             .map(
//               ([field, errors]) => {

//                 if (Array.isArray(errors)) {

//                   return `${field}: ${errors.join(
//                     ", "
//                   )}`;

//                 }

//                 return `${field}: ${errors}`;

//               }
//             )
//             .join(" | ");


//         setError(
//           messages ||
//             "Failed to update student."
//         );

//       } else {

//         setError(
//           "Failed to update student."
//         );

//       }

//     } finally {

//       setSubmitting(false);

//     }

//   };


//   // ======================================================
//   // LOADING
//   // ======================================================

//   if (loading) {

//     return (

//       <div className="form-container">

//         <h2>
//           Loading Student...
//         </h2>

//       </div>

//     );

//   }


//   // ======================================================
//   // FORM
//   // ======================================================

//   return (

//     <div className="form-container">

//       <h2>
//         Edit Student
//       </h2>


//       {message && (

//         <p className="success-message">
//           {message}
//         </p>

//       )}


//       {error && (

//         <p className="error-message">
//           {error}
//         </p>

//       )}


//       <form onSubmit={handleSubmit}>

//         <input
//           type="text"
//           name="username"
//           placeholder="Username"
//           value={formData.username}
//           onChange={handleChange}
//           required
//         />


//         <input
//           type="text"
//           name="first_name"
//           placeholder="First Name"
//           value={formData.first_name}
//           onChange={handleChange}
//           required
//         />


//         <input
//           type="text"
//           name="last_name"
//           placeholder="Last Name"
//           value={formData.last_name}
//           onChange={handleChange}
//           required
//         />


//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//         />


//         <input
//           type="text"
//           name="phone_number"
//           placeholder="Phone Number"
//           value={formData.phone_number}
//           onChange={handleChange}
//         />


//         <label>
//           Date of Birth
//         </label>

//         <input
//           type="date"
//           name="date_of_birth"
//           value={formData.date_of_birth}
//           onChange={handleChange}
//         />


//         <textarea
//           name="address"
//           placeholder="Address"
//           value={formData.address}
//           onChange={handleChange}
//         />


//         <label>
//           School Class
//         </label>

//         <select
//           name="school_class"
//           value={formData.school_class}
//           onChange={handleChange}
//           required
//         >

//           <option value="">
//             Select Class
//           </option>


//           {classes.map(
//             (schoolClass) => (

//               <option
//                 key={schoolClass.id}
//                 value={schoolClass.id}
//               >

//                 {schoolClass.grade_name
//                   ? `${schoolClass.grade_name} - ${schoolClass.name}`
//                   : schoolClass.name}

//               </option>

//             )
//           )}

//         </select>


//         <button
//           type="submit"
//           disabled={submitting}
//         >

//           {submitting
//             ? "Updating Student..."
//             : "Update Student"}

//         </button>


//         <button
//           type="button"
//           onClick={() =>
//             navigate("/admin/students")
//           }
//         >

//           Cancel

//         </button>

//       </form>

//     </div>

//   );

// };

// export default StudentEdit;

