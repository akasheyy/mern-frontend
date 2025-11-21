export default function TopBar() {
  return (
    <div
      style={{
        height: "60px",
        width: "100%",
        padding: "0 20px",
        background: "white",
        borderBottom: "1px solid #ddd",

        position: "fixed",   // 🔥 FIXED TOPBAR
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,

        display: "flex",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "Arial Black",
          letterSpacing: 1,
          userSelect: "none",
        }}
      >
        Connecto
      </h2>
    </div>
  );
}
