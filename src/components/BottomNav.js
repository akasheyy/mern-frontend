import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiPlusSquare,
  FiSearch,
} from "react-icons/fi";

export default function BottomNav() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("https://mern-backend-igep.onrender.com/api/user/me", {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log("BottomNav load error:", err);
      }
    }

    loadProfile();
  }, []);

  // Default nav item style
  const navItem = {
    color: "#777",
    fontSize: "26px",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "20%"
  };

  // Active icon style
  const activeStyle = {
    color: "#6d28d9"
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: "70px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.12)",
        zIndex: 999
      }}
    >

      {/* HOME */}
      <Link
        to="/"
        style={{ ...navItem, ...(location.pathname === "/" ? activeStyle : {}) }}
      >
        <FiHome size={26} />
        
      </Link>

      {/* DASHBOARD */}
      <Link
        to="/dashboard"
        style={{
          ...navItem,
          ...(location.pathname === "/dashboard" ? activeStyle : {})
        }}
      >
        <FiGrid size={26} />
        
      </Link>

      {/* ADD POST BUTTON */}
      <Link
        to="/add-post"
        style={{
          ...navItem,
          ...(location.pathname === "/add-post" ? activeStyle : {})
        }}
      >
        <FiPlusSquare size={30} />
        
      </Link>

      {/* EXPLORE */}
      <Link
        to="/explore"
        style={{
          ...navItem,
          ...(location.pathname === "/explore" ? activeStyle : {})
        }}
      >
        <FiSearch size={26} />
        
      </Link>

      {/* PROFILE */}
      <Link
        to="/profile"
        style={{
          ...navItem,
          ...(location.pathname === "/profile" ? activeStyle : {})
        }}
      >
        <img
          src={user?.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            objectFit: "cover",
            border:
              location.pathname === "/profile"
                ? "2px solid #6d28d9"
                : "2px solid #d1d5db"
          }}
        />
        
      </Link>
    </div>
  );
}
