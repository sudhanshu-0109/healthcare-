// ─── LAB PRICING VIEW ────────────────────────────────────────
// Read-only page showing all lab test prices set by admin.
// Visible to: patients, doctors, lab technicians.

import Ic from "../../components/ui/Ic";
import { P } from "../../constants/icons";

const LabPricingView = ({ state }) => {
    const pricing = state.labPricing || [];

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>Lab Test Prices</h2>
                <p style={{ color: "var(--tx2)", fontSize: 13 }}>
                    All prices are fixed and set by the admin. No hidden charges.
                </p>
            </div>

            {/* Info banner */}
            <div className="card" style={{ background: "var(--c1)0e", borderColor: "var(--c1)33" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Ic d={P.lock} size={16} c="var(--c1)" />
                    <span style={{ fontSize: 13, color: "var(--c1)" }}>
                        Prices are transparently fixed by admin and audit-logged. What you see is what you pay.
                    </span>
                </div>
            </div>

            {/* Pricing grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {pricing.length === 0 ? (
                    <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>
                        No pricing data available.
                    </div>
                ) : (
                    pricing.map((p) => (
                        <div
                            key={p.id}
                            className="card"
                            style={{
                                background: "var(--s3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.testName}</div>
                                <div style={{ fontSize: 11, color: "var(--tx2)", marginTop: 2 }}>
                                    Last updated: {p.lastUpdated || "—"}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    background: "var(--c3)18",
                                    border: "1px solid var(--c3)44",
                                    borderRadius: 10,
                                    padding: "6px 12px",
                                    fontFamily: "var(--m)",
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "var(--c3)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Ic d={P.lock} size={11} c="var(--c3)" />
                                ₹{p.price}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer note */}
            <div style={{ fontSize: 11, color: "var(--tx2)", textAlign: "center", fontFamily: "var(--m)" }}>
                ✦ All lab test prices are reviewed and updated by the admin team. Contact admin for any discrepancies.
            </div>
        </div>
    );
};

export default LabPricingView;
