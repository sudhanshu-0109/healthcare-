// ─── FORM INPUT COMPONENTS ───────────────────────────────────
// Inp  – labelled text/date/password input with error state
// Sel  – labelled select dropdown

/**
 * Inp – single-line input with optional label and validation error.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string}  props.val
 * @param {function} props.onChange  - Receives the new string value
 * @param {string} [props.type="text"]
 * @param {string} [props.ph]        - Placeholder
 * @param {string} [props.err]       - Error message (turns border red)
 */
export const Inp = ({ label, val, onChange, type = "text", ph = "", err = "" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {label && (
            <label style={{
                fontSize: 11, color: "var(--tx2)", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: 0.5,
            }}>
                {label}
            </label>
        )}
        <input
            type={type}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            placeholder={ph}
            style={{ borderColor: err ? "var(--c4)" : "var(--b2)" }}
            onFocus={(e) => (e.target.style.borderColor = err ? "var(--c4)" : "var(--c1)")}
            onBlur={(e) => (e.target.style.borderColor = err ? "var(--c4)" : "var(--b2)")}
        />
        {err && <span style={{ fontSize: 11, color: "var(--c4)" }}>⚠ {err}</span>}
    </div>
);

/**
 * Sel – styled select dropdown.
 *
 * @param {object}   props
 * @param {string}  [props.label]
 * @param {string}   props.val
 * @param {function} props.onChange  - Receives the new string value
 * @param {{ v: string|number, l: string }[]} props.opts - Option list
 */
export const Sel = ({ label, val, onChange, opts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {label && (
            <label style={{
                fontSize: 11, color: "var(--tx2)", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: 0.5,
            }}>
                {label}
            </label>
        )}
        <select value={val} onChange={(e) => onChange(e.target.value)}>
            {opts.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
            ))}
        </select>
    </div>
);
