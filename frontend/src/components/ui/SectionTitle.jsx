// ─── SECTION TITLE ───────────────────────────────────────────
// Small all-caps grey label used as a visual section divider.

/**
 * @param {object} props
 * @param {string} props.ch - Title text
 */
const SectionTitle = ({ ch }) => (
    <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--tx2)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
    }}>
        {ch}
    </div>
);

export default SectionTitle;
