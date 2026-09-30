import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

import {
    getAssignments,
    getQuizQuestions,
} from "../../api/academicsAPI.js";

import "./StudentQuiz.css";


function StudentQuiz() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [assignment, setAssignment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const loadQuiz = async () => {
            try {
                setLoading(true);
                setError("");

                // Only students can view quizzes
                if (!user || user.role !== "student") {
                    setError("Only students can view this quiz.");
                    return;
                }

                // Get assignments
                const assignmentsResponse = await getAssignments();

                const assignments =
                    Array.isArray(assignmentsResponse)
                        ? assignmentsResponse
                        : assignmentsResponse?.results || [];

                // Find selected assignment
                const selectedAssignment = assignments.find(
                    (item) =>
                        String(item.id) === String(assignmentId)
                );

                if (!selectedAssignment) {
                    setError("Assignment not found.");
                    return;
                }

                setAssignment(selectedAssignment);

                // Get quiz questions
                const questionsResponse =
                    await getQuizQuestions(assignmentId);

                const quizQuestions =
                    Array.isArray(questionsResponse)
                        ? questionsResponse
                        : questionsResponse?.results || [];

                setQuestions(quizQuestions);

            } catch (err) {
                console.error("Failed to load quiz:", err);

                setError(
                    "Unable to load the quiz. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [assignmentId, user]);


    /*
     * ---------------------------------------------------------
     * FALLBACK QUESTIONS
     * ---------------------------------------------------------
     *
     * Your current assignment has the 10 questions inside
     * the description instead of QuizQuestion records.
     *
     * This parser allows those questions to still appear nicely
     * on the student's page.
     */
    const descriptionQuestions = useMemo(() => {
        if (!assignment?.description) {
            return [];
        }

        const text = assignment.description
            .replace(/\r\n/g, "\n")
            .trim();

        /*
         * Look for:
         *
         * 1. Question...
         * A. ...
         * B. ...
         * C. ...
         * D. ...
         *
         * 2. Question...
         */

        const questionMatches = [
            ...text.matchAll(
                /(?:^|\n|\s)(\d+)\.\s+([\s\S]*?)(?=(?:\n|\s)\d+\.\s+|$)/g
            ),
        ];

        if (questionMatches.length === 0) {
            return [];
        }

        const parsed = [];

        questionMatches.forEach((match, index) => {
            const questionNumber = match[1];
            let content = match[2].trim();

            const optionA = content.match(
                /(?:^|\s)A\.\s*([\s\S]*?)(?=\s+B\.\s*|$)/
            );

            const optionB = content.match(
                /(?:^|\s)B\.\s*([\s\S]*?)(?=\s+C\.\s*|$)/
            );

            const optionC = content.match(
                /(?:^|\s)C\.\s*([\s\S]*?)(?=\s+D\.\s*|$)/
            );

            const optionD = content.match(
                /(?:^|\s)D\.\s*([\s\S]*)$/
            );

            let questionText = content;

            if (optionA) {
                questionText = content
                    .split(/(?:^|\s)A\.\s*/)[0]
                    .trim();
            }

            parsed.push({
                id: `description-${questionNumber}-${index}`,
                question: questionText,
                option_a: optionA
                    ? optionA[1].trim()
                    : "",
                option_b: optionB
                    ? optionB[1].trim()
                    : "",
                option_c: optionC
                    ? optionC[1].trim()
                    : "",
                option_d: optionD
                    ? optionD[1].trim()
                    : "",
            });
        });

        return parsed;
    }, [assignment]);


    /*
     * Use real QuizQuestion records when available.
     * Otherwise use questions found inside description.
     */
    const displayQuestions =
        questions.length > 0
            ? questions
            : descriptionQuestions;


    /*
     * Remove the numbered quiz questions from the description
     * so they aren't displayed twice.
     */
    const cleanDescription = useMemo(() => {
        if (!assignment?.description) {
            return "Answer the questions in your exercise book.";
        }

        let text = assignment.description.trim();

        // Remove numbered question section
        text = text.replace(
            /(?:^|\n|\s)1\.\s+[\s\S]*$/i,
            ""
        ).trim();

        /*
         * Remove common instruction text if it exists at
         * the end of the description.
         */
        text = text
            .replace(
                /Instructions[\s\S]*$/i,
                ""
            )
            .trim();

        if (!text) {
            return "Read each question carefully and choose the correct answer.";
        }

        return text;
    }, [assignment]);


    // Loading
    if (loading) {
        return (
            <DashboardLayout>
                <div className="student-quiz-page">
                    <div className="quiz-loading">
                        <div className="loading-spinner">
                            ⏳
                        </div>

                        <h2>Loading your quiz...</h2>

                        <p>
                            Please wait while we prepare your questions.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }


    // Error
    if (error) {
        return (
            <DashboardLayout>
                <div className="student-quiz-page">

                    <button
                        className="quiz-back-button"
                        onClick={() => navigate("/assignments")}
                    >
                        ← Back to Assignments
                    </button>

                    <div className="quiz-error">
                        <div className="error-icon">
                            ⚠️
                        </div>

                        <h2>Oops!</h2>

                        <p>{error}</p>

                        <button
                            className="error-back-button"
                            onClick={() =>
                                navigate("/assignments")
                            }
                        >
                            Return to Assignments
                        </button>
                    </div>

                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout>

            <div className="student-quiz-page">

                {/* Back button */}
                <button
                    className="quiz-back-button"
                    onClick={() => navigate("/assignments")}
                >
                    <span>←</span>
                    Back to Assignments
                </button>


                {/* Hero Header */}
                <section className="quiz-hero">

                    <div className="quiz-hero-icon">
                        📝
                    </div>

                    <div className="quiz-hero-content">

                        <div className="quiz-label">
                            ENGLISH QUIZ
                        </div>

                        <h1>
                            {assignment?.title || "English Quiz"}
                        </h1>

                        <p>
                            {cleanDescription}
                        </p>

                    </div>

                    <div className="quiz-hero-decoration">
                        ✏️
                    </div>

                </section>


                {/* Quiz information */}
                <section className="quiz-details">

                    <div className="quiz-info-card subject-info">
                        <div className="quiz-info-icon">
                            📚
                        </div>

                        <div>
                            <span>Subject</span>
                            <strong>
                                {assignment?.subject_name || "—"}
                            </strong>
                        </div>
                    </div>


                    <div className="quiz-info-card grade-info">
                        <div className="quiz-info-icon">
                            🎓
                        </div>

                        <div>
                            <span>Grade</span>
                            <strong>
                                {assignment?.grade_name || "—"}
                            </strong>
                        </div>
                    </div>


                    <div className="quiz-info-card class-info">
                        <div className="quiz-info-icon">
                            🏫
                        </div>

                        <div>
                            <span>Class</span>
                            <strong>
                                {assignment?.class_name || "—"}
                            </strong>
                        </div>
                    </div>


                    <div className="quiz-info-card questions-info">
                        <div className="quiz-info-icon">
                            ❓
                        </div>

                        <div>
                            <span>Questions</span>
                            <strong>
                                {displayQuestions.length}
                            </strong>
                        </div>
                    </div>

                </section>


                {/* Instructions */}
                <section className="quiz-instructions">

                    <div className="instructions-icon">
                        💡
                    </div>

                    <div className="instructions-content">

                        <h2>
                            Instructions
                        </h2>

                        <p className="instructions-intro">
                            Read each question carefully before choosing
                            your answer.
                        </p>

                        <div className="instructions-list">

                            <div className="instruction-item">
                                <span>1</span>
                                <p>
                                    Copy the questions into your
                                    exercise book.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>2</span>
                                <p>
                                    Copy all the answer choices
                                    A, B, C and D.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>3</span>
                                <p>
                                    Choose the correct answer for
                                    each question.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>4</span>
                                <p>
                                    Write your answers in your
                                    exercise book.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <span>5</span>
                                <p>
                                    Do not submit your answers online.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>


                {/* Questions heading */}
                {displayQuestions.length > 0 && (
                    <section className="questions-section">

                        <div className="questions-section-header">

                            <div>
                                <span className="section-kicker">
                                    TEST YOUR KNOWLEDGE
                                </span>

                                <h2>
                                    Quiz Questions
                                </h2>

                                <p>
                                    Choose the best answer for each question.
                                </p>
                            </div>

                            <div className="question-count-badge">
                                <strong>
                                    {displayQuestions.length}
                                </strong>
                                <span>
                                    Questions
                                </span>
                            </div>

                        </div>


                        {/* Questions */}
                        <div className="quiz-questions">

                            {displayQuestions.map((quiz, index) => (

                                <article
                                    className="quiz-question-card"
                                    key={quiz.id || index}
                                >

                                    {/* Question top */}
                                    <div className="question-card-top">

                                        <div className="question-number">
                                            <span>
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="question-title">
                                            <span>
                                                Question {index + 1}
                                            </span>

                                            <h3>
                                                {quiz.question}
                                            </h3>
                                        </div>

                                    </div>


                                    {/* Answer choices */}
                                    <div className="quiz-options">

                                        <div className="quiz-option option-a">
                                            <span className="option-letter">
                                                A
                                            </span>

                                            <p>
                                                {quiz.option_a || "—"}
                                            </p>
                                        </div>


                                        <div className="quiz-option option-b">
                                            <span className="option-letter">
                                                B
                                            </span>

                                            <p>
                                                {quiz.option_b || "—"}
                                            </p>
                                        </div>


                                        <div className="quiz-option option-c">
                                            <span className="option-letter">
                                                C
                                            </span>

                                            <p>
                                                {quiz.option_c || "—"}
                                            </p>
                                        </div>


                                        <div className="quiz-option option-d">
                                            <span className="option-letter">
                                                D
                                            </span>

                                            <p>
                                                {quiz.option_d || "—"}
                                            </p>
                                        </div>

                                    </div>


                                    {/* Physical answer area */}
                                    <div className="write-answer">

                                        <span className="answer-icon">
                                            ✍️
                                        </span>

                                        <div>
                                            <strong>
                                                Your Answer
                                            </strong>

                                            <p>
                                                Write A, B, C or D in your
                                                exercise book.
                                            </p>
                                        </div>

                                        <div className="answer-line">
                                            __________________
                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>

                    </section>
                )}


                {/* No questions */}
                {displayQuestions.length === 0 && (

                    <div className="no-quiz">

                        <div className="no-quiz-icon">
                            📚
                        </div>

                        <h2>
                            No quiz questions yet
                        </h2>

                        <p>
                            Your teacher has not added questions
                            to this assignment yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/assignments")
                            }
                        >
                            ← Back to Assignments
                        </button>

                    </div>

                )}


                {/* Footer */}
                {displayQuestions.length > 0 && (

                    <section className="quiz-footer">

                        <div className="footer-icon">
                            🌟
                        </div>

                        <div>
                            <h3>
                                You can do it!
                            </h3>

                            <p>
                                Take your time, read every question
                                carefully and choose the best answer.
                            </p>
                        </div>

                    </section>

                )}

            </div>

        </DashboardLayout>
    );
}

export default StudentQuiz;



// import { useContext, useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout.jsx";
// import { AuthContext } from "../../context/AuthContext.jsx";

// import {
//     getAssignments,
//     getQuizQuestions,
// } from "../../api/academicsAPI.js";

// import "./StudentQuiz.css";


// function StudentQuiz() {
//     const { assignmentId } = useParams();
//     const navigate = useNavigate();

//     const { user } = useContext(AuthContext);

//     const [assignment, setAssignment] = useState(null);
//     const [questions, setQuestions] = useState([]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");


//     useEffect(() => {
//         const loadQuiz = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 // Only students can view the quiz
//                 if (!user || user.role !== "student") {
//                     setError(
//                         "Only students can view this quiz."
//                     );
//                     return;
//                 }

//                 // Get assignments
//                 const assignmentsResponse =
//                     await getAssignments();

//                 const assignments =
//                     Array.isArray(assignmentsResponse)
//                         ? assignmentsResponse
//                         : assignmentsResponse?.results || [];

//                 // Find the selected assignment
//                 const selectedAssignment =
//                     assignments.find(
//                         (item) =>
//                             String(item.id) ===
//                             String(assignmentId)
//                     );

//                 if (!selectedAssignment) {
//                     setError("Assignment not found.");
//                     return;
//                 }

//                 setAssignment(selectedAssignment);


//                 // Get quiz questions
//                 const questionsResponse =
//                     await getQuizQuestions(assignmentId);

//                 const quizQuestions =
//                     Array.isArray(questionsResponse)
//                         ? questionsResponse
//                         : questionsResponse?.results || [];

//                 setQuestions(quizQuestions);

//             } catch (err) {
//                 console.error(
//                     "Failed to load quiz:",
//                     err
//                 );

//                 setError(
//                     "Unable to load the quiz. Please try again."
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadQuiz();
//     }, [assignmentId, user]);


//     // Loading
//     if (loading) {
//         return (
//             <DashboardLayout>
//                 <div className="student-quiz-page">
//                     <div className="quiz-loading">
//                         Loading quiz...
//                     </div>
//                 </div>
//             </DashboardLayout>
//         );
//     }


//     // Error
//     if (error) {
//         return (
//             <DashboardLayout>
//                 <div className="student-quiz-page">

//                     <button
//                         className="quiz-back-button"
//                         onClick={() =>
//                             navigate("/assignments")
//                         }
//                     >
//                         ← Back to Assignments
//                     </button>

//                     <div className="quiz-error">
//                         {error}
//                     </div>

//                 </div>
//             </DashboardLayout>
//         );
//     }


//     return (
//         <DashboardLayout>

//             <div className="student-quiz-page">

//                 {/* Back button */}
//                 <button
//                     className="quiz-back-button"
//                     onClick={() =>
//                         navigate("/assignments")
//                     }
//                 >
//                     ← Back to Assignments
//                 </button>


//                 {/* Quiz header */}
//                 <div className="quiz-header">

//                     <div>

//                         <span className="quiz-label">
//                             QUIZ
//                         </span>

//                         <h1>
//                             {assignment?.title}
//                         </h1>

//                         <p>
//                             {assignment?.description ||
//                                 "Answer the questions in your exercise book."}
//                         </p>

//                     </div>

//                 </div>


//                 {/* Assignment information */}
//                 <div className="quiz-details">

//                     <div>
//                         <strong>Subject</strong>

//                         <span>
//                             {assignment?.subject_name || "—"}
//                         </span>
//                     </div>


//                     <div>
//                         <strong>Grade</strong>

//                         <span>
//                             {assignment?.grade_name || "—"}
//                         </span>
//                     </div>


//                     <div>
//                         <strong>Class</strong>

//                         <span>
//                             {assignment?.class_name || "—"}
//                         </span>
//                     </div>


//                     <div>
//                         <strong>Questions</strong>

//                         <span>
//                             {questions.length}
//                         </span>
//                     </div>

//                 </div>


//                 {/* Instructions */}
//                 <div className="quiz-instructions">

//                     <h2>
//                         Instructions
//                     </h2>

//                     <ul>

//                         <li>
//                             Copy the questions into
//                             your exercise book.
//                         </li>

//                         <li>
//                             Copy all the answer choices
//                             A, B, C and D.
//                         </li>

//                         <li>
//                             Choose the correct answer
//                             for each question.
//                         </li>

//                         <li>
//                             Write your answers in your
//                             exercise book.
//                         </li>

//                         <li>
//                             Do not submit your answers
//                             online.
//                         </li>

//                     </ul>

//                 </div>


//                 {/* No questions */}
//                 {questions.length === 0 ? (

//                     <div className="no-quiz">

//                         <h2>
//                             No quiz questions yet
//                         </h2>

//                         <p>
//                             Your teacher has not added
//                             questions to this assignment yet.
//                         </p>

//                     </div>

//                 ) : (

//                     /* Questions */
//                     <div className="quiz-questions">

//                         {questions.map((quiz, index) => (

//                             <div
//                                 className="quiz-question-card"
//                                 key={quiz.id}
//                             >

//                                 <div className="question-number">
//                                     Question {index + 1}
//                                 </div>


//                                 <h2>
//                                     {quiz.question}
//                                 </h2>


//                                 {/* Answer choices */}
//                                 <div className="quiz-options">

//                                     <div className="quiz-option">
//                                         <span>A.</span>

//                                         <p>
//                                             {quiz.option_a}
//                                         </p>
//                                     </div>


//                                     <div className="quiz-option">
//                                         <span>B.</span>

//                                         <p>
//                                             {quiz.option_b}
//                                         </p>
//                                     </div>


//                                     <div className="quiz-option">
//                                         <span>C.</span>

//                                         <p>
//                                             {quiz.option_c}
//                                         </p>
//                                     </div>


//                                     <div className="quiz-option">
//                                         <span>D.</span>

//                                         <p>
//                                             {quiz.option_d}
//                                         </p>
//                                     </div>

//                                 </div>


//                                 {/* Physical answer line */}
//                                 <div className="write-answer">
//                                     Answer: ____________________
//                                 </div>

//                             </div>

//                         ))}

//                     </div>

//                 )}


//                 {/* Footer */}
//                 {questions.length > 0 && (

//                     <div className="quiz-footer">

//                         <h3>
//                             Remember
//                         </h3>

//                         <p>
//                             Copy the quiz into your
//                             exercise book and write
//                             your answers there.
//                         </p>

//                     </div>

//                 )}

//             </div>

//         </DashboardLayout>
//     );
// }


// export default StudentQuiz;

