import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import "./PerformanceChart.css";

const PerformanceChart = ({
    data = [],
    childName = "",
}) => {
    const hasData =
        Array.isArray(data) &&
        data.length > 0;

    return (
        <div className="chart-card">

            <div className="chart-header">

                <div>

                    <h2>
                        Academic Performance
                        {childName
                            ? ` — ${childName}`
                            : ""}
                    </h2>

                    <p>
                        Average marks by subject
                    </p>

                </div>

                <div className="chart-icon">
                    📈
                </div>

            </div>

            {hasData ? (

                <div className="chart-wrapper">

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 20,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="subject"
                                tick={{
                                    fontSize: 12,
                                }}
                                interval={0}
                                angle={-20}
                                textAnchor="end"
                                height={70}
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
                                formatter={(
                                    value
                                ) => [
                                    `${value}%`,
                                    "Average Marks",
                                ]}
                                labelFormatter={(
                                    label
                                ) =>
                                    `Subject: ${label}`
                                }
                            />

                            <Bar
                                dataKey="performance"
                                name="Average Marks"
                                fill="#16a34a"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0,
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            ) : (

                <div className="chart-empty">

                    <div className="chart-empty-icon">
                        📈
                    </div>

                    <h3>
                        No Academic Data
                    </h3>

                    <p>
                        {childName
                            ? `Academic performance for ${childName} will appear here once examination results have been recorded.`
                            : "Academic performance will appear here once examination results have been recorded."}
                    </p>

                </div>

            )}

        </div>
    );
};

export default PerformanceChart;



// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";

// import "./PerformanceChart.css";

// const PerformanceChart = ({ data = [] }) => {
//   const hasData = Array.isArray(data) && data.length > 0;

//   return (
//     <div className="chart-card">

//       <div className="chart-header">
//         <div>
//           <h2>Academic Performance</h2>
//           <p>
//             Average marks by subject
//           </p>
//         </div>

//         <div className="chart-icon">
//           📈
//         </div>
//       </div>

//       {hasData ? (
//         <div className="chart-wrapper">

//           <ResponsiveContainer
//             width="100%"
//             height={320}
//           >
//             <BarChart
//               data={data}
//               margin={{
//                 top: 20,
//                 right: 20,
//                 left: 0,
//                 bottom: 20,
//               }}
//             >

//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 vertical={false}
//               />

//               <XAxis
//                 dataKey="subject"
//                 tick={{ fontSize: 12 }}
//                 interval={0}
//                 angle={-20}
//                 textAnchor="end"
//                 height={70}
//               />

//               <YAxis
//                 domain={[0, 100]}
//                 tick={{ fontSize: 12 }}
//                 tickFormatter={(value) => `${value}%`}
//               />

//               <Tooltip
//                 formatter={(value) => [
//                   `${value}%`,
//                   "Average Marks",
//                 ]}
//                 labelFormatter={(label) =>
//                   `Subject: ${label}`
//                 }
//               />

//               <Bar
//                 dataKey="performance"
//                 name="Average Marks"
//                 fill="#16a34a"
//                 radius={[6, 6, 0, 0]}
//               />

//             </BarChart>
//           </ResponsiveContainer>

//         </div>
//       ) : (
//         <div className="chart-empty">

//           <div className="chart-empty-icon">
//             📈
//           </div>

//           <h3>No Academic Data</h3>

//           <p>
//             Academic performance will appear here once
//             examination results have been recorded.
//           </p>

//         </div>
//       )}
//     </div>
//   );
// };

// export default PerformanceChart;