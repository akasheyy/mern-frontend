import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function FollowingList() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/user/profile/${id}`,
        { headers: { Authorization: "Bearer " + token } }
      );

      const data = await res.json();
      setUser(data.user);
      setFollowing(data.user.following || []);
    }

    load();
  }, [id]);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "50px",minHeight:"80vh",background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",}}>
      <h2 style={{textAlign:"center",color:"white"}}>Following</h2>

      {following.length === 0 && <p>Not following anyone yet.</p>}

      <div style={{ marginTop: "20px" }}>
        {following.map((f) => {
          const userId = typeof f === "string" ? f : f._id;

          return (
            <Link
              key={userId}
              to={`/profile/${userId}`}
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
