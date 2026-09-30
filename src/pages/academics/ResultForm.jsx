import {
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import axios from "../../api/axios";

import { AuthContext } from "../../context/AuthContext";

import "../../Styles/form.css";

const ResultForm = () => {
    // ==========================================================
    // AUTHENTICATED USER
    // ==========================================================

    const { user } = useContext(AuthContext);

    const userRole = user?.role || "";

    const isAdmin = userRole === "admin";
    const isTeacher = userRole === "teacher";

    // ==========================================================
    // STATE
    // ==========================================================

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        grade: "",
        school_class: "",
        student: "",
        subject: "",
        term: "",
        session: "",
        marks: "",
    });

    // ==========================================================
    // LOAD DATA
    // ==========================================================

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                // ------------------------------------------------
                // All users need students and subjects.
                // Admin also needs grades and classes.
                // ------------------------------------------------

                const requests = [
                    axios.get("/auth/students/"),
                    axios.get("/academics/subjects/"),
                ];

                if (isAdmin) {
                    requests.push(
                        axios.get("/academics/grades/")
                    );

                    requests.push(
                        axios.get("/academics/classes/")
                    );
                }

                const responses =
                    await Promise.all(requests);

                const studentsResponse =
                    responses[0];

                const subjectsResponse =
                    responses[1];

                // ------------------------------------------------
                // STUDENTS
                // ------------------------------------------------

                const studentsData =
                    Array.isArray(
                        studentsResponse.data
                    )
                        ? studentsResponse.data
                        : studentsResponse.data?.results || [];

                setStudents(studentsData);

                // ------------------------------------------------
                // SUBJECTS
                // ------------------------------------------------

                const subjectsData =
                    Array.isArray(
                        subjectsResponse.data
                    )
                        ? subjectsResponse.data
                        : subjectsResponse.data?.results || [];

                setSubjects(subjectsData);

                // ------------------------------------------------
                // ADMIN ONLY: GRADES
                // ------------------------------------------------

                if (isAdmin) {
                    const gradesResponse =
                        responses[2];

                    const gradesData =
                        Array.isArray(
                            gradesResponse.data
                        )
                            ? gradesResponse.data
                            : gradesResponse.data?.results || [];

                    setGrades(gradesData);

                    // ------------------------------------------------
                    // ADMIN ONLY: CLASSES
                    // ------------------------------------------------

                    const classesResponse =
                        responses[3];

                    const classesData =
                        Array.isArray(
                            classesResponse.data
                        )
                            ? classesResponse.data
                            : classesResponse.data?.results || [];

                    setClasses(classesData);

                    console.log(
                        "Grades loaded:",
                        gradesData
                    );

                    console.log(
                        "Classes loaded:",
                        classesData
                    );
                }

                console.log(
                    "Students loaded:",
                    studentsData
                );

                console.log(
                    "Subjects loaded:",
                    subjectsData
                );
            } catch (err) {
                console.error(
                    "Error loading result form data:",
                    err.response?.data || err
                );

                setError(
                    "Unable to load result form data. " +
                    "Please check that the backend is running and you are logged in."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAdmin]);

    // ==========================================================
    // GET STUDENT CLASS
    // ==========================================================

    const getStudentClass = (student) => {
        if (!student) {
            return null;
        }

        if (
            student.school_class &&
            typeof student.school_class === "object"
        ) {
            return student.school_class;
        }

        if (student.school_class_id) {
            return student.school_class_id;
        }

        return student.school_class || null;
    };

    // ==========================================================
    // GET STUDENT CLASS ID
    // ==========================================================

    const getStudentClassId = (student) => {
        if (!student) {
            return "";
        }

        if (student.school_class_id) {
            return String(
                student.school_class_id
            );
        }

        if (
            student.school_class &&
            typeof student.school_class === "object"
        ) {
            return String(
                student.school_class.id || ""
            );
        }

        if (student.school_class) {
            return String(
                student.school_class
            );
        }

        return "";
    };

    // ==========================================================
    // GET CLASS GRADE ID
    // ==========================================================

    const getClassGradeId = (schoolClass) => {
        if (!schoolClass) {
            return "";
        }

        if (
            schoolClass.grade !== undefined &&
            schoolClass.grade !== null
        ) {
            if (
                typeof schoolClass.grade === "object"
            ) {
                return String(
                    schoolClass.grade.id || ""
                );
            }

            return String(
                schoolClass.grade
            );
        }

        if (schoolClass.grade_id) {
            return String(
                schoolClass.grade_id
            );
        }

        return "";
    };

    // ==========================================================
    // GET CLASS GRADE NAME
    // ==========================================================

    const getClassGradeName = (schoolClass) => {
        if (!schoolClass) {
            return "";
        }

        if (schoolClass.grade_name) {
            return schoolClass.grade_name;
        }

        if (
            schoolClass.grade &&
            typeof schoolClass.grade === "object"
        ) {
            return (
                schoolClass.grade.name || ""
            );
        }

        return "";
    };

    // ==========================================================
    // GET CLASS NAME
    // ==========================================================

    const getClassName = (schoolClass) => {
        if (!schoolClass) {
            return "Class not assigned";
        }

        if (schoolClass.class_name) {
            return schoolClass.class_name;
        }

        if (schoolClass.name) {
            return schoolClass.name;
        }

        return "Class not assigned";
    };

    // ==========================================================
    // GET FULL CLASS DISPLAY
    // ==========================================================

    const getFullClassName = (schoolClass) => {
        if (!schoolClass) {
            return "Class not assigned";
        }

        const gradeName =
            getClassGradeName(schoolClass);

        const className =
            getClassName(schoolClass);

        if (
            gradeName &&
            className &&
            !className.startsWith(
                gradeName
            )
        ) {
            return `${gradeName} - ${className}`;
        }

        return className;
    };

    // ==========================================================
    // GET STUDENT CLASS NAME
    // ==========================================================

    const getStudentClassName = (student) => {
        if (!student) {
            return "Class not assigned";
        }

        if (student.school_class_name) {
            return student.school_class_name;
        }

        if (student.class_name) {
            if (student.grade_name) {
                return `${student.grade_name} - ${student.class_name}`;
            }

            return student.class_name;
        }

        const studentClass =
            getStudentClass(student);

        if (
            studentClass &&
            typeof studentClass === "object"
        ) {
            const gradeName =
                getClassGradeName(
                    studentClass
                );

            const className =
                getClassName(studentClass);

            if (
                gradeName &&
                className &&
                !className.startsWith(
                    gradeName
                )
            ) {
                return `${gradeName} - ${className}`;
            }

            return (
                className ||
                gradeName ||
                "Class not assigned"
            );
        }

        if (
            student.grade_name &&
            student.class_name
        ) {
            return `${student.grade_name} - ${student.class_name}`;
        }

        if (student.grade_name) {
            return student.grade_name;
        }

        return "Class not assigned";
    };

    // ==========================================================
    // GET STUDENT GRADE ID
    // ==========================================================

    const getStudentGradeId = useCallback(
        (student) => {
            if (!student) {
                return "";
            }

            // Direct grade_id
            if (student.grade_id) {
                return String(
                    student.grade_id
                );
            }

            // Grade object
            if (
                student.grade &&
                typeof student.grade === "object"
            ) {
                return String(
                    student.grade.id || ""
                );
            }

            // Direct grade value
            if (
                student.grade !== undefined &&
                student.grade !== null &&
                typeof student.grade !== "object"
            ) {
                return String(
                    student.grade
                );
            }

            // Get grade from student's school class
            const studentClass =
                getStudentClass(student);

            if (
                studentClass &&
                typeof studentClass === "object"
            ) {
                return getClassGradeId(
                    studentClass
                );
            }

            // Match student's class ID against loaded classes
            const classId =
                getStudentClassId(student);

            if (classId) {
                const matchedClass =
                    classes.find(
                        (schoolClass) =>
                            String(
                                schoolClass.id
                            ) === String(classId)
                    );

                if (matchedClass) {
                    return getClassGradeId(
                        matchedClass
                    );
                }
            }

            return "";
        },
        [classes]
    );

    // ==========================================================
    // GET STUDENT NAME
    // ==========================================================

    const getStudentName = (student) => {
        if (!student) {
            return "Unnamed Student";
        }

        if (student.student_name) {
            return student.student_name;
        }

        if (student.user_name) {
            return student.user_name;
        }

        if (student.user?.full_name) {
            return student.user.full_name;
        }

        if (
            student.user?.first_name ||
            student.user?.last_name
        ) {
            return `${student.user?.first_name || ""} ${
                student.user?.last_name || ""
            }`.trim();
        }

        if (
            student.first_name ||
            student.last_name
        ) {
            return `${student.first_name || ""} ${
                student.last_name || ""
            }`.trim();
        }

        return "Unnamed Student";
    };

    // ==========================================================
    // ADMIN: FILTER CLASSES BY GRADE
    // ==========================================================

    const filteredClasses = useMemo(() => {
        if (!isAdmin || !formData.grade) {
            return [];
        }

        return classes.filter(
            (schoolClass) =>
                String(
                    getClassGradeId(
                        schoolClass
                    )
                ) ===
                String(formData.grade)
        );
    }, [
        isAdmin,
        classes,
        formData.grade,
    ]);

    // ==========================================================
    // ADMIN: FILTER STUDENTS BY GRADE + CLASS
    // ==========================================================

    const filteredAdminStudents = useMemo(() => {
        let filtered = [...students];

        // ------------------------------------------------------
        // Grade
        // ------------------------------------------------------

        if (formData.grade) {
            filtered = filtered.filter(
                (student) =>
                    String(
                        getStudentGradeId(
                            student
                        )
                    ) ===
                    String(formData.grade)
            );
        }

        // ------------------------------------------------------
        // Class
        // ------------------------------------------------------

        if (formData.school_class) {
            filtered = filtered.filter(
                (student) =>
                    String(
                        getStudentClassId(
                            student
                        )
                    ) ===
                    String(
                        formData.school_class
                    )
            );
        }

        return filtered;
    }, [
        students,
        formData.grade,
        formData.school_class,
        getStudentGradeId,
    ]);

    // ==========================================================
    // TEACHER STUDENTS
    // ==========================================================
    //
    // Teachers do not select Grade or School Class.
    //
    // The student's class is already attached to the student.
    //
    // The backend remains responsible for determining what
    // students the teacher is allowed to work with.
    //
    // ==========================================================

    const teacherStudents = useMemo(() => {
        return students;
    }, [students]);

    // ==========================================================
    // STUDENTS DISPLAYED IN FORM
    // ==========================================================

    const availableStudents = isAdmin
        ? filteredAdminStudents
        : teacherStudents;

    // ==========================================================
    // CALCULATE EXAM GRADE
    // ==========================================================

    const calculateGrade = (marks) => {
        const numericMarks = Number(
            marks
        );

        if (
            marks === "" ||
            Number.isNaN(numericMarks)
        ) {
            return "";
        }

        if (numericMarks >= 80) {
            return "A";
        }

        if (numericMarks >= 70) {
            return "B";
        }

        if (numericMarks >= 60) {
            return "C";
        }

        if (numericMarks >= 50) {
            return "D";
        }

        return "E";
    };

    // ==========================================================
    // CURRENT EXAM GRADE
    // ==========================================================

    const currentGrade =
        calculateGrade(
            formData.marks
        );

    // ==========================================================
    // HANDLE ADMIN GRADE CHANGE
    // ==========================================================

    const handleGradeChange = (e) => {
        const gradeId =
            e.target.value;

        setFormData((previous) => ({
            ...previous,

            grade: gradeId,

            // Grade changed, therefore class and student
            // must be selected again.
            school_class: "",
            student: "",
        }));

        setError("");
    };

    // ==========================================================
    // HANDLE ADMIN CLASS CHANGE
    // ==========================================================

    const handleClassChange = (e) => {
        const classId =
            e.target.value;

        setFormData((previous) => ({
            ...previous,

            school_class: classId,

            // Class changed, therefore student must be
            // selected again.
            student: "",
        }));

        setError("");
    };

    // ==========================================================
    // HANDLE STUDENT CHANGE
    // ==========================================================

    const handleStudentChange = (e) => {
        const studentId =
            e.target.value;

        setFormData((previous) => ({
            ...previous,
            student: studentId,
        }));

        setError("");
    };

    // ==========================================================
    // OTHER FIELD CHANGES
    // ==========================================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    // ==========================================================
    // SUBMIT RESULT
    // ==========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // ======================================================
        // ADMIN VALIDATION
        // ======================================================

        if (isAdmin) {
            if (!formData.grade) {
                setError(
                    "Please select a grade."
                );
                return;
            }

            if (!formData.school_class) {
                setError(
                    "Please select a school class."
                );
                return;
            }
        }

        // ======================================================
        // STUDENT VALIDATION
        // ======================================================

        if (!formData.student) {
            setError(
                "Please select a student."
            );
            return;
        }

        const selectedStudent =
            students.find(
                (student) =>
                    String(student.id) ===
                    String(formData.student)
            );

        if (!selectedStudent) {
            setError(
                "Please select a valid student."
            );
            return;
        }

        // ======================================================
        // ADMIN: VERIFY STUDENT CLASS
        // ======================================================

        if (isAdmin) {
            const selectedStudentClassId =
                getStudentClassId(
                    selectedStudent
                );

            if (
                String(
                    selectedStudentClassId
                ) !==
                String(
                    formData.school_class
                )
            ) {
                setError(
                    "The selected student does not belong to the selected school class."
                );
                return;
            }

            // --------------------------------------------------
            // Verify selected student's grade
            // --------------------------------------------------

            const selectedStudentGradeId =
                getStudentGradeId(
                    selectedStudent
                );

            if (
                selectedStudentGradeId &&
                String(
                    selectedStudentGradeId
                ) !==
                String(
                    formData.grade
                )
            ) {
                setError(
                    "The selected student does not belong to the selected grade."
                );
                return;
            }
        }

        // ======================================================
        // SUBJECT VALIDATION
        // ======================================================

        if (!formData.subject) {
            setError(
                "Please select a subject."
            );
            return;
        }

        // ======================================================
        // TERM VALIDATION
        // ======================================================

        if (!formData.term) {
            setError(
                "Please select a term."
            );
            return;
        }

        // ======================================================
        // SESSION VALIDATION
        // ======================================================

        if (!formData.session) {
            setError(
                "Please enter the session/year."
            );
            return;
        }

        // ======================================================
        // MARKS VALIDATION
        // ======================================================

        const marks =
            Number(formData.marks);

        if (
            Number.isNaN(marks) ||
            marks < 0 ||
            marks > 100
        ) {
            setError(
                "Marks must be between 0 and 100."
            );
            return;
        }

        // ======================================================
        // SUBMIT TO BACKEND
        // ======================================================

        try {
            setSaving(true);

            // --------------------------------------------------
            // IMPORTANT
            // --------------------------------------------------
            //
            // We intentionally send only:
            //
            // student
            // subject
            // term
            // session
            // marks
            //
            // Django determines:
            //
            // school_class = student.school_class
            //
            // and calculates:
            //
            // A / B / C / D / E
            //
            // Grade is therefore not manually submitted.
            // --------------------------------------------------

            const resultData = {
                student:
                    formData.student,

                subject:
                    formData.subject,

                term:
                    formData.term,

                session:
                    formData.session,

                marks: marks,
            };

            console.log(
                "Submitting result:",
                resultData
            );

            await axios.post(
                "/academics/results/",
                resultData
            );

            // --------------------------------------------------
            // Success message
            // --------------------------------------------------

            alert(
                `Result saved successfully.\n\n` +
                `Student: ${getStudentName(
                    selectedStudent
                )}\n` +
                `Class: ${getStudentClassName(
                    selectedStudent
                )}\n` +
                `Marks: ${marks}\n` +
                `Grade: ${currentGrade}`
            );

            // --------------------------------------------------
            // Reset form
            // --------------------------------------------------

            setFormData({
                grade: "",
                school_class: "",
                student: "",
                subject: "",
                term: "",
                session: "",
                marks: "",
            });
        } catch (err) {
            console.error(
                "Result creation error:",
                err.response?.data || err
            );

            const errorData =
                err.response?.data;

            // ==================================================
            // PERMISSION ERROR
            // ==================================================

            if (
                err.response?.status === 403
            ) {
                setError(
                    errorData?.detail ||
                    "You do not have permission to enter exam results."
                );

                return;
            }

            // ==================================================
            // VALIDATION ERRORS
            // ==================================================

            if (
                typeof errorData === "object" &&
                errorData !== null
            ) {
                const messages =
                    Object.entries(
                        errorData
                    )
                        .map(
                            ([field, message]) => {
                                const formattedMessage =
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                            ", "
                                        )
                                        : String(
                                            message
                                        );

                                return `${field}: ${formattedMessage}`;
                            }
                        )
                        .join("\n");

                setError(
                    messages ||
                    "Failed to save result."
                );

                return;
            }

            setError(
                "Failed to save result."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <div className="form-container">
                <h2>Enter Exam Result</h2>

                <p>
                    Loading result form...
                </p>
            </div>
        );
    }

    // ==========================================================
    // SELECTED STUDENT
    // ==========================================================

    const selectedStudent =
        students.find(
            (student) =>
                String(student.id) ===
                String(formData.student)
        );

    // ==========================================================
    // UNKNOWN ROLE
    // ==========================================================

    if (!isAdmin && !isTeacher) {
        return (
            <div className="form-container">
                <h2>Enter Exam Result</h2>

                <div className="error-message">
                    You do not have permission
                    to enter exam results.
                </div>
            </div>
        );
    }

    // ==========================================================
    // FORM
    // ==========================================================

    return (
        <div className="form-container">

            <h2>Enter Exam Result</h2>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div
                    className="error-message"
                    style={{
                        whiteSpace: "pre-line",
                        marginBottom: "15px",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                {/* ==================================================
                    ADMIN ONLY: GRADE
                ================================================== */}

                {isAdmin && (
                    <>
                        <label
                            htmlFor="grade"
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginBottom: "6px",
                            }}
                        >
                            Grade
                        </label>

                        <select
                            id="grade"
                            name="grade"
                            value={
                                formData.grade
                            }
                            onChange={
                                handleGradeChange
                            }
                            required
                        >
                            <option value="">
                                Select Grade
                            </option>

                            {grades.map(
                                (grade) => (
                                    <option
                                        key={
                                            grade.id
                                        }
                                        value={
                                            grade.id
                                        }
                                    >
                                        {
                                            grade.name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </>
                )}

                {/* ==================================================
                    ADMIN ONLY: SCHOOL CLASS
                ================================================== */}

                {isAdmin && (
                    <>
                        <label
                            htmlFor="school_class"
                            style={{
                                display: "block",
                                fontWeight: "600",
                                marginTop: "12px",
                                marginBottom: "6px",
                            }}
                        >
                            School Class
                        </label>

                        <select
                            id="school_class"
                            name="school_class"
                            value={
                                formData.school_class
                            }
                            onChange={
                                handleClassChange
                            }
                            disabled={
                                !formData.grade
                            }
                            required
                        >
                            <option value="">
                                {!formData.grade
                                    ? "Select Grade First"
                                    : filteredClasses.length ===
                                      0
                                    ? "No Classes Available"
                                    : "Select School Class"}
                            </option>

                            {filteredClasses.map(
                                (
                                    schoolClass
                                ) => (
                                    <option
                                        key={
                                            schoolClass.id
                                        }
                                        value={
                                            schoolClass.id
                                        }
                                    >
                                        {getFullClassName(
                                            schoolClass
                                        )}
                                    </option>
                                )
                            )}
                        </select>
                    </>
                )}

                {/* ==================================================
                    STUDENT
                ================================================== */}

                <label
                    htmlFor="student"
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginTop: isAdmin
                            ? "12px"
                            : "0",
                        marginBottom: "6px",
                    }}
                >
                    Student
                </label>

                <select
                    id="student"
                    name="student"
                    value={
                        formData.student
                    }
                    onChange={
                        handleStudentChange
                    }
                    disabled={
                        isAdmin &&
                        !formData.school_class
                    }
                    required
                >
                    <option value="">
                        {isAdmin &&
                        !formData.school_class
                            ? "Select School Class First"
                            : availableStudents.length ===
                              0
                            ? "No Students Available"
                            : "Select Student"}
                    </option>

                    {availableStudents.map(
                        (student) => (
                            <option
                                key={
                                    student.id
                                }
                                value={
                                    student.id
                                }
                            >
                                {getStudentName(
                                    student
                                )}

                                {student.admission_number
                                    ? ` - ${student.admission_number}`
                                    : ""}
                            </option>
                        )
                    )}
                </select>

                {/* ==================================================
                    SELECTED STUDENT INFORMATION
                ================================================== */}

                {selectedStudent && (
                    <div
                        style={{
                            marginTop: "10px",
                            marginBottom: "15px",
                            padding:
                                "10px 12px",
                            borderRadius:
                                "6px",
                            backgroundColor:
                                "#eef6ff",
                            border:
                                "1px solid #cfe3ff",
                        }}
                    >
                        <strong>
                            Student Class:
                        </strong>{" "}
                        {getStudentClassName(
                            selectedStudent
                        )}

                        <div
                            style={{
                                fontSize:
                                    "12px",
                                marginTop:
                                    "4px",
                                color:
                                    "#555",
                            }}
                        >
                            The student's
                            class is
                            automatically
                            saved by
                            the backend.
                        </div>
                    </div>
                )}

                {/* ==================================================
                    SUBJECT
                ================================================== */}

                <label
                    htmlFor="subject"
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginTop: "12px",
                        marginBottom: "6px",
                    }}
                >
                    Subject
                </label>

                <select
                    id="subject"
                    name="subject"
                    value={
                        formData.subject
                    }
                    onChange={
                        handleChange
                    }
                    required
                >
                    <option value="">
                        Select Subject
                    </option>

                    {subjects.map(
                        (subject) => (
                            <option
                                key={
                                    subject.id
                                }
                                value={
                                    subject.id
                                }
                            >
                                {
                                    subject.name
                                }
                            </option>
                        )
                    )}
                </select>

                {/* ==================================================
                    TERM
                ================================================== */}

                <label
                    htmlFor="term"
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginTop: "12px",
                        marginBottom: "6px",
                    }}
                >
                    Term
                </label>

                <select
                    id="term"
                    name="term"
                    value={
                        formData.term
                    }
                    onChange={
                        handleChange
                    }
                    required
                >
                    <option value="">
                        Select Term
                    </option>

                    <option value="Term 1">
                        Term 1
                    </option>

                    <option value="Term 2">
                        Term 2
                    </option>

                    <option value="Term 3">
                        Term 3
                    </option>
                </select>

                {/* ==================================================
                    SESSION / YEAR
                ================================================== */}

                <label
                    htmlFor="session"
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginTop: "12px",
                        marginBottom: "6px",
                    }}
                >
                    Session / Year
                </label>

                <input
                    id="session"
                    type="text"
                    name="session"
                    placeholder="e.g. 2026"
                    value={
                        formData.session
                    }
                    onChange={
                        handleChange
                    }
                    required
                />

                {/* ==================================================
                    MARKS
                ================================================== */}

                <label
                    htmlFor="marks"
                    style={{
                        display: "block",
                        fontWeight: "600",
                        marginTop: "12px",
                        marginBottom: "6px",
                    }}
                >
                    Marks
                </label>

                <input
                    id="marks"
                    type="number"
                    name="marks"
                    placeholder="Enter marks (0 - 100)"
                    min="0"
                    max="100"
                    value={
                        formData.marks
                    }
                    onChange={
                        handleChange
                    }
                    required
                />

                {/* ==================================================
                    AUTOMATIC EXAM GRADE
                ================================================== */}

                <div
                    style={{
                        marginTop: "12px",
                        marginBottom: "15px",
                    }}
                >
                    <label
                        htmlFor="calculated-grade"
                        style={{
                            display: "block",
                            fontWeight: "600",
                            marginBottom: "6px",
                        }}
                    >
                        Exam Grade
                    </label>

                    <input
                        id="calculated-grade"
                        type="text"
                        value={
                            currentGrade ||
                            "Grade will appear after entering marks"
                        }
                        readOnly
                        style={{
                            backgroundColor:
                                "#f3f4f6",
                            cursor:
                                "not-allowed",
                            fontWeight:
                                currentGrade
                                    ? "700"
                                    : "400",
                            fontSize:
                                currentGrade
                                    ? "18px"
                                    : "14px",
                        }}
                    />
                </div>

                {/* ==================================================
                    SAVE RESULT
                ================================================== */}

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Saving Result..."
                        : "Save Result"}
                </button>

            </form>
        </div>
    );
};

export default ResultForm;

