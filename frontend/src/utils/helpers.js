// ─── UTILITY HELPERS ─────────────────────────────────────────
// Pure, stateless helper functions used across multiple pages.

/** Returns today's date as "YYYY-MM-DD". */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Returns true if the given date string is strictly in the past
 * (midnight comparison — "today" is NOT considered past).
 */
export const isDatePast = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    return target < today;
};
