import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ----------------------------------------------------
  // LOAD LOGGED-IN USER FIRST
  // ----------------------------------------------------
  useEffect(() => {
    async function loadCurrentUser() {
      const res = await fetch("https://mern-backend-igep.onrender.com/api/user/me", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      setCurrentUser(data);
    }

    loadCurrentUser();
  }, [token]);


  // ----------------------------------------------------
  // LOAD SUGGESTED USERS
  // ----------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    async function loadSuggestions() {
      const res = await fetch("https://mern-backend-igep.onrender.com/api/user/suggestions", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      setSuggestions(data);
    }

    loadSuggestions();
  }, [currentUser]);


  // ----------------------------------------------------
  // SEARCH USERS
  // ----------------------------------------------------
  useEffect(() => {
    loadUsers("");
  }, []);

  const loadUsers = async (query) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://mern-backend-igep.onrender.com/api/user/search?query=${query}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();

      // ❌ Filter out current user
      const filtered = data.filter((u) => u._id !== currentUser?._id);

      setUsers(filtered);
      setLoading(false);
    } catch (err) {
      console.log("Search error:", err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    loadUsers(value);
  };


  // ----------------------------------------------------
  // FOLLOW USER IN EXPLORE
  // ----------------------------------------------------
  async function handleFollow(targetId) {
    await fetch(`https://mern-backend-igep.onrender.com/api/user/${targetId}/follow`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    // Remove from suggestions instantly
    setSuggestions((prev) => prev.filter((u) => u._id !== targetId));
  }


  return (
    <div style={{ padding: "20px",minHeight:"90vh",background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",marginBottom:"50px" }}>
      <h2 style={{ marginBottom: "15px",marginTop:"50px",color:"white" }}>Explore</h2>

      {/* SEARCH BAR */}
      <input
        value={search}
        onChange={handleSearch}
        placeholder="Search users..."
        style={{
          width: "94%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          marginBottom: "20px"
        }}
      />

      {loading && <p>Searching...</p>}


      {/* ------------------------------------ */}
      {/* 🔥 SUGGESTED USERS */}
      {/* ------------------------------------ */}
      {suggestions.length > 0 && (
        <>
          <h3 style={{ marginBottom: "10px",color:"white" }}>Suggested for you</h3>

          {suggestions.map((u) => (
            <div
              key={u._id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                background: "white",
                borderRadius: "12px",
                marginBottom: "12px",
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
              }}
            >
              <Link
                to={`/user/${u._id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "#222",
                  flexGrow: 1
                }}
              >
                <img
                  src={u.avatar || "https://via.placeholder.com/40"}
                  alt=""
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: "50%",
                    marginRight: 15,
                    objectFit: "cover",
                    border: "2px solid #ddd"
                  }}
                />

                <div>
                  <b style={{ fontSize: "18px" }}>{u.username}</b>
                  <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                    {u.followers.length} followers
                  </p>
                </div>
              </Link>

              {/* FOLLOW BUTTON */}
              <button
                onClick={() => handleFollow(u._id)}
                style={{
                  padding: "6px 12px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </>
      )}


      {/* ------------------------------------ */}
      {/* 🔍 SEARCH RESULTS */}
      {/* ------------------------------------ */}
      <h3 style={{ marginTop: "20px",color:"white" }}>Users</h3>

      {users.map((u) => (
        <Link
          key={u._id}
          to={`/user/${u._id}`}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px",
            background: "white",
            borderRadius: "12px",
            marginBottom: "12px",
            textDecoration: "none",
            color: "#222",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
          }}
        >
          <img
            src={u.avatar || "https://via.placeholder.com/40"}
            alt=""
            style={{
              width: 55,
              height: 55,
              borderRadius: "50%",
              marginRight: 15,
              objectFit: "cover",
              border: "2px solid #ddd"
            }}
          />

          <div>
            <b style={{ fontSize: "18px" }}>{u.username}</b>
            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
              {u.followers.length} followers
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
