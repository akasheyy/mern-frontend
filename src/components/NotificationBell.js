import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FiBell } from "react-icons/fi";   // ← NEW ICON HERE

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socketRef.current = io("https://mern-backend-igep.onrender.com", {
      auth: { token }
    });

    socketRef.current.on("notification", (payload) => {
      setNotifications((prev) => [payload, ...prev]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const unreadCount = notifications.length;

  const formatText = (n) => {
    if (n.type === "message") return "New message";
    if (n.type === "like") return `Someone liked your post`;
    if (n.type === "comment") return `New comment on your post`;
    return "New notification";
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "22px",
        }}
      >
        <FiBell size={26} color="#333" />

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "#ef4444",
              color: "#fff",
              borderRadius: "999px",
              padding: "0px 6px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            width: 260,
            maxHeight: 320,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: 10,
            zIndex: 999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <b style={{ fontSize: 14 }}>Notifications</b>

            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 12,
                  color: "#3b82f6",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              No notifications.
            </p>
          )}

          {notifications.map((n, idx) => (
            <div
              key={idx}
              style={{
                padding: "8px 6px",
                borderRadius: 8,
                background: "#f9fafb",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <div style={{ marginBottom: 2 }}>{formatText(n)}</div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
