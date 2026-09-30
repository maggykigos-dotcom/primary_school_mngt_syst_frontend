import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import "./AttendanceChart.css";

const AttendanceChart = ({
    data = [],
    childName = "",
}) => {
    // ============================================================
    // CHECK DATA
    // ============================================================

    const hasRawData =
        Array.isArray(data) &&
        data.length > 0;

    // ============================================================
    // BUILD DAILY ATTENDANCE
    // ============================================================

    const attendanceData = hasRawData
        ? (() => {
              const dailyData = {};

              data.forEach((record) => {
                  const rawDate =
                      record.date ||
                      record.attendance_date ||
                      record.day ||
                      record.created_at;

                  if (!rawDate) {
                      return;
                  }

                  const date =
                      String(rawDate).split("T")[0];

                  let status = "";

                  if (
                      record.status !== undefined
                  ) {
                      status = String(
                          record.status
                      ).toLowerCase();
                  }

                  if (
                      !status &&
                      record.attendance_status
                  ) {
                      status = String(
                          record.attendance_status
                      ).toLowerCase();
                  }

                  const isPresent =
                      status === "present" ||
                      record.is_present === true ||
                      record.present === true;

                  const isAbsent =
                      status === "absent" ||
                      record.is_absent === true ||
                      record.absent === true;

                  const isExcused =
                      status === "excused" ||
                      record.is_excused === true ||
                      record.excused === true;

                  if (!dailyData[date]) {
                      dailyData[date] = {
                          date,
                          present: 0,
                          absent: 0,
                          excused: 0,
                          total: 0,
                      };
                  }

                  dailyData[date].total += 1;

                  if (isPresent) {
                      dailyData[date].present += 1;
                  } else if (isAbsent) {
                      dailyData[date].absent += 1;
                  } else if (isExcused) {
                      dailyData[date].excused += 1;
                  }
              });

              return Object.values(dailyData)
                  .map((day) => {
                      const attendance =
                          day.total > 0
                              ? Math.round(
                                    (day.present /
                                        day.total) *
                                        100
                                )
                              : 0;

                      return {
                          ...day,
                          attendance,
                      };
                  })
                  .sort(
                      (a, b) =>
                          new Date(a.date) -
                          new Date(b.date)
                  );
          })()
        : [];

    const hasData =
        attendanceData.length > 0;

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (dateString) => {
        const date = new Date(
            `${dateString}T00:00:00`
        );

        if (
            Number.isNaN(date.getTime())
        ) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
            }
        );
    };

    // ============================================================
    // TOOLTIP
    // ============================================================

    const CustomTooltip = ({
        active,
        payload,
    }) => {
        if (
            !active ||
            !payload ||
            payload.length === 0
        ) {
            return null;
        }

        const day =
            payload[0].payload;

        return (
            <div
                className="attendance-tooltip"
                style={{
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                }}
            >
                <strong>
                    {formatDate(day.date)}
                </strong>

                <div>
                    Attendance:{" "}
                    <strong>
                        {day.attendance}%
                    </strong>
                </div>

                <div>
                    Present:{" "}
                    {day.present}
                </div>

                <div>
                    Absent:{" "}
                    {day.absent}
                </div>

                {day.excused > 0 && (
                    <div>
                        Excused:{" "}
                        {day.excused}
                    </div>
                )}
            </div>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="chart-card">

            <div className="chart-header">

                <div>
                    <h2>
                        Attendance Trends
                        {childName
                            ? ` — ${childName}`
                            : ""}
                    </h2>

                    <p>
                        Daily attendance
                        percentage
                    </p>
                </div>

                <div className="chart-icon">
                    📊
                </div>

            </div>

            {hasData ? (

                <div className="chart-wrapper">

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={attendanceData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 5,
                                bottom: 20,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="date"
                                tickFormatter={
                                    formatDate
                                }
                                tick={{
                                    fontSize: 12,
                                }}
                                minTickGap={20}
                            />

                            <YAxis
                                domain={[0, 100]}
                                tick={{
                                    fontSize: 12,
                                }}
                                tickFormatter={(
                                    value
                                ) =>
                                    `${value}%`
                                }
                            />

                            <Tooltip
                                content={
                                    <CustomTooltip />
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="attendance"
                                name="Attendance"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{
                                    r: 5,
                                }}
                                activeDot={{
                                    r: 7,
                                }}
                                connectNulls
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            ) : (

                <div className="chart-empty">

                    <div className="chart-empty-icon">
                        📊
                    </div>

                    <h3>
                        No Attendance Data
                    </h3>

                    <p>
                        {childName
                            ? `Attendance trends for ${childName} will appear here once attendance has been recorded.`
                            : "Attendance trends will appear here once attendance has been recorded."}
                    </p>

                </div>

            )}

        </div>
    );
};

export default AttendanceChart;





// import {
//     ResponsiveContainer,
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     Tooltip,
//     CartesianGrid,
// } from "recharts";

// import "./AttendanceChart.css";


// const AttendanceChart = ({ data = [] }) => {

//     // ==========================
//     // CHECK DATA
//     // ==========================

//     const hasRawData =
//         Array.isArray(data) &&
//         data.length > 0;


//     // ==========================
//     // BUILD DAILY ATTENDANCE
//     // ==========================

//     const attendanceData = hasRawData
//         ? (() => {

//             const dailyData = {};


//             data.forEach((record) => {

//                 // ==========================
//                 // GET DATE
//                 // ==========================

//                 const rawDate =
//                     record.date ||
//                     record.attendance_date ||
//                     record.day ||
//                     record.created_at;


//                 if (!rawDate) {
//                     return;
//                 }


//                 // Keep only YYYY-MM-DD
//                 const date =
//                     String(rawDate).split("T")[0];


//                 // ==========================
//                 // DETERMINE STATUS
//                 // ==========================

//                 let status = "";


//                 if (record.status !== undefined) {
//                     status = String(record.status).toLowerCase();
//                 }


//                 // Support alternative backend
//                 // field names as well.
//                 if (!status && record.attendance_status) {
//                     status = String(
//                         record.attendance_status
//                     ).toLowerCase();
//                 }


//                 const isPresent =
//                     status === "present" ||
//                     record.is_present === true ||
//                     record.present === true;


//                 const isAbsent =
//                     status === "absent" ||
//                     record.is_absent === true ||
//                     record.absent === true;


//                 const isExcused =
//                     status === "excused" ||
//                     record.is_excused === true ||
//                     record.excused === true;


//                 // ==========================
//                 // CREATE DATE GROUP
//                 // ==========================

//                 if (!dailyData[date]) {
//                     dailyData[date] = {
//                         date,
//                         present: 0,
//                         absent: 0,
//                         excused: 0,
//                         total: 0,
//                     };
//                 }


//                 // ==========================
//                 // COUNT RECORD
//                 // ==========================

//                 dailyData[date].total += 1;


//                 if (isPresent) {
//                     dailyData[date].present += 1;
//                 } else if (isAbsent) {
//                     dailyData[date].absent += 1;
//                 } else if (isExcused) {
//                     dailyData[date].excused += 1;
//                 }

//             });


//             // ==========================
//             // CALCULATE PERCENTAGES
//             // ==========================

//             return Object.values(dailyData)
//                 .map((day) => {

//                     const attendance =
//                         day.total > 0
//                             ? Math.round(
//                                 (day.present / day.total) * 100
//                             )
//                             : 0;


//                     return {
//                         ...day,
//                         attendance,
//                     };

//                 })

//                 // ==========================
//                 // OLDEST → NEWEST
//                 // ==========================

//                 .sort(
//                     (a, b) =>
//                         new Date(a.date) -
//                         new Date(b.date)
//                 );

//         })()
//         : [];


//     const hasData =
//         attendanceData.length > 0;


//     // ==========================
//     // FORMAT DATE
//     // ==========================

//     const formatDate = (dateString) => {

//         const date = new Date(
//             `${dateString}T00:00:00`
//         );


//         if (Number.isNaN(date.getTime())) {
//             return dateString;
//         }


//         return date.toLocaleDateString(
//             "en-US",
//             {
//                 month: "short",
//                 day: "numeric",
//             }
//         );
//     };


//     // ==========================
//     // TOOLTIP
//     // ==========================

//     const CustomTooltip = ({
//         active,
//         payload,
//     }) => {

//         if (
//             !active ||
//             !payload ||
//             payload.length === 0
//         ) {
//             return null;
//         }


//         const day = payload[0].payload;


//         return (
//             <div
//                 className="attendance-tooltip"
//                 style={{
//                     background: "#ffffff",
//                     border: "1px solid #d1d5db",
//                     borderRadius: "8px",
//                     padding: "10px 14px",
//                     boxShadow:
//                         "0 4px 12px rgba(0,0,0,0.12)",
//                 }}
//             >

//                 <strong>
//                     {formatDate(day.date)}
//                 </strong>

//                 <div>
//                     Attendance:{" "}
//                     <strong>
//                         {day.attendance}%
//                     </strong>
//                 </div>

//                 <div>
//                     Present: {day.present}
//                 </div>

//                 <div>
//                     Absent: {day.absent}
//                 </div>

//                 {day.excused > 0 && (
//                     <div>
//                         Excused: {day.excused}
//                     </div>
//                 )}

//             </div>
//         );
//     };


//     return (

//         <div className="chart-card">

//             {/* ==========================
//                 HEADER
//             ========================== */}

//             <div className="chart-header">

//                 <div>

//                     <h2>
//                         Attendance Trends
//                     </h2>

//                     <p>
//                         Daily attendance percentage
//                     </p>

//                 </div>

//                 <div className="chart-icon">
//                     📊
//                 </div>

//             </div>


//             {/* ==========================
//                 CHART
//             ========================== */}

//             {hasData ? (

//                 <div className="chart-wrapper">

//                     <ResponsiveContainer
//                         width="100%"
//                         height={300}
//                     >

//                         <LineChart
//                             data={attendanceData}
//                             margin={{
//                                 top: 20,
//                                 right: 20,
//                                 left: 5,
//                                 bottom: 20,
//                             }}
//                         >

//                             <CartesianGrid
//                                 strokeDasharray="3 3"
//                                 vertical={false}
//                             />


//                             <XAxis
//                                 dataKey="date"
//                                 tickFormatter={
//                                     formatDate
//                                 }
//                                 tick={{
//                                     fontSize: 12,
//                                 }}
//                                 minTickGap={20}
//                             />


//                             <YAxis
//                                 domain={[0, 100]}
//                                 tick={{
//                                     fontSize: 12,
//                                 }}
//                                 tickFormatter={
//                                     (value) =>
//                                         `${value}%`
//                                 }
//                             />


//                             <Tooltip
//                                 content={
//                                     <CustomTooltip />
//                                 }
//                             />


//                             <Line
//                                 type="monotone"
//                                 dataKey="attendance"
//                                 name="Attendance"
//                                 stroke="#2563eb"
//                                 strokeWidth={3}
//                                 dot={{
//                                     r: 5,
//                                 }}
//                                 activeDot={{
//                                     r: 7,
//                                 }}
//                                 connectNulls
//                             />

//                         </LineChart>

//                     </ResponsiveContainer>

//                 </div>

//             ) : (

//                 <div className="chart-empty">

//                     <div className="chart-empty-icon">
//                         📊
//                     </div>

//                     <h3>
//                         No Attendance Data
//                     </h3>

//                     <p>
//                         Attendance trends will
//                         appear here once attendance
//                         has been recorded.
//                     </p>

//                 </div>

//             )}

//         </div>
//     );
// };


// export default AttendanceChart;

