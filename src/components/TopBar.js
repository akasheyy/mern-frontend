import NotificationBell from "../components/NotificationBell";

export default function TopBar() {
  return (
    <div
      style={{
        height: "50px",
        width: "100%",
        padding: "0 20px",
        background: "white",
        borderBottom: "1px solid #ddd",

        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"  // ⭐ THIS FIXES ALIGNMENT
      }}
    >
      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE → Notification Icon */}
      <div style={{ marginLeft: "auto",marginRight:"30px" }}>
        <NotificationBell />
      </div>
    </div>
  );
}
