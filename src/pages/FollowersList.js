import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function FollowersList() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://mern-backend-igep.onrender.com/api/user/profile/${id}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();
      setUser(data.user);
      setFollowers(data.user.followers || []);
    }

    load();
  }, [id]);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "50px",minHeight:"80vh",background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <h2 style={{textAlign:"center",color:"white"}}>Followers</h2>

      {followers.length === 0 && <p>No followers yet.</p>}

      <div style={{ marginTop: "20px" }}>
        {followers.map((f) => {
          const userId = typeof f === "string" ? f : f._id;

          return (
            <Link
              key={userId}
              to={`/user/${userId}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                background: "#fff",
                marginBottom: "10px",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#111",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src={f.avatar || "https://via.placeholder.com/40"}
                alt=""
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "15px"
                }}
              />

              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {f.username}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
