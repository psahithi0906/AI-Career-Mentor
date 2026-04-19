import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import API from "./services/api";
import "./CareerPaths.css";

function CareerPaths() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [targetCompany, setTargetCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser(userData);
    
    // Redirect if user hasn't filled the form
    if (!userData.skills || !userData.experience) {
      navigate("/");
    }
  }, [navigate]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await API.post("/jobs/search", {
        company: targetCompany.trim() || null,
        role: user.role || "Software Engineer",
        location: location.trim() || null
      });
      
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        alert("Failed to fetch jobs. Please try again.");
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("Error searching for jobs. Please try again later.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
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
          <h2>Search Jobs of your current role</h2>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Company name (e.g., Google, Microsoft)"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="company-input"
            />
            <input
              type="text"
              placeholder="Location (e.g., Remote, San Francisco, New York)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="location-input"
            />
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </div>
        </div>

        <div className="results-section">
          <h2>Job Recommendations</h2>
          {!searched ? (
            <div className="placeholder-content">
              <p>🚀 AI-powered job recommendations will appear here</p>
              <ul className="features-list">
                <li>✓ Personalized job matches based on your skills</li>
                <li>✓ Company insights and culture fit analysis</li>
                <li>✓ Salary trends and market demand</li>
                <li>✓ Application tips and interview preparation</li>
              </ul>
            </div>
          ) : jobs.length > 0 ? (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div className="job-title-section">
                      <h3>{job.title}</h3>
                      <span className="job-id">ID: {job.id}</span>
                    </div>
                    <span className="match-score">{job.matchScore}% Match</span>
                  </div>
                  <div className="job-meta">
                    <span className="job-company">🏢 {job.company}</span>
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-salary">💰 {job.salary}</span>
                    <span className="job-posted">🕒 {job.posted}</span>
                  </div>
                  <p className="job-description">{job.description}</p>
                  {job.requirements.length > 0 && (
                    <div className="job-requirements">
                      <strong>Required Skills:</strong>
                      <div className="skills-tags">
                        {job.requirements.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apply-btn"
                  >
                    Apply Now →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <img src="/sad_dog.png" alt="No results" className="no-results-image" />
              <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#94a3b8" }}>
                Try adjusting your search criteria or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerPaths;


