// import {
//   Navigate,
// } from "react-router-dom";

// import {
//   useContext,
// } from "react";

// import {
//   AuthContext,
// } from "../context/AuthContext";

// const ProtectedRoute = ({
//   children,
//   allowedRoles,
// }) => {
//   const {
//     user,
//     loading,
//   } = useContext(AuthContext);

//   if (loading) {
//     return (
//       <div>Loading...</div>
//     );
//   }

//   if (!user) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//       />
//     );
//   }

//   if (
//     allowedRoles &&
//     !allowedRoles.includes(
//       user.role
//     )
//   ) {
//     return (
//       <Navigate
//         to="/unauthorized"
//         replace
//       />
//     );
//   }

//   return children;
// };

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({
    children,
    allowedRoles,
}) => {

    const {
        user,
        loading,
    } = useContext(AuthContext);

    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;
