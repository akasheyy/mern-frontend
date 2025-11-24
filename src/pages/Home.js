import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { FaRegComment, FaShare } from "react-icons/fa";


export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem("userId"));

  async function loadPosts() {
    const token = localStorage.getItem("token");

    const res = await fetch("https://mern-backend-igep.onrender.com/api/posts", {
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

  // instant UI update
  setPosts(prev =>
    prev.map(p =>
      p._id === postId
        ? {
            ...p,
            likes: p.likes.includes(userId)
              ? p.likes.filter(id => id !== userId)
              : [...p.likes, userId]
          }
        : p
    )
  );

  // send to backend
  await fetch(`https://mern-backend-igep.onrender.com/api/posts/${postId}/like`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token }
  });
}


  function handleShare(post) {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href
      });
    } else {
      alert("Sharing is not supported on this device.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
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
              borderRadius: "18px",
              marginBottom: "25px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)"
            }}
          >
            {/* USER HEADER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 15px"
              }}
            >
              <Link
                to={`/user/${p.userId._id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  color: "#222"
                }}
              >
                <img
                  src={
                    p.userId.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt=""
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
                <b>{p.userId.username}</b>
              </Link>

              {/* <FiMoreHorizontal size={26} style={{ cursor: "pointer" }} /> */}
            </div>

            {/* IMAGE */}
            {p.image && (
              <img
                src={p.image}
                alt="post"
                style={{
                  width: "100%",
                  objectFit: "cover",
                  maxHeight: "450px"
                }}
              />
            )}

            {/* ACTION BUTTONS */}
{/* ACTION BUTTONS */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "12px 15px"
  }}
>
  {/* ❤️ LIKE */}
  <div
    onClick={() => handleLike(p._id)}
    style={{
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    {p.likes.includes(userId) ? (
      <AiFillHeart size={28} color="#e11d48" />
    ) : (
      <AiOutlineHeart size={28} />
    )}

    <span style={{ fontSize: "15px", color: "#444" }}>
      {p.likes.length}
    </span>
  </div>

  {/* 💬 COMMENT */}
  <div
    onClick={() => navigate(`/post/${p._id}`)}
    style={{
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
    <FaRegComment size={25} />

    <span style={{ fontSize: "15px", color: "#6b7280" }}>
      {p.comments?.length || 0}
    </span>
  </div>

  {/* ↗ SHARE */}
  <span
    onClick={() => handleShare(p)}
    style={{ cursor: "pointer" }}
  >
    <FaShare size={22} />
  </span>

  {/* // ➡ SHOW MORE ICON
  <span
    onClick={() => navigate(`/post/${p._id}`)}
    style={{
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      fontSize:"20px"
    }}
    title="Show More"
  >
  
  </span>  */}
</div>



            {/* DESCRIPTION */}
            <div style={{ padding: "0 15px 15px" }}>
              <b>{p.userId.username}</b> : {p.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
