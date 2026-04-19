import { useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import API from "./services/api";

function Home() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const name = user.name || "User";
  const email = user.email || "Not available";

  const [formData, setFormData] = useState({
    skills: "",
    experience: "",
    company: "",
    role: "",
    service: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update user record with career details
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Send to backend
      await API.put("/auth/update", {
        skills: formData.skills,
        experience: formData.experience,
        company: formData.company,
        role: formData.role,
      });
      
      // Navigate based on service
      const routes = {
        "career-paths": "/career-paths",
        "resume-analysis": "/resume-analysis",
        "skill-recommendations": "/skill-recommendations",
      };
      navigate(routes[formData.service] || "/form");
    } catch (err) {
      console.error("Update failed:", err);
      // Still navigate even if update fails
      const routes = {
        "career-paths": "/career-paths",
        "resume-analysis": "/resume-analysis",
        "skill-recommendations": "/skill-recommendations",
      };
      navigate(routes[formData.service] || "/form");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="home"> 

        {/* Hero Section */}
        <div className="hero">
          <h1>
            Empower Your Career with <span>AI</span>
          </h1>

          <p>
            Get personalized career paths and resume analysis powered by AI.
          </p>

          <div className="career-form-box">
            <form onSubmit={handleSubmit} className="career-form">
              <h2>Let's Get Started! Please enter the below details</h2>
              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Python"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="company">Current Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Google"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Current Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="service">What service would you like?</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a service</option>
                  <option value="career-paths">Personalized Career Paths</option>
                  <option value="resume-analysis">AI Resume Analysis</option>
                  <option value="skill-recommendations">Skill Recommendations</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">Submit & Continue</button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="option-container">
          <button className="options">🎯 Smart Job Discovery</button>
          <div className="tooltip">🌟 Search jobs based on your profile with insights on roles, companies, and hiring trends</div>
        </div>
        <div className="option-container">
          <button className="options">📄 AI Resume Analysis</button>
          <div className="tooltip">📄 Upload your resume to get AI-driven analysis with ATS score, skill gaps, and improvement suggestions.</div>
        </div>
        <div className="option-container">
          <button className="options">💡 Desired Skills & Paths</button>
          <div className="tooltip">💡AI-powered skill recommendations and step-by-step career roadmaps tailored to your desired role with prioritized learning paths and structured milestones. </div>
        </div>
      </div>
    </div>
  );
}

export default Home;