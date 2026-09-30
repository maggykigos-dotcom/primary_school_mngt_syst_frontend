import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import {
    getFees,
    initiateMpesaPayment,
} from "../../api/financeAPI";

import "./MpesaPayment.css";

const MpesaPayment = () => {
    const [fees, setFees] = useState([]);
    const [selectedFee, setSelectedFee] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==============================
    // LOAD FEES
    // ==============================
    useEffect(() => {
        const loadFees = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getFees();
                setFees(data || []);
            } catch (error) {
                console.error(
                    "Failed to load fee records:",
                    error
                );

                setError(
                    "Failed to load your children's fee records."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFees();
    }, []);

    // ==============================
    // SELECTED FEE
    // ==============================
    const selectedFeeData = fees.find(
        (fee) =>
            String(fee.id) === String(selectedFee)
    );

    // ==============================
    // FEE CHANGE
    // ==============================
    const handleFeeChange = (event) => {
        const feeId = event.target.value;

        setSelectedFee(feeId);
        setMessage("");
        setError("");
        setAmount("");
    };

    // ==============================
    // PAYMENT
    // ==============================
    const handlePayment = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!selectedFeeData) {
            setError("Please select a fee record.");
            return;
        }

        const paymentAmount = Number(amount);
        const balance = Number(
            selectedFeeData.balance || 0
        );

        if (paymentAmount <= 0) {
            setError(
                "Please enter a valid payment amount."
            );
            return;
        }

        if (paymentAmount > balance) {
            setError(
                `Payment cannot exceed the remaining balance of KSh ${balance.toLocaleString()}.`
            );
            return;
        }

        if (!phone) {
            setError(
                "Please enter your M-Pesa phone number."
            );
            return;
        }

        try {
            setPaying(true);

            const response =
                await initiateMpesaPayment({
                    student_id:
                        selectedFeeData.student?.id,

                    fee_id:
                        selectedFeeData.id,

                    amount: paymentAmount,

                    phone_number: phone,
                });

            setMessage(
                response.message ||
                    "Payment request sent. Check your phone for the M-Pesa prompt."
            );

            setAmount("");
        } catch (error) {
            console.error(
                "M-Pesa payment error:",
                error
            );

            const serverMessage =
                error.response?.data?.error ||
                error.response?.data?.detail;

            setError(
                serverMessage ||
                    "Unable to initiate the M-Pesa payment."
            );
        } finally {
            setPaying(false);
        }
    };

    // ==============================
    // LOADING
    // ==============================
    if (loading) {
        return (
            <DashboardLayout>
                <div className="mpesa-page">
                    <div className="mpesa-card">
                        <div className="mpesa-loading">
                            Loading fee records...
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mpesa-page">

                <div className="mpesa-card">

                    {/* HEADER */}
                    <div className="mpesa-header">

                        <div className="mpesa-icon">
                            M
                        </div>

                        <div>
                            <h1>M-Pesa Payment</h1>

                            <p>
                                Pay school fees securely
                                using M-Pesa.
                            </p>
                        </div>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mpesa-error">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {message && (
                        <div className="mpesa-success">
                            {message}
                        </div>
                    )}

                    {/* NO FEES */}
                    {fees.length === 0 ? (
                        <div className="mpesa-empty">
                            No fee records are available
                            for your children.
                        </div>
                    ) : (

                        <form
                            className="mpesa-form"
                            onSubmit={handlePayment}
                        >

                            {/* CHILD / FEE */}
                            <div className="mpesa-form-group">

                                <label htmlFor="fee">
                                    Select Child / Fee
                                </label>

                                <select
                                    id="fee"
                                    value={selectedFee}
                                    onChange={
                                        handleFeeChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select a child
                                    </option>

                                    {fees.map((fee) => (
                                        <option
                                            key={fee.id}
                                            value={fee.id}
                                        >
                                            {fee.student?.first_name}{" "}
                                            {fee.student?.last_name}
                                            {" — "}
                                            {fee.term}{" "}
                                            {fee.session}
                                            {" — Balance KSh "}
                                            {Number(
                                                fee.balance || 0
                                            ).toLocaleString()}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* FEE SUMMARY */}
                            {selectedFeeData && (
                                <div className="fee-summary">

                                    <div className="summary-title">
                                        Fee Summary
                                    </div>

                                    <div className="summary-row">
                                        <span>
                                            Student
                                        </span>

                                        <strong>
                                            {
                                                selectedFeeData
                                                    .student
                                                    ?.first_name
                                            }{" "}
                                            {
                                                selectedFeeData
                                                    .student
                                                    ?.last_name
                                            }
                                        </strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>
                                            Term
                                        </span>

                                        <strong>
                                            {
                                                selectedFeeData.term
                                            }{" "}
                                            {
                                                selectedFeeData.session
                                            }
                                        </strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>
                                            Total Fee
                                        </span>

                                        <strong>
                                            KSh{" "}
                                            {Number(
                                                selectedFeeData.total_amount ||
                                                    0
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>
                                            Already Paid
                                        </span>

                                        <strong>
                                            KSh{" "}
                                            {Number(
                                                selectedFeeData.amount_paid ||
                                                    0
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="summary-row balance-row">
                                        <span>
                                            Balance
                                        </span>

                                        <strong>
                                            KSh{" "}
                                            {Number(
                                                selectedFeeData.balance ||
                                                    0
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                </div>
                            )}

                            {/* AMOUNT */}
                            <div className="mpesa-form-group">

                                <label htmlFor="amount">
                                    Amount to Pay
                                </label>

                                <div className="amount-input">
                                    <span>KSh</span>

                                    <input
                                        id="amount"
                                        type="number"
                                        min="1"
                                        max={
                                            selectedFeeData
                                                ? selectedFeeData.balance
                                                : undefined
                                        }
                                        value={amount}
                                        onChange={(event) =>
                                            setAmount(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter amount"
                                        required
                                        disabled={
                                            !selectedFeeData
                                        }
                                    />
                                </div>

                            </div>

                            {/* PHONE */}
                            <div className="mpesa-form-group">

                                <label htmlFor="phone">
                                    M-Pesa Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="2547XXXXXXXX"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <small className="input-help">
                                    Enter the M-Pesa number
                                    that will receive the
                                    payment prompt.
                                </small>

                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                className="mpesa-submit"
                                disabled={
                                    paying ||
                                    !selectedFeeData
                                }
                            >
                                {paying
                                    ? "Sending payment request..."
                                    : "📱 Pay with M-Pesa"}
                            </button>

                            {/* INFORMATION */}
                            <div className="mpesa-info">

                                <strong>
                                    How it works
                                </strong>

                                <ol>
                                    <li>
                                        Select your child
                                        and fee.
                                    </li>

                                    <li>
                                        Enter the amount
                                        you want to pay.
                                    </li>

                                    <li>
                                        Enter your M-Pesa
                                        phone number.
                                    </li>

                                    <li>
                                        Click Pay with
                                        M-Pesa.
                                    </li>

                                    <li>
                                        Enter your M-Pesa
                                        PIN when prompted
                                        on your phone.
                                    </li>
                                </ol>

                            </div>

                        </form>
                    )}

                </div>

            </div>
        </DashboardLayout>
    );
};

export default MpesaPayment;



// import { useEffect, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

// import {
//   getFees,
//   initiateMpesaPayment,
// } from "../../api/financeAPI";

// import "./MpesaPayment.css";

// const MpesaPayment = () => {
//   const [fees, setFees] = useState([]);
//   const [selectedFee, setSelectedFee] = useState("");
//   const [amount, setAmount] = useState("");
//   const [phone, setPhone] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [paying, setPaying] = useState(false);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // Load fee records
//   useEffect(() => {
//     const loadFees = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getFees();

//         setFees(data || []);
//       } catch (error) {
//         console.error(
//           "Failed to load fee records:",
//           error
//         );

//         setError(
//           "Failed to load your children's fee records."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadFees();
//   }, []);

//   // Selected fee
//   const selectedFeeData = fees.find(
//     (fee) =>
//       String(fee.id) ===
//       String(selectedFee)
//   );

//   // Handle fee selection
//   const handleFeeChange = (event) => {
//     const feeId = event.target.value;

//     setSelectedFee(feeId);
//     setMessage("");
//     setError("");
//     setAmount("");
//   };

//   // Handle M-Pesa payment
//   const handlePayment = async (event) => {
//     event.preventDefault();

//     setMessage("");
//     setError("");

//     if (!selectedFeeData) {
//       setError(
//         "Please select a fee record."
//       );
//       return;
//     }

//     const paymentAmount = Number(amount);
//     const balance = Number(
//       selectedFeeData.balance || 0
//     );

//     if (paymentAmount <= 0) {
//       setError(
//         "Please enter a valid payment amount."
//       );
//       return;
//     }

//     if (paymentAmount > balance) {
//       setError(
//         `Payment cannot exceed the remaining balance of KSh ${balance.toLocaleString()}.`
//       );
//       return;
//     }

//     if (!phone) {
//       setError(
//         "Please enter your M-Pesa phone number."
//       );
//       return;
//     }

//     try {
//       setPaying(true);

//       const response =
//         await initiateMpesaPayment({
//           student_id:
//             selectedFeeData.student?.id,

//           fee_id:
//             selectedFeeData.id,

//           amount:
//             paymentAmount,

//           phone_number:
//             phone,
//         });

//       setMessage(
//         response.message ||
//           "Payment request sent. Check your phone for the M-Pesa prompt."
//       );

//       setAmount("");

//     } catch (error) {
//       console.error(
//         "M-Pesa payment error:",
//         error
//       );

//       const serverMessage =
//         error.response?.data?.error ||
//         error.response?.data?.detail;

//       setError(
//         serverMessage ||
//           "Unable to initiate the M-Pesa payment."
//       );
//     } finally {
//       setPaying(false);
//     }
//   };

//   // Loading
//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="mpesa-page">
//           <h1>M-Pesa Payment</h1>

//           <p>
//             Loading fee records...
//           </p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="mpesa-page">

//         <h1>M-Pesa Payment</h1>

//         <p>
//           Pay school fees for your child
//           using M-Pesa.
//         </p>

//         {/* ERROR */}
//         {error && (
//           <div className="mpesa-error">
//             {error}
//           </div>
//         )}

//         {/* SUCCESS MESSAGE */}
//         {message && (
//           <div className="mpesa-message">
//             {message}
//           </div>
//         )}

//         {/* NO FEES */}
//         {fees.length === 0 ? (
//           <div className="mpesa-empty">
//             No fee records are available
//             for your children.
//           </div>
//         ) : (

//           <form
//             className="mpesa-form"
//             onSubmit={handlePayment}
//           >

//             {/* SELECT CHILD */}
//             <label>
//               Select Child / Fee
//             </label>

//             <select
//               value={selectedFee}
//               onChange={handleFeeChange}
//               required
//             >
//               <option value="">
//                 -- Select a child --
//               </option>

//               {fees.map((fee) => (
//                 <option
//                   key={fee.id}
//                   value={fee.id}
//                 >
//                   {fee.student?.first_name}{" "}
//                   {fee.student?.last_name}
//                   {" — "}
//                   {fee.term}{" "}
//                   {fee.session}
//                   {" — Balance KSh "}
//                   {Number(
//                     fee.balance || 0
//                   ).toLocaleString()}
//                 </option>
//               ))}
//             </select>

//             {/* FEE SUMMARY */}
//             {selectedFeeData && (
//               <div className="fee-summary">

//                 <p>
//                   <strong>
//                     Student:
//                   </strong>{" "}
//                   {selectedFeeData.student?.first_name}{" "}
//                   {selectedFeeData.student?.last_name}
//                 </p>

//                 <p>
//                   <strong>
//                     Admission No:
//                   </strong>{" "}
//                   {selectedFeeData.student?.admission_number ||
//                     selectedFeeData.student?.admission_no ||
//                     "-"}
//                 </p>

//                 <p>
//                   <strong>
//                     Total Fee:
//                   </strong>{" "}
//                   KSh{" "}
//                   {Number(
//                     selectedFeeData.total_amount ||
//                       0
//                   ).toLocaleString()}
//                 </p>

//                 <p>
//                   <strong>
//                     Already Paid:
//                   </strong>{" "}
//                   KSh{" "}
//                   {Number(
//                     selectedFeeData.amount_paid ||
//                       0
//                   ).toLocaleString()}
//                 </p>

//                 <p>
//                   <strong>
//                     Balance:
//                   </strong>{" "}
//                   KSh{" "}
//                   {Number(
//                     selectedFeeData.balance ||
//                       0
//                   ).toLocaleString()}
//                 </p>

//               </div>
//             )}

//             {/* AMOUNT */}
//             <label>
//               Amount to Pay
//             </label>

//             <input
//               type="number"
//               min="1"
//               max={
//                 selectedFeeData
//                   ? selectedFeeData.balance
//                   : undefined
//               }
//               value={amount}
//               onChange={(event) =>
//                 setAmount(
//                   event.target.value
//                 )
//               }
//               placeholder="Enter amount"
//               required
//               disabled={!selectedFeeData}
//             />

//             {/* PHONE */}
//             <label>
//               M-Pesa Phone Number
//             </label>

//             <input
//               type="tel"
//               placeholder="2547XXXXXXXX"
//               value={phone}
//               onChange={(event) =>
//                 setPhone(
//                   event.target.value
//                 )
//               }
//               required
//             />

//             {/* PAY BUTTON */}
//             <button
//               type="submit"
//               disabled={
//                 paying ||
//                 !selectedFeeData
//               }
//             >
//               {paying
//                 ? "Sending payment request..."
//                 : "📱 Pay with M-Pesa"}
//             </button>

//           </form>
//         )}

//       </div>
//     </DashboardLayout>
//   );
// };

// export default MpesaPayment;