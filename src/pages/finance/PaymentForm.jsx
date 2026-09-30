import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./PaymentForm.css";

const PaymentForm = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [fees, setFees] = useState([]);
    const [methods, setMethods] = useState([]);

    const [form, setForm] = useState({
        student_id: "",
        parent_id: "",
        fee_id: "",
        amount: "",
        method_id: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD DATA
    // ==========================================

    useEffect(() => {
        const loadData = async () => {
            try {
                const requests = [
                    API.get("auth/students/"),
                    API.get("finance/fees/"),
                    API.get("finance/payment-methods/"),
                ];

                if (user?.role === "admin") {
                    requests.push(API.get("auth/parents/"));
                }

                const responses = await Promise.all(requests);

                setStudents(responses[0].data);
                setFees(responses[1].data);
                setMethods(responses[2].data);

                if (user?.role === "admin") {
                    setParents(responses[3].data);
                }
            } catch (error) {
                console.error("Error loading payment data:", error);
                setError("Failed to load payment information.");
            } finally {
                setLoadingData(false);
            }
        };

        if (user) {
            loadData();
        }
    }, [user]);

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Clear fee when changing student
        if (name === "student_id") {
            setForm((previous) => ({
                ...previous,
                student_id: value,
                fee_id: "",
            }));
        }
    };

    // ==========================================
    // FILTER FEES FOR SELECTED STUDENT
    // ==========================================

    const studentFees = form.student_id
        ? fees.filter(
              (fee) =>
                  String(fee.student?.id) ===
                  String(form.student_id)
          )
        : [];

    // ==========================================
    // SUBMIT PAYMENT
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.student_id) {
            setError("Please select a student.");
            return;
        }

        if (user?.role === "admin" && !form.parent_id) {
            setError("Please select a parent.");
            return;
        }

        if (!form.fee_id) {
            setError("Please select a fee.");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setError("Please enter a valid payment amount.");
            return;
        }

        if (!form.method_id) {
            setError("Please select a payment method.");
            return;
        }

        try {
            setLoading(true);

            const paymentData = {
                student_id: Number(form.student_id),
                fee_id: Number(form.fee_id),
                amount: Number(form.amount),
                method_id: Number(form.method_id),
            };

            if (user?.role === "admin") {
                paymentData.parent_id = Number(form.parent_id);
            }

            await API.post(
                "finance/payments/",
                paymentData
            );

            navigate("/payments");
        } catch (error) {
            console.error("Payment error:", error);

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else if (data) {
                console.error("Backend validation error:", data);

                setError(
                    "Payment could not be created. Please check the entered information."
                );
            } else {
                setError("Payment could not be created.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DISPLAY
    // ==========================================

    return (
        <div className="form-page">
            <div className="form-card">

                <div className="form-header">
                    <h2>Record Payment</h2>
                    <p>
                        Record a school fee payment.
                    </p>
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* ================= STUDENT ================= */}

                    <div className="form-group">
                        <label htmlFor="student_id">
                            Student
                        </label>

                        <select
                            id="student_id"
                            name="student_id"
                            value={form.student_id}
                            onChange={handleChange}
                            disabled={loadingData}
                            required
                        >
                            <option value="">
                                {loadingData
                                    ? "Loading students..."
                                    : "Select student"}
                            </option>

                            {students.map((student) => (
                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.student_name ||
                                        student.name ||
                                        `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                                        student.username}
                                    {" — "}
                                    {student.admission_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ================= PARENT ================= */}

                    {user?.role === "admin" && (
                        <div className="form-group">
                            <label htmlFor="parent_id">
                                Parent
                            </label>

                            <select
                                id="parent_id"
                                name="parent_id"
                                value={form.parent_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select parent
                                </option>

                                {parents.map((parent) => (
                                    <option
                                        key={parent.id}
                                        value={parent.id}
                                    >
                                        {parent.name ||
                                            parent.username ||
                                            "Unnamed Parent"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* ================= FEE ================= */}

                    <div className="form-group">
                        <label htmlFor="fee_id">
                            Fee
                        </label>

                        <select
                            id="fee_id"
                            name="fee_id"
                            value={form.fee_id}
                            onChange={handleChange}
                            disabled={!form.student_id}
                            required
                        >
                            <option value="">
                                {form.student_id
                                    ? studentFees.length > 0
                                        ? "Select fee"
                                        : "No fees found for this student"
                                    : "Select student first"}
                            </option>

                            {studentFees.map((fee) => (
                                <option
                                    key={fee.id}
                                    value={fee.id}
                                >
                                    {fee.term || "Fee"}
                                    {" — "}
                                    Balance: KSh{" "}
                                    {fee.balance ?? fee.amount ?? 0}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ================= AMOUNT ================= */}

                    <div className="form-group">
                        <label htmlFor="amount">
                            Amount
                        </label>

                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="1"
                            step="0.01"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="Enter payment amount"
                            required
                        />
                    </div>

                    {/* ================= PAYMENT METHOD ================= */}

                    <div className="form-group">
                        <label htmlFor="method_id">
                            Payment Method
                        </label>

                        <select
                            id="method_id"
                            name="method_id"
                            value={form.method_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select payment method
                            </option>

                            {methods.map((method) => (
                                <option
                                    key={method.id}
                                    value={method.id}
                                >
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ================= ACTIONS ================= */}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/payments")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                loading ||
                                loadingData
                            }
                        >
                            {loading
                                ? "Processing..."
                                : "Record Payment"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PaymentForm;



// import { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";

// import API from "../../api/axios";
// import { AuthContext } from "../../context/AuthContext";

// import "./PaymentForm.css";

// const PaymentForm = () => {
//   const navigate = useNavigate();

//   const { user } = useContext(AuthContext);

//   const [students, setStudents] = useState([]);
//   const [parents, setParents] = useState([]);
//   const [fees, setFees] = useState([]);
//   const [methods, setMethods] = useState([]);

//   const [form, setForm] = useState({
//     student_id: "",
//     parent_id: "",
//     fee_id: "",
//     amount: "",
//     method_id: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);
//   const [error, setError] = useState("");

//   // ==============================
//   // LOAD DATA
//   // ==============================

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const requests = [
//           API.get("auth/students/"),
//           API.get("finance/fees/"),
//           API.get("finance/payment-methods/"),
//         ];

//         if (user?.role === "admin") {
//           requests.push(
//             API.get("auth/parents/")
//           );
//         }

//         const responses = await Promise.all(requests);

//         setStudents(responses[0].data);
//         setFees(responses[1].data);
//         setMethods(responses[2].data);

//         if (user?.role === "admin") {
//           setParents(responses[3].data);
//         }

//       } catch (error) {
//         console.error(error);
//         setError("Failed to load payment information.");
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     if (user) {
//       loadData();
//     }
//   }, [user]);

//   // ==============================
//   // HANDLE CHANGE
//   // ==============================

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   // ==============================
//   // FILTER FEES BY STUDENT
//   // ==============================

//   const studentFees = form.student_id
//     ? fees.filter(
//         (fee) =>
//           String(fee.student?.id) ===
//           String(form.student_id)
//       )
//     : [];

//   // ==============================
//   // SUBMIT
//   // ==============================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");

//     if (!form.student_id) {
//       setError("Please select a student.");
//       return;
//     }

//     if (user?.role === "admin" && !form.parent_id) {
//       setError("Please select a parent.");
//       return;
//     }

//     if (!form.fee_id) {
//       setError("Please select a fee.");
//       return;
//     }

//     if (!form.amount || Number(form.amount) <= 0) {
//       setError("Please enter a valid payment amount.");
//       return;
//     }

//     if (!form.method_id) {
//       setError("Please select a payment method.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const paymentData = {
//         student_id: Number(form.student_id),
//         fee_id: Number(form.fee_id),
//         amount: Number(form.amount),
//         method_id: Number(form.method_id),
//       };

//       // Parent is automatically determined by backend
//       if (user?.role === "admin") {
//         paymentData.parent_id = Number(
//           form.parent_id
//         );
//       }

//       await API.post(
//         "finance/payments/",
//         paymentData
//       );

//       navigate("/payments");

//     } catch (error) {
//       console.error(error);

//       const data = error.response?.data;

//       if (data?.detail) {
//         setError(data.detail);
//       } else if (data) {
//         setError(
//           "Payment could not be created. Please check the entered information."
//         );
//       } else {
//         setError("Payment could not be created.");
//       }

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-page">

//       <div className="form-card">

//         <div className="form-header">
//           <h2>Record Payment</h2>

//           <p>
//             Record a school fee payment.
//           </p>
//         </div>

//         {error && (
//           <div className="form-error">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>

//           {/* STUDENT */}

//           <div className="form-group">

//             <label htmlFor="student_id">
//               Student
//             </label>

//             <select
//               id="student_id"
//               name="student_id"
//               value={form.student_id}
//               onChange={handleChange}
//               disabled={loadingData}
//               required
//             >

//               <option value="">
//                  {loadingData
//                   ? "Loading students..."
//                   : "Select student"}
//               </option>

//               {students.map((student) => (
//                 <option
//                   key={student.id}
//                   value={student.id}
//                 >
                
//                   {student.student_name} — {student.admission_number}
//                 </option>
//               ))}

//             </select>

//           </div>

//           {/* PARENT — ADMIN ONLY */}

//           {user?.role === "admin" && (
//             <div className="form-group">

//               <label htmlFor="parent_id">
//                 Parent
//               </label>

//               <select
//                 id="parent_id"
//                 name="parent_id"
//                 value={form.parent_id}
//                 onChange={handleChange}
//                 required
//               >

//                 <option value="">
//                   Select parent
//                 </option>

//                 {parents.map((parent) => (
//                   <option
//                     key={parent.id}
//                     value={parent.id}
//                   >
//                     {parent.parent_name}
//                   </option>
//                 ))}

//               </select>

//             </div>
//           )}

//           {/* FEE */}

//           <div className="form-group">

//             <label htmlFor="fee_id">
//               Fee
//             </label>

//             <select
//               id="fee_id"
//               name="fee_id"
//               value={form.fee_id}
//               onChange={handleChange}
//               disabled={!form.student_id}
//               required
//             >

//               <option value="">
//                 {form.student_id
//                   ? "Select fee"
//                   : "Select student first"}
//               </option>

//               {studentFees.map((fee) => (
//                 <option
//                   key={fee.id}
//                   value={fee.id}
//                 >
//                   {fee.term} - Balance:
//                   {" "}
//                   KSh {fee.balance}
//                 </option>
//               ))}

//             </select>

//           </div>

//           {/* AMOUNT */}

//           <div className="form-group">

//             <label htmlFor="amount">
//               Amount
//             </label>

//             <input
//               id="amount"
//               name="amount"
//               type="number"
//               min="1"
//               step="0.01"
//               value={form.amount}
//               onChange={handleChange}
//               placeholder="Enter amount"
//               required
//             />

//           </div>

//           {/* PAYMENT METHOD */}

//           <div className="form-group">

//             <label htmlFor="method_id">
//               Payment Method
//             </label>

//             <select
//               id="method_id"
//               name="method_id"
//               value={form.method_id}
//               onChange={handleChange}
//               required
//             >

//               <option value="">
//                 Select payment method
//               </option>

//               {methods.map((method) => (
//                 <option
//                   key={method.id}
//                   value={method.id}
//                 >
//                   {method.name}
//                 </option>
//               ))}

//             </select>

//           </div>

//           {/* ACTIONS */}

//           <div className="form-actions">

//             <button
//               type="button"
//               className="btn btn-secondary"
//               onClick={() => navigate("/payments")}
//               disabled={loading}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={loading || loadingData}
//             >
//               {loading
//                 ? "Processing..."
//                 : "Record Payment"}
//             </button>

//           </div>

//         </form>

//       </div>

//     </div>
//   );
// };

// export default PaymentForm;