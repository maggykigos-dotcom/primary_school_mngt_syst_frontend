import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const AssignmentForm = () => {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attachment, setAttachment] = useState(null);

    const [formData, setFormData] = useState({
        teacher: "",
        subject: "",
        school_class: "",
        title: "",
        description: "",
        due_date: "",
        max_marks: 100,
    });

    useEffect(() => {
        axios
            .get("/auth/teachers/")
            .then((res) => {
                setTeachers(
                    Array.isArray(res.data)
                        ? res.data
                        : res.data.results || []
                );
            })
            .catch((error) => {
                console.error(
                    "Error loading teachers:",
                    error
                );
            });

        axios
            .get("/academics/subjects/")
            .then((res) => {
                setSubjects(
                    Array.isArray(res.data)
                        ? res.data
                        : res.data.results || []
                );
            })
            .catch((error) => {
                console.error(
                    "Error loading subjects:",
                    error
                );
            });

        axios
            .get("/academics/classes/")
            .then((res) => {
                setClasses(
                    Array.isArray(res.data)
                        ? res.data
                        : res.data.results || []
                );
            })
            .catch((error) => {
                console.error(
                    "Error loading classes:",
                    error
                );
            });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();

            data.append("teacher", formData.teacher);
            data.append("subject", formData.subject);
            data.append(
                "school_class",
                formData.school_class
            );
            data.append("title", formData.title);
            data.append(
                "description",
                formData.description
            );
            data.append(
                "due_date",
                formData.due_date
            );
            data.append(
                "max_marks",
                formData.max_marks
            );

            if (attachment) {
                data.append(
                    "attachment",
                    attachment
                );
            }

            await axios.post(
                "/academics/assignments/",
                data,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            alert(
                "Assignment created successfully."
            );

            setFormData({
                teacher: "",
                subject: "",
                school_class: "",
                title: "",
                description: "",
                due_date: "",
                max_marks: 100,
            });

            setAttachment(null);

            // Reset file input
            document.getElementById(
                "assignment-file"
            ).value = "";

        } catch (error) {
            console.error(
                "Assignment creation error:",
                error.response?.data || error
            );

            alert(
                JSON.stringify(
                    error.response?.data ||
                    "Failed to create assignment."
                )
            );
        }
    };

    return (
        <div className="form-container">

            <h2>Create Assignment</h2>

            <form onSubmit={handleSubmit}>

                {/* TEACHER */}
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
                                "Unnamed Teacher"}
                        </option>
                    ))}
                </select>

                {/* SUBJECT */}
                <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Subject
                    </option>

                    {subjects.map((subject) => (
                        <option
                            key={subject.id}
                            value={subject.id}
                        >
                            {subject.name}
                        </option>
                    ))}
                </select>

                {/* CLASS */}
                <select
                    name="school_class"
                    value={formData.school_class}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Class
                    </option>

                    {classes.map((cls) => (
                        <option
                            key={cls.id}
                            value={cls.id}
                        >
                            {cls.class_name ||
                                `${cls.grade_name || ""} ${cls.name}`.trim() ||
                                cls.name}
                        </option>
                    ))}
                </select>

                {/* TITLE */}
                <input
                    type="text"
                    name="title"
                    placeholder="Assignment title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                {/* DESCRIPTION */}
                <textarea
                    name="description"
                    placeholder="Enter assignment instructions, questions or requirements..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                />

                {/* FILE */}
                <label htmlFor="assignment-file">
                    Upload Assignment
                </label>

                <input
                    id="assignment-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                />

                {attachment && (
                    <p>
                        Selected file:{" "}
                        <strong>
                            {attachment.name}
                        </strong>
                    </p>
                )}

                {/* DUE DATE */}
                <label>
                    Due Date
                </label>

                <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                />

                {/* MAX MARKS */}
                <label>
                    Maximum Marks
                </label>

                <input
                    type="number"
                    name="max_marks"
                    min="1"
                    value={formData.max_marks}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Create Assignment
                </button>

            </form>
        </div>
    );
};

export default AssignmentForm;



// import { useEffect, useState } from "react";
// import axios from "../../api/axios";
// import "../../Styles/form.css";

// const AssignmentForm = () => {
//     const [teachers, setTeachers] = useState([]);
//     const [subjects, setSubjects] = useState([]);
//     const [classes, setClasses] = useState([]);

//     const [formData, setFormData] = useState({
//         teacher: "",
//         subject: "",
//         school_class: "",
//         title: "",
//         description: "",
//         due_date: "",
//     });

//     useEffect(() => {
//         // Load teachers
//         axios
//             .get("/auth/teachers/")
//             .then((res) => {
//                 setTeachers(res.data);
//             })
//             .catch((error) => {
//                 console.error("Error loading teachers:", error);
//             });

//         // Load subjects
//         axios
//             .get("/academics/subjects/")
//             .then((res) => {
//                 setSubjects(res.data);
//             })
//             .catch((error) => {
//                 console.error("Error loading subjects:", error);
//             });

//         // Load classes
//         axios
//             .get("/academics/classes/")
//             .then((res) => {
//                 setClasses(res.data);
//             })
//             .catch((error) => {
//                 console.error("Error loading classes:", error);
//             });
//     }, []);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             await axios.post(
//                 "/academics/assignments/",
//                 formData
//             );

//             alert("Assignment created successfully.");

//             // Clear form after successful creation
//             setFormData({
//                 teacher: "",
//                 subject: "",
//                 school_class: "",
//                 title: "",
//                 description: "",
//                 due_date: "",
//             });
//         } catch (error) {
//             console.error(
//                 "Assignment creation error:",
//                 error.response?.data || error
//             );

//             alert(
//                 error.response?.data?.detail ||
//                 "Failed to create assignment."
//             );
//         }
//     };

//     return (
//         <div className="form-container">
//             <h2>Create Assignment</h2>

//             <form onSubmit={handleSubmit}>

//                 {/* TEACHER */}
//                 <select
//                     name="teacher"
//                     value={formData.teacher}
//                     onChange={handleChange}
//                     required
//                 >
//                     <option value="">
//                         Select Teacher
//                     </option>

//                     {teachers.map((teacher) => (
//                         <option
//                             key={teacher.id}
//                             value={teacher.id}
//                         >
//                             {teacher.name || "Unnamed Teacher"}
//                         </option>
//                     ))}
//                 </select>

//                 {/* SUBJECT */}
//                 <select
//                     name="subject"
//                     value={formData.subject}
//                     onChange={handleChange}
//                     required
//                 >
//                     <option value="">
//                         Select Subject
//                     </option>

//                     {subjects.map((subject) => (
//                         <option
//                             key={subject.id}
//                             value={subject.id}
//                         >
//                             {subject.name}
//                         </option>
//                     ))}
//                 </select>

//                 {/* SCHOOL CLASS */}
//                 <select
//                     name="school_class"
//                     value={formData.school_class}
//                     onChange={handleChange}
//                     required
//                 >
//                     <option value="">
//                         Select Class
//                     </option>

//                     {classes.map((cls) => (
//                         <option
//                             key={cls.id}
//                             value={cls.id}
//                         >
//                             {cls.class_name ||
//                                 `${cls.grade_name || ""} ${cls.name}`.trim() ||
//                                 cls.name}
//                         </option>
//                     ))}
//                 </select>

//                 {/* TITLE */}
//                 <input
//                     name="title"
//                     placeholder="Assignment title"
//                     value={formData.title}
//                     onChange={handleChange}
//                     required
//                 />

//                 {/* DESCRIPTION */}
//                 <textarea
//                     name="description"
//                     placeholder="Assignment description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     required
//                 />

//                 {/* DUE DATE */}
//                 <input
//                     type="date"
//                     name="due_date"
//                     value={formData.due_date}
//                     onChange={handleChange}
//                     required
//                 />

//                 <button type="submit">
//                     Create Assignment
//                 </button>

//             </form>
//         </div>
//     );
// };

// export default AssignmentForm;



