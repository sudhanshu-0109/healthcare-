// ─── LANDING PAGE ────────────────────────────────────────────
// Public marketing + auth page. No login required to view.

import { useState, useRef } from "react";
import { api } from "../../api";
import Btn from "../ui/Btn";
import Ic from "../ui/Ic";
import { Inp, Sel } from "../ui/FormFields";
import { P } from "../../constants/icons";
import ThemeToggle from "../ui/ThemeToggle";

/**
 * @param {object}   props
 * @param {function} props.onLogin       - Receives user object on success
 * @param {Array}    props.users         - Current user list (for demo logins)
 * @param {function} props.setState      - Global state setter
 * @param {string}   props.theme         - Current theme ("light" | "dark")
 * @param {function} props.onToggleTheme - Toggle theme handler
 */
const LandingPage = ({ onLogin, users, setState, theme = "dark", onToggleTheme }) => {
    // ── Auth modal state ──
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState("login"); // "login" | "register"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [regRole, setRegRole] = useState("patient");
    const [specialty, setSpecialty] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Emergency button state ──
    const [holdPct, setHoldPct] = useState(0);
    const [emergActive, setEmergActive] = useState(false);
    const holdRef = useRef(null);
    const holdStart = useRef(null);

    // ── Auth helpers ──
    const openAuth = (mode) => {
        setAuthMode(mode); setErr(""); setName(""); setEmail(""); setPass("");
        setRegRole("patient"); setSpecialty(""); setShowAuth(true);
    };

    const handleLogin = async () => {
        setErr(""); setLoading(true);
        try {
            const u = await api.login(email.trim(), pass);
            if (!u) throw new Error("Invalid credentials.");
            setState((s) => ({
                ...s,
                users: s.users.some((x) => x.id === u.id) ? s.users : [...s.users, u],
            }));
            onLogin(u);
            setShowAuth(false);
        } catch (e) {
            setErr(e.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name.trim()) { setErr("Name is required."); return; }
        if (!email.trim()) { setErr("Email is required."); return; }
        if (!pass || pass.length < 3) { setErr("Password must be at least 3 characters."); return; }
        setErr(""); setLoading(true);
        try {
            const u = await api.register({
                name: name.trim(), email: email.trim(), password: pass,
                role: regRole, specialty: regRole === "doctor" ? specialty.trim() : "",
            });
            setState((s) => ({
                ...s,
                users: s.users.some((x) => x.id === u.id) ? s.users : [...s.users, u],
            }));
            onLogin(u);
            setShowAuth(false);
        } catch (e) {
            setErr(e.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    // ── Emergency hold ──
    const startHold = () => {
        holdStart.current = Date.now();
        holdRef.current = setInterval(() => {
            const p = Math.min(100, ((Date.now() - holdStart.current) / 3000) * 100);
            setHoldPct(p);
            if (p >= 100) { clearInterval(holdRef.current); setEmergActive(true); }
        }, 50);
    };
    const endHold = () => { clearInterval(holdRef.current); if (holdPct < 100) setHoldPct(0); };

    // ── Static content ──
    const demos = [
        { l: "Patient", e: "👤", r: "patient" },
        { l: "Doctor", e: "🩺", r: "doctor" },
        { l: "Lab", e: "🔬", r: "lab" },
        { l: "Pharmacy", e: "💊", r: "pharmacy" },
        { l: "Admin", e: "🛡", r: "admin" },
        { l: "Hospital", e: "🏥", r: "hospital" },
    ];
    const services = [
        { icon: "cal", t: "Smart Scheduling", d: "AI-assisted queue management with real-time slot allocation" },
        { icon: "flask", t: "Lab Integration", d: "Fixed-price lab tests with instant report delivery" },
        { icon: "amb", t: "Emergency 24/7", d: "GPS-based rapid dispatch with FCFS hospital matching" },
        { icon: "pill", t: "Pharmacy Connect", d: "Digital prescriptions with auto-reminder generation" },
        { icon: "dollar", t: "Transparent Bills", d: "Every charge itemized, audited, and digitally receipted" },
        { icon: "shield", t: "Secure & Audited", d: "Role-based access, audit logs, fraud detection built-in" },
    ];
    const doctors = [
        { n: "Dr. Priya Mehta", s: "General Medicine", exp: "12 yrs", av: true },
        { n: "Dr. Arjun Sharma", s: "Cardiology", exp: "18 yrs", av: true },
        { n: "Dr. Kavya Nair", s: "Pediatrics", exp: "9 yrs", av: false },
        { n: "Dr. Rahul Joshi", s: "Orthopedics", exp: "14 yrs", av: true },
    ];
    const hospitals = [
        "City General Hospital", "Vadodara Medicity",
        "SSG Hospital", "Baroda Heart Institute", "Sterling Hospital",
    ];

    return (
        <div style={{ width: "100vw", height: "100vh", background: "var(--bg)", overflowY: "auto", position: "relative" }}>

            {/* ══ NAVBAR ══ */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 100,
                background: "var(--s1)cc", backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--b1)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 40px", height: 60,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "var(--c1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ic d={P.heart} size={16} c="#060b14" fill="#060b14" />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 18, color: "var(--c1)", letterSpacing: "-0.5px" }}>
                        healthcare<span style={{ color: "var(--tx)" }}>+</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: 28, fontSize: 13, color: "var(--tx2)" }}>
                    {["Services", "Doctors", "Hospitals", "Emergency"].map((l) => (
                        <a
                            key={l}
                            href={`#${l.toLowerCase()}`}
                            style={{ color: "var(--tx2)", textDecoration: "none", transition: "color .15s" }}
                            onMouseEnter={(e) => (e.target.style.color = "var(--c1)")}
                            onMouseLeave={(e) => (e.target.style.color = "var(--tx2)")}>
                            {l}
                        </a>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    <Btn ch="Login" v="gst" sz="sm" onClick={() => openAuth("login")} />
                    <Btn ch="Register" v="pri" sz="sm" onClick={() => openAuth("register")} />
                </div>
            </nav>

            {/* ══ HERO ══ */}
            <section style={{ minHeight: "88vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "60px 40px" }}>
                {/* Background decorations */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 700, height: 700, background: "radial-gradient(circle,#00f5d40e 0%,transparent 65%)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", bottom: "-20%", right: "-5%", width: 600, height: 600, background: "radial-gradient(circle,#3b9eff0a 0%,transparent 65%)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)", backgroundSize: "60px 60px", opacity: .18 }} />
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
                    {/* Left: Hero copy */}
                    <div className="fade-up">
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--c1)15", border: "1px solid var(--c1)33", borderRadius: 99, padding: "5px 14px", fontSize: 11, color: "var(--c1)", fontFamily: "var(--m)", marginBottom: 20 }}>
                            ✦ HEALTHCARE+ PLATFORM v2.0 — FULLY AUDITED
                        </div>
                        <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 20 }}>
                            The Future of<br /><span style={{ color: "var(--c1)" }}>Smart Healthcare</span><br />Is Here
                        </h1>
                        <p style={{ fontSize: 16, color: "var(--tx2)", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
                            End-to-end digital health workflow — appointments, emergency dispatch, lab tests, pharmacy, transparent billing & more. All roles. One platform.
                        </p>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <Btn ch="Get Started →" v="pri" sz="lg" onClick={() => openAuth("register")} />
                            <Btn ch="Emergency (Hold 3s)" v="dng" sz="lg"
                                onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                                onTouchStart={startHold} onTouchEnd={endHold} />
                        </div>
                        {holdPct > 0 && holdPct < 100 && (
                            <div style={{ marginTop: 16, height: 4, background: "var(--s3)", borderRadius: 99, maxWidth: 280, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${holdPct}%`, background: "var(--c4)", borderRadius: 99, transition: "width .05s" }} />
                            </div>
                        )}
                    </div>

                    {/* Right: Emergency button */}
                    <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <div style={{ fontSize: 12, color: "var(--tx2)", textAlign: "center", fontFamily: "var(--m)", letterSpacing: 1, textTransform: "uppercase" }}>Emergency Dispatch</div>
                        <div style={{ position: "relative" }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i} style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "2px solid var(--c4)", opacity: 0, animation: `ring 2.4s ease-out ${i * .7}s infinite` }} />
                            ))}
                            <button
                                onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                                onTouchStart={startHold} onTouchEnd={endHold}
                                style={{
                                    width: 180, height: 180, borderRadius: "50%", border: "none",
                                    background: emergActive ? "#c0392b" : "var(--c4)", color: "#fff",
                                    fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "var(--f)",
                                    boxShadow: "0 0 50px var(--c4)55", animation: "breathe 2s ease infinite",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                                }}>
                                <span style={{ fontSize: 36 }}>{emergActive ? "📡" : "🚨"}</span>
                                <span>{emergActive ? "BROADCASTING" : "EMERGENCY"}</span>
                                <span style={{ fontSize: 11, opacity: .8 }}>{emergActive ? "Login to track" : "Hold 3 seconds"}</span>
                            </button>
                        </div>
                        {holdPct > 0 && holdPct < 100 && (
                            <div style={{ width: 180, height: 5, background: "var(--s3)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${holdPct}%`, background: "var(--c4)", borderRadius: 99 }} />
                            </div>
                        )}
                        {emergActive && (
                            <div style={{ textAlign: "center", color: "var(--c4)", fontSize: 13, animation: "breathe 1s infinite" }}>
                                📡 Broadcasting… <a href="#" onClick={() => openAuth("login")} style={{ color: "var(--c1)", fontWeight: 700, textDecoration: "none" }}>Login</a> to manage
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══ SERVICES ══ */}
            <section id="services" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>What We Offer</div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>Complete Healthcare Ecosystem</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                    {services.map((s, i) => (
                        <div key={i} className="card card-lift" style={{ background: "var(--s1)" }}>
                            <div style={{ width: 44, height: 44, background: "var(--c1)18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <Ic d={P[s.icon]} size={20} c="var(--c1)" />
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.t}</div>
                            <div style={{ color: "var(--tx2)", fontSize: 13, lineHeight: 1.6 }}>{s.d}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ DOCTORS ══ */}
            <section id="doctors" style={{ padding: "80px 40px", background: "var(--s1)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Our Specialists</div>
                        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>Expert Medical Team</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
                        {doctors.map((d, i) => (
                            <div key={i} className="card card-lift" style={{ textAlign: "center" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--c1)22", border: "2px solid var(--c1)44", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 24, fontWeight: 800, color: "var(--c1)" }}>
                                    {d.n.split(" ")[1][0]}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{d.n}</div>
                                <div style={{ color: "var(--tx2)", fontSize: 12, marginBottom: 8 }}>{d.s}</div>
                                <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)", marginBottom: 10 }}>{d.exp} experience</div>
                                <span style={{ background: d.av ? "var(--c1)20" : "var(--c4)20", color: d.av ? "var(--c1)" : "var(--c4)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontFamily: "var(--m)" }}>
                                    {d.av ? "AVAILABLE" : "ON LEAVE"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HOSPITALS ══ */}
            <section id="hospitals" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Network</div>
                    <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px" }}>Partner Hospital Network</h2>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    {hospitals.map((h, i) => (
                        <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "var(--s1)" }}>
                            <Ic d={P.cross} size={20} c="var(--c4)" />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{h}</div>
                                <div style={{ fontSize: 11, color: "var(--c1)", fontFamily: "var(--m)" }}>PARTNER • 24/7</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ TICKER FOOTER ══ */}
            <div style={{ borderTop: "1px solid var(--b1)", padding: "14px 0", overflow: "hidden", background: "var(--s1)" }}>
                <div style={{ display: "flex", gap: 60, whiteSpace: "nowrap", animation: "ticker 20s linear infinite", fontSize: 12, color: "var(--tx2)", fontFamily: "var(--m)" }}>
                    {Array(2).fill(["healthcare+ v2.0", "HIPAA-Ready", "Audit Logs", "Fixed Lab Prices", "FCFS Emergency", "Role-Based Access", "Digital Receipts", "24/7 Support"]).flat().map((t, i) => (
                        <span key={i}>✦ {t}</span>
                    ))}
                </div>
            </div>

            {/* ══ AUTH MODAL ══ */}
            {showAuth && (
                <div className="modal-bg" onClick={() => !loading && setShowAuth(false)}>
                    <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, background: "var(--c1)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Ic d={P.heart} size={18} c="#060b14" fill="#060b14" />
                            </div>
                            <div style={{ fontWeight: 900, fontSize: 18 }}>
                                {authMode === "login" ? "Sign in" : "Create account"}{" "}
                                to <span style={{ color: "var(--c1)" }}>healthcare+</span>
                            </div>
                        </div>

                        {/* Tab toggle */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 18, background: "var(--s3)", borderRadius: 10, padding: 4 }}>
                            {["login", "register"].map((mode) => (
                                <button key={mode}
                                    onClick={() => { setAuthMode(mode); setErr(""); }}
                                    style={{
                                        flex: 1, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                                        background: authMode === mode ? "var(--c1)" : "transparent",
                                        color: authMode === mode ? "#060b14" : "var(--tx2)",
                                        fontWeight: 600, fontSize: 13, fontFamily: "var(--f)",
                                    }}>
                                    {mode === "login" ? "Login" : "Register"}
                                </button>
                            ))}
                        </div>

                        {authMode === "login" ? (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                                    <Inp label="Email" val={email} onChange={setEmail} ph="your@email.com" />
                                    <Inp label="Password" val={pass} onChange={setPass} type="password" ph="••••••" />
                                    {err && <div style={{ color: "var(--c4)", fontSize: 12, background: "var(--c4)12", padding: "8px 12px", borderRadius: 8 }}>⚠ {err}</div>}
                                    <Btn ch={loading ? "Signing in…" : "Sign In →"} v="pri" onClick={handleLogin} load={loading} dis={loading} style={{ width: "100%", justifyContent: "center" }} />
                                </div>
                                <div style={{ fontSize: 11, color: "var(--tx2)", textAlign: "center", marginBottom: 12, fontFamily: "var(--m)", textTransform: "uppercase", letterSpacing: .8 }}>Quick Demo Access</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                                    {demos.map((d) => (
                                        <button key={d.r}
                                            onClick={() => { const u = users.find((u) => u.role === d.r); if (u) onLogin(u); }}
                                            style={{ background: "var(--s3)", border: "1px solid var(--b2)", borderRadius: 8, padding: "7px 13px", color: "var(--tx2)", fontSize: 12, transition: "all .14s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c1)"; e.currentTarget.style.color = "var(--c1)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--b2)"; e.currentTarget.style.color = "var(--tx2)"; }}>
                                            {d.e} {d.l}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <Inp label="Full Name" val={name} onChange={setName} ph="e.g. Dr. Priya Mehta" />
                                <Inp label="Email" val={email} onChange={setEmail} ph="your@email.com" />
                                <Inp label="Password" val={pass} onChange={setPass} type="password" ph="Min 3 characters" />
                                <Sel label="Register as" val={regRole} onChange={setRegRole}
                                    opts={[{ v: "patient", l: "Patient" }, { v: "doctor", l: "Doctor" }, { v: "lab", l: "Lab Technician" }]} />
                                {regRole === "doctor" && (
                                    <Inp label="Specialty (optional)" val={specialty} onChange={setSpecialty} ph="e.g. General Medicine, Cardiology" />
                                )}
                                {err && <div style={{ color: "var(--c4)", fontSize: 12, background: "var(--c4)12", padding: "8px 12px", borderRadius: 8 }}>⚠ {err}</div>}
                                <Btn ch={loading ? "Creating account…" : "Create Account →"} v="pri" onClick={handleRegister} load={loading} dis={loading} style={{ width: "100%", justifyContent: "center" }} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
