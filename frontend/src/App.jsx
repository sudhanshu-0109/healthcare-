
import { useState, useCallback, useEffect, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────
import { INITIAL_STATE } from "./constants/initialState";
import { G } from "./constants/designTokens";

// ── Layout components ──────────────────────────────────────────
import Sidebar from "./components/layout/Sidebar";
import LandingPage from "./components/layout/LandingPage";
import AuditReport from "./components/layout/AuditReport";

// ── UI primitives ──────────────────────────────────────────────
import Toast from "./components/ui/Toast";
import Btn from "./components/ui/Btn";
import ThemeToggle from "./components/ui/ThemeToggle";

// ── Patient pages ──────────────────────────────────────────────
import PatientDashboard from "./pages/patient/PatientDashboard";
import AppointmentsPage from "./pages/patient/AppointmentsPage";
import BillingPage from "./pages/patient/BillingPage";
import TimelinePage from "./pages/patient/TimelinePage";

// ── Doctor pages ───────────────────────────────────────────────
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// ── Admin pages ────────────────────────────────────────────────
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPricing from "./pages/admin/AdminPricing";
import FraudPage from "./pages/admin/FraudPage";
import AuditPage from "./pages/admin/AuditPage";
import UsersPage from "./pages/admin/UsersPage";
import LeaveRequestsPage from "./pages/admin/LeaveRequestsPage";

// ── Shared pages ───────────────────────────────────────────────
import QueuePage from "./pages/shared/QueuePage";
import PrescriptionsPage from "./pages/shared/PrescriptionsPage";
import LabPage from "./pages/shared/LabPage";
import LabPricingView from "./pages/shared/LabPricingView";
import PharmacyPage from "./pages/shared/PharmacyPage";
import EmergencyPage from "./pages/shared/EmergencyPage";
import NotifPage from "./pages/shared/NotifPage";
import GenericDashboard from "./pages/shared/GenericDashboard";

// ── Helpers ────────────────────────────────────────────────────
import { todayStr } from "./utils/helpers";
import { api } from "./api";

// Toast ID counter (module-level so it survives re-renders)
let toastCount = 0;

// ── localStorage keys ──────────────────────────────────────────
const LS_STATE = "hplus_state";
const LS_ACTIVE = "hplus_active";
const LS_THEME = "hplus_theme";

function loadSavedState() {
  try {
    const raw = localStorage.getItem(LS_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
export default function App() {
  // Restore full state from localStorage; fall back to INITIAL_STATE
  const [state, setState] = useState(() => loadSavedState() ?? INITIAL_STATE);

  // Restore active page only when a user is already logged in
  const [active, setActive] = useState(() => {
    try {
      const saved = loadSavedState();
      if (saved?.currentUser) return localStorage.getItem(LS_ACTIVE) || "dashboard";
    } catch { /* ignore */ }
    return "dashboard";
  });

  const [toasts, setToasts] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(LS_THEME) || "dark"; } catch { return "dark"; }
  });

  // Skip persisting on very first render (state already came from storage)
  const firstRender = useRef(true);

  // ── Persist state to localStorage on every change ──────────
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    try { localStorage.setItem(LS_STATE, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  // ── Persist active page ────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_ACTIVE, active); } catch { /* ignore */ }
  }, [active]);

  // ── Persist theme ──────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_THEME, theme); } catch { /* ignore */ }
  }, [theme]);

  // ── Theme ──
  useEffect(() => {

    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  // ── Sync users + leave requests from backend when logged in ──
  useEffect(() => {
    if (!state.currentUser || state.view !== "app") return;
    (async () => {
      try {
        const [users, leaves] = await Promise.all([
          api.getUsers(),
          api.getLeaveRequests(),
        ]);
        setState((s) => ({
          ...s,
          users: users.length > 0
            ? users.map((u) =>
              u.id === s.currentUser?.id ? { ...u, password: s.currentUser.password } : u
            )
            : s.users,
          leaveRequests: Array.isArray(leaves) ? leaves : s.leaveRequests,
        }));
      } catch {
        // ignore network errors — fall back to cached state
      }
    })();
  }, [state.currentUser?.id, state.view]);

  // ── Medicines ──
  const handleMedicineTaken = useCallback((prescriptionId, medicineId) => {
    let pharmacyAlert = null;
    setState((s) => {
      const prescriptions = s.prescriptions.map((p) => {
        if (p.id !== prescriptionId) return p;
        const medicines = p.medicines.map((m) => {
          if (m.id !== medicineId) return m;
          // Safely initialise remaining days from whichever field exists
          const baseDays = typeof m.durationDays === "number" ? m.durationDays : 0;
          const current = typeof m.remainingDays === "number" ? m.remainingDays : baseDays;
          const next = Math.max(0, current - 1);
          // Trigger pharmacy alert when stock hits 2 days or fewer (only once per drop)
          if (next <= 2 && current > 2) {
            pharmacyAlert = {
              id: s.notifNextId,
              userId: s.currentUser?.id,
              message: `💊 ${m.name} has only ${next} day${next !== 1 ? "s" : ""} left — order a refill from the Pharmacy department!`,
              readStatus: false,
              createdAt: todayStr(),
              type: "medicine",
            };
          }
          return { ...m, remainingDays: next };
        });
        return { ...p, medicines };
      });
      return {
        ...s,
        prescriptions,
        ...(pharmacyAlert ? {
          notifications: [...s.notifications, pharmacyAlert],
          notifNextId: s.notifNextId + 1,
        } : {}),
      };
    });
  }, []);

  // ── Auth ──
  const login = useCallback((u) => {
    setState((s) => ({ ...s, currentUser: u, view: "app" }));
    setActive("dashboard");
  }, []);

  const logout = useCallback(() => {
    // Clear persisted session so refresh goes back to landing
    try {
      localStorage.removeItem(LS_STATE);
      localStorage.removeItem(LS_ACTIVE);
    } catch { /* ignore */ }
    setState((s) => ({ ...s, currentUser: null, view: "landing" }));
    setActive("dashboard");
    setToasts([]);
  }, []);


  // ── Toasts ──
  const toast = useCallback((msg, v = "ok") => {
    const id = ++toastCount;
    setToasts((t) => [...t, { id, msg, v }]);
  }, []);

  const rmToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // ─────────────────────────────────────────────────────────
  // LANDING VIEW (not logged in)
  // ─────────────────────────────────────────────────────────
  if (!state.currentUser || state.view === "landing") {
    return (
      <>
        <style>{G}</style>
        <LandingPage
          onLogin={login}
          users={state.users}
          setState={setState}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {/* Toast stack */}
        {toasts.map((t, i) => (
          <div key={t.id} style={{ position: "fixed", bottom: `${24 + i * 68}px`, right: 24, zIndex: 9999 }}>
            <Toast msg={t.msg} v={t.v} onClose={() => rmToast(t.id)} />
          </div>
        ))}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────
  // APP VIEW (logged in)
  // ─────────────────────────────────────────────────────────
  const u = state.currentUser;
  const unread = state.notifications.filter((n) => n.userId === u.id && !n.readStatus).length;

  // Shared props passed to every page component
  const pageProps = { state, setState, user: u, toast };

  /**
   * Route switcher — maps URL-like "active" string to a page component.
   * No external router library needed; all state is in-memory.
   */
  const renderPage = () => {
    switch (active) {
      // ── Dashboard (role-specific) ──
      case "dashboard":
        if (u.role === "patient") return <PatientDashboard {...pageProps} onMedicineTaken={handleMedicineTaken} />;
        if (u.role === "doctor") return <DoctorDashboard  {...pageProps} />;
        if (u.role === "admin") return <AdminAnalytics   {...pageProps} />;
        return <GenericDashboard {...pageProps} />;

      // ── Patient routes ──
      case "appointments": return <AppointmentsPage  {...pageProps} />;
      case "billing": return <BillingPage        {...pageProps} />;
      case "timeline": return <TimelinePage       {...pageProps} />;

      // ── Shared routes ──
      case "queue": return <QueuePage         {...pageProps} />;
      case "prescriptions": return <PrescriptionsPage {...pageProps} />;
      case "lab":
      case "requests": return <LabPage            {...pageProps} />;
      case "pharmacy":
      case "orders": return <PharmacyPage       {...pageProps} />;
      case "emergency": return <EmergencyPage      {...pageProps} />;
      case "notifications": return <NotifPage          {...pageProps} />;

      // ── Lab role: pricing view (read-only via LabPricingView) ──
      case "pricing":
        return u.role === "admin" ? <AdminPricing {...pageProps} /> : <LabPricingView {...pageProps} />;

      // ── Admin routes ──
      case "analytics": return <AdminAnalytics {...pageProps} />;
      case "fraud": return <FraudPage      {...pageProps} />;
      case "audit": return <AuditPage      {...pageProps} />;
      case "leave-requests": return <LeaveRequestsPage {...pageProps} />;
      case "users": return <UsersPage      {...pageProps} />;

      default:
        return <div style={{ color: "var(--tx2)", textAlign: "center", padding: "60px 0" }}>Coming soon.</div>;
    }
  };

  return (
    <>
      <style>{G}</style>

      {/* ── Main shell ── */}
      <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
        {/* Left sidebar */}
        <Sidebar user={u} active={active} setActive={setActive} onLogout={logout} unread={unread} />

        {/* Right content column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top bar */}
          <header style={{
            height: 52, background: "var(--s1)", borderBottom: "1px solid var(--b1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px", flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, color: "var(--tx2)", fontFamily: "var(--m)" }}>
              healthcare+ / <span style={{ color: "var(--c1)" }}>{u.role.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Btn ch="📋 Audit Report" v="gst" sz="sm" onClick={() => setShowReport(true)} />
              <div style={{ width: 1, height: 20, background: "var(--b2)" }} />
              <div style={{ fontSize: 12, color: "var(--tx2)" }}>{todayStr()}</div>
              {unread > 0 && (
                <div style={{ background: "var(--c4)", color: "#fff", borderRadius: 99, fontSize: 11, padding: "2px 8px", fontFamily: "var(--m)" }}>
                  {unread} new
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            {renderPage()}
          </main>
        </div>
      </div>

      {/* Audit report modal */}
      {showReport && <AuditReport onClose={() => setShowReport(false)} />}

      {/* Toast notification stack */}
      {toasts.map((t, i) => (
        <div key={t.id} style={{ position: "fixed", bottom: `${24 + i * 68}px`, right: 24, zIndex: 9999 }}>
          <Toast msg={t.msg} v={t.v} onClose={() => rmToast(t.id)} />
        </div>
      ))}
    </>
  );
}
