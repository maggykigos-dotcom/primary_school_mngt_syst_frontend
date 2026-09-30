import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const StudentForm = () => {
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    school_class: "",
  });

  // Load school classes
  useEffect(() => {
    axios
      .get("/academics/classes/")
      .then((response) => {
        setClasses(response.data);
      })
      .catch((error) => {
        console.error("Failed to load classes:", error);
        setMessage("Failed to load school classes.");
      });
  }, []);

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (submitting) {
      return;
    }

    setMessage("");
    setSubmitting(true);

    try {
      const response = await axios.post("/auth/students/", {
        username: formData.username.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        date_of_birth: formData.date_of_birth || null,
        address: formData.address.trim(),
        school_class: formData.school_class
          ? Number(formData.school_class)
          : null,
      });

      console.log("Student created:", response.data);

      setMessage("Student created successfully.");

      setFormData({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
        school_class: "",
      });
    } catch (error) {
      console.error(
        "Student creation error:",
        error.response?.data || error
      );

      const errorData = error.response?.data;

      if (errorData && typeof errorData === "object") {
        const messages = Object.entries(errorData)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(", ")}`;
            }

            return `${field}: ${errors}`;
          })
          .join(" | ");

        setMessage(messages || "Failed to create student.");
      } else {
        setMessage("Failed to create student.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add Student</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
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
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        />

        <label>Date of Birth</label>

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

        <label>School Class</label>

        <select
          name="school_class"
          value={formData.school_class}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Class
          </option>

          {classes.map((schoolClass) => (
            <option
              key={schoolClass.id}
              value={schoolClass.id}
            >
              {schoolClass.grade_name
                ? `${schoolClass.grade_name} - ${schoolClass.name}`
                : schoolClass.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating Student..." : "Create Student"}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;



// import { useEffect, useState } from "react";
// import axios from "../../api/axios";
// import "../../Styles/form.css";

// const StudentForm = () => {
//   const [classes, setClasses] = useState([]);

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//     date_of_birth: "",
//     address: "",
//     school_class: "",
//   });

//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     axios
//       .get("/academics/classes/")
//       .then((response) => {
//         setClasses(response.data);
//       })
//       .catch((error) => {
//         console.error("Failed to load classes:", error);
//       });
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       await axios.post("/auth/students/", {
//         username: formData.username,
//         password: formData.password,
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         phone_number: formData.phone_number,
//         date_of_birth: formData.date_of_birth || null,
//         address: formData.address,
//         school_class: formData.school_class,
//       });

//       setMessage("Student created successfully.");

//       setFormData({
//         username: "",
//         password: "",
//         first_name: "",
//         last_name: "",
//         email: "",
//         phone_number: "",
//         date_of_birth: "",
//         address: "",
//         school_class: "",
//       });
//     } catch (error) {
//       console.error("Student creation error:", error.response?.data || error);

//       const errorData = error.response?.data;

//       if (errorData) {
//         setMessage(
//           typeof errorData === "object"
//             ? Object.entries(errorData)
//                 .map(([field, errors]) => `${field}: ${errors}`)
//                 .join(" | ")
//             : "Failed to create student."
//         );
//       } else {
//         setMessage("Failed to create student.");
//       }
//     }
//   };

//   return (
//     <div className="form-container">
//       <h2>Add Student</h2>

//       {message && <p>{message}</p>}

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
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
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

//         <label>Date of Birth</label>

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

//         <label>School Class</label>

//         <select
//           name="school_class"
//           value={formData.school_class}
//           onChange={handleChange}
//           required
//         >
//           <option value="">
//             Select Class
//           </option>

//           {classes.map((schoolClass) => (
//             <option
//               key={schoolClass.id}
//               value={schoolClass.id}
//             >
//               {schoolClass.grade_name
//                 ? `${schoolClass.grade_name} - ${schoolClass.name}`
//                 : schoolClass.name}
//             </option>
//           ))}
//         </select>

//         <button type="submit">
//           Create Student
//         </button>
//       </form>
//     </div>
//   );
// };

// export default StudentForm;