import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const ParentForm = () => {
const [students, setStudents] = useState([]);


const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    role_type: "mother",
    students: [],
});

const [message, setMessage] = useState("");

useEffect(() => {
    axios
        .get("/auth/students/")
        .then((response) => {
            setStudents(response.data);
        })
        .catch((error) => {
            console.error("Error loading students:", error);
            setMessage("Failed to load students.");
        });
}, []);

const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
};

const handleStudentChange = (e) => {
    const selected = Array.from(
        e.target.selectedOptions,
        (option) => Number(option.value)
    );

    setFormData({
        ...formData,
        students: selected,
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
        await axios.post("/auth/parents/", {
            username: formData.username,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            date_of_birth: formData.date_of_birth,
            address: formData.address,
            role: "parent",
            role_type: formData.role_type,
            students: formData.students,
        });

        setMessage("Parent created successfully.");

        setFormData({
            username: "",
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            date_of_birth: "",
            address: "",
            role_type: "mother",
            students: [],
        });
    } catch (error) {
        console.error(
            "Parent creation error:",
            error.response?.data
        );

        const errors = error.response?.data;

        if (errors) {
            if (typeof errors === "string") {
                setMessage(errors);
            } else if (errors.detail) {
                setMessage(errors.detail);
            } else {
                const errorMessages = Object.entries(errors)
                    .map(([field, messages]) => {
                        const messageText = Array.isArray(messages)
                            ? messages.join(", ")
                            : messages;

                        return `${field}: ${messageText}`;
                    })
                    .join(" | ");

                setMessage(errorMessages);
            }
        } else {
            setMessage("Failed to create parent.");
        }
    }
};

return (
    <div className="form-container">
        <h2>Add Parent</h2>

        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>
            <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
            />

            <input
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
            />

            <input
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
            />

            <input
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
            />

            <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
            />

            <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
            />

            <label>Parent Type</label>

            <select
                name="role_type"
                value={formData.role_type}
                onChange={handleChange}
            >
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="guardian">Guardian</option>
            </select>

            <label>Children</label>

            <select
                multiple
                value={formData.students}
                onChange={handleStudentChange}
            >
                {students.map((student) => (
                    <option
                        key={student.id}
                        value={student.id}
                    >
                        {student.student_name || "Unknown Student"}
                        {" — "}
                        {student.admission_number}
                    </option>
                ))}
            </select>

            <small>
                Hold Ctrl (Windows) or Command (Mac) to select multiple children.
            </small>

            <button type="submit">
                Create Parent
            </button>
        </form>
    </div>
);


};

export default ParentForm;



// import { useEffect, useState } from "react";

// import axios from "../../api/axios";

// import "../../Styles/form.css";

// const ParentForm = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     date_of_birth: "",
//     address: "",
//     role_type: "mother",
//     students: [],
//   });

//   const [message, setMessage] = useState("");

//   // ==========================================================
//   // LOAD STUDENTS
//   // ==========================================================

//   useEffect(() => {
//     axios
//       .get("/auth/students/")
//       .then((response) => {
//         setStudents(response.data);
//       })
//       .catch((error) => {
//         console.error(
//           "Error loading students:",
//           error.response?.data || error
//         );

//         setMessage("Failed to load students.");
//       });
//   }, []);

//   // ==========================================================
//   // HANDLE INPUT CHANGES
//   // ==========================================================

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // ==========================================================
//   // HANDLE STUDENT SELECTION
//   // ==========================================================

//   const handleStudentChange = (e) => {
//     const selected = Array.from(
//       e.target.selectedOptions,
//       (option) => Number(option.value)
//     );

//     setFormData({
//       ...formData,
//       students: selected,
//     });
//   };

//   // ==========================================================
//   // HANDLE FORM SUBMISSION
//   // ==========================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (loading) return;

//     setLoading(true);
//     setMessage("");

//     try {
//       await axios.post("/auth/parents/", {
//         username: formData.username,
//         password: formData.password,
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         phone_number: formData.phone_number,
//         date_of_birth: formData.date_of_birth || null,
//         address: formData.address,
//         role: "parent",
//         role_type: formData.role_type,
//         students: formData.students,
//       });

//       setMessage("Parent created successfully.");

//       // Reset form
//       setFormData({
//         username: "",
//         password: "",
//         first_name: "",
//         last_name: "",
//         email: "",
//         phone_number: "",
//         date_of_birth: "",
//         address: "",
//         role_type: "mother",
//         students: [],
//       });
//     } catch (error) {
//       console.error(
//         "Parent creation error:",
//         error.response?.data || error
//       );

//       const data = error.response?.data;

//       // Django returned a plain text error
//       if (typeof data === "string") {
//         setMessage(data);
//       }

//       // Django returned {"detail": "..."}
//       else if (data?.detail) {
//         setMessage(data.detail);
//       }

//       // Django REST Framework returned field errors
//       else if (data && typeof data === "object") {
//         const errorMessages = Object.entries(data)
//           .map(([field, messages]) => {
//             const messageText = Array.isArray(messages)
//               ? messages.join(", ")
//               : String(messages);

//             return `${field}: ${messageText}`;
//           })
//           .join(" | ");

//         setMessage(errorMessages);
//       }

//       // Unknown error
//       else {
//         setMessage("Failed to create parent.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================================
//   // FORM
//   // ==========================================================

//   return (
//     <div className="form-container">
//       <h2>Add Parent</h2>

//       {message && <p>{message}</p>}

//       <form onSubmit={handleSubmit}>

//         {/* Username */}
//         <input
//           name="username"
//           placeholder="Username"
//           value={formData.username}
//           onChange={handleChange}
//           required
//         />

//         {/* Password */}
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />

//         {/* First Name */}
//         <input
//           name="first_name"
//           placeholder="First Name"
//           value={formData.first_name}
//           onChange={handleChange}
//           required
//         />

//         {/* Last Name */}
//         <input
//           name="last_name"
//           placeholder="Last Name"
//           value={formData.last_name}
//           onChange={handleChange}
//           required
//         />

//         {/* Email */}
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//         />

//         {/* Phone Number */}
//         <input
//           name="phone_number"
//           placeholder="Phone Number"
//           value={formData.phone_number}
//           onChange={handleChange}
//         />

//         {/* Date of Birth */}
//         <input
//           type="date"
//           name="date_of_birth"
//           value={formData.date_of_birth}
//           onChange={handleChange}
//         />

//         {/* Address */}
//         <textarea
//           name="address"
//           placeholder="Address"
//           value={formData.address}
//           onChange={handleChange}
//         />

//         {/* Parent Type */}
//         <label>Parent Type</label>

//         <select
//           name="role_type"
//           value={formData.role_type}
//           onChange={handleChange}
//         >
//           <option value="mother">Mother</option>
//           <option value="father">Father</option>
//           <option value="guardian">Guardian</option>
//         </select>

//         {/* Children */}
//         <label>Children</label>

//         <select
//           multiple
//           value={formData.students}
//           onChange={handleStudentChange}
//         >
//           {students.map((student) => (
//             <option
//               key={student.id}
//               value={student.id}
//             >
//               {student.admission_number}
//             </option>
//           ))}
//         </select>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading}
//         >
//           {loading ? "Creating Parent..." : "Create Parent"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default ParentForm;



