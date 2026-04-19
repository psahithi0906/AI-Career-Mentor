import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../public/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const name = user.name || "User";
  const email = user.email || "Not available";
  const skills = user.skills || "Not provided";
  const experience = user.experience || "Not provided";
  const company = user.company || "Not provided";
  const role = user.role || "Not provided";

  useEffect(() => {
    if (!showProfile) return;
    const timer = setTimeout(() => setShowProfile(false), 3000);
    return () => clearTimeout(timer);
  }, [showProfile]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="AI Career" onClick={() => navigate("/home")} style={{ cursor: "pointer" }} />
      </div>

      <div className="user-info">
        <button
          type="button"
          className="profile-button"
          onClick={() => setShowProfile((prev) => !prev)}
        >
          <img
            src="/profile.jpg"
            alt="Profile"
            className="profile-img"
          />
        </button>
        <div className="user-greeting">
          <b>Hi {name}!</b>
        </div>

        {showProfile && (
          <div className="profile-popup">
            <div className="profile-popup-header">Profile</div>
            <div className="profile-detail">
              <span className="detail-label">Name</span>
              <span>{name}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Email</span>
              <span>{email}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Skills</span>
              <span>{skills}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Experience</span>
              <span>{experience}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Company</span>
              <span>{company}</span>
            </div>
            <div className="profile-detail">
              <span className="detail-label">Role</span>
              <span>{role}</span>
            </div>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "8px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}