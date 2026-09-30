import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const TimetableForm = () => {
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);

    const [formData, setFormData] = useState({
        subject: "",
        teacher: "",
        school_class: "",
        day: "",
        start_time: "",
        end_time: "",
    });

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // LOAD SUBJECTS, TEACHERS AND CLASSES
    // ==========================================================
    useEffect(() => {
        const loadData = async () => {
            try {
                const [subjectsResponse, teachersResponse, classesResponse] =
                    await Promise.all([
                        axios.get("/academics/subjects/"),
                        axios.get("/auth/teachers/"),
                        axios.get("/academics/classes/"),
                    ]);

                setSubjects(subjectsResponse.data);
                setTeachers(teachersResponse.data);
                setClasses(classesResponse.data);
            } catch (error) {
                console.error("Error loading timetable data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // ==========================================================
    // GET SELECTED SUBJECT
    // ==========================================================
    const selectedSubject = subjects.find(
        (subject) => String(subject.id) === String(formData.subject)
    );

    // ==========================================================
    // FILTER TEACHERS BASED ON SELECTED SUBJECT
    // ==========================================================
    const availableTeachers = selectedSubject
        ? teachers.filter((teacher) =>
              (selectedSubject.teachers || []).some(
                  (teacherId) =>
                      String(teacherId) === String(teacher.id)
              )
          )
        : [];

    // ==========================================================
    // HANDLE FORM CHANGES
    // ==========================================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        // If subject changes, clear the teacher because
        // the previously selected teacher may not teach
        // the newly selected subject.
        if (name === "subject") {
            setFormData({
                ...formData,
                subject: value,
                teacher: "",
            });

            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // ==========================================================
    // SUBMIT
    // ==========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Make sure a teacher is actually assigned to
        // the selected subject.
        if (!selectedSubject) {
            alert("Please select a subject.");
            return;
        }

        const teacherIsAssigned = availableTeachers.some(
            (teacher) =>
                String(teacher.id) === String(formData.teacher)
        );

        if (!teacherIsAssigned) {
            alert(
                "Please select a teacher who is assigned to the selected subject."
            );
            return;
        }

        try {
            await axios.post(
                "/academics/timetable/",
                formData
            );

            alert("Timetable entry saved successfully.");

            setFormData({
                subject: "",
                teacher: "",
                school_class: "",
                day: "",
                start_time: "",
                end_time: "",
            });
        } catch (error) {
            console.error(
                "Timetable creation error:",
                error.response?.data || error
            );

            const errorData = error.response?.data;

            if (typeof errorData === "object") {
                const messages = Object.entries(errorData)
                    .map(([field, message]) => {
                        const formattedMessage = Array.isArray(message)
                            ? message.join(", ")
                            : message;

                        return `${field}: ${formattedMessage}`;
                    })
                    .join("\n");

                alert(
                    messages ||
                        "Failed to save timetable entry."
                );
            } else {
                alert(
                    "Failed to save timetable entry."
                );
            }
        }
    };

    // ==========================================================
    // LOADING
    // ==========================================================
    if (loading) {
        return (
            <div className="form-container">
                <h2>Add Timetable Entry</h2>
                <p>Loading timetable data...</p>
            </div>
        );
    }

    // ==========================================================
    // FORM
    // ==========================================================
    return (
        <div className="form-container">
            <h2>Add Timetable Entry</h2>

            <form onSubmit={handleSubmit}>

                {/* ==================================================
                    SUBJECT
                ================================================== */}
                <label>Subject</label>

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


                {/* ==================================================
                    TEACHER
                ================================================== */}
                <label>Teacher</label>

                <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    required
                    disabled={!formData.subject}
                >
                    <option value="">
                        {!formData.subject
                            ? "Select Subject First"
                            : availableTeachers.length === 0
                            ? "No Teacher Assigned"
                            : "Select Teacher"}
                    </option>

                    {availableTeachers.map((teacher) => (
                        <option
                            key={teacher.id}
                            value={teacher.id}
                        >
                            {teacher.name ||
                                `${teacher.first_name || ""} ${
                                    teacher.last_name || ""
                                }`.trim() ||
                                teacher.user?.name ||
                                teacher.user?.username ||
                                "Unnamed Teacher"}
                        </option>
                    ))}
                </select>

                {/* Inform admin if the subject has no teacher */}
                {formData.subject &&
                    availableTeachers.length === 0 && (
                        <small
                            style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#c0392b",
                            }}
                        >
                            No teacher has been assigned to this
                            subject yet.
                        </small>
                    )}


                {/* ==================================================
                    CLASS
                ================================================== */}
                <label>Class</label>

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
                                `${cls.grade_name || ""} ${
                                    cls.name || ""
                                }`.trim() ||
                                cls.name}
                        </option>
                    ))}
                </select>


                {/* ==================================================
                    DAY
                ================================================== */}
                <label>Day</label>
                

                <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                        Select Day
                    </option>

                    <option value="mon">Monday</option>
                    <option value="tue">Tuesday</option>
                    <option value="wed">Wednesday</option>
                    <option value="thu">Thursday</option>
                    <option value="fri">Friday</option>
                </select>

                {/* ==================================================
                    START TIME
                ================================================== */}
                <label>Start Time</label>

                <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                />


                {/* ==================================================
                    END TIME
                ================================================== */}
                <label>End Time</label>

                <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                />


                {/* ==================================================
                    SAVE
                ================================================== */}
                <button
                    type="submit"
                    disabled={
                        !formData.subject ||
                        !formData.teacher ||
                        availableTeachers.length === 0
                    }
                >
                    Save Timetable
                </button>

            </form>
        </div>
    );
};

export default TimetableForm;



