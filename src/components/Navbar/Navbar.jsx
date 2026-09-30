
import { useContext, useState } from "react";

import { AuthContext } from "../../context/AuthContext";

import NotificationBell from "../Notifications/NotificationBell";

import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  const [showProfile, setShowProfile] = useState(false);

  // Build the profile image URL
  const getProfilePicture = () => {
    if (!user?.profile_picture) {
      return null;
    }

    // If Django already returned an absolute URL
    if (
      user.profile_picture.startsWith("http://") ||
      user.profile_picture.startsWith("https://")
    ) {
      return user.profile_picture;
    }

    // If Django returned a relative media URL
    return `http://127.0.0.1:8000${user.profile_picture}`;
  };

  const profilePicture = getProfilePicture();

  return (
    <>
      <header className="navbar">
     
        <button
          className="menu-button"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <h1 className="navbar-title">
          School Management System
        </h1>

        <div className="navbar-right">
          <NotificationBell />

          <div className="user-info">
            {/* PROFILE PICTURE */}
            <button
              type="button"
              className="user-avatar-button"
              onClick={() => {
                if (profilePicture) {
                  setShowProfile(true);
                }
              }}
              title={
                profilePicture
                  ? "View profile picture"
                  : "No profile picture"
              }
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={`${user?.username || "User"} profile`}
                  className="user-profile-image"
                />
              ) : (
                <div className="user-avatar">
                  {user?.username
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>
              )}
            </button>

            <div className="user-details">
              <strong>{user?.username}</strong>

              <span>{user?.role}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* PROFILE IMAGE MODAL */}
      {showProfile && profilePicture && (
        <div
          className="profile-modal-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setShowProfile(false)}
              aria-label="Close profile picture"
            >
              ×
            </button>

            <img
              src={profilePicture}
              alt={`${user?.username || "User"} profile`}
              className="profile-modal-image"
            />

            <div className="profile-modal-name">
              {user?.username}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;



// import { useContext, useEffect, useState } from "react";

// import { AuthContext } from "../../context/AuthContext";

// import NotificationBell from "../Notifications/NotificationBell";

// import API from "../../api/axios";

// import "./Navbar.css";

// const Navbar = ({ onMenuClick }) => {
//   const { user, logout } = useContext(AuthContext);

//   const [profilePicture, setProfilePicture] = useState(null);

//   // =========================================================
//   // LOAD ACTUAL BACKEND PROFILE PICTURE
//   // =========================================================

//   useEffect(() => {
//     const loadProfilePicture = async () => {
//       if (!user?.id) {
//         return;
//       }

//       // If AuthContext already contains profile_picture
//       if (user.profile_picture) {
//         setProfilePicture(user.profile_picture);
//         return;
//       }

//       try {
//         const response = await API.get(
//           `auth/users/${user.id}/`
//         );

//         if (response.data?.profile_picture) {
//           setProfilePicture(
//             response.data.profile_picture
//           );
//         }
//       } catch (error) {
//         console.error(
//           "Failed to load profile picture:",
//           error
//         );
//       }
//     };

//     loadProfilePicture();
//   }, [user]);

//   // =========================================================
//   // PROFILE IMAGE URL
//   // =========================================================

//   const getProfilePictureUrl = () => {
//     if (!profilePicture) {
//       return null;
//     }

//     // Backend already returned an absolute URL
//     if (
//       profilePicture.startsWith("http://") ||
//       profilePicture.startsWith("https://")
//     ) {
//       return profilePicture;
//     }

//     // Relative media URL
//     return `http://127.0.0.1:8000${profilePicture}`;
//   };

//   const pictureUrl = getProfilePictureUrl();

//   return (
//     <header className="navbar">

//       {/* MOBILE MENU */}
//       <button
//         className="menu-button"
//         onClick={onMenuClick}
//         type="button"
//       >
//         ☰
//       </button>

//       {/* TITLE */}
//       <h1 className="navbar-title">
//         School Management System
//       </h1>

//       {/* RIGHT SIDE */}
//       <div className="navbar-right">

//         <NotificationBell />

//         <div className="user-info">

//           {/* ACTUAL PROFILE PICTURE */}
//           <div className="user-avatar">

//             {pictureUrl ? (
//               <img
//                 src={pictureUrl}
//                 alt={`${user?.username || "User"} profile`}
//                 className="profile-image"
//               />
//             ) : (
//               <span className="profile-placeholder">
//                 {user?.username
//                   ?.charAt(0)
//                   ?.toUpperCase()}
//               </span>
//             )}

//           </div>

//           {/* USER DETAILS */}
//           <div className="user-details">

//             <strong>
//               {user?.username}
//             </strong>

//             <span>
//               {user?.role}
//             </span>

//           </div>

//         </div>

//         {/* LOGOUT */}
//         <button
//           className="logout-button"
//           onClick={logout}
//           type="button"
//         >
//           Logout
//         </button>

//       </div>

//     </header>
//   );
// };

// export default Navbar;
