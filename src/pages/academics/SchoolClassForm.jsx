import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const SchoolClassForm = () => {
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [formData, setFormData] = useState({
        grade: "",
        teacher: "",
        name: "",
    });

    useEffect(() => {
        // Load grades
        axios
            .get("/academics/grades/")
            .then((res) => {
                setGrades(res.data);
            })
            .catch((error) => {
                console.error("Error loading grades:", error);
            });

        // Load teachers
        axios
            .get("/auth/teachers/")
            .then((res) => {
                setTeachers(res.data);
            })
            .catch((error) => {
                console.error("Error loading teachers:", error);
            });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "/academics/classes/",
                formData
            );

            alert("School class created successfully.");

            // Reset form
            setFormData({
                grade: "",
                teacher: "",
                name: "",
            });
        } catch (error) {
            console.error(
                "School class creation error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to create school class."
            );
        }
    };

    return (
        <div className="form-container">
            <h2>Add School Class</h2>

            <form onSubmit={handleSubmit}>

                {/* GRADE */}
                <label>Grade</label>

                <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Grade
                    </option>

                    {grades.map((grade) => (
                        <option
                            key={grade.id}
                            value={grade.id}
                        >
                            {grade.name}
                        </option>
                    ))}
                </select>

                {/* TEACHER */}
                <label>Teacher</label>

                <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Teacher
                    </option>

                    {teachers.map((teacher) => (
                        <option
                            key={teacher.id}
                            value={teacher.id}
                        >
                            {teacher.name ||
                                `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
                                "Unnamed Teacher"}
                        </option>
                    ))}
                </select>

                {/* CLASS NAME */}
                <label>Class Name</label>

                <select
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Class
                    </option>

                    <option value="A">
                        A
                    </option>

                    <option value="B">
                        B
                    </option>

                    <option value="C">
                        C
                    </option>
                </select>

                <button type="submit">
                    Create Class
                </button>

            </form>
        </div>
    );
};

export default SchoolClassForm;





// import { useEffect, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import "../../Styles/form.css";

// import {
//   getGrades,
//   createClass,
// } from "../../api/academicsAPI";

// import API from "../../api/axios";

// const SchoolClassForm = () => {
//   const [grades, setGrades] = useState([]);
//   const [teachers, setTeachers] = useState([]);

//   const [formData, setFormData] = useState({
//     grade: "",
//     teacher: "",
//     name: "",
//   });

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const gradeResponse = await getGrades();

//         const gradeData = Array.isArray(gradeResponse.data)
//           ? gradeResponse.data
//           : gradeResponse.data?.results || [];

//         setGrades(gradeData);

//         const teacherResponse = await API.get("auth/teachers/");

//         const teacherData = Array.isArray(teacherResponse.data)
//           ? teacherResponse.data
//           : teacherResponse.data?.results || [];

//         setTeachers(teacherData);
//       } catch (error) {
//         console.error("Failed to load grades or teachers:", error);
//       }
//     };

//     loadData();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       await createClass(formData);

//       alert("Class created successfully.");

//       setFormData({
//         grade: "",
//         teacher: "",
//         name: "",
//       });
//     } catch (error) {
//       console.error("Failed to create class:", error);

//       const message =
//         error.response?.data
//           ? JSON.stringify(error.response.data)
//           : "Failed to create class.";

//       alert(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="form-container">
//         <h2>Add School Class</h2>

//         <form onSubmit={handleSubmit}>
//           <label>Grade</label>

//           <select
//             name="grade"
//             value={formData.grade}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Grade</option>

//             {grades.map((grade) => (
//               <option
//                 key={grade.id}
//                 value={grade.id}
//               >
//                 {grade.name}
//               </option>
//             ))}
//           </select>

//           <label>Teacher</label>

//           <select
//             name="teacher"
//             value={formData.teacher}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Teacher</option>

//             {teachers.map((teacher) => (
//               <option
//                 key={teacher.id}
//                 value={teacher.id}
//               >
//                 {teacher.user?.first_name ||
//                   teacher.first_name ||
//                   ""}{" "}
//                 {teacher.user?.last_name ||
//                   teacher.last_name ||
//                   ""}
//               </option>
//             ))}
//           </select>

//           <label>Class Name</label>

//           <input
//             type="text"
//             name="name"
//             placeholder="A"
//             maxLength="10"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />

//           <button
//             type="submit"
//             disabled={loading}
//           >
//             {loading ? "Creating..." : "Create Class"}
//           </button>
//         </form>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default SchoolClassForm;


