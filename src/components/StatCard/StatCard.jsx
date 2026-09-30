import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon,
  type = "primary",
}) => {
  return (
    <div
      className={`stat-card stat-${type}`}
    >

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <p className="stat-title">
          {title}
        </p>

        <h3 className="stat-value">
          {value}
        </h3>
      </div>

    </div>
  );
};

export default StatCard;