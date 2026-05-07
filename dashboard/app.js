// ─────────────────────────────────────────────────────────────────────────────
// Stock Accuracy Monitor — vanilla JS
//
// TO CONNECT THE REAL BACKEND:
//   Replace the loadData() function below with a real fetch call, e.g.:
//     const res  = await fetch('/api/stock/comparison');
//     const json = await res.json();
//     return { rows: json.data, lastUpdated: json.lastUpdated };
//
//   The rows array must contain objects with these fields:
//     materialNumber, description, sLoc, yesterdayQty, todayQty,
//     delta, pctChange, status, bun
//   where status is one of: OK | UP | DOWN | NEW | MISSING
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock data (replace with real API call when backend is ready) ──────────────
const MOCK_LAST_UPDATED = "2026-05-07T06:12:00Z";

const MOCK_RAW = [
  { materialNumber: "200003",  description: "WASHER/N125/8,4",             sLoc: "4002", yesterdayQty: 1200, todayQty: 980,   bun: "EA", mrpController: "A06" },
  { materialNumber: "200145",  description: "BOLT M6x20 HEX HEAD",         sLoc: "4002", yesterdayQty: 500,  todayQty: 500,   bun: "EA", mrpController: "A06" },
  { materialNumber: "200892",  description: "CABLE GLAND PG16",             sLoc: "4003", yesterdayQty: 340,  todayQty: 410,   bun: "EA", mrpController: "B02" },
  { materialNumber: "201034",  description: "DIN RAIL 35MM 2M",             sLoc: "4003", yesterdayQty: 80,   todayQty: 80,    bun: "EA", mrpController: "B02" },
  { materialNumber: "201250",  description: "TERMINAL BLOCK 4MM",           sLoc: "1001", yesterdayQty: 2000, todayQty: 1640,  bun: "EA", mrpController: "C01" },
  { materialNumber: "201489",  description: "CONTACTOR 230V 9A",            sLoc: "1001", yesterdayQty: 45,   todayQty: 45,    bun: "EA", mrpController: "C01" },
  { materialNumber: "201532",  description: "CIRCUIT BREAKER 6A 1P",        sLoc: "1001", yesterdayQty: 120,  todayQty: 98,    bun: "EA", mrpController: "C01" },
  { materialNumber: "201788",  description: "CABLE DUCT 25x25",             sLoc: "3001", yesterdayQty: 60,   todayQty: 74,    bun: "EA", mrpController: "A06" },
  { materialNumber: "202001",  description: "EARTH STUD M6",                sLoc: "4002", yesterdayQty: 300,  todayQty: 300,   bun: "EA", mrpController: "A06" },
  { materialNumber: "202210",  description: "ENCLOSURE RIT AX 600x600",     sLoc: "3001", yesterdayQty: 18,   todayQty: 6,     bun: "EA", mrpController: "D05" },
  { materialNumber: "202345",  description: "PUSH BUTTON GREEN 22MM",       sLoc: "4003", yesterdayQty: 90,   todayQty: 113,   bun: "EA", mrpController: "B02" },
  { materialNumber: "202567",  description: "INDICATOR LAMP RED 230V",      sLoc: "4003", yesterdayQty: 55,   todayQty: 55,    bun: "EA", mrpController: "B02" },
  { materialNumber: "202891",  description: "FUSE 6A CYLINDRICAL",          sLoc: "1001", yesterdayQty: 450,  todayQty: 510,   bun: "EA", mrpController: "C01" },
  { materialNumber: "203112",  description: "PSU 24VDC 10A DIN",            sLoc: "1001", yesterdayQty: 22,   todayQty: 22,    bun: "EA", mrpController: "C01" },
  { materialNumber: "203344",  description: "CABLE H07V-K 1.5MM BLK 100M",  sLoc: "3001", yesterdayQty: 14,   todayQty: 14,    bun: "RL", mrpController: "D05" },
  { materialNumber: "203500",  description: "GLAND PLATE 600x200",          sLoc: "3001", yesterdayQty: 30,   todayQty: 0,     bun: "EA", mrpController: "D05" },
  { materialNumber: "203678",  description: "SCREW M4x10 POZI",             sLoc: "4002", yesterdayQty: 5000, todayQty: 4980,  bun: "EA", mrpController: "A06" },
  { materialNumber: "203890",  description: "HEX NUT M4 ZINC",              sLoc: "4002", yesterdayQty: 3000, todayQty: 2980,  bun: "EA", mrpController: "A06" },
  { materialNumber: "204102",  description: "RELAY 24VDC SPCO",             sLoc: "1001", yesterdayQty: 0,    todayQty: 40,    bun: "EA", mrpController: "C01" },
  { materialNumber: "204230",  description: "SOCKET BASE 8-PIN DIN",        sLoc: "1001", yesterdayQty: 0,    todayQty: 38,    bun: "EA", mrpController: "C01" },
  { materialNumber: "204455",  description: "LABEL HOLDER 15MM DIN",        sLoc: "4003", yesterdayQty: 200,  todayQty: 200,   bun: "EA", mrpController: "B02" },
  { materialNumber: "204601",  description: "MOUNTING PLATE GALV 600x600",  sLoc: "3001", yesterdayQty: 12,   todayQty: 12,    bun: "EA", mrpController: "D05" },
  { materialNumber: "204780",  description: "SHRINK TUBE 3MM BLACK 100M",   sLoc: "4002", yesterdayQty: 8,    todayQty: 8,     bun: "RL", mrpController: "A06" },
  { materialNumber: "204920",  description: "CABLE TIE 100MM NATURAL",      sLoc: "4002", yesterdayQty: 2500, todayQty: 2500,  bun: "EA", mrpController: "A06" },
  { materialNumber: "205100",  description: "WIRING DUCT COVER 25MM",       sLoc: "4003", yesterdayQty: 120,  todayQty: 88,    bun: "EA", mrpController: "B02" },
];

// ── Enrich raw rows with delta, pctChange and status ──────────────────────────
function enrichRows(rawRows, threshold) {
  return rawRows.map(function (r) {
    const yest = r.yesterdayQty;
    const tod  = r.todayQty;

    if (yest === 0 && tod > 0)  return Object.assign({}, r, { delta: tod,        pctChange: null, status: "NEW"     });
    if (yest > 0  && tod === 0) return Object.assign({}, r, { delta: -yest,      pctChange: -100, status: "MISSING" });

    const delta     = tod - yest;
    const pctChange = yest !== 0 ? (delta / yest) * 100 : 0;
    const status    = Math.abs(pctChange) >= threshold ? (delta > 0 ? "UP" : "DOWN") : "OK";

    return Object.assign({}, r, { delta, pctChange, status });
  });
}

// ── Load data (swap this for a real fetch when the backend is ready) ──────────
function loadData(threshold) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({ rows: enrichRows(MOCK_RAW, threshold), lastUpdated: MOCK_LAST_UPDATED });
    }, 300);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
let allRows      = [];
let lastUpdated  = null;
let activeFilter = "ALL";
let activeSLoc   = "";
let searchQuery  = "";
let threshold    = 10;
let sortKey      = "pctChange";
let sortDir      = "desc";
let chart        = null;

// ─────────────────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  bindControls();
  fetchAndRender();
});

function bindControls() {
  // Status filter tabs
  document.querySelectorAll(".filter-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll(".filter-tab").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderTable();
    });
  });

  // Search
  document.getElementById("search").addEventListener("input", function () {
    searchQuery = this.value.trim().toLowerCase();
    renderTable();
  });

  // Threshold
  document.getElementById("threshold").addEventListener("change", function () {
    threshold = Math.max(1, Math.min(100, parseInt(this.value, 10) || 10));
    this.value = threshold;
    // Re-enrich and re-render everything because status flags change
    allRows = enrichRows(MOCK_RAW, threshold);
    renderSummaryCards();
    renderChart();
    renderSLocButtons();
    renderTable();
  });

  // Export
  document.getElementById("btn-export").addEventListener("click", exportCSV);

  // Refresh
  document.getElementById("btn-refresh").addEventListener("click", fetchAndRender);

  // Sortable columns
  document.querySelectorAll("thead th[data-sort]").forEach(function (th) {
    th.addEventListener("click", function () {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = isNumericKey(key) ? "desc" : "asc";
      }
      updateSortHeaders();
      renderTable();
    });
  });
}

function isNumericKey(k) {
  return ["yesterdayQty","todayQty","delta","pctChange"].includes(k);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch & render
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAndRender() {
  setLoading(true);
  try {
    const data  = await loadData(threshold);
    allRows      = data.rows;
    lastUpdated  = data.lastUpdated;
    renderLastUpdated();
    renderSummaryCards();
    renderChart();
    renderSLocButtons();
    renderTable();
    setLoading(false);
  } catch (e) {
    setLoading(false);
    document.getElementById("error-banner").textContent = "Failed to load stock data: " + e.message;
    document.getElementById("error-banner").classList.remove("hidden");
  }
}

function setLoading(on) {
  document.getElementById("loading-state").classList.toggle("hidden", !on);
  document.getElementById("main-content").classList.toggle("hidden", on);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary cards
// ─────────────────────────────────────────────────────────────────────────────
function renderSummaryCards() {
  const total   = allRows.length;
  const flagged = allRows.filter(function (r) { return r.status === "UP" || r.status === "DOWN"; }).length;
  const newItems = allRows.filter(function (r) { return r.status === "NEW"; }).length;
  const missing = allRows.filter(function (r) { return r.status === "MISSING"; }).length;

  document.getElementById("card-total").textContent   = total;
  document.getElementById("card-flagged").textContent = flagged;
  document.getElementById("card-new").textContent     = newItems;
  document.getElementById("card-missing").textContent = missing;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLoc buttons
// ─────────────────────────────────────────────────────────────────────────────
function renderSLocButtons() {
  const sLocs    = [...new Set(allRows.map(function (r) { return r.sLoc; }))].sort();
  const container = document.getElementById("sloc-buttons");
  container.innerHTML = "";

  // "All areas" button
  const allBtn = makeBtn("All areas", "sloc-tab" + (activeSLoc === "" ? " active" : ""), function () {
    activeSLoc = "";
    renderSLocButtons();
    renderTable();
  });
  container.appendChild(allBtn);

  sLocs.forEach(function (s) {
    const btn = makeBtn(s, "sloc-tab" + (activeSLoc === s ? " active" : ""), function () {
      activeSLoc = activeSLoc === s ? "" : s;
      renderSLocButtons();
      renderTable();
    });
    container.appendChild(btn);
  });
}

function makeBtn(label, className, onClick) {
  const btn = document.createElement("button");
  btn.className   = className;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart (Chart.js)
// ─────────────────────────────────────────────────────────────────────────────
const BAR_COLORS = { UP: "#22c55e", DOWN: "#ef4444", NEW: "#8b5cf6", MISSING: "#f59e0b", OK: "#4b5563" };

function renderChart() {
  const chartData = allRows
    .filter(function (r) { return r.pctChange !== null; })
    .sort(function (a, b) { return Math.abs(b.pctChange) - Math.abs(a.pctChange); })
    .slice(0, 12);

  const labels     = chartData.map(function (r) { return truncate(r.description, 20); });
  const values     = chartData.map(function (r) { return parseFloat(r.pctChange.toFixed(1)); });
  const colors     = chartData.map(function (r) { return BAR_COLORS[r.status] || BAR_COLORS.OK; });
  const fullLabels = chartData.map(function (r) { return r.description + " (" + r.materialNumber + ") — SLoc " + r.sLoc; });

  const ctx = document.getElementById("changes-chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        data:            values,
        backgroundColor: colors,
        borderRadius:    3,
        borderSkipped:   false,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (items) { return fullLabels[items[0].dataIndex]; },
            label: function (item) {
              const r = chartData[item.dataIndex];
              const sign = item.raw >= 0 ? "+" : "";
              return [
                "Change: " + sign + item.raw + "%",
                r.yesterdayQty + " → " + r.todayQty + " " + r.bun,
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af", font: { size: 11 }, maxRotation: 40, minRotation: 30 },
          grid:  { color: "#2d3142" }
        },
        y: {
          ticks: {
            color: "#9ca3af",
            font: { size: 11 },
            callback: function (v) { return v + "%"; }
          },
          grid: { color: "#2d3142" }
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────────────────────────────────────
function getFilteredRows() {
  let rows = allRows;

  if (activeFilter === "FLAGGED") rows = rows.filter(function (r) { return r.status === "UP" || r.status === "DOWN"; });
  else if (activeFilter !== "ALL") rows = rows.filter(function (r) { return r.status === activeFilter; });

  if (activeSLoc) rows = rows.filter(function (r) { return r.sLoc === activeSLoc; });

  if (searchQuery) rows = rows.filter(function (r) {
    return r.materialNumber.toLowerCase().includes(searchQuery) ||
           r.description.toLowerCase().includes(searchQuery);
  });

  return sortRows(rows);
}

function sortRows(rows) {
  return rows.slice().sort(function (a, b) {
    let av = a[sortKey], bv = b[sortKey];
    if (av === null || av === undefined) av = sortDir === "asc" ?  Infinity : -Infinity;
    if (bv === null || bv === undefined) bv = sortDir === "asc" ?  Infinity : -Infinity;
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === "asc" ? av - bv : bv - av;
  });
}

function renderTable() {
  const rows = getFilteredRows();
  const tbody = document.getElementById("table-body");

  document.getElementById("table-meta").innerHTML =
    "Showing <strong>" + rows.length + "</strong> of <strong>" + allRows.length + "</strong> materials";

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No materials match the current filters.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (r) {
    const flagged  = r.status === "UP" || r.status === "DOWN";
    const deltaStr = r.delta !== null && r.delta !== undefined
      ? (r.delta >= 0 ? "+" : "") + fmtNum(r.delta)
      : "—";
    const pctStr   = r.pctChange !== null && r.pctChange !== undefined
      ? (r.pctChange >= 0 ? "+" : "") + r.pctChange.toFixed(1) + "%"
      : "—";
    const deltaClass = r.delta > 0 ? "pos" : r.delta < 0 ? "neg" : "";
    const pctClass   = r.pctChange > 0 ? "pos" : r.pctChange < 0 ? "neg" : "";

    return [
      "<tr" + (flagged ? ' class="row-flagged"' : "") + ">",
      "  <td class='mono'>" + esc(r.materialNumber) + "</td>",
      "  <td>" + esc(r.description) + "</td>",
      "  <td class='sloc'>" + esc(r.sLoc) + "</td>",
      "  <td class='num'>" + fmtNum(r.yesterdayQty) + "</td>",
      "  <td class='num'>" + fmtNum(r.todayQty) + "</td>",
      "  <td class='num " + deltaClass + "'>" + deltaStr + "</td>",
      "  <td class='num " + pctClass   + "'>" + pctStr   + "</td>",
      "  <td>" + badgeHtml(r.status) + "</td>",
      "</tr>",
    ].join("\n");
  }).join("\n");
}

function updateSortHeaders() {
  document.querySelectorAll("thead th[data-sort]").forEach(function (th) {
    const active = th.dataset.sort === sortKey;
    th.classList.toggle("sorted", active);
    const icon = th.querySelector(".sort-icon");
    if (icon) icon.textContent = active ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅";
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV export
// ─────────────────────────────────────────────────────────────────────────────
function exportCSV() {
  const rows = getFilteredRows();
  const headers = ["Material Number","Description","SLoc","Yesterday Qty","Today Qty","Delta","% Change","Status"];
  const lines   = [headers.map(csvEsc).join(",")];

  rows.forEach(function (r) {
    lines.push([
      r.materialNumber,
      r.description,
      r.sLoc,
      r.yesterdayQty,
      r.todayQty,
      r.delta ?? "",
      r.pctChange !== null && r.pctChange !== undefined ? r.pctChange.toFixed(2) : "",
      r.status,
    ].map(csvEsc).join(","));
  });

  const date     = lastUpdated ? lastUpdated.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const blob     = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement("a");
  a.href         = url;
  a.download     = "stock_comparison_" + date + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function renderLastUpdated() {
  if (!lastUpdated) return;
  const d = new Date(lastUpdated);
  const str = d.toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  document.getElementById("last-updated").innerHTML = "Last updated: <strong>" + str + "</strong>";
}

function badgeHtml(status) {
  const map = {
    OK:      ["badge-ok",      "OK"      ],
    UP:      ["badge-up",      "▲ UP"    ],
    DOWN:    ["badge-down",    "▼ DOWN"  ],
    NEW:     ["badge-new",     "NEW"     ],
    MISSING: ["badge-missing", "MISSING" ],
  };
  const [cls, label] = map[status] || map.OK;
  return '<span class="badge ' + cls + '">' + label + "</span>";
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toFixed(1);
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function csvEsc(v) {
  return '"' + String(v ?? "").replace(/"/g, '""') + '"';
}
