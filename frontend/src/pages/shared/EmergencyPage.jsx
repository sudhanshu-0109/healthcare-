// ─── EMERGENCY PAGE ──────────────────────────────────────────
// Patients trigger FCFS emergency broadcasts.
// Hospitals/admins see pending requests and accept or failover.

import { useState, useRef, useEffect } from "react";
import Btn from "../../components/ui/Btn";
import Ic from "../../components/ui/Ic";
import Badge from "../../components/ui/Badge";
import SectionTitle from "../../components/ui/SectionTitle";
import { P } from "../../constants/icons";
import { todayStr } from "../../utils/helpers";

const EmergencyPage = ({ state, setState, user, toast }) => {
    const [active, setActive] = useState(false);
    const [loc, setLoc] = useState("");
    const [countdown, setCd] = useState(0);
    const [gpsLoading, setGpsLoading] = useState(true);
    const cdRef = useRef(null);

    const isHosp = user.role === "hospital";
    const isAdmin = user.role === "admin";
    const hasActive = state.emergencyRequests.some(
        (e) => e.patientId === user.id && (e.status === "REQUESTED" || e.status === "ACCEPTED")
    );

    // Auto-detect GPS on mount
    useEffect(() => {
        if (isHosp || isAdmin) return;
        if (!navigator.geolocation) { setLoc("Vadodara, Gujarat"); setGpsLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            (p) => { setLoc(`Lat:${p.coords.latitude.toFixed(4)}, Lng:${p.coords.longitude.toFixed(4)}`); setGpsLoading(false); },
            () => { setLoc("Vadodara, Gujarat"); setGpsLoading(false); },
            { timeout: 6000 }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => () => clearInterval(cdRef.current), []);

    const getGPS = () => {
        setGpsLoading(true);
        if (!navigator.geolocation) { setLoc("Vadodara, Gujarat"); setGpsLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            (p) => { setLoc(`Lat:${p.coords.latitude.toFixed(4)}, Lng:${p.coords.longitude.toFixed(4)}`); setGpsLoading(false); },
            () => { setLoc("Vadodara, Gujarat"); setGpsLoading(false); },
            { timeout: 6000 }
        );
    };

    // Patient: broadcast emergency to all hospitals
    const trigger = () => {
        if (!loc.trim()) { toast("Enter or detect your location first.", "err"); return; }
        if (hasActive) { toast("Active emergency already in progress.", "err"); return; }
        setActive(true); setCd(100);
        const eid = state.emergNextId;
        const hospitalNotifs = state.users
            .filter((u) => u.role === "hospital")
            .map((h, i) => ({
                id: state.notifNextId + i, userId: h.id, readStatus: false, createdAt: todayStr(),
                message: `🚨 EMERGENCY at ${loc.trim()} — Patient ${user.name} needs help!`, type: "emergency",
            }));
        setState((s) => ({
            ...s,
            emergencyRequests: [...s.emergencyRequests, { id: eid, patientId: user.id, location: loc.trim(), status: "REQUESTED", acceptedHospitalId: null, createdAt: todayStr(), eta: null }],
            notifications: [...s.notifications, ...hospitalNotifs],
            emergNextId: s.emergNextId + 1,
            notifNextId: s.notifNextId + hospitalNotifs.length,
        }));
        toast("🚨 Emergency broadcast sent! Waiting for hospital to accept.");
        let p = 100;
        cdRef.current = setInterval(() => { p -= 1.5; setCd(Math.max(0, p)); if (p <= 0) clearInterval(cdRef.current); }, 100);
    };

    // Hospital: accept a pending emergency (FCFS)
    const accept = (id) => {
        const e = state.emergencyRequests.find((e) => e.id === id);
        if (!e || e.status !== "REQUESTED") { toast("Already accepted by another responder.", "err"); return; }
        const acceptedHosp = state.users.find((u) => u.id === user.id);
        setState((s) => ({
            ...s,
            emergencyRequests: s.emergencyRequests.map((x) => x.id === id ? { ...x, status: "ACCEPTED", acceptedHospitalId: user.id, eta: "8 mins" } : x),
            notifications: [...s.notifications, {
                id: s.notifNextId, userId: e.patientId, readStatus: false, createdAt: todayStr(),
                message: `✅ ${acceptedHosp?.name || "Hospital"} accepted your emergency! Ambulance dispatched — ETA 8 mins.`, type: "emergency",
            }],
            notifNextId: s.notifNextId + 1,
        }));
        toast("Emergency accepted! Ambulance dispatched.");
    };

    const failover = () => toast("Failover triggered: Calling secondary responders and alerting admin.", "err");

    // ── Hospital / Admin view ──
    if (isHosp || isAdmin) {
        const pending = state.emergencyRequests.filter((e) => e.status === "REQUESTED");
        const past = state.emergencyRequests.filter((e) => e.status !== "REQUESTED");

        return (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={{ fontWeight: 800, fontSize: 24 }}>Emergency Monitor</h2>

                {pending.length === 0 ? (
                    <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>All clear. No active emergencies ✅</div>
                ) : (
                    pending.map((e) => {
                        const mm = e.location.match(/Lat:([\.\-\d]+),\s*Lng:([\.\-\d]+)/);
                        const lat = mm?.[1]; const lng = mm?.[2];
                        return (
                            <div key={e.id} className="card danger-anim" style={{ background: "var(--c4)10", borderColor: "var(--c4)55" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                    <div>
                                        <div style={{ color: "var(--c4)", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>🚨 INCOMING EMERGENCY — MANUAL ACCEPT REQUIRED</div>
                                        <div style={{ fontSize: 14, marginBottom: 4, display: "flex", gap: 6 }}><Ic d={P.map} size={14} c="var(--tx2)" /> {e.location}</div>
                                        <div style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 8 }}>
                                            Patient: <strong>{state.users.find((u) => u.id === e.patientId)?.name || "Unknown"}</strong> • {e.createdAt}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--c3)", background: "var(--c3)15", padding: "4px 10px", borderRadius: 8, display: "inline-block" }}>
                                            ⚡ First hospital to accept will be dispatched (FCFS)
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                                        {isHosp && <Btn ch={<><Ic d={P.amb} size={14} c="currentColor" /> Accept & Dispatch</>} v="dng" onClick={() => accept(e.id)} />}
                                        {isAdmin && <Btn ch="Failover" v="gst" sz="sm" onClick={failover} />}
                                    </div>
                                </div>
                                {lat && lng && (
                                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--c4)44" }}>
                                        <iframe title="Patient location map" width="100%" height="220" frameBorder="0" style={{ border: 0 }}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${+lng - .015}%2C${+lat - .015}%2C${+lng + .015}%2C${+lat + .015}&layer=mapnik&marker=${lat}%2C${lng}`}
                                            allowFullScreen />
                                        <div style={{ textAlign: "center", fontSize: 11, color: "var(--tx2)", padding: "5px", background: "var(--s3)" }}>
                                            📍 Patient coordinates: {lat}, {lng}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {past.length > 0 && (
                    <div>
                        <SectionTitle ch="Past Emergencies" />
                        {past.map((e) => (
                            <div key={e.id} className="card" style={{ marginBottom: 10, background: "var(--s3)", display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{e.location}</div>
                                    <div style={{ fontSize: 12, color: "var(--tx2)" }}>{e.createdAt}{e.eta && ` • ETA: ${e.eta}`}</div>
                                    {e.acceptedHospitalId && <div style={{ fontSize: 11, color: "var(--c1)", marginTop: 2 }}>Accepted by: {state.users.find((u) => u.id === e.acceptedHospitalId)?.name || "Hospital"}</div>}
                                </div>
                                <Badge s={e.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Patient view ──
    const myRequests = state.emergencyRequests.filter((e) => e.patientId === user.id);
    const activeReq = myRequests.find((e) => e.status === "REQUESTED" || e.status === "ACCEPTED");
    const mapMatchActive = activeReq?.location.match(/Lat:([\.\-\d]+),\s*Lng:([\.\-\d]+)/);
    const latActive = mapMatchActive?.[1];
    const lngActive = mapMatchActive?.[2];

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 24 }}>Emergency Dispatch</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Left: dispatch button or status */}
                <div>
                    {(active || activeReq) ? (
                        <div className="card" style={{
                            background: activeReq?.status === "ACCEPTED" ? "var(--c1)10" : "var(--c4)10",
                            borderColor: activeReq?.status === "ACCEPTED" ? "var(--c1)44" : "var(--c4)44",
                            textAlign: "center", padding: "32px 24px",
                        }}>
                            {activeReq?.status === "ACCEPTED" ? (
                                <>
                                    <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
                                    <div style={{ fontWeight: 800, fontSize: 20, color: "var(--c1)", marginBottom: 8 }}>
                                        {state.users.find((u) => u.id === activeReq.acceptedHospitalId)?.name || "A Hospital"} Accepted!
                                    </div>
                                    <div style={{ color: "var(--tx2)", fontSize: 14, marginBottom: 10 }}>Ambulance is on the way — stay calm 🚑</div>
                                    <div style={{ background: "var(--c1)", color: "#060b14", padding: "12px 28px", borderRadius: 12, display: "inline-block", fontWeight: 900, fontSize: 28, fontFamily: "var(--m)", marginBottom: 16 }}>
                                        ETA: {activeReq.eta || "—"}
                                    </div>
                                    {latActive && lngActive && (
                                        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--c1)44", marginTop: 8 }}>
                                            <iframe title="Your location map" width="100%" height="200" frameBorder="0" style={{ border: 0 }}
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${+lngActive - .015}%2C${+latActive - .015}%2C${+lngActive + .015}%2C${+latActive + .015}&layer=mapnik&marker=${latActive}%2C${lngActive}`}
                                                allowFullScreen />
                                            <div style={{ textAlign: "center", fontSize: 11, color: "var(--tx2)", padding: "5px", background: "var(--s3)" }}>📍 Your coordinates: {latActive}, {lngActive}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 20px" }}>
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--c4)", opacity: 0, animation: `ring 2s ease-out ${i * .55}s infinite` }} />
                                        ))}
                                        <div style={{ position: "absolute", inset: 0, background: "var(--c4)20", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📡</div>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Broadcasting to hospitals…</div>
                                    <div style={{ color: "var(--tx2)", fontSize: 13, marginBottom: 16 }}>Waiting for a hospital to manually accept your request</div>
                                    <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)", background: "var(--s3)", padding: "8px 16px", borderRadius: 8, display: "inline-block" }}>
                                        📍 Location shared: {activeReq?.location || loc}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
                            {/* Location field */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Your Location (auto-detected)</div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                    <input
                                        value={gpsLoading ? "Detecting location…" : loc}
                                        onChange={(e) => setLoc(e.target.value)}
                                        placeholder="Detecting your location…"
                                        style={{ flex: 1, background: "var(--s3)", border: "1px solid var(--b2)", borderRadius: "var(--r)", padding: "10px 14px", color: "var(--tx)", fontFamily: "var(--f)", fontSize: 13, outline: "none" }}
                                    />
                                    <Btn ch={gpsLoading ? "…" : <><Ic d={P.map} size={14} c="currentColor" /> Refresh</>} v="sec" sz="sm" onClick={getGPS} dis={gpsLoading} />
                                </div>
                                {loc && !gpsLoading && (
                                    <div style={{ fontSize: 11, color: "var(--c1)", background: "var(--c1)12", padding: "5px 10px", borderRadius: 8, marginTop: 4 }}>📍 Location ready</div>
                                )}
                            </div>

                            {/* Big red SOS button */}
                            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{ position: "absolute", inset: -24, borderRadius: "50%", border: "2px solid var(--c4)", opacity: 0, animation: `ring 2.4s ease-out ${i * .7}s infinite` }} />
                                ))}
                                <button onClick={trigger} disabled={hasActive || gpsLoading} style={{
                                    width: 160, height: 160, borderRadius: "50%", border: "none",
                                    background: (hasActive || gpsLoading) ? "var(--tx3)" : "var(--c4)",
                                    color: "#fff", fontSize: 15, fontWeight: 900,
                                    cursor: (hasActive || gpsLoading) ? "not-allowed" : "pointer",
                                    fontFamily: "var(--f)",
                                    boxShadow: (hasActive || gpsLoading) ? "none" : "0 0 40px var(--c4)55",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                                    animation: (hasActive || gpsLoading) ? "none" : "breathe 2s ease infinite",
                                }}>
                                    <span style={{ fontSize: 32 }}>🚨</span>
                                    <span>EMERGENCY</span>
                                    <span style={{ fontSize: 11, opacity: .8 }}>{gpsLoading ? "Locating…" : "Press to dispatch"}</span>
                                </button>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--tx2)" }}>
                                {hasActive ? "Emergency already active — awaiting hospital" : "Broadcasts to all nearby hospitals. FCFS dispatch."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: history */}
                <div>
                    <SectionTitle ch="My Emergency History" />
                    {myRequests.length === 0 ? (
                        <div className="card" style={{ color: "var(--tx2)", textAlign: "center", padding: "30px 0" }}>No past emergencies.</div>
                    ) : (
                        myRequests.map((e) => {
                            const mm = e.location.match(/Lat:([\.\-\d]+),\s*Lng:([\.\-\d]+)/);
                            const lat = mm?.[1]; const lng = mm?.[2];
                            return (
                                <div key={e.id} className="card" style={{ marginBottom: 12, background: "var(--s3)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{e.location}</div>
                                            <div style={{ fontSize: 12, color: "var(--tx2)" }}>{e.createdAt}{e.eta && ` • ETA: ${e.eta}`}</div>
                                            {e.status === "ACCEPTED" && (
                                                <div style={{ fontSize: 12, color: "var(--c1)", fontWeight: 700, marginTop: 4 }}>
                                                    ✓ {state.users.find((u) => u.id === e.acceptedHospitalId)?.name || "Hospital"} accepted — Ambulance en route
                                                </div>
                                            )}
                                            {e.status === "REQUESTED" && (
                                                <div style={{ fontSize: 12, color: "var(--c3)", fontWeight: 600, marginTop: 4, animation: "breathe 1.5s infinite" }}>⏳ Waiting for hospital to accept…</div>
                                            )}
                                        </div>
                                        <Badge s={e.status} />
                                    </div>
                                    {lat && lng && (
                                        <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--b2)", marginTop: 8 }}>
                                            <iframe title="Emergency location map" width="100%" height="160" frameBorder="0" style={{ border: 0 }}
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${+lng - .012}%2C${+lat - .012}%2C${+lng + .012}%2C${+lat + .012}&layer=mapnik&marker=${lat}%2C${lng}`}
                                                allowFullScreen />
                                            <div style={{ textAlign: "center", fontSize: 11, color: "var(--tx2)", padding: "4px 0", background: "var(--s2)" }}>📍 {lat}, {lng}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyPage;
