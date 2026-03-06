// ─── STAT CARD ───────────────────────────────────────────────
// KPI card used on all dashboard pages.

import Ic from "./Ic";
import { P } from "../../constants/icons";

/**
 * @param {object} props
 * @param {string}          props.label
 * @param {string|number}   props.val
 * @param {keyof P}         props.icon      - Icon key from constants/icons.js
 * @param {string}         [props.color]
 * @param {string}         [props.sub]      - Secondary / sub-text
 */
const StatCard = ({ label, val, icon, color = "var(--c1)", sub }) => (
    <div className="card card-lift" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Icon bubble */}
        <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: color + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
        }}>
            <Ic d={P[icon]} size={22} c={color} />
        </div>

        {/* Text */}
        <div>
            <div style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1 }}>{val}</div>
            {sub && <div style={{ fontSize: 11, color: "var(--tx2)", marginTop: 3 }}>{sub}</div>}
        </div>
    </div>
);

export default StatCard;
