// ─── BUTTON COMPONENT ────────────────────────────────────────
// Multi-variant button with built-in loading spinner and
// disabled state handling. No external CSS class required.

/**
 * @param {object} props
 * @param {React.ReactNode} props.ch      - Button children / label
 * @param {function}        props.onClick
 * @param {"pri"|"sec"|"dng"|"gst"|"blu"|"prp"} [props.v="pri"] - Visual variant
 * @param {"sm"|"md"|"lg"} [props.sz="md"] - Size
 * @param {boolean} [props.dis=false]  - Disabled
 * @param {boolean} [props.load=false] - Shows spinner + disables
 * @param {object}  [props.style]      - Extra inline styles (alias: sx)
 */
const Btn = ({ ch, onClick, v = "pri", sz = "md", dis = false, load = false, style: sx = {} }) => {
    const base = {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 10,
        fontWeight: 700,
        opacity: dis || load ? 0.5 : 1,
        cursor: dis || load ? "not-allowed" : "pointer",
        fontSize: sz === "sm" ? 12 : sz === "lg" ? 15 : 13,
        padding: sz === "sm" ? "7px 13px" : sz === "lg" ? "13px 22px" : "10px 18px",
        transition: "all .15s",
        border: "none",
    };

    const variants = {
        pri: { background: "var(--c1)", color: "#060b14" },
        sec: { background: "var(--s3)", color: "var(--tx)", border: "1px solid var(--b2)" },
        dng: { background: "var(--c4)", color: "#fff" },
        gst: { background: "transparent", color: "var(--tx2)", border: "1px solid var(--b2)" },
        blu: { background: "var(--c2)", color: "#fff" },
        prp: { background: "var(--c5)", color: "#fff" },
    };

    return (
        <button
            style={{ ...base, ...variants[v], ...sx }}
            onClick={dis || load ? undefined : onClick}
            disabled={dis || load}
            onMouseEnter={(e) => { if (!dis && !load) e.currentTarget.style.opacity = ".85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
            {load && (
                <span style={{
                    width: 12, height: 12,
                    border: "2px solid currentColor",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin .6s linear infinite",
                    display: "inline-block",
                }} />
            )}
            {ch}
        </button>
    );
};

export default Btn;
