import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const SubjectForm = () => {
    const [grades, setGrades] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        grades: [],
        teachers: [],
        is_for_all_grades: false,
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
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleGradesChange = (e) => {
        const selectedGrades = Array.from(
            e.target.selectedOptions,
            (option) => Number(option.value)
        );

        setFormData({
            ...formData,
            grades: selectedGrades,
        });
    };

    const handleTeachersChange = (e) => {
        const selectedTeachers = Array.from(
            e.target.selectedOptions,
            (option) => Number(option.value)
        );

        setFormData({
            ...formData,
            teachers: selectedTeachers,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "/academics/subjects/",
                formData
            );

            alert("Subject created successfully.");

            setFormData({
                name: "",
                grades: [],
                teachers: [],
                is_for_all_grades: false,
            });
        } catch (error) {
            console.error(
                "Subject creation error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to create subject."
            );
        }
    };

    return (
        <div className="form-container">
            <h2>Add Subject</h2>

            <form onSubmit={handleSubmit}>

                {/* SUBJECT NAME */}
                <label>Subject Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="Enter subject name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* GRADES */}
                <label>Grades</label>

                <select
                    multiple
                    name="grades"
                    value={formData.grades}
                    onChange={handleGradesChange}
                    disabled={formData.is_for_all_grades}
                >
                    {grades.map((grade) => (
                        <option
                            key={grade.id}
                            value={grade.id}
                        >
                            {grade.name}
                        </option>
                    ))}
                </select>

                {/* TEACHERS */}
                <label>Teachers</label>

                <select
                    multiple
                    name="teachers"
                    value={formData.teachers}
                    onChange={handleTeachersChange}
                >
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

                {/* ALL GRADES */}
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="is_for_all_grades"
                        checked={formData.is_for_all_grades}
                        onChange={handleChange}
                    />

                    Subject is for all grades
                </label>

                <button type="submit">
                    Create Subject
                </button>

            </form>
        </div>
    );
};

export default SubjectForm;





// import { useEffect, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import "../../Styles/form.css";

// import {
//   getGrades,
//   createSubject,
// } from "../../api/academicsAPI";

// import API from "../../api/axios";

// const SubjectForm = () => {
//   const [grades, setGrades] = useState([]);
//   const [teachers, setTeachers] = useState([]);

//   const [formData, setFormData] = useState({
//     name: "",
//     grades: [],
//     school_classes: [],
//     teachers: [],
//     is_for_all: false,
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
//         console.error("Failed to load subject data:", error);
//       }
//     };

//     loadData();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleMultiSelect = (e) => {
//     const values = Array.from(
//       e.target.selectedOptions,
//       (option) => Number(option.value)
//     );

//     setFormData({
//       ...formData,
//       [e.target.name]: values,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       await createSubject(formData);

//       alert("Subject created successfully.");

//       setFormData({
//         name: "",
//         grades: [],
//         school_classes: [],
//         teachers: [],
//         is_for_all: false,
//       });
//     } catch (error) {
//       console.error("Failed to create subject:", error);

//       const message =
//         error.response?.data
//           ? JSON.stringify(error.response.data)
//           : "Failed to create subject.";

//       alert(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="form-container">
//         <h2>Add Subject</h2>

//         <form onSubmit={handleSubmit}>
//           <label>Subject Name</label>

//           <input
//             name="name"
//             placeholder="Mathematics"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />

//           <label>Grades</label>

//           <select
//             name="grades"
//             multiple
//             value={formData.grades}
//             onChange={handleMultiSelect}
//             disabled={formData.is_for_all}
//           >
//             {grades.map((grade) => (
//               <option
//                 key={grade.id}
//                 value={grade.id}
//               >
//                 {grade.name}
//               </option>
//             ))}
//           </select>

//           <label>Teachers</label>

//           <select
//             name="teachers"
//             multiple
//             value={formData.teachers}
//             onChange={handleMultiSelect}
//           >
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

//           <label>
//             <input
//               type="checkbox"
//               name="is_for_all"
//               checked={formData.is_for_all}
//               onChange={handleChange}
//             />

//             Subject is for all grades
//           </label>

//           <button
//             type="submit"
//             disabled={loading}
//           >
//             {loading ? "Creating..." : "Create Subject"}
//           </button>
//         </form>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default SubjectForm;


