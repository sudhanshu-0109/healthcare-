// ─── CONFIRM DIALOG ──────────────────────────────────────────
// Modal overlay asking the user to confirm destructive actions.

import Btn from "./Btn";

/**
 * @param {object}   props
 * @param {string}   props.title
 * @param {string}   props.msg
 * @param {function} props.onOk
 * @param {function} props.onCancel
 * @param {string}  [props.ok="Confirm"] - OK button label
 * @param {boolean} [props.dng=false]    - Use danger (red) variant for OK
 */
const Confirm = ({ title, msg, onOk, onCancel, ok = "Confirm", dng = false }) => (
    <div className="modal-bg" onClick={onCancel}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{title}</div>
            <div style={{ color: "var(--tx2)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{msg}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn ch="Cancel" v="gst" onClick={onCancel} />
                <Btn ch={ok} v={dng ? "dng" : "pri"} onClick={onOk} />
            </div>
        </div>
    </div>
);

export default Confirm;
