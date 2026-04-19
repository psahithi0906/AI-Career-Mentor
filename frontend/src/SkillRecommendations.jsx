import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./SkillRecommendations.css";

function SkillRecommendations() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [desiredRole, setDesiredRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser(userData);
    
    // Redirect if user hasn't filled the form
    if (!userData.skills || !userData.experience) {
      navigate("/");
    }
  }, [navigate]);

  const handleGenerateRoadmap = () => {
    if (!desiredRole.trim()) {
      alert("Please enter your desired role");
      return;
    }
    setLoading(true);
    // TODO: Implement skill recommendations and roadmap generation
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <Navbar />
      <div className="skill-recommendations-container">
        <div className="header-section">
          <h1>💡 Desired Skills & Career Paths</h1>
          <p className="subtitle">
            Get personalized skill recommendations and career roadmaps
          </p>
        </div>

        <div className="current-profile">
          <h2>Your Current Profile</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">Current Role:</span>
              <span className="value">{user.role || "Not provided"}</span>
            </div>
            <div className="profile-item">
              <span className="label">Experience:</span>
              <span className="value">{user.experience || "Not provided"}</span>
            </div>
            <div className="profile-item">
              <span className="label">Current Skills:</span>
              <span className="value">{user.skills || "Not provided"}</span>
            </div>
            <div className="profile-item">
              <span className="label">Company:</span>
              <span className="value">{user.company || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="desired-role-section">
          <h2>What's Your Dream Role?</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              className="role-input"
            />
            <button 
              className="generate-btn"
              onClick={handleGenerateRoadmap}
              disabled={loading}
            >
              {loading ? "Generating..." : "🚀 Generate Roadmap"}
            </button>
          </div>
        </div>

        <div className="roadmap-section">
          <h2>Your Personalized Career Roadmap</h2>
          <div className="placeholder-content">
            <p>🗺️ Your AI-powered career roadmap will appear here</p>
            
            <div className="roadmap-features">
              <div className="roadmap-card">
                <div className="card-icon">🎯</div>
                <h3>Skill Gap Analysis</h3>
                <p>Identify the skills you need to acquire for your desired role</p>
              </div>
              
              <div className="roadmap-card">
                <div className="card-icon">📚</div>
                <h3>Learning Path</h3>
                <p>Step-by-step learning resources prioritized by importance</p>
              </div>
              
              <div className="roadmap-card">
                <div className="card-icon">⏱️</div>
                <h3>Timeline & Milestones</h3>
                <p>Realistic timeline with achievable milestones to track progress</p>
              </div>
              
              <div className="roadmap-card">
                <div className="card-icon">💼</div>
                <h3>Career Progression</h3>
                <p>Intermediate roles and positions on your path to the dream role</p>
              </div>
              
              <div className="roadmap-card">
                <div className="card-icon">🏆</div>
                <h3>Certifications</h3>
                <p>Recommended certifications to boost your credentials</p>
              </div>
              
              <div className="roadmap-card">
                <div className="card-icon">🔗</div>
                <h3>Projects & Portfolio</h3>
                <p>Hands-on projects to build and showcase your skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillRecommendations;


