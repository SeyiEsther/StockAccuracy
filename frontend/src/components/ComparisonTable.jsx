import { useState } from "react";

const STATUS_META = {
  OK:      { label: "OK",      cls: "badge-ok" },
  UP:      { label: "▲ UP",    cls: "badge-up" },
  DOWN:    { label: "▼ DOWN",  cls: "badge-down" },
  NEW:     { label: "NEW",     cls: "badge-new" },
  MISSING: { label: "MISSING", cls: "badge-missing" },
};

const COLUMNS = [
  { key: "materialNumber",  label: "Material",      numeric: false },
  { key: "description",     label: "Description",   numeric: false },
  { key: "sLoc",            label: "SLoc",          numeric: false },
  { key: "yesterdayQty",    label: "Yesterday",     numeric: true  },
  { key: "todayQty",        label: "Today",         numeric: true  },
  { key: "delta",           label: "Delta",         numeric: true  },
  { key: "pctChange",       label: "% Change",      numeric: true  },
  { key: "status",          label: "Status",        numeric: false },
];

function fmt(val) {
  if (val === null || val === undefined) return "—";
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(1);
}

function fmtPct(val) {
  if (val === null || val === undefined) return "—";
  return (val >= 0 ? "+" : "") + val.toFixed(1) + "%";
}

function SortIcon({ dir }) {
  if (!dir) return <span className="sort-icon neutral">⇅</span>;
  return <span className="sort-icon">{dir === "asc" ? "▲" : "▼"}</span>;
}

export default function ComparisonTable({ rows }) {
  const [sortKey, setSortKey] = useState("pctChange");
  const [sortDir, setSortDir] = useState("desc");

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(COLUMNS.find((c) => c.key === key)?.numeric ? "desc" : "asc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (av === null || av === undefined) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv === null || bv === undefined) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc" ? av - bv : bv - av;
  });

  if (rows.length === 0) {
    return <div className="empty-state">No materials match the current filters.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`${col.numeric ? "num" : ""} ${sortKey === col.key ? "sorted" : ""}`}
                onClick={() => handleSort(col.key)}
              >
                {col.label} <SortIcon dir={sortKey === col.key ? sortDir : null} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const meta = STATUS_META[row.status] || STATUS_META.OK;
            const isFlagged = row.status === "UP" || row.status === "DOWN";
            return (
              <tr key={`${row.materialNumber}-${row.sLoc}`} className={isFlagged ? "row-flagged" : ""}>
                <td className="mono">{row.materialNumber}</td>
                <td>{row.description}</td>
                <td className="sloc">{row.sLoc}</td>
                <td className="num">{fmt(row.yesterdayQty)}</td>
                <td className="num">{fmt(row.todayQty)}</td>
                <td className={`num ${row.delta > 0 ? "pos" : row.delta < 0 ? "neg" : ""}`}>
                  {row.delta !== null && row.delta !== undefined ? (row.delta >= 0 ? "+" : "") + fmt(row.delta) : "—"}
                </td>
                <td className={`num ${row.pctChange > 0 ? "pos" : row.pctChange < 0 ? "neg" : ""}`}>
                  {fmtPct(row.pctChange)}
                </td>
                <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
