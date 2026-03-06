// ─── FRAUD DETECTION PAGE ────────────────────────────────────
// Automated anomaly flags built from the current billing and
// pricing data. No backend required — runs client-side.

import Ic from "../../components/ui/Ic";
import { P } from "../../constants/icons";

// Severity → colour token
const SEV_COLORS = { HIGH: "var(--c4)", WARN: "var(--c3)", INFO: "var(--c2)" };

const FraudPage = ({ state }) => {
    // Build flags from existing data
    const flags = [
        // Lab price above ₹800 threshold
        ...state.labPricing
            .filter((p) => p.price > 800)
            .map((p) => ({ type: "HIGH_PRICE", detail: `${p.testName} at ₹${p.price} exceeds threshold`, sev: "WARN", date: p.lastUpdated })),

        // Bill total above ₹5,000 threshold
        ...state.billing
            .filter((b) => b.totalAmount > 5000)
            .map((b) => ({ type: "LARGE_BILL", detail: `Bill #${b.id} total ₹${b.totalAmount}`, sev: "HIGH", date: b.createdAt })),

        // Unpaid bills
        ...state.billing
            .filter((b) => !b.paidStatus)
            .map((b) => ({ type: "UNPAID", detail: `Bill #${b.id} of ₹${b.totalAmount} unpaid`, sev: "INFO", date: b.createdAt })),
    ];

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Fraud Detection</h2>

            {/* System status banner */}
            <div className="card" style={{ background: "var(--c5)0e", borderColor: "var(--c5)33", display: "flex", gap: 10, alignItems: "center" }}>
                <Ic d={P.shield} size={18} c="var(--c5)" />
                <span style={{ fontSize: 13, color: "var(--c5)" }}>
                    Automated anomaly detection running. {flags.length} flag{flags.length !== 1 ? "s" : ""} detected.
                </span>
            </div>

            {/* Flag cards */}
            {flags.length === 0 ? (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No anomalies detected. System clean ✅</div>
            ) : (
                flags.map((f, i) => {
                    const col = SEV_COLORS[f.sev];
                    return (
                        <div key={i} className="card" style={{ borderColor: `${col}44`, background: `${col}0a` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <Ic d={P.alert} size={18} c={col} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: col, fontSize: 13 }}>{f.type}</div>
                                        <div style={{ fontSize: 12, color: "var(--tx2)" }}>{f.detail}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: col, fontFamily: "var(--m)" }}>{f.date}</span>
                                    <span style={{ background: `${col}25`, color: col, borderRadius: 99, fontSize: 10, padding: "2px 8px", fontFamily: "var(--m)" }}>{f.sev}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default FraudPage;
