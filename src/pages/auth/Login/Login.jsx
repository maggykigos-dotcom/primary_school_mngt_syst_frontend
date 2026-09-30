import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form);

      // Login successful
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>School Portal</h1>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;


// import {
//   useContext,
//   useState,
// } from "react";

// import {
//   useNavigate,
// } from "react-router-dom";

// import {
//   AuthContext,
// } from "../../../context/AuthContext";

// import "./Login.css";

// const Login = () => {
//   const navigate = useNavigate();

//   const {
//     login,
//   } = useContext(AuthContext);

//   const [form, setForm] =
//     useState({
//       username: "",
//       password: "",
//     });

//   const [error, setError] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);

//   const handleChange = (event) => {
//     setForm({
//       ...form,
//       [event.target.name]:
//         event.target.value,
//     });
//   };

//   const handleSubmit = async (
//     event
//   ) => {
//     event.preventDefault();

//     setError("");
//     setLoading(true);

//     try {
//       const data =
//         await login(form);

//         navigate("/dashboard");

//     } catch (error) {
//       console.error(error);

//       setError(
//         "Invalid username or password."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">

//       <div className="login-card">

//         <div className="login-header">
//           <h1>
//             School Portal
//           </h1>

//           <p>
//             Sign in to your account
//           </p>
//         </div>

//         {error && (
//           <div className="login-error">
//             {error}
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit}
//         >

//           <div className="form-group">

//             <label>
//               Username
//             </label>

//             <input
//               type="text"
//               name="username"
//               value={form.username}
//               onChange={handleChange}
//               required
//             />

//           </div>

//           <div className="form-group">

//             <label>
//               Password
//             </label>

//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />

//           </div>

//           <button
//             className="login-button"
//             disabled={loading}
//           >
//             {loading
//               ? "Signing in..."
//               : "Login"}
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// };

// export default Login;