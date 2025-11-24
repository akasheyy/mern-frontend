import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PublicProfile() {
  const { id } = useParams();

  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Load logged in user
        const meRes = await fetch("https://mern-backend-igep.onrender.com/api/user/me", {
          headers: { Authorization: "Bearer " + token }
        });
        const meData = await meRes.json();
        setCurrentUser(meData);

        // Load viewed user profile
        const res = await fetch(
          `https://mern-backend-igep.onrender.com/api/user/profile/${id}`,
          { headers: { Authorization: "Bearer " + token } }
        );
        const data = await res.json();
        setUserData(data);

        setLoading(false);
      } catch (err) {
        console.log("Public profile load error:", err);
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <h2 style={{ textAlign: "center", color: "white" }}>Loading...</h2>;
  if (!userData || !userData.user) return <h2 style={{ textAlign: "center", color: "white" }}>User not found</h2>;

  const { user, posts } = userData;

  const followerList = user.followers || [];
  const followingList = user.following || [];

  const followingIds = currentUser?.following?.map((f) =>
    typeof f === "string" ? f : f._id
  ) || [];

  const isFollowing = followingIds.includes(user._id);

  async function handleFollow() {
    const token = localStorage.getItem("token");

    await fetch(`https://mern-backend-igep.onrender.com/api/user/${user._id}/follow`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    setUserData({
      ...userData,
      user: {
        ...user,
        followers: [...followerList, { _id: currentUser._id }]
      }
    });
  }

  async function handleUnfollow() {
    const token = localStorage.getItem("token");

    await fetch(`https://mern-backend-igep.onrender.com/api/user/${user._id}/unfollow`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    setUserData({
      ...userData,
      user: {
        ...user,
        followers: followerList.filter(
          (f) => (typeof f === "string" ? f : f._id) !== currentUser._id
        )
      }
    });
  }

  const joinedDate = new Date(user.createdAt);

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
      <div style={{ width: "100%", maxWidth: "900px",marginTop:"50px",marginBottom:"50px" }}>

        {/* ---------- HEADER ---------- */}
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            marginBottom: "30px"
          }}
        >
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            alt="avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #764ba2"
            }}
          />

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

            {/* Follow/Unfollow + Message */}
            {currentUser?._id !== user._id && (
              <div style={{ marginTop: "12px", display: "flex", gap: "4px" }}>
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  style={{
                    padding: "5px 8px",
                    borderRadius: "10px",
                    border: "none",
                    background: isFollowing ? "#dd0707ff" : "#2563EB",
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>

                <Link
                  to={`/chat/${user._id}`}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "#008357ff",
                    color: "white",
                    fontWeight: "700",
                    textDecoration: "none"
                  }}
                >
                  Message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ---------- STATS BOX ---------- */}
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
            <h3 style={{ fontSize: "22px", color: "#333" }}>{followerList.length}</h3>  
<p style={{ color: "#777" }}>Followers</p>
            </Link>
          </div>

          <div>
            <Link
  to={`/following/${user._id}`}
  style={{ textDecoration: "none", color: "#111" }}
>
            <h3 style={{ fontSize: "22px", color: "#333" }}>{followingList.length}</h3>
            <p style={{ color: "#777" }}>Following</p>
            </Link>
          </div>
        </div>

        {/* ---------- POSTS GRID ---------- */}
        <h3 style={{ color: "white", marginBottom: "15px", fontSize: "22px" }}>
          Posts
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "7px"
          }}
        >
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/post/${p._id}`}
              style={{
                display: "block",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt="post"
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
          ))}
        </div>
      </div>
    </div>
  );
}
