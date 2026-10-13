// Date utilities for ProjectManagerApp prototype
// Anchored around current demo date: October 11, 2026

export const DEMO_CURRENT_DATE = "2026-10-11";
export const DEMO_TODAY = "2026-10-11";

/**
 * Formats YYYY-MM-DD to friendly string like "15 Oct 2026" or "15 Oct"
 */
export const formatDate = (dateStr, includeYear = true) => {
  if (!dateStr) return "N/A";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthName = months[month - 1];
  return includeYear ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
};

/**
 * Calculates delay in days between planned end and forecast end
 * Returns number of delayed days (0 if not delayed or earlier)
 */
export const calculateDelayDays = (plannedEndStr, forecastEndStr) => {
  if (!plannedEndStr || !forecastEndStr) return 0;
  const p = new Date(plannedEndStr);
  const f = new Date(forecastEndStr);
  const diffTime = f.getTime() - p.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Checks if a task is overdue relative to DEMO_CURRENT_DATE
 */
export const isOverdue = (plannedEndStr, status) => {
  if (!plannedEndStr || status === "Completed") return false;
  const target = new Date(plannedEndStr);
  const current = new Date(DEMO_CURRENT_DATE);
  return current > target;
};

/**
 * Difference in days between two date strings (end - start)
 */
export const getDaysDifference = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  const s = new Date(startDateStr);
  const e = new Date(endDateStr);
  const diffTime = e.getTime() - s.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Adds days to a date string YYYY-MM-DD
 */
export const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};
