// ─── TOAST NOTIFICATION ──────────────────────────────────────
// Self-dismissing bottom-right notification with fade animation.

import { useState, useEffect } from "react";

/**
 * @param {object}   props
 * @param {string}   props.msg      - Message to display
 * @param {function} props.onClose  - Called after the toast exits
 * @param {"ok"|"err"} [props.v="ok"] - Variant (green | red border)
 */
const Toast = ({ msg, onClose, v = "ok" }) => {
    const [out, setOut] = useState(false);
    const isErr = v === "err";

    useEffect(() => {
        const t = setTimeout(() => {
            setOut(true);
            setTimeout(onClose, 280);
        }, 3400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{
            background: "var(--s2)",
            border: `1px solid ${isErr ? "var(--c4)" : "var(--c1)"}`,
            borderRadius: 12,
            padding: "13px 18px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            maxWidth: 360,
            boxShadow: "0 6px 32px rgba(0,0,0,.5)",
            animation: out ? "fadeIn .28s ease reverse" : "fadeUp .28s ease",
        }}>
            <span style={{ color: isErr ? "var(--c4)" : "var(--c1)", fontSize: 16 }}>
                {isErr ? "⚠" : "✓"}
            </span>
            <span style={{ flex: 1, fontSize: 13 }}>{msg}</span>
            <button
                onClick={() => { setOut(true); setTimeout(onClose, 280); }}
                style={{ background: "none", border: "none", color: "var(--tx2)", fontSize: 17, lineHeight: 1 }}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
