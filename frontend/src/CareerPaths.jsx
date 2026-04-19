import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./CareerPaths.css";

function CareerPaths() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser(userData);
    
    // Redirect if user hasn't filled the form
    if (!userData.skills || !userData.experience) {
      navigate("/");
    }
  }, [navigate]);

  const handleSearch = () => {
    setLoading(true);
    // TODO: Implement job search functionality
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <Navbar />
      <div className="career-paths-container">
        <div className="header-section">
          <h1>🎯 Smart Job Discovery</h1>
          <p className="subtitle">
            Find personalized job opportunities based on your profile
          </p>
        </div>

        <div className="profile-summary">
          <h2>Your Profile</h2>
          <div className="profile-details">
            <div className="detail-item">
              <strong>Skills:</strong> {user.skills || "Not provided"}
            </div>
            <div className="detail-item">
              <strong>Experience:</strong> {user.experience || "Not provided"}
            </div>
            <div className="detail-item">
              <strong>Current Role:</strong> {user.role || "Not provided"}
            </div>
            <div className="detail-item">
              <strong>Company:</strong> {user.company || "Not provided"}
            </div>
          </div>
        </div>

        <div className="search-section">
          <button 
            className="search-btn" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Discover Jobs"}
          </button>
        </div>

        <div className="results-section">
          <h2>Job Recommendations</h2>
          <div className="placeholder-content">
            <p>🚀 AI-powered job recommendations will appear here</p>
            <ul className="features-list">
              <li>✓ Personalized job matches based on your skills</li>
              <li>✓ Company insights and culture fit analysis</li>
              <li>✓ Salary trends and market demand</li>
              <li>✓ Application tips and interview preparation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerPaths;

// Made with Bob
