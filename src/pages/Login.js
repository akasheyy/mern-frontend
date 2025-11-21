import React, { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    }
  }

  // Modern input style
  const inputStyle = {
    width: "93%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #dbdbdb",
    background: "#fafafa",
    color: "#262626",
    marginBottom: "18px",
    fontSize: "15px",
    transition: "all 0.2s ease"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "35px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "26px",
            marginBottom: "25px",
            fontWeight: "700",
            color: "#262626"
          }}
        >
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.background = "#fff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #dbdbdb";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.background = "#fff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #dbdbdb";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
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
            Login
          </button>
        </form>

        <p
          style={{
            marginTop: "18px",
            textAlign: "center",
            fontSize: "14px",
            color: "#4b5563"
          }}
        >
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#6d28d9",
              fontWeight: "600",
              textDecoration: "none"
            }}
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
