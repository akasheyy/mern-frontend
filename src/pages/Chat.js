import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import io from "socket.io-client";

export default function Chat() {
  const { id } = useParams(); // other user id

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  
  // 🎙 Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const bottomRef = useRef(null);
  const socket = useRef(null);

  const token = localStorage.getItem("token");

  /* ===================================================
     SOCKET CONNECT
  =================================================== */
  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      auth: { token }
    });

    socket.current.on("new_message", (msg) => {
      // accept if message belongs to this chat
      const s =
        typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const r =
        typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;

      if (s === id || r === id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.current.disconnect();
  }, [id, token]);

  /* ===================================================
     LOAD USER + HISTORY
  =================================================== */
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      // logged-in user
      const meRes = await fetch("http://localhost:5000/api/user/me", {
        headers: { Authorization: "Bearer " + token }
      });
      const meData = await meRes.json();
      setCurrentUser(meData);

      // chat history
      const msgRes = await fetch(
        `http://localhost:5000/api/messages/history/${id}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const msgData = await msgRes.json();
      setMessages(msgData);

      // other user
      const userRes = await fetch(
        `http://localhost:5000/api/user/profile/${id}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      const userData = await userRes.json();
      setOtherUser(userData.user);
    }

    load();
  }, [id, token]);

  /* ===================================================
     AUTO SCROLL
  =================================================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===================================================
     SEND TEXT MESSAGE
  =================================================== */
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.current.emit("send_message", {
      to: id,
      text
    });

    setText("");
  };

  // ===================================================
// SEND FILE (image, video, pdf, docs, zip...)
// ===================================================
const sendFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/messages/file/${id}`,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      }
    );

    if (!res.ok) {
      console.log(await res.text());
      return alert("File upload failed");
    }

    await res.json();


    // DO NOT manually push message — socket will handle it

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
          const token = localStorage.getItem("token");

          const res = await fetch(
            `http://localhost:5000/api/messages/voice/${id}`,
            {
              method: "POST",
              headers: { Authorization: "Bearer " + token },
              body: formData
            }
          );

          if (!res.ok) {
            console.log(await res.text());
            alert("Failed to upload voice message");
          }

          // ⚠️ DO NOT setMessages() here.
          // Socket.io will push the message automatically.

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
      setRecordSeconds(
        Math.floor((Date.now() - recordStartTime) / 1000)
      );
    }, 500);

    return () => clearInterval(interval);
  }, [isRecording, recordStartTime]);

  if (!currentUser || !otherUser) return <h2>Loading chat...</h2>;

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        background: "#f3f4f6"
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
        <Link to="/dashboard" style={{ fontSize: "24px", textDecoration: "none" }}>
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

        <div>
          <Link to={`/user/${otherUser._id}`}

                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "#222",
                  flexGrow: 1
                }}
              >
          <b>{otherUser.username}</b></Link>
          <p style={{ fontSize: "12px", margin: 0, color: "#666" }}>Chatting now</p>
        </div>
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

          return (
            <div
              key={index}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                marginBottom: "14px"
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
                    marginRight: 8
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
                  borderBottomLeftRadius: isMe ? "18px" : "4px"
                }}
              >
               {msg.fileUrl ? (
  msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
    <img
      src={msg.fileUrl}
      alt="sent"
      style={{ maxWidth: "220px", borderRadius: "10px" }}
    />
  ) : (
    <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#2563EB" }}>
      📄 File
    </a>
  )
) : msg.audioUrl ? (
  <audio controls src={msg.audioUrl} style={{ maxWidth: "220px" }} />
) : (
  msg.text
)}

              </div>

              {isMe && (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    marginLeft: 8
                  }}
                />
              )}
            </div>
          );
        })}

        <div ref={bottomRef}></div>
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
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#e5e7eb",
    border: "none",
    fontSize: "20px"
  }}
>
  📎
</button>


        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isRecording ? "Recording..." : "Message..."}
          disabled={isRecording}
          style={{
            flexGrow: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "15px"
          }}
        />
{/* Mic Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: 42,
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
            padding: "12px 18px",
            borderRadius: "20px",
            background: !text.trim() || isRecording ? "#9ca3af" : "#4f46e5",
            color: "white",
            border: "none",
            fontWeight: "600",
            cursor:
              !text.trim() || isRecording ? "not-allowed" : "pointer"
          }}
        >
          Send
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
    </div>
  );
}
