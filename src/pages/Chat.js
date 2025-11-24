import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import io from "socket.io-client";

export default function Chat() {
  const { id } = useParams(); // other user id

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 🎙 Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const bottomRef = useRef(null);
  const socket = useRef(null);

  const token = localStorage.getItem("token");

  // 🗑️ Delete / clear UI state
  const [deleteTarget, setDeleteTarget] = useState(null); // message object
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Keep track of which incoming messages we already marked as seen
  const seenSentRef = useRef(new Set());
  // For debounce typing events
  const typingTimeoutRef = useRef(null);

  // helper: format time like 10:23 PM
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 🔽 helper: scroll to last message
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "auto",
        block: "end"
      });
    }
  };

  /* ===================================================
     SOCKET CONNECT
  =================================================== */
  useEffect(() => {
    if (!token) return;

    socket.current = io("https://mern-backend-igep.onrender.com", {
      auth: { token }
    });

    // When a new message arrives
    socket.current.on("new_message", (msg) => {
      const s =
        typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const r =
        typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;

      if (s === id || r === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // When the other user is typing
    socket.current.on("typing", ({ from }) => {
      if (from === id) setIsTyping(true);
    });

    // When they stop typing
    socket.current.on("stop_typing", ({ from }) => {
      if (from === id) setIsTyping(false);
    });

    // When a message is deleted for everyone
    socket.current.on("message_deleted", ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    // When chat is cleared for both
    socket.current.on("chat_cleared", () => {
      setMessages([]);
    });

    // When message is delivered (double tick, grey)
    socket.current.on("message_delivered", ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && m.status !== "seen"
            ? { ...m, status: "delivered" }
            : m
        )
      );
    });

    // When messages are seen (sender should see blue tick)
    socket.current.on("messages_seen", (ids) => {
      if (!Array.isArray(ids)) return;
      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m._id) ? { ...m, status: "seen" } : m
        )
      );
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [id, token]);

  /* ===================================================
     LOAD USER + HISTORY
  =================================================== */
  useEffect(() => {
    async function load() {
      const tokenLocal = localStorage.getItem("token");
      if (!tokenLocal) return;

      // logged-in user
      const meRes = await fetch(
        "https://mern-backend-igep.onrender.com/api/user/me",
        {
          headers: { Authorization: "Bearer " + tokenLocal }
        }
      );
      const meData = await meRes.json();
      setCurrentUser(meData);

      // chat history
      const msgRes = await fetch(
        `https://mern-backend-igep.onrender.com/api/messages/history/${id}`,
        { headers: { Authorization: "Bearer " + tokenLocal } }
      );
      const msgData = await msgRes.json();
      setMessages(msgData);

      // 👇 after messages set, jump to bottom once
      setTimeout(() => {
        scrollToBottom();
      }, 0);

      // other user
      const userRes = await fetch(
        `https://mern-backend-igep.onrender.com/api/user/profile/${id}`,
        { headers: { Authorization: "Bearer " + tokenLocal } }
      );
      const userData = await userRes.json();
      setOtherUser(userData.user);
    }

    load();
  }, [id]);

  /* ===================================================
     AUTO SCROLL ON MESSAGES CHANGE
     (always keep view at last message)
  =================================================== */
  useEffect(() => {
    // only depend on length so it doesn't re-run on every minor change
    scrollToBottom();
  }, [messages.length]);

  /* ===================================================
     MARK INCOMING MESSAGES AS SEEN
  =================================================== */
  useEffect(() => {
    if (!socket.current || !currentUser) return;

    const unseenIncoming = messages.filter((m) => {
      const senderId =
        typeof m.sender === "string" ? m.sender : m.sender?._id;
      const isFromOther = senderId === id;
      const isAlreadySeen = m.status === "seen";
      const alreadySent = seenSentRef.current.has(m._id);
      return isFromOther && !isAlreadySeen && !alreadySent;
    });

    if (unseenIncoming.length === 0) return;

    const ids = unseenIncoming
      .map((m) => m._id)
      .filter(Boolean);

    if (ids.length === 0) return;

    // remember we sent these
    ids.forEach((mid) => seenSentRef.current.add(mid));

    // notify backend: mark these as seen
    socket.current.emit("seen_messages", {
      ids,
      from: currentUser._id
    });
  }, [messages, currentUser, id]);

  /* ===================================================
     SEND TEXT MESSAGE
  =================================================== */
  const sendMessage = () => {
    if (!text.trim() || !socket.current) return;

    socket.current.emit("send_message", {
      to: id,
      text
    });

    // stop typing when message sent
    socket.current.emit("stop_typing", { to: id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setText("");
  };

  /* ===================================================
     HANDLE INPUT + TYPING EMIT
  =================================================== */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!socket.current) return;

    if (value.trim()) {
      // user is typing
      socket.current.emit("typing", { to: id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.current.emit("stop_typing", { to: id });
      }, 1500);
    } else {
      // empty -> stop typing
      socket.current.emit("stop_typing", { to: id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  /* ===================================================
     SEND FILE (image, video, pdf, docs, zip...)
  =================================================== */
  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const tokenLocal = localStorage.getItem("token");

      const res = await fetch(
        `https://mern-backend-igep.onrender.com/api/messages/file/${id}`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + tokenLocal },
          body: formData
        }
      );

      if (!res.ok) {
        console.log(await res.text());
        alert("File upload failed");
      }
      // Socket will add the new message
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload file");
    }

    // reset input
    e.target.value = "";
  };

  /* ===================================================
     VOICE RECORDING
  =================================================== */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm"
        });

        const formData = new FormData();
        formData.append("audio", audioBlob, "voice-message.webm");
        formData.append("duration", recordSeconds);

        try {
          const tokenLocal = localStorage.getItem("token");

          const res = await fetch(
            `https://mern-backend-igep.onrender.com/api/messages/voice/${id}`,
            {
              method: "POST",
              headers: { Authorization: "Bearer " + tokenLocal },
              body: formData
            }
          );

          if (!res.ok) {
            console.log(await res.text());
            alert("Failed to upload voice message");
          }

          // Socket will push the new voice message
        } catch (err) {
          console.error("Voice upload error:", err);
          alert("Failed to upload voice message");
        }

        stream.getTracks().forEach((t) => t.stop());
        setRecordSeconds(0);
        setRecordStartTime(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordStartTime(Date.now());
    } catch (err) {
      console.error("Mic error:", err);
      alert("Cannot access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording || !recordStartTime) return;

    const interval = setInterval(() => {
      setRecordSeconds(Math.floor((Date.now() - recordStartTime) / 1000));
    }, 500);

    return () => clearInterval(interval);
  }, [isRecording, recordStartTime]);

  /* ===================================================
     DELETE MESSAGE (WhatsApp-style)
  =================================================== */

  const handleDeleteMessage = async (mode) => {
    // mode: "me" | "everyone"
    if (!deleteTarget || !deleteTarget._id) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `https://mern-backend-igep.onrender.com/api/messages/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ mode })
        }
      );

      if (!res.ok) {
        console.log(await res.text());
        alert("Failed to delete message");
        return;
      }

      // Remove from this client's UI
      setMessages((prev) =>
        prev.filter((m) => m._id !== deleteTarget._id)
      );
    } catch (err) {
      console.error("Delete message error:", err);
      alert("Failed to delete message");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  /* ===================================================
     CLEAR CHAT (like WhatsApp "Clear chat")
  =================================================== */

  const handleClearChat = async (mode) => {
    // mode: "me" | "everyone"
    try {
      setActionLoading(true);

      const res = await fetch(
        `https://mern-backend-igep.onrender.com/api/messages/clear/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ mode })
        }
      );

      if (!res.ok) {
        console.log(await res.text());
        alert("Failed to clear chat");
        return;
      }

      // Clear from UI
      setMessages([]);
    } catch (err) {
      console.error("Clear chat error:", err);
      alert("Failed to clear chat");
    } finally {
      setActionLoading(false);
      setShowClearModal(false);
    }
  };

  if (!currentUser || !otherUser) return <h2>Loading chat...</h2>;

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6",
        marginBottom:"50px"
      }}
    >
      {/* ---------------- TOP BAR ---------------- */}
      <div
        style={{
          height: "65px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 15px",
          background: "#fff",
          borderBottom: "1px solid #ddd",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10
        }}
      >
        <Link
          to="/dashboard"
          style={{ fontSize: "24px", textDecoration: "none" }}
        >
          ⬅
        </Link>

        <img
          src={otherUser.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #ddd"
          }}
        />

        <div style={{ flexGrow: 1 }}>
          <Link
            to={`/user/${otherUser._id}`}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "#222",
              flexGrow: 1
            }}
          >
            <b>{otherUser.username}</b>
          </Link>
          <p style={{ fontSize: "12px", margin: 0, color: "#666" }}>
            {isTyping ? "Typing..." : "Chatting now"}
          </p>
        </div>

        {/* 🗑️ Clear chat button */}
        <button
          onClick={() => setShowClearModal(true)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "20px",
            cursor: "pointer"
          }}
          title="Clear chat"
        >
          🗑️
        </button>
      </div>

      {/* ---------------- CHAT MESSAGES ---------------- */}
      <div
        style={{
          marginTop: "65px",
          flexGrow: 1,
          padding: "15px",
          overflowY: "auto"
        }}
      >
        {messages.map((msg, index) => {
          const senderId =
            typeof msg.sender === "string"
              ? msg.sender
              : msg.sender?._id;

          const isMe = senderId === currentUser._id;
          const avatar = isMe ? currentUser.avatar : otherUser.avatar;

          const key = msg._id || index;

          const status = msg.status || "delivered"; // default if missing

          return (
            <div
              key={key}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                marginBottom: "30px",
                gap: "3px"
              }}
            >
              {!isMe && (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    marginRight: 4
                  }}
                />
              )}

              <div
                style={{
                  maxWidth: "68%",
                  padding: "10px 14px",
                  borderRadius: "18px",
                  background: isMe ? "#4f46e5" : "#e5e7eb",
                  color: isMe ? "#fff" : "#111",
                  fontSize: "15px",
                  borderBottomRightRadius: isMe ? "4px" : "18px",
                  borderBottomLeftRadius: isMe ? "18px" : "4px",
                  wordBreak: "break-word",
                  position: "relative"
                }}
              >
                {/* CONTENT */}
                {msg.fileUrl ? (
                  msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={msg.fileUrl}
                      alt="sent"
                      style={{ maxWidth: "220px", borderRadius: "10px" }}
                    />
                  ) : (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2563EB" }}
                    >
                      📄 File
                    </a>
                  )
                ) : msg.audioUrl ? (
                  <audio
                    controls
                    src={msg.audioUrl}
                    style={{ maxWidth: "220px" }}
                  />
                ) : (
                  msg.text
                )}

                {/* TIME + TICKS ROW */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    fontSize: "11px",
                    color: isMe ? "rgba(255,255,255,0.8)" : "#6b7280"
                  }}
                >
                  <span>{formatTime(msg.createdAt)}</span>

                  {isMe && (
                    <span
                      style={{
                        color:
                          status === "seen"
                            ? "#38bdf8" // blue for seen
                            : isMe
                            ? "rgba(255,255,255,0.7)" // grey-ish for sent/delivered
                            : "#9ca3af"
                      }}
                    >
                      {status === "sent" ? "✓" : "✓✓"}
                    </span>
                  )}
                </div>
              </div>

              {/* 3-dot menu for delete options */}
              <button
                onClick={() => {
                  setDeleteTarget(msg);
                  setShowDeleteModal(true);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#9ca3af"
                }}
                title="More"
              >
                ⋮
              </button>

              {isMe && (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    marginLeft: 4
                  }}
                />
              )}
            </div>
          );
        })}

        {/* 🔚 bottom marker for scrolling */}
        <div ref={bottomRef} />
      </div>

      {/* ---------------- INPUT AREA ---------------- */}
      <div
        style={{
          padding: "10px",
          display: "flex",
          gap: "10px",
          background: "#fff",
          borderTop: "1px solid #ddd",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0
        }}
      >
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={sendFile}
        />

        <button
          onClick={() => document.getElementById("fileInput").click()}
          style={{
            width: 35,
            height: 42,
            borderRadius: "50%",
            background: "#e5e7eb",
            border: "none",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          📎
        </button>

        <input
          value={text}
          onChange={handleInputChange}
          placeholder={isRecording ? "Recording..." : "Message..."}
          disabled={isRecording}
          style={{
            flexGrow: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "15px",
          }}
        />

        {/* Mic Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: 35,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: isRecording ? "#dc2626" : "#e5e7eb",
            color: isRecording ? "#fff" : "#111",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          {isRecording ? "■" : "🎙️"}
        </button>

        <button
          onClick={sendMessage}
          disabled={!text.trim() || isRecording}
          style={{
            padding: "10px 16px",
            borderRadius: "20px",
            background:
              !text.trim() || isRecording ? "#9ca3af" : "#4f46e5",
            color: "white",
            border: "none",
            fontWeight: "600",
            cursor:
              !text.trim() || isRecording ? "not-allowed" : "pointer"
          }}
        >
          ➤
        </button>
      </div>

      {isRecording && (
        <div
          style={{
            position: "fixed",
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "13px",
            color: "#dc2626"
          }}
        >
          Recording... {recordSeconds}s
        </div>
      )}

      {/* =================== MODALS =================== */}

      {/* Delete single message modal */}
      {showDeleteModal && deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "16px",
              width: "90%",
              maxWidth: "320px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          >
            <p style={{ marginBottom: "10px", fontWeight: 600 }}>
              Delete this message?
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "14px"
              }}
            >
              "Delete for everyone" removes it from both sides (like WhatsApp).
            </p>

            <button
              onClick={() => handleDeleteMessage("me")}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "none",
                background: "#e5e7eb",
                marginBottom: "6px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              {actionLoading ? "Please wait..." : "Delete for me"}
            </button>

            {/* Only show "delete for everyone" if it's my message */}
            {(() => {
              const senderId =
                typeof deleteTarget.sender === "string"
                  ? deleteTarget.sender
                  : deleteTarget.sender?._id;
              const canDeleteForEveryone = senderId === currentUser._id;
              if (!canDeleteForEveryone) return null;

              return (
                <button
                  onClick={() => handleDeleteMessage("everyone")}
                  disabled={actionLoading}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "999px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    marginBottom: "6px",
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  {actionLoading ? "Please wait..." : "Delete for everyone"}
                </button>
              );
            })()}

            <button
              onClick={() => {
                if (actionLoading) return;
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "none",
                background: "#fff",
                borderTop: "1px solid #e5e7eb",
                marginTop: "4px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clear chat modal */}
      {showClearModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "16px",
              width: "90%",
              maxWidth: "320px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          >
            <p style={{ marginBottom: "10px", fontWeight: 600 }}>
              Clear chat?
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "14px"
              }}
            >
              "Clear chat" removes all messages in this conversation, similar to
              WhatsApp.
            </p>

            <button
              onClick={() => handleClearChat("me")}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "none",
                background: "#e5e7eb",
                marginBottom: "6px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              {actionLoading
                ? "Please wait..."
                : "Clear chat (only for me)"}
            </button>

            <button
              onClick={() => handleClearChat("everyone")}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                marginBottom: "6px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              {actionLoading ? "Please wait..." : "Clear chat for both"}
            </button>

            <button
              onClick={() => {
                if (actionLoading) return;
                setShowClearModal(false);
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "none",
                background: "#fff",
                borderTop: "1px solid #e5e7eb",
                marginTop: "4px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
