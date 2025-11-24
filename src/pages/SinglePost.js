import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

export default function SinglePost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");

  const loadPost = useCallback(async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`https://mern-backend-igep.onrender.com/api/posts/${id}`, {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    setPost(data);
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function addComment() {
    const token = localStorage.getItem("token");

    await fetch(`https://mern-backend-igep.onrender.com/api/posts/${id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ text: comment })
    });

    setComment("");
    loadPost();
  }

  if (!post) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 15px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        marginTop:"50px",
        marginBottom:"50px"
      }}
    >
      
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb"
        }}
      >
        {/* BACK BUTTON */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "15px"
  }}
>
  <Link
    to="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      color: "#6d28d9",
      textDecoration: "none",
   
      cursor: "pointer"
    }}
  >
    ←
  </Link>
</div>

        {/* IMAGE */}
        {post.image && (
          <img
            src={post.image}
            alt=""
            style={{
              width: "100%",
              borderRadius: "16px",
              marginBottom: "20px"
            }}
          />
        )}

        {/* TITLE */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "5px"
          }}
        >
          {post.title}
        </h1>

        {/* AUTHOR */}
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          By <b>{post.userId.username}</b>
        </p>

        {/* CONTENT */}
        <p
          style={{
            fontSize: "17px",
            lineHeight: "1.7",
            color: "#374151",
            whiteSpace: "pre-line"
          }}
        >
          {post.content}
        </p>

        <hr style={{ margin: "25px 0", borderColor: "#ddd" }} />

        {/* COMMENTS */}
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "10px",
            color: "#1f2937"
          }}
        >
          Comments ({post.comments.length})
        </h3>

        <div>
          {post.comments.map((c) => (
            <div
              key={c._id}
              style={{
                background: "#f9fafb",
                padding: "12px",
                borderRadius: "12px",
                marginTop: "10px",
                border: "1px solid #e5e7eb"
              }}
            >
              <b style={{ color: "#4f46e5" }}>{c.username}:</b>{" "}
              <span style={{ color: "#333" }}>{c.text}</span>
            </div>
          ))}
        </div>

        {/* ADD COMMENT */}
        <div style={{ marginTop: "20px" }}>
          <textarea
            placeholder="Write a comment..."
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: "90%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "#fafafa",
              outline: "none",
              fontSize: "15px",
              transition: "all 0.2s ease"
            }}
            onFocus={(e) => {
              e.target.style.background = "#fff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />

          <button
            onClick={addComment}
            style={{
              marginTop: "12px",
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow =
                "0 8px 20px rgba(102,126,234,0.55)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow =
                "0 4px 15px rgba(102,126,234,0.4)";
            }}
          >
            Add Comment
          </button>
        </div>

        
      </div>
    </div>
  );
}
