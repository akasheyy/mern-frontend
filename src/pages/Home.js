import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);

  async function loadPosts() {
    const token = localStorage.getItem("token");


    const res = await fetch("http://localhost:5000/api/posts", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    setPosts(data);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleLike(postId) {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    loadPosts();
  }

  return (
    <div
      style={{
        minHeight: "90vh",
        padding: "30px 15px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div style={{ width: "100%", maxWidth: "650px" }}>
        <h2
          style={{
            textAlign: "center",
            color: "white",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px"
          }}
        >
          All Posts
        </h2>

        {posts.length === 0 && (
          <p style={{ color: "white", textAlign: "center" }}>No posts yet.</p>
        )}

        {posts.map((p) => (
          <div
            key={p._id}
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "20px",
              marginBottom: "25px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              border: "1px solid #e5e7eb"
            }}
          >
            {/* USER SECTION */}
           <Link to={`/user/${p.userId._id}`}
              style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}
            >
              <img
                src={p.userId.avatar}
                alt=""
                style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
            <b>{p.userId.username}</b>
            </Link>

              <br/>
            {/* IMAGE */}
            {p.image && (
              <img
                src={p.image}
                alt=""
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  marginBottom: "15px"
                }}
              />
            )}
            {/* TITLE + DESCRIPTION */}
            <h3
              style={{
                marginTop: "15px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#222"
              }}
            >
              {p.title}
            </h3>

            <p style={{ color: "#555", marginBottom: "10px" }}>
              {p.description}
            </p>


            {/* ACTION BUTTONS */}
<div style={{ 
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "10px",
  marginBottom: "10px"
}}>
  
  {/* LIKE */}
  <button
    onClick={() => handleLike(p._id)}
    style={{
      background: "#ef4444",
      color: "white",
      border: "none",
      padding: "10px 0",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "15px"
    }}
  >
    ❤️ Like  ({p.likes.length})
  </button>

  {/* COMMENT */}
  <button
    onClick={() => window.location.href = `/post/${p._id}`}
    style={{
      background: "#3b82f6",
      color: "white",
      border: "none",
      padding: "10px 0",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "15px"
    }}
  >
    💬 Comment
  </button>

  {/* READ MORE BUTTON */}
  <button
    onClick={() => window.location.href = `/post/${p._id}`}
    style={{
      background: "#6d28d9",
      color: "white",
      border: "none",
      padding: "10px 0",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "15px"
    }}
  >
    Show More →
  </button>

</div>

          </div>
        ))}
      </div>
    </div>
  );
}
