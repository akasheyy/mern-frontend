import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditPost() {
  const { id } = useParams();

  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    async function loadPost() {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://mern-backend-igep.onrender.com/api/posts/${id}`, {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();

      setPost({
        title: data.title,
        description: data.description,
        content: data.content,
        image: data.image
      });

      setPreview(data.image);
    }

    loadPost();
  }, [id]);

  function handleChange(e) {
    setPost({ ...post, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    setNewImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("description", post.description);
    formData.append("content", post.content);

    if (newImage) {
      formData.append("image", newImage);
    }

    const res = await fetch(`https://mern-backend-igep.onrender.com/api/posts/${id}`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      window.location.href = "/dashboard";
    }
  }

  // Same input style as AddPost page
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
          Edit Post
        </h2>

        <form onSubmit={handleSubmit}>
          {/* IMAGE PREVIEW */}
          {preview && (
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  marginBottom: "10px"
                }}
              />

              {/* REMOVE IMAGE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setNewImage(null);
                }}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontWeight: "700"
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* IMAGE INPUT BOX */}
          <label
            style={{
              display: "block",
              padding: "20px",
              width: "91%",
              borderRadius: "16px",
              border: "2px dashed #dbdbdb",
              textAlign: "center",
              color: "#6b7280",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "0.3s"
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
            📸 Click to upload new image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Post title"
            value={post.title}
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

          {/* Description */}
          <input
            type="text"
            name="description"
            placeholder="Short description"
            value={post.description}
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

          {/* Content */}
          <textarea
            name="content"
            rows="6"
            placeholder="Write full content"
            value={post.content}
            onChange={handleChange}
            style={{
              ...inputStyle,
              height: "140px",
              resize: "none"
            }}
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
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow =
                "0 8px 20px rgba(102, 126, 234, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow =
                "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >
            Update Post
          </button>
        </form>
      </div>
    </div>
  );
}
