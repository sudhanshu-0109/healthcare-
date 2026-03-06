const ThemeToggle = ({ theme, onToggle }) => {
    const isLight = theme === "light";

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 9px",
                borderRadius: 999,
                border: "1px solid var(--b2)",
                background: "var(--s3)",
                color: "var(--tx2)",
                fontSize: 11,
                fontFamily: "var(--m)",
                cursor: "pointer",
                minWidth: 80,
            }}
        >
            <span style={{ fontSize: 13 }}>
                {isLight ? "🌞" : "🌙"}
            </span>
            <span>{isLight ? "Light" : "Dark"}</span>
            <span
                style={{
                    marginLeft: "auto",
                    width: 20,
                    height: 12,
                    borderRadius: 999,
                    background: "var(--b2)",
                    padding: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isLight ? "flex-end" : "flex-start",
                    transition: "justify-content .18s",
                }}
            >
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--c1)",
                    }}
                />
            </span>
        </button>
    );
};

export default ThemeToggle;

