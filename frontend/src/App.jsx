import { useState, useMemo } from "react";
import { useStockData } from "./hooks/useStockData";
import SummaryCards from "./components/SummaryCards";
import FilterBar from "./components/FilterBar";
import ComparisonTable from "./components/ComparisonTable";
import ChangesChart from "./components/ChangesChart";
import ExportButton from "./components/ExportButton";
import "./index.css";

const DEFAULT_THRESHOLD = 10;

function formatTimestamp(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function App() {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sLoc, setSLoc] = useState("");

  const { rows, lastUpdated, loading, error, reload } = useStockData(threshold);

  const sLocOptions = useMemo(
    () => [...new Set(rows.map((r) => r.sLoc))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    let result = rows;

    if (activeFilter === "FLAGGED") result = result.filter((r) => r.status === "UP" || r.status === "DOWN");
    else if (activeFilter !== "ALL") result = result.filter((r) => r.status === activeFilter);

    if (sLoc) result = result.filter((r) => r.sLoc === sLoc);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.materialNumber.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, activeFilter, sLoc, search]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Stock Accuracy Monitor</h1>
          <span className="app-subtitle">ZMM_LI009 / WIP Stock Rep JF &mdash; Rittal CSM Plymouth</span>
        </div>
        <div className="header-right">
          <span className="last-updated">
            Last updated: <strong>{formatTimestamp(lastUpdated)}</strong>
          </span>
          <button className="reload-btn" onClick={reload} disabled={loading}>
            {loading ? "Loading…" : "⟳ Refresh"}
          </button>
          <ExportButton rows={filtered} lastUpdated={lastUpdated} />
        </div>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading stock data…</div>
        ) : (
          <>
            <SummaryCards rows={rows} />

            <ChangesChart rows={rows} />

            <section className="table-section">
              <FilterBar
                activeFilter={activeFilter} onFilterChange={setActiveFilter}
                search={search} onSearchChange={setSearch}
                sLoc={sLoc} onSLocChange={setSLoc} sLocOptions={sLocOptions}
                threshold={threshold} onThresholdChange={setThreshold}
              />
              <div className="table-meta">
                Showing <strong>{filtered.length}</strong> of <strong>{rows.length}</strong> materials
              </div>
              <ComparisonTable rows={filtered} />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        Stock Accuracy Monitor &middot; ZMM_LI009 &middot; Rittal CSM Plymouth &middot; v1.0
      </footer>
    </div>
  );
}
