import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/messages/recent", {
          headers: { Authorization: "Bearer " + token },
        });

        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.log("Inbox Load Error:", err);
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <h2 style={{ textAlign: "center",marginTop:"60px" }}>Loading...</h2>;

  if (conversations.length === 0)
    return (
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>
        No chats yet. Start messaging someone.
      </h3>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "650px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", marginTop:"45px", textAlign:"center"}}>Messages</h2>

      {conversations.map((chat) => {
        const u = chat.user;
        const lastMsg = chat.lastMessage;
        const lastActive = u.lastActive
          ? new Date(u.lastActive).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Offline";

        return (
          <Link
            to={`/chat/${u._id}`}
            key={u._id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              background: "#fff",
              marginBottom: "12px",
              borderRadius: "12px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              textDecoration: "none",
              color: "#222",
            }}
          >
            <img
              src={u.avatar || "https://via.placeholder.com/40"}
              alt="avatar"
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                marginRight: 12,
                objectFit: "cover",
                border: "2px solid #ddd",
              }}
            />

            <div style={{ flexGrow: 1 }}>
              <b style={{ fontSize: "17px" }}>{u.username}</b>
              <p
                style={{
                  margin: "3px 0",
                  color: "#666",
                  fontSize: "14px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {lastMsg}
              </p>
              <small style={{ color: "#999" }}>Active: {lastActive}</small>
            </div>

            {/* Green active dot */}
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            ></div>
          </Link>
        );
      })}
    </div>
  );
}
