import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./ResumeAnalysis.css";

function ResumeAnalysis() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser(userData);
    
    // Redirect if user hasn't filled the form
    if (!userData.skills || !userData.experience) {
      navigate("/");
    }
  }, [navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or Word document");
      return;
    }
    setFile(selectedFile);
  };

  const handleAnalyze = () => {
    if (!file) {
      alert("Please upload a resume first");
      return;
    }
    setAnalyzing(true);
    // TODO: Implement resume analysis functionality
    setTimeout(() => {
      setAnalyzing(false);
    }, 3000);
  };

  return (
    <div>
      <Navbar />
      <div className="resume-analysis-container">
        <div className="header-section">
          <h1>📄 AI Resume Analysis</h1>
          <p className="subtitle">
            Get AI-driven insights to improve your resume
          </p>
        </div>

        <div className="upload-section">
          <div 
            className={`upload-box ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="upload-icon">📤</div>
                <h3>Drag & Drop Your Resume</h3>
                <p>or</p>
                <label htmlFor="file-upload" className="upload-btn">
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <p className="file-info">Supported formats: PDF, DOC, DOCX</p>
              </>
            ) : (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                <button 
                  className="remove-btn"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {file && (
            <button 
              className="analyze-btn" 
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "🔍 Analyze Resume"}
            </button>
          )}
        </div>

        <div className="analysis-results">
          <h2>Analysis Results</h2>
          <div className="placeholder-content">
            <p>📊 Your resume analysis will appear here</p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>ATS Score</h3>
                <p>Check how well your resume passes Applicant Tracking Systems</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💡</div>
                <h3>Skill Gaps</h3>
                <p>Identify missing skills for your target role</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>Improvements</h3>
                <p>Get actionable suggestions to enhance your resume</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Keywords</h3>
                <p>Optimize with industry-relevant keywords</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;


