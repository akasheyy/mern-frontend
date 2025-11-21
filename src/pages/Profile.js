import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      // Load user info
      const res1 = await fetch("http://localhost:5000/api/user/me", {
        headers: { Authorization: "Bearer " + token }
      });
      const userInfo = await res1.json();
      setUser(userInfo);

      // Load user's posts
      const res2 = await fetch("http://localhost:5000/api/posts/myposts", {
        headers: { Authorization: "Bearer " + token }
      });
      const postsData = await res2.json();
      setPosts(postsData);
    }

    loadUser();
  }, []);

  if (!user) return <h2 style={{ color: "#fff", textAlign: "center" }}>Loading...</h2>;

  const joinedDate = new Date(user.createdAt);
  
  const followersCount = user.followers ? user.followers.length : 0;
  const followingCount = user.following ? user.following.length : 0;

  // ---------------- DELETE POST ----------------
  const deletePost = async (id) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    alert(data.message);

    setPosts(posts.filter((p) => p._id !== id));
  };

  // ---------------- AVATAR CHANGE ----------------
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);

    fetch("http://localhost:5000/api/user/avatar", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: formData
    })
      .then((res) => res.json())
      .then(() => {
        alert("Profile picture updated!");
        window.location.reload();
      });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>

        {/* ---------------- PROFILE HEADER ---------------- */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "25px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            marginBottom: "30px"
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <img
              src={user.avatar || "https://via.placeholder.com/150"}
              alt="avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #764ba2"
              }}
            />

            {/* Change avatar */}
            <label
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#6d28d9",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Edit
              <input type="file" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
          </div>

          {/* User Info */}
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "5px" }}>
              {user.username}
            </h2>

            <p style={{ color: "#555", marginBottom: "6px" }}>{user.email}</p>

            <p style={{ color: "#777", fontSize: "14px" }}>
  Joined on{" "}
  {joinedDate.getDate().toString().padStart(2, "0")}/
  {(joinedDate.getMonth() + 1).toString().padStart(2, "0")}/
  {joinedDate.getFullYear()}
</p>



            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              style={{
                marginTop: "12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ---------------- STATS (Posts / Followers / Following) ---------------- */}
        <div
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "18px",
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
            marginBottom: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}
        >
          <div>
            <h3 style={{ fontSize: "22px", color: "#333" }}>{posts.length}</h3>
            <p style={{ color: "#777" }}>Posts</p>
          </div>

          <div>
            <Link to={`/followers/${user._id}`}  style={{ textDecoration: "none", color: "#111" }}>  
            <h3 style={{ fontSize: "22px", color: "#333" }}>{followersCount}</h3>
            <p style={{ color: "#777" }}>Followers</p>
            </Link>
          </div>

          <div>
            <Link
              to={`/following/${user._id}`}
              style={{ textDecoration: "none", color: "#111" }}
            >
            <h3 style={{ fontSize: "22px", color: "#333" }}>{followingCount}</h3>
            <p style={{ color: "#777" }}>Following</p>
            </Link>
          </div>
        </div>

        {/* ---------------- POSTS GRID ---------------- */}
        <h3 style={{ color: "white", marginBottom: "15px", fontSize: "22px" }}>
          Your Posts
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px"
          }}
        >
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
              }}
            >
              {/* CLICK IMAGE → OPEN POST */}
              <Link to={`/post/${post._id}`}>
                {post.image ? (
                  <img
                    src={post.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "160px",
                      background: "#f3f4f6",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "600",
                      color: "#555"
                    }}
                  >
                    No Image
                  </div>
                )}
              </Link>

              {/* THREE DOT MENU */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "5px 8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "700"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = document.getElementById("menu-" + post._id);
                  menu.style.display = menu.style.display === "block" ? "none" : "block";
                }}
              >
                ⋮
              </div>

              {/* DROPDOWN MENU */}
              <div
                id={"menu-" + post._id}
                style={{
                  display: "none",
                  position: "absolute",
                  top: "45px",
                  right: "10px",
                  background: "#fff",
                  borderRadius: "10px",
                  width: "120px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                  zIndex: 10
                }}
              >
                <Link
                  to={`/edit/${post._id}`}
                  style={{
                    display: "block",
                    padding: "10px",
                    textDecoration: "none",
                    color: "#6d28d9",
                    fontWeight: "600",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  Edit
                </Link>

                <button
                  onClick={() => deletePost(post._id)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FLOATING ADD POST BUTTON */}
        <Link
          to="/add-post"
          style={{
            position: "fixed",
            bottom: "75px",
            right: "25px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            color: "white",
            fontSize: "34px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            fontWeight: "700",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
          }}
        >
          +
        </Link>
      </div>
    </div>
  );
}
