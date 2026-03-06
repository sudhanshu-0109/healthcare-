// ─── PHARMACY PAGE ───────────────────────────────────────────
// Pharmacy staff confirm pickups; patients view their orders.

import Btn from "../../components/ui/Btn";
import Badge from "../../components/ui/Badge";
import { todayStr } from "../../utils/helpers";

const PharmacyPage = ({ state, setState, user, toast }) => {
    const isPharm = user.role === "pharmacy";
    const orders = isPharm
        ? state.pharmacyOrders
        : state.pharmacyOrders.filter((o) => o.patientId === user.id);

    const confirmPickup = (id) => {
        const ord = state.pharmacyOrders.find((o) => o.id === id);
        setState((s) => {
            let billing = s.billing;
            let nextBillId = s.billNextId;

            if (ord && ord.totalAmount > 0) {
                let bill = s.billing.find((b) => b.patientId === ord.patientId && !b.paidStatus);
                if (!bill) {
                    const idBill = nextBillId;
                    bill = { id: idBill, patientId: ord.patientId, consultationFee: 0, labFee: 0, pharmacyFee: ord.totalAmount, totalAmount: ord.totalAmount, paidStatus: false, createdAt: todayStr(), receiptId: `HP-RCP-${String(idBill).padStart(3, "0")}`, verifiedBadge: false };
                    billing = [...billing, bill];
                    nextBillId = nextBillId + 1;
                } else {
                    const updated = { ...bill, pharmacyFee: bill.pharmacyFee + ord.totalAmount };
                    updated.totalAmount = updated.consultationFee + updated.labFee + updated.pharmacyFee;
                    billing = s.billing.map((b) => (b.id === bill.id ? updated : b));
                }
            }

            return {
                ...s,
                pharmacyOrders: s.pharmacyOrders.map((o) => o.id === id ? { ...o, pickedUp: true, status: "PICKED_UP" } : o),
                billing,
                billNextId: nextBillId,
            };
        });

        if (ord) {
            setState((s) => ({
                ...s,
                notifications: [...s.notifications, {
                    id: s.notifNextId, userId: ord.patientId, readStatus: false,
                    createdAt: todayStr(), message: `💊 Medicines picked up. Reminders are now active.`, type: "medicine",
                }],
                notifNextId: s.notifNextId + 1,
            }));
        }
        toast("Pickup confirmed! Medicine reminders activated.");
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Pharmacy {isPharm ? "Orders" : "/ My Medicines"}</h2>

            {orders.length === 0 ? (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "40px 0" }}>No pharmacy orders.</div>
            ) : (
                orders.map((o) => {
                    const px = state.prescriptions.find((p) => p.id === o.prescriptionId);
                    return (
                        <div key={o.id} className="card" style={{ background: "var(--s3)" }}>
                            {/* Order header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>Order #{o.id}</div>
                                    <div style={{ fontSize: 12, color: "var(--tx2)" }}>Patient: {px?.patientName || "—"} • Generated: {o.generatedAt}</div>
                                    {px && <div style={{ fontSize: 12, color: "var(--tx2)" }}>Diagnosis: {px.diagnosis}</div>}
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <Badge s={o.status} />
                                    {o.remindersActive && (
                                        <span style={{ fontSize: 10, color: "var(--c1)", fontFamily: "var(--m)", background: "var(--c1)15", padding: "2px 8px", borderRadius: 99 }}>REMINDERS ON</span>
                                    )}
                                </div>
                            </div>

                            {/* Item breakdown */}
                            <div style={{ background: "var(--s2)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                                <div style={{ padding: "8px 14px", fontSize: 11, color: "var(--tx2)", borderBottom: "1px solid var(--b1)", fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: .5 }}>Items</div>
                                {o.items.map((it, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--b1)" }}>
                                        <span style={{ fontSize: 13 }}>{it.name} × {it.qty}</span>
                                        <span style={{ fontFamily: "var(--m)", color: "var(--c3)" }}>₹{it.unitPrice * it.qty}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--c1)15" }}>
                                    <span style={{ fontWeight: 700 }}>Total</span>
                                    <span style={{ fontFamily: "var(--m)", fontWeight: 800, color: "var(--c1)" }}>₹{o.totalAmount}</span>
                                </div>
                            </div>

                            {/* Action button */}
                            {(isPharm || !o.pickedUp) && (
                                <Btn ch={o.pickedUp ? "✓ Picked Up" : "Confirm Pickup"}
                                    v={o.pickedUp ? "gst" : "pri"} dis={o.pickedUp}
                                    onClick={() => !o.pickedUp && confirmPickup(o.id)} />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default PharmacyPage;
