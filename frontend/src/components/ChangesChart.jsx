import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

const BAR_COLORS = {
  UP:      "#22c55e",
  DOWN:    "#ef4444",
  NEW:     "#8b5cf6",
  MISSING: "#f59e0b",
  OK:      "#4b5563",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="ct-material">{d.materialNumber}</p>
      <p className="ct-desc">{d.description}</p>
      <p>SLoc: <strong>{d.sLoc}</strong></p>
      <p>Change: <strong style={{ color: d.pctChange >= 0 ? "#22c55e" : "#ef4444" }}>
        {d.pctChange !== null ? (d.pctChange >= 0 ? "+" : "") + d.pctChange.toFixed(1) + "%" : "—"}
      </strong></p>
    </div>
  );
}

export default function ChangesChart({ rows }) {
  const chartData = [...rows]
    .filter((r) => r.pctChange !== null)
    .sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange))
    .slice(0, 12)
    .map((r) => ({ ...r, absPct: Math.abs(r.pctChange) }));

  if (chartData.length === 0) {
    return <div className="empty-state small">No change data to chart.</div>;
  }

  return (
    <div className="chart-section">
      <h2 className="section-title">Top Changes (% Movement)</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3142" />
          <XAxis
            dataKey="materialNumber"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={(v) => v + "%"}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <ReferenceLine y={0} stroke="#4b5563" />
          <Bar dataKey="pctChange" radius={[3, 3, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.materialNumber + entry.sLoc} fill={BAR_COLORS[entry.status] || BAR_COLORS.OK} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
