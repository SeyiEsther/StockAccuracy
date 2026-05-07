const FILTER_OPTIONS = [
  { value: "ALL",     label: "All" },
  { value: "FLAGGED", label: "Flagged" },
  { value: "UP",      label: "Up Only" },
  { value: "DOWN",    label: "Down Only" },
  { value: "NEW",     label: "New" },
  { value: "MISSING", label: "Missing" },
];

const STATUS_COLORS = {
  ALL:     "#3b82f6",
  FLAGGED: "#ef4444",
  UP:      "#22c55e",
  DOWN:    "#ef4444",
  NEW:     "#8b5cf6",
  MISSING: "#f59e0b",
};

export default function FilterBar({
  activeFilter, onFilterChange,
  search, onSearchChange,
  sLoc, onSLocChange, sLocOptions,
  threshold, onThresholdChange,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-tab ${activeFilter === opt.value ? "active" : ""}`}
            style={activeFilter === opt.value ? { borderColor: STATUS_COLORS[opt.value], color: STATUS_COLORS[opt.value] } : {}}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search material or description…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select
          className="sloc-select"
          value={sLoc}
          onChange={(e) => onSLocChange(e.target.value)}
        >
          <option value="">All SLocs</option>
          {sLocOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="threshold-control">
          <label htmlFor="threshold">Flag threshold</label>
          <input
            id="threshold"
            type="number"
            min={1}
            max={100}
            step={1}
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
          />
          <span>%</span>
        </div>
      </div>
    </div>
  );
}
