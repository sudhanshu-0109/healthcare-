// ─── ICON COMPONENT ──────────────────────────────────────────
// Lightweight wrapper around an SVG path so every icon is
// rendered consistently without importing a heavy icon library.

/**
 * @param {object} props
 * @param {string}  props.d     - SVG path data (from constants/icons.js)
 * @param {number}  [props.size=18] - Width/height in pixels
 * @param {string}  [props.c="currentColor"] - Stroke colour
 * @param {string}  [props.fill="none"]
 */
const Ic = ({ d, size = 18, c = "currentColor", fill = "none" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
    >
        <path d={d} />
    </svg>
);

export default Ic;
