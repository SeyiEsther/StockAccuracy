import { useState, useEffect, useCallback } from "react";
import { MOCK_STOCK_DATA, MOCK_LAST_UPDATED } from "../data/mockData";

// Derive status and delta fields from raw row data.
function enrichRow(row, threshold) {
  const { yesterdayQty, todayQty } = row;

  if (yesterdayQty === 0 && todayQty > 0) {
    return { ...row, delta: todayQty, pctChange: null, status: "NEW" };
  }
  if (yesterdayQty > 0 && todayQty === 0) {
    return { ...row, delta: -yesterdayQty, pctChange: -100, status: "MISSING" };
  }

  const delta = todayQty - yesterdayQty;
  const pctChange = yesterdayQty !== 0 ? (delta / yesterdayQty) * 100 : 0;
  const absPct = Math.abs(pctChange);

  let status = "OK";
  if (absPct >= threshold) status = delta > 0 ? "UP" : "DOWN";

  return { ...row, delta, pctChange, status };
}

// -----------------------------------------------------------------------
// When the backend is ready, replace the mock block below with a real fetch:
//
//   const res = await fetch("/api/stock/comparison");
//   const json = await res.json();
//   setRows(json.data.map(r => enrichRow(r, threshold)));
//   setLastUpdated(json.lastUpdated);
// -----------------------------------------------------------------------

export function useStockData(threshold) {
  const [rows, setRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // Simulate async fetch
    setTimeout(() => {
      try {
        setRows(MOCK_STOCK_DATA.map((r) => enrichRow(r, threshold)));
        setLastUpdated(MOCK_LAST_UPDATED);
      } catch (e) {
        setError("Failed to load stock data.");
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [threshold]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, lastUpdated, loading, error, reload: load };
}
