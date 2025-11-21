import React, { useState } from "react";

export default function AddPost() {
  const [post, setPost] = useState({
    title: "",
    description: "",
    content: ""
  });

  const [image, setImage] = useState(null);

  function handleChange(e) {
    setPost({
      ...post,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("description", post.description);
    formData.append("content", post.content);
    if (image) formData.append("image", image);

    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      window.location.href = "/dashboard";
    }
  }

  const inputStyle = {
    width: "94%",
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
        padding: "25px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          border: "1px solid #e5e7eb",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell"
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#262626",
            textAlign: "center",
            marginBottom: "25px"
          }}
        >
          Create New Post
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Post title"
            value={post.title}
            onChange={handleChange}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #dbdbdb";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Description */}
          <input
            type="text"
            name="description"
            placeholder="Short description"
            value={post.description}
            onChange={handleChange}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #dbdbdb";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Content */}
          <textarea
            name="content"
            placeholder="Write full content here"
            rows="6"
            value={post.content}
            onChange={handleChange}
            style={{
              ...inputStyle,
              resize: "none",
              height: "130px"
            }}
            onFocus={(e) => {
              e.target.style.background = "#ffffff";
              e.target.style.border = "1px solid #a78bfa";
              e.target.style.boxShadow = "0 0 5px #a78bfa";
            }}
            onBlur={(e) => {
              e.target.style.background = "#fafafa";
              e.target.style.border = "1px solid #dbdbdb";
              e.target.style.boxShadow = "none";
            }}
          ></textarea>

          {/* Image Upload */}
          <label
            style={{
              display: "block",
              width: "91%",
              padding: "20px",
              border: "2px dashed #dbdbdb",
              borderRadius: "16px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
              cursor: "pointer",
              marginBottom: "20px",
              transition: ".3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.border = "2px dashed #a78bfa";
              e.target.style.background = "#faf5ff";
            }}
            onMouseLeave={(e) => {
              e.target.style.border = "2px dashed #dbdbdb";
              e.target.style.background = "transparent";
            }}
          >
            📸 Click to upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ display: "none" }}
            />
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow =
                "0 8px 20px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow =
                "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >
            Publish Post
          </button>
        </form>
      </div>
    </div>
  );
}
