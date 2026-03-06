// ─── BADGE COMPONENT ─────────────────────────────────────────
// Renders a coloured pill label for status values such as
// "CONFIRMED", "PENDING", "COMPLETED", etc.

import { SC } from "../../constants/designTokens";

/**
 * @param {object} props
 * @param {string} props.s - Status string (key of SC colour map)
 */
const Badge = ({ s }) => (
    <span
        style={{
            background: (SC[s] || "#4d5a6b") + "22",
            color: SC[s] || "#7b98bc",
            border: `1px solid ${(SC[s] || "#4d5a6b")}44`,
            padding: "2px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontFamily: "var(--m)",
            fontWeight: 600,
            whiteSpace: "nowrap",
        }}
    >
        {s}
    </span>
);

export default Badge;
