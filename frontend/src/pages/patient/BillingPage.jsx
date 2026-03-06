// ─── BILLING PAGE ────────────────────────────────────────────
// Transparent itemised bill view with UPI payment integration.

import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import Badge from "../../components/ui/Badge";
import { P } from "../../constants/icons";
import api from "../../api";

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const BillingPage = ({ state, setState, user, toast }) => {
    const bills = state.billing.filter((b) => b.patientId === user.id);
    const unpaid = bills.filter((b) => !b.paidStatus).reduce((s, b) => s + b.totalAmount, 0);

    const getUpiUrl = (bill) => {
        const amount = bill.totalAmount || (bill.consultationFee + bill.labFee + bill.pharmacyFee);
        const vpa = "6200036944@ibl";
        const name = encodeURIComponent("Bank Of Baroda");
        const note = encodeURIComponent(`Bill #${bill.id}`);
        return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    };

    const payViaRazorpay = async (bill) => {
        if (!bill || bill.paidStatus) return;
        const amount = bill.totalAmount || (bill.consultationFee + bill.labFee + bill.pharmacyFee);
        if (!amount || amount <= 0) return;

        toast("Initializing payment gateway...", "ok");
        const res = await loadRazorpay();
        if (!res) {
            toast("Failed to load Razorpay SDK. Check your connection.", "err");
            return;
        }

        try {
            // 1. Create order on Django Backend
            const order = await api.createPaymentOrder(amount);

            const RAZORPAY_KEY = "rzp_test_YourKeyId"; // Replace with your real public test key

            // HACKATHON DEMO MODE: If no real key is provided, simulate a successful payment overlay
            if (RAZORPAY_KEY === "rzp_test_YourKeyId") {
                toast("Demo mode: Simulating payment success...", "ok");
                setTimeout(() => {
                    setState((s) => ({
                        ...s,
                        billing: s.billing.map((b) => b.id === bill.id ? { ...b, paidStatus: true, verifiedBadge: true, totalAmount: amount } : b),
                    }));
                    if (toast) toast(`Bill #${bill.id} successfully paid (Demo Mode)!`, "ok");
                }, 1500);
                return;
            }

            // 2. Configure Razorpay Options
            const options = {
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: "healthcare+",
                description: `Payment for Bill #${bill.id}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify payment on Backend
                        await api.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bill_id: bill.id
                        });

                        // 4. Update Frontend State on success
                        setState((s) => ({
                            ...s,
                            billing: s.billing.map((b) => b.id === bill.id ? { ...b, paidStatus: true, verifiedBadge: true, totalAmount: amount } : b),
                        }));
                        if (toast) toast(`Bill #${bill.id} successfully paid via Razorpay!`, "ok");
                    } catch (err) {
                        toast("Payment verification failed on server.", "err");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#00dcb4" // var(--c1)
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            toast("Error setting up payment order.", "err");
            // Fallback to manual mark as paid if backend mock fails
            markPaidAfterUpi(bill);
        }
    };

    // Keep the manual fallback or UPI scanner if they just scan it externally
    const markPaidAfterUpi = (bill) => {
        if (!bill || bill.paidStatus) return;
        const amount = bill.totalAmount || (bill.consultationFee + bill.labFee + bill.pharmacyFee);
        if (!amount || amount <= 0) return;
        setState((s) => ({
            ...s,
            billing: s.billing.map((b) => b.id === bill.id ? { ...b, paidStatus: true, verifiedBadge: true, totalAmount: amount } : b),
        }));
        if (toast) toast(`Bill #${bill.id} marked as paid.`);
    };

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Billing & Transparency</h2>

            {/* Trust banner */}
            <div className="card" style={{ background: "var(--c1)0d", borderColor: "var(--c1)33" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Ic d={P.shield} size={20} c="var(--c1)" />
                    <div>
                        <div style={{ fontWeight: 700, color: "var(--c1)", fontSize: 14 }}>healthcare+ Transparent Billing Guarantee</div>
                        <div style={{ fontSize: 12, color: "var(--tx2)", marginTop: 4 }}>All charges are system-generated. Lab prices are admin-fixed and locked. Every rupee is auditable. Digital receipts stored permanently.</div>
                    </div>
                </div>
            </div>

            {/* Outstanding dues alert */}
            {unpaid > 0 && (
                <div style={{ background: "var(--c4)12", border: "1px solid var(--c4)44", borderRadius: 12, padding: "12px 18px", display: "flex", gap: 10, alignItems: "center" }}>
                    <Ic d={P.alert} size={16} c="var(--c4)" />
                    <div style={{ color: "var(--c4)", fontWeight: 700 }}>Outstanding: ₹{unpaid.toLocaleString()} unpaid</div>
                </div>
            )}

            {/* Bill cards */}
            {bills.length === 0 ? (
                <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No bills generated yet.</div>
            ) : (
                bills.map((b) => {
                    const calcTotal = b.consultationFee + b.labFee + b.pharmacyFee;
                    return (
                        <div key={b.id} className="card" style={{ borderColor: !b.paidStatus ? "var(--c4)44" : "var(--b1)" }}>
                            {/* Bill header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 18 }}>Bill #{b.id}</div>
                                    <div style={{ fontSize: 12, color: "var(--tx2)" }}>{b.createdAt}</div>
                                    {b.receiptId && <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)", marginTop: 2 }}>Receipt: {b.receiptId}</div>}
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    {b.verifiedBadge && (
                                        <span style={{ background: "var(--c1)20", color: "var(--c1)", border: "1px solid var(--c1)44", borderRadius: 99, fontSize: 11, padding: "3px 10px", fontFamily: "var(--m)", display: "flex", gap: 4, alignItems: "center" }}>
                                            <Ic d={P.check} size={11} c="var(--c1)" /> VERIFIED
                                        </span>
                                    )}
                                    <Badge s={b.paidStatus ? "COMPLETED" : "PENDING"} />
                                </div>
                            </div>

                            {/* Itemised breakdown */}
                            <div style={{ background: "var(--s3)", borderRadius: 12, overflow: "hidden" }}>
                                {[
                                    { l: "Consultation Fee", v: b.consultationFee, std: 500, i: "user" },
                                    { l: "Lab Tests", v: b.labFee, std: null, i: "flask" },
                                    { l: "Pharmacy", v: b.pharmacyFee, std: null, i: "pill" },
                                ].map((row) => (
                                    <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--b1)" }}>
                                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                            <Ic d={P[row.i]} size={15} c="var(--tx2)" />
                                            <span style={{ fontSize: 13 }}>{row.l}</span>
                                            {row.std && row.v === row.std && (
                                                <span style={{ fontSize: 10, color: "var(--c1)", fontFamily: "var(--m)", background: "var(--c1)15", padding: "1px 7px", borderRadius: 99 }}>STANDARD RATE</span>
                                            )}
                                        </div>
                                        <span style={{ fontFamily: "var(--m)", fontWeight: 600 }}>₹{row.v}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "var(--c1)12" }}>
                                    <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
                                    <span style={{ fontFamily: "var(--m)", fontWeight: 800, fontSize: 22, color: "var(--c1)" }}>₹{calcTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment actions */}
                            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                                    <span style={{ fontSize: 12, color: "var(--tx2)" }}>
                                        {b.paidStatus
                                            ? "Bill marked as paid via UPI."
                                            : "Scan QR code or click 'Pay on Mobile'. Then mark as paid."}
                                    </span>
                                    {!b.paidStatus && (
                                        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
                                            <div style={{ background: "#fff", padding: 6, borderRadius: 8 }}>
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(getUpiUrl(b))}`}
                                                    alt="UPI QR Code"
                                                    width="90"
                                                    height="90"
                                                />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                <span style={{ fontSize: 12, color: "var(--tx2)", fontFamily: "var(--m)" }}>
                                                    UPI ID: <span style={{ color: "var(--tx)" }}>6200036944@ibl</span>
                                                </span>
                                                <span style={{ fontSize: 12, color: "var(--tx2)", fontFamily: "var(--m)" }}>
                                                    Name: <span style={{ color: "var(--tx)" }}>Bank Of Baroda</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!b.paidStatus ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                                        <Btn ch={<><Ic d={P.dollar} size={14} c="currentColor" /> Pay with Razorpay</>} v="pri" onClick={() => payViaRazorpay(b)} />
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <Btn ch="Manual UPI Link" v="sec" onClick={() => {
                                                try { window.open(getUpiUrl(b), "_blank"); } catch { }
                                            }} sz="sm" />
                                            <Btn ch="Force Mark Paid" v="sec" onClick={() => markPaidAfterUpi(b)} sz="sm" />
                                        </div>
                                    </div>
                                ) : (
                                    <Btn ch="Paid Confirmed" v="gst" dis={true} />
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default BillingPage;
