export default function SummaryCards({ rows }) {
  const total = rows.length;
  const flagged = rows.filter((r) => r.status === "UP" || r.status === "DOWN").length;
  const newItems = rows.filter((r) => r.status === "NEW").length;
  const missing = rows.filter((r) => r.status === "MISSING").length;

  const cards = [
    { label: "Total Tracked",  value: total,    color: "#3b82f6" },
    { label: "Flagged",        value: flagged,  color: "#ef4444" },
    { label: "New",            value: newItems, color: "#8b5cf6" },
    { label: "Missing",        value: missing,  color: "#f59e0b" },
  ];

  return (
    <div className="summary-cards">
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ borderTopColor: c.color }}>
          <span className="card-value" style={{ color: c.color }}>{c.value}</span>
          <span className="card-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
