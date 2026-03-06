// ─── ADMIN LAB PRICING ───────────────────────────────────────
// Admin-only page to view and update fixed lab test prices.
// Every change is audit-logged and requires a confirm step.

import { useState } from "react";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import Confirm from "../../components/ui/Confirm";
import { P } from "../../constants/icons";
import { todayStr } from "../../utils/helpers";

const AdminPricing = ({ state, setState, toast }) => {
    const [editId, setEditId] = useState(null);
    const [newVal, setNewVal] = useState("");
    const [valErr, setValErr] = useState("");
    const [pending, setPending] = useState(null); // { id, old, nw, name }

    // Validate and open confirm dialog
    const requestUpdate = (id) => {
        setValErr("");
        if (!newVal || isNaN(+newVal) || +newVal <= 0) { setValErr("Enter a valid positive number."); return; }
        const item = state.labPricing.find((p) => p.id === id);
        setPending({ id, old: item.price, nw: +parseInt(newVal), name: item.testName });
    };

    // Commit the price update + write audit log
    const confirm = () => {
        setState((s) => ({
            ...s,
            labPricing: s.labPricing.map((p) => p.id === pending.id ? { ...p, price: pending.nw, lastUpdated: todayStr() } : p),
            auditLogs: [...s.auditLogs, { id: s.auditNextId, action: "PRICE_UPDATE", performedBy: "Admin", detail: `${pending.name}: ₹${pending.old}→₹${pending.nw}`, timestamp: todayStr() }],
            auditNextId: s.auditNextId + 1,
        }));
        setEditId(null); setPending(null);
        toast(`"${pending.name}" updated to ₹${pending.nw}. Audit logged.`);
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {pending && (
                <Confirm
                    title="Confirm Price Update"
                    msg={`Change "${pending.name}" from ₹${pending.old} → ₹${pending.nw}? This will be audit-logged.`}
                    onOk={confirm}
                    onCancel={() => setPending(null)}
                    ok="Update"
                    dng
                />
            )}

            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Lab Pricing Management</h2>

            {/* Warning banner */}
            <div className="card" style={{ background: "var(--c3)0e", borderColor: "var(--c3)33" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Ic d={P.alert} size={16} c="var(--c3)" />
                    <span style={{ fontSize: 13, color: "var(--c3)" }}>All price changes are audit-logged. Unauthorized changes trigger fraud alerts.</span>
                </div>
            </div>

            {/* Price table */}
            <div className="card">
                <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["Test Name", "Current Price", "Last Updated", "Action"].map((h) => <th key={h}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {state.labPricing.map((p) => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 500 }}>{p.testName}</td>
                                <td style={{ fontFamily: "var(--m)", color: "var(--c3)" }}>
                                    {editId === p.id ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            <input
                                                value={newVal}
                                                onChange={(e) => { setNewVal(e.target.value); setValErr(""); }}
                                                style={{ width: 110, background: "var(--s3)", border: `1px solid ${valErr ? "var(--c4)" : "var(--c1)"}`, borderRadius: "var(--r)", padding: "6px 10px", color: "var(--tx)", fontFamily: "var(--m)", outline: "none" }}
                                            />
                                            {valErr && <span style={{ fontSize: 10, color: "var(--c4)" }}>⚠ {valErr}</span>}
                                        </div>
                                    ) : (
                                        <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            <Ic d={P.lock} size={11} c="var(--c3)" /> ₹{p.price}
                                        </span>
                                    )}
                                </td>
                                <td style={{ fontFamily: "var(--m)", fontSize: 12, color: "var(--tx2)" }}>{p.lastUpdated || "—"}</td>
                                <td>
                                    {editId === p.id ? (
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <Btn ch="Save" v="pri" sz="sm" onClick={() => requestUpdate(p.id)} />
                                            <Btn ch="Cancel" v="gst" sz="sm" onClick={() => { setEditId(null); setValErr(""); }} />
                                        </div>
                                    ) : (
                                        <Btn ch="Edit" v="gst" sz="sm" onClick={() => { setEditId(p.id); setNewVal(String(p.price)); setValErr(""); }} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPricing;
