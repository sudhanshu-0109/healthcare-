// ─── NOTIFICATIONS PAGE ──────────────────────────────────────
// Show all notifications for the current user with read/unread state.

import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import { P } from "../../constants/icons";

// Icon and colour mappings by notification type
const NOTIF_ICONS = { appointment: "cal", lab: "flask", billing: "dollar", medicine: "pill", emergency: "amb", pharmacy: "pill", queue: "clock" };
const NOTIF_COLORS = { appointment: "var(--c1)", lab: "var(--c2)", billing: "var(--c3)", medicine: "var(--c5)", emergency: "var(--c4)", pharmacy: "var(--c1)", queue: "var(--c2)" };

const NotifPage = ({ state, setState, user }) => {
    const notifs = state.notifications.filter((n) => n.userId === user.id).slice().reverse();
    const unread = notifs.filter((n) => !n.readStatus).length;

    const markOne = (id) =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, readStatus: true } : n) }));

    const markAll = () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.userId === user.id ? { ...n, readStatus: true } : n) }));

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: 24 }}>Notifications</h2>
                    {unread > 0 && <div style={{ fontSize: 12, color: "var(--tx2)", marginTop: 2 }}>{unread} unread</div>}
                </div>
                {unread > 0 && <Btn ch="Mark all read" v="gst" sz="sm" onClick={markAll} />}
            </div>

            {notifs.length === 0 ? (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>All caught up! 🎉</div>
            ) : (
                notifs.map((n) => {
                    const ic = NOTIF_ICONS[n.type] || "bell";
                    const cl = NOTIF_COLORS[n.type] || "var(--c1)";
                    return (
                        <div
                            key={n.id}
                            onClick={() => markOne(n.id)}
                            style={{
                                background: n.readStatus ? "var(--s2)" : "var(--c1)08",
                                border: `1px solid ${n.readStatus ? "var(--b1)" : "var(--c1)2a"}`,
                                borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                                transition: "all .18s", display: "flex", gap: 14, alignItems: "flex-start",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                            {/* Icon bubble */}
                            <div style={{ width: 36, height: 36, background: `${cl}20`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Ic d={P[ic]} size={16} c={cl} />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 4 }}>{n.message}</div>
                                <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)" }}>{n.createdAt}</div>
                            </div>

                            {/* Unread dot */}
                            {!n.readStatus && (
                                <span style={{ background: "var(--c1)22", color: "var(--c1)", borderRadius: 99, fontSize: 10, padding: "2px 8px", fontFamily: "var(--m)", flexShrink: 0 }}>NEW</span>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default NotifPage;
