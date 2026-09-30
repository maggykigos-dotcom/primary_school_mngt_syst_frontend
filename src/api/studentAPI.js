import API from "./axios";

const today = new Date()
  .toLocaleDateString("en-US", {
    weekday: "short",
  })
  .toLowerCase()
  .slice(0, 3);

export const getStudentDashboardData = async () => {
  const responses = await Promise.allSettled([
    API.get("auth/students/profile/"),
    API.get("academics/attendance/"),
    API.get("academics/results/"),
    API.get("academics/assignments/"),
    API.get(`academics/timetable/?day=${today}`),
    API.get("finance/fees/"),
  ]);

  const [
    profileResponse,
    attendanceResponse,
    resultsResponse,
    assignmentsResponse,
    timetableResponse,
    feesResponse,
  ] = responses;

  const getData = (response, fallback = []) => {
    if (response.status === "fulfilled") {
      return response.value.data;
    }

    console.error("Dashboard API request failed:", response.reason);

    return fallback;
  };

  const profile = getData(profileResponse, {});
  const attendance = getData(attendanceResponse, []);
  const results = getData(resultsResponse, []);
  const assignments = getData(assignmentsResponse, []);
  const timetable = getData(timetableResponse, []);
  const fees = getData(feesResponse, []);

  console.log("========== STUDENT DASHBOARD ==========");
  console.log("PROFILE:", profile);
  console.log("ATTENDANCE:", attendance);
  console.log("RESULTS:", results);
  console.log("ASSIGNMENTS:", assignments);
  console.log("TIMETABLE:", timetable);
  console.log("FEES:", fees);
  console.log("=======================================");

  return {
    profile,
    attendance,
    results,
    assignments,
    timetable,
    fees,
  };
};


// import API from "./axios";

// const today = new Date()
//   .toLocaleDateString("en-US", {
//     weekday: "short",
//   })
//   .toLowerCase()
//   .slice(0, 3);

// export const getStudentDashboardData = async () => {
//   const results = await Promise.allSettled([
//     API.get("auth/students/profile/"),
//     API.get("academics/attendance/"),
//     API.get("academics/results/"),
//     API.get("academics/assignments/"),
//     API.get(`academics/timetable/?day=${today}`),
//     API.get("finance/fees/"),
//   ]);

//   const [
//     profileResponse,
//     attendanceResponse,
//     resultsResponse,
//     assignmentsResponse,
//     timetableResponse,
//     feesResponse,
//   ] = results;

//   console.log(
//     "STUDENT PROFILE DATA",
//     profileResponse.status === "fulfilled"
//       ? profileResponse.value.data
//       : null
//   );

//   return {
//     profile:
//       profileResponse.status === "fulfilled"
//         ? profileResponse.value.data
//         : null,

//     attendance:
//       attendanceResponse.status === "fulfilled"
//         ? attendanceResponse.value.data
//         : {
//             percentage: 0,
//             trend: [],
//           },

//     results:
//       resultsResponse.status === "fulfilled"
//         ? resultsResponse.value.data
//         : {
//             average: 0,
//             subjects: [],
//           },

//     assignments:
//       assignmentsResponse.status === "fulfilled"
//         ? assignmentsResponse.value.data
//         : [],

//     timetable:
//       timetableResponse.status === "fulfilled"
//         ? timetableResponse.value.data
//         : [],

//     fees:
//       feesResponse.status === "fulfilled"
//         ? feesResponse.value.data
//         : [],
//   };
// };

