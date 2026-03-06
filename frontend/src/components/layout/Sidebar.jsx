// ─── SIDEBAR NAVIGATION ──────────────────────────────────────
// Role-aware left navigation panel with unread notification badge.

import Ic from "../ui/Ic";
import { P } from "../../constants/icons";

// Navigation menu items per role
const MENUS = {
    patient: [
        { k: "dashboard", l: "Dashboard", i: "trend" },
        { k: "appointments", l: "Appointments", i: "cal" },
        { k: "queue", l: "My Queue", i: "clock" },
        { k: "prescriptions", l: "Prescriptions", i: "clip" },
        { k: "pharmacy", l: "Pharmacy", i: "pill" },
        { k: "lab", l: "Lab Reports", i: "flask" },
        { k: "billing", l: "Billing", i: "dollar" },
        { k: "timeline", l: "Timeline", i: "timeline" },
        { k: "emergency", l: "Emergency", i: "amb" },
        { k: "notifications", l: "Notifications", i: "bell" },
    ],
    doctor: [
        { k: "dashboard", l: "Dashboard", i: "trend" },
        { k: "queue", l: "Patient Queue", i: "list" },
        { k: "prescriptions", l: "Prescriptions", i: "clip" },
        { k: "lab", l: "Lab Requests", i: "flask" },
        { k: "notifications", l: "Notifications", i: "bell" },
    ],
    lab: [
        { k: "dashboard", l: "Dashboard", i: "trend" },
        { k: "requests", l: "Lab Requests", i: "flask" },
        { k: "pricing", l: "Know the Pricing", i: "dollar" },
        { k: "notifications", l: "Notifications", i: "bell" },
    ],
    pharmacy: [
        { k: "dashboard", l: "Dashboard", i: "trend" },
        { k: "orders", l: "Orders", i: "pill" },
        { k: "notifications", l: "Notifications", i: "bell" },
    ],
    admin: [
        { k: "dashboard", l: "Analytics", i: "trend" },
        { k: "pricing", l: "Lab Pricing", i: "dollar" },
        { k: "fraud", l: "Fraud Detect", i: "shield" },
        { k: "emergency", l: "Emergencies", i: "amb" },
        { k: "audit", l: "Audit Log", i: "receipt" },
        { k: "leave-requests", l: "Leave Requests", i: "cal" },
        { k: "users", l: "Users", i: "user" },
    ],
    hospital: [
        { k: "dashboard", l: "Dashboard", i: "trend" },
        { k: "emergency", l: "Emergency Req.", i: "amb" },
    ],
};

/**
 * @param {object}   props
 * @param {object}   props.user
 * @param {string}   props.active    - Current page key
 * @param {function} props.setActive
 * @param {function} props.onLogout
 * @param {number}   props.unread    - Unread notification count
 */
const Sidebar = ({ user, active, setActive, onLogout, unread }) => {
    const menu = MENUS[user.role] || [];

    return (
        <aside style={{
            width: 230,
            minHeight: "100vh",
            background: "var(--s1)",
            borderRight: "1px solid var(--b1)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
        }}>
            {/* ── Brand header ── */}
            <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid var(--b1)" }}>
                {/* Logo mark + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                        width: 36, height: 36, background: "var(--c1)", borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }} className="glow-c1">
                        <Ic d={P.heart} size={18} c="#060b14" fill="#060b14" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px", color: "var(--c1)" }}>
                            healthcare<span style={{ color: "var(--tx)" }}>+</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--m)" }}>v2.0 — audited</div>
                    </div>
                </div>

                {/* Logged-in user chip */}
                <div style={{
                    background: "var(--s3)", borderRadius: "var(--r)",
                    padding: "10px 12px", display: "flex", gap: 10, alignItems: "center",
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "var(--c1)22", border: "2px solid var(--c1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, color: "var(--c1)", fontSize: 14, flexShrink: 0,
                    }}>
                        {user.name[0]}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--c1)", fontFamily: "var(--m)", textTransform: "uppercase" }}>
                            {user.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                {menu.map((item) => {
                    const isActive = active === item.k;
                    const badgeCount = item.k === "notifications" && unread > 0 ? unread : 0;

                    return (
                        <button
                            key={item.k}
                            onClick={() => setActive(item.k)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 11px",
                                borderRadius: "var(--r)",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                background: isActive ? "var(--c1)1a" : "transparent",
                                color: isActive ? "var(--c1)" : "var(--tx2)",
                                fontWeight: isActive ? 700 : 500,
                                fontSize: 13,
                                fontFamily: "var(--f)",
                                position: "relative",
                                transition: "all .14s",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "var(--s3)";
                                    e.currentTarget.style.color = "var(--tx)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "var(--tx2)";
                                }
                            }}
                        >
                            <Ic d={P[item.i]} size={15} c="currentColor" />
                            {item.l}
                            {badgeCount > 0 && (
                                <span style={{
                                    position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
                                    background: "var(--c4)", color: "#fff", borderRadius: 99,
                                    fontSize: 10, padding: "1px 6px", fontFamily: "var(--m)",
                                    minWidth: 20, textAlign: "center",
                                }}>
                                    {badgeCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Sign out ── */}
            <div style={{ padding: "10px 8px", borderTop: "1px solid var(--b1)" }}>
                <button
                    onClick={onLogout}
                    style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 11px", borderRadius: "var(--r)", border: "none", cursor: "pointer",
                        background: "transparent", color: "var(--tx2)",
                        fontFamily: "var(--f)", fontSize: 13, fontWeight: 500, width: "100%",
                        transition: "all .14s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--c4)18"; e.currentTarget.style.color = "var(--c4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tx2)"; }}
                >
                    <Ic d={P.logout} size={15} c="currentColor" /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
