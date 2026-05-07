// dashboard.js — client-side interactivity for Stock Accuracy Monitor
//
// Data is injected by the Razor page as window.STOCK_DATA (array of StockRow).
// All filtering, sorting, threshold logic, and chart rendering happens here.
// The server does the heavy lifting (data fetch, delta/pctChange calc);
// this file only handles display.

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────
  var allRows      = window.STOCK_DATA || [];
  var activeFilter = "ALL";
  var activeSLoc   = "";
  var searchQuery  = "";
  var threshold    = 10;
  var sortKey      = "pctChange";
  var sortDir      = "desc";
  var chart        = null;

  // ── Bootstrap ──────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    renderSummaryCards();
    renderChart();
    renderTable();
    bindControls();
  });

  // ── Control bindings ───────────────────────────────────────────────────
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

    // SLoc buttons (rendered by Razor, so they exist in DOM at this point)
    document.querySelectorAll(".sloc-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var clicked = btn.dataset.sloc;
        activeSLoc  = activeSLoc === clicked ? "" : clicked;
        document.querySelectorAll(".sloc-tab").forEach(function (b) {
          b.classList.toggle("active", b.dataset.sloc === activeSLoc);
        });
        renderTable();
      });
    });

    // Search
    document.getElementById("search").addEventListener("input", function () {
      searchQuery = this.value.trim().toLowerCase();
      renderTable();
    });

    // Threshold — re-evaluates UP/DOWN status for every row
    document.getElementById("threshold").addEventListener("change", function () {
      threshold = Math.max(1, Math.min(100, parseInt(this.value, 10) || 10));
      this.value = threshold;
      renderSummaryCards();
      renderChart();
      renderTable();
    });

    // Export
    document.getElementById("btn-export").addEventListener("click", exportCSV);

    // Sortable column headers
    document.querySelectorAll("thead th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.dataset.sort;
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

  // ── Status resolution (applied client-side so threshold is live) ───────
  // isNew / isMissing come from the server; UP/DOWN/OK depend on threshold.
  function getStatus(row) {
    if (row.isNew)     return "NEW";
    if (row.isMissing) return "MISSING";
    if (row.pctChange === null || row.pctChange === undefined) return "OK";
    return Math.abs(row.pctChange) >= threshold
      ? (row.pctChange > 0 ? "UP" : "DOWN")
      : "OK";
  }

  // ── Summary cards ──────────────────────────────────────────────────────
  function renderSummaryCards() {
    var total   = allRows.length;
    var flagged = 0, newCount = 0, missing = 0;
    allRows.forEach(function (r) {
      var s = getStatus(r);
      if (s === "UP" || s === "DOWN") flagged++;
      if (s === "NEW")     newCount++;
      if (s === "MISSING") missing++;
    });
    document.getElementById("card-total").textContent   = total;
    document.getElementById("card-flagged").textContent = flagged;
    document.getElementById("card-new").textContent     = newCount;
    document.getElementById("card-missing").textContent = missing;
  }

  // ── Chart ──────────────────────────────────────────────────────────────
  var POINT_COLORS = { UP: "#22c55e", DOWN: "#ef4444", NEW: "#8b5cf6", MISSING: "#f59e0b", OK: "#4b5563" };

  function renderChart() {
    var chartData = allRows
      .filter(function (r) { return r.pctChange !== null && r.pctChange !== undefined; })
      .map(function (r)    { return { row: r, status: getStatus(r) }; })
      .sort(function (a, b) { return Math.abs(b.row.pctChange) - Math.abs(a.row.pctChange); })
      .slice(0, 12);

    var labels      = chartData.map(function (d) { return truncate(d.row.description, 20); });
    var values      = chartData.map(function (d) { return parseFloat(d.row.pctChange.toFixed(1)); });
    var pointColors = chartData.map(function (d) { return POINT_COLORS[d.status] || POINT_COLORS.OK; });
    var fullLabels  = chartData.map(function (d) {
      return d.row.description + " (" + d.row.materialNumber + ") — SLoc " + d.row.sLoc;
    });

    var ctx = document.getElementById("changes-chart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          data:               values,
          pointBackgroundColor: pointColors,
          pointBorderColor:   pointColors,
          pointRadius:        6,
          pointHoverRadius:   9,
          borderColor:        "#3b82f6",
          backgroundColor:    "rgba(59,130,246,0.08)",
          borderWidth:        2,
          fill:               true,
          tension:            0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return fullLabels[items[0].dataIndex]; },
              label: function (item) {
                var r = chartData[item.dataIndex].row;
                return [
                  "Change: " + (item.raw >= 0 ? "+" : "") + item.raw + "%",
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
            ticks: { color: "#9ca3af", font: { size: 11 }, callback: function (v) { return v + "%"; } },
            grid:  { color: "#2d3142" }
          }
        }
      }
    });
  }

  // ── Table ──────────────────────────────────────────────────────────────
  function getFilteredRows() {
    var rows = allRows.map(function (r) { return Object.assign({}, r, { _status: getStatus(r) }); });

    if (activeFilter === "FLAGGED") rows = rows.filter(function (r) { return r._status === "UP" || r._status === "DOWN"; });
    else if (activeFilter !== "ALL") rows = rows.filter(function (r) { return r._status === activeFilter; });

    if (activeSLoc) rows = rows.filter(function (r) { return r.sLoc === activeSLoc; });

    if (searchQuery) rows = rows.filter(function (r) {
      return r.materialNumber.toLowerCase().includes(searchQuery) ||
             r.description.toLowerCase().includes(searchQuery);
    });

    return rows.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (av === null || av === undefined) av = sortDir === "asc" ?  1e9 : -1e9;
      if (bv === null || bv === undefined) bv = sortDir === "asc" ?  1e9 : -1e9;
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }

  function renderTable() {
    var rows  = getFilteredRows();
    var tbody = document.getElementById("table-body");

    document.getElementById("table-meta").innerHTML =
      "Showing <strong>" + rows.length + "</strong> of <strong>" + allRows.length + "</strong> materials";

    if (rows.length === 0) {
      tbody.innerHTML = "<tr><td colspan=\"8\" class=\"empty-state\">No materials match the current filters.</td></tr>";
      return;
    }

    tbody.innerHTML = rows.map(function (r) {
      var flagged  = r._status === "UP" || r._status === "DOWN";
      var sign     = function (n) { return n >= 0 ? "+" : ""; };
      var deltaStr = r.delta !== null && r.delta !== undefined ? sign(r.delta) + fmtNum(r.delta) : "—";
      var pctStr   = r.pctChange !== null && r.pctChange !== undefined ? sign(r.pctChange) + r.pctChange.toFixed(1) + "%" : "—";
      var dCls     = r.delta > 0 ? "pos" : r.delta < 0 ? "neg" : "";
      var pCls     = r.pctChange > 0 ? "pos" : r.pctChange < 0 ? "neg" : "";

      return "<tr" + (flagged ? " class=\"row-flagged\"" : "") + ">" +
        "<td class=\"mono\">" + esc(r.materialNumber) + "</td>" +
        "<td>" + esc(r.description) + "</td>" +
        "<td class=\"sloc\">" + esc(r.sLoc) + "</td>" +
        "<td class=\"num\">" + fmtNum(r.yesterdayQty) + "</td>" +
        "<td class=\"num\">" + fmtNum(r.todayQty) + "</td>" +
        "<td class=\"num " + dCls + "\">" + deltaStr + "</td>" +
        "<td class=\"num " + pCls + "\">" + pctStr + "</td>" +
        "<td>" + badgeHtml(r._status) + "</td>" +
        "</tr>";
    }).join("");
  }

  function updateSortHeaders() {
    document.querySelectorAll("thead th[data-sort]").forEach(function (th) {
      var active = th.dataset.sort === sortKey;
      th.classList.toggle("sorted", active);
      var icon = th.querySelector(".sort-icon");
      if (icon) icon.textContent = active ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅";
    });
  }

  // ── CSV export ─────────────────────────────────────────────────────────
  function exportCSV() {
    var rows    = getFilteredRows();
    var headers = ["Material Number", "Description", "SLoc", "Yesterday Qty", "Today Qty", "Delta", "% Change", "Status"];
    var lines   = [headers.map(csvEsc).join(",")];

    rows.forEach(function (r) {
      lines.push([
        r.materialNumber, r.description, r.sLoc,
        r.yesterdayQty, r.todayQty,
        r.delta !== null ? r.delta : "",
        r.pctChange !== null && r.pctChange !== undefined ? r.pctChange.toFixed(2) : "",
        r._status,
      ].map(csvEsc).join(","));
    });

    var today = new Date().toISOString().slice(0, 10);
    var blob  = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    var url   = URL.createObjectURL(blob);
    var a     = document.createElement("a");
    a.href    = url;
    a.download = "stock_comparison_" + today + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  function badgeHtml(status) {
    var map = {
      OK:      ["badge-ok",      "OK"       ],
      UP:      ["badge-up",      "▲ UP" ],
      DOWN:    ["badge-down",    "▼ DOWN"],
      NEW:     ["badge-new",     "NEW"      ],
      MISSING: ["badge-missing", "MISSING"  ],
    };
    var parts = map[status] || map.OK;
    return "<span class=\"badge " + parts[0] + "\">" + parts[1] + "</span>";
  }

  function fmtNum(n) {
    if (n === null || n === undefined) return "—";
    return Number.isInteger(n) ? n.toLocaleString("en-GB") : parseFloat(n).toLocaleString("en-GB");
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
  }

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function csvEsc(v) {
    return '"' + String(v !== null && v !== undefined ? v : "").replace(/"/g, '""') + '"';
  }

  function isNumericKey(k) {
    return ["yesterdayQty", "todayQty", "delta", "pctChange"].indexOf(k) !== -1;
  }

}());
