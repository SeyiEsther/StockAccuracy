function toCSV(rows) {
  const headers = [
    "Material Number", "Description", "SLoc",
    "Yesterday Qty", "Today Qty", "Delta", "% Change", "Status",
  ];
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const dataRows = rows.map((r) => [
    r.materialNumber,
    r.description,
    r.sLoc,
    r.yesterdayQty,
    r.todayQty,
    r.delta ?? "",
    r.pctChange !== null && r.pctChange !== undefined ? r.pctChange.toFixed(2) : "",
    r.status,
  ].map(escape).join(","));
  return [headers.map(escape).join(","), ...dataRows].join("\r\n");
}

export default function ExportButton({ rows, lastUpdated }) {
  function handleExport() {
    const csv = toCSV(rows);
    const date = lastUpdated ? new Date(lastUpdated).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_comparison_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="export-btn" onClick={handleExport} disabled={rows.length === 0}>
      ↓ Export CSV
    </button>
  );
}
