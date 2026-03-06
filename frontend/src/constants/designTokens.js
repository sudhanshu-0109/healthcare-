// ─── DESIGN TOKENS & GLOBAL CSS ──────────────────────────────
// Single source of truth for all colours, fonts, animations and
// reusable utility classes injected via <style>{G}</style>.

export const G = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;height:100%;overflow:hidden}
:root{
  --bg:#060b14; --s1:#0b1220; --s2:#101829; --s3:#162035;
  --b1:#1a2840; --b2:#1f3050; --b3:#253860;
  --c1:#00f5d4; --c2:#3b9eff; --c3:#f0a500; --c4:#f43f5e; --c5:#a78bfa;
  --tx:#dce8f5; --tx2:#7b98bc; --tx3:#3d5a7a;
  --f:'Outfit',sans-serif; --m:'Fira Code',monospace;
  --r:10px; --r2:16px; --r3:20px;
  --shadow:0 4px 24px rgba(0,0,0,.4);
}
body{background:var(--bg);color:var(--tx);font-family:var(--f);font-size:14px;line-height:1.5}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:var(--b3)}

/* ─── Animations ─── */
@keyframes fadeUp    {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn    {from{opacity:0}to{opacity:1}}
@keyframes spin      {to{transform:rotate(360deg)}}
@keyframes glow      {0%,100%{box-shadow:0 0 12px #00f5d444}50%{box-shadow:0 0 28px #00f5d488}}
@keyframes dangerPulse{0%,100%{box-shadow:0 0 0 0 #f43f5e55}50%{box-shadow:0 0 0 14px #f43f5e00}}
@keyframes ring      {0%{transform:scale(1);opacity:.5}100%{transform:scale(2.6);opacity:0}}
@keyframes countbar  {from{width:100%}to{width:0%}}
@keyframes modalIn   {from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes holdFill  {from{width:0%}to{width:100%}}
@keyframes breathe   {0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes ticker    {from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ─── Utility classes ─── */
.fade-up{animation:fadeUp .32s cubic-bezier(.22,1,.36,1) both}
.glow-c1{animation:glow 2.4s ease infinite}
.danger-anim{animation:dangerPulse 1.6s ease infinite}

/* ─── Card component ─── */
.card{background:var(--s2);border:1px solid var(--b1);border-radius:var(--r2);padding:20px;transition:border-color .2s,transform .18s,box-shadow .18s}
.card:hover{border-color:var(--b2);box-shadow:0 6px 28px rgba(0,0,0,.35)}
.card-lift:hover{transform:translateY(-2px)}

/* ─── Modal ─── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:9000;animation:fadeIn .18s ease}
.modal-box{background:var(--s2);border:1px solid var(--b2);border-radius:var(--r3);padding:28px;max-width:480px;width:90%;animation:modalIn .22s ease}

/* ─── Form elements ─── */
input,select{background:var(--s3);border:1px solid var(--b2);border-radius:var(--r);padding:10px 14px;color:var(--tx);font-family:var(--f);font-size:14px;outline:none;transition:border-color .18s;width:100%}
input:focus,select:focus{border-color:var(--c1)}
input::placeholder{color:var(--tx3)}
button{cursor:pointer;font-family:var(--f);border:none;transition:all .15s}

/* ─── Table ─── */
.tbl th,.tbl td{padding:12px 14px;text-align:left}
.tbl thead{border-bottom:1px solid var(--b2)}
.tbl th{font-size:11px;color:var(--tx2);text-transform:uppercase;letter-spacing:.6px}
.tbl tbody tr:hover td{background:var(--s3)}
.tbl tbody tr td{border-bottom:1px solid var(--b1);font-size:13px}

/* ─── Theme modifiers ─── */
body.theme-dark{
  --bg:#060b14; --s1:#0b1220; --s2:#101829; --s3:#162035;
  --b1:#1a2840; --b2:#1f3050; --b3:#253860;
  --c1:#00f5d4; --c2:#3b9eff; --c3:#f0a500; --c4:#f43f5e; --c5:#a78bfa;
  --tx:#dce8f5; --tx2:#7b98bc; --tx3:#3d5a7a;
}
body.theme-light{
  --bg:#f4f6fb; --s1:#ffffff; --s2:#f5f7ff; --s3:#edf1ff;
  --b1:#d7ddf0; --b2:#c2c9e4; --b3:#adb6dd;
  --c1:#2563eb; --c2:#0891b2; --c3:#d97706; --c4:#dc2626; --c5:#7c3aed;
  --tx:#111827; --tx2:#4b5563; --tx3:#9ca3af;
}
`;

// Status → colour mapping used by Badge & charts
export const SC = {
    PENDING: "#f0a500",
    CONFIRMED: "#00f5d4",
    IN_PROGRESS: "#3b9eff",
    COMPLETED: "#22d3a0",
    CANCELLED: "#f43f5e",
    REQUESTED: "#f0a500",
    ACCEPTED: "#3b9eff",
    DISPATCHED: "#a78bfa",
    READY: "#22d3a0",
};

// Convenience alias for inline CSS border-radius
export const VAR_R = "var(--r)";
