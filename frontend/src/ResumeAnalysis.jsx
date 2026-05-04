import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./services/api";
import Navbar from "./Navbar";
import "./ResumeAnalysis.css";

function ResumeAnalysis() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser(userData);
    setTargetRole(userData.role || "");

    if (!userData.skills || !userData.experience) {
      navigate("/");
    }
  }, [navigate]);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files?.[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files?.[0]) {
      handleFile(event.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const extension = selectedFile.name.toLowerCase().split(".").pop();
    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/rtf",
      "text/rtf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = ["pdf", "docx", "doc", "txt", "rtf"];

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension)) {
      setError("Please upload your resume as PDF, DOCX, TXT, or RTF.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setAnalysis(null);
    setFlippedCards({});
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }

    if (!targetRole.trim()) {
      setError("Please enter the role you are applying for.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("currentSkills", user.skills || "");
    formData.append("experience", user.experience || "");

    try {
      setAnalyzing(true);
      setError("");
      const response = await API.post("/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysis(response.data.analysis);
      setFlippedCards({});
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Resume analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCard = (cardId) => {
    setFlippedCards((current) => ({
      ...current,
      [cardId]: !current[cardId],
    }));
  };

  const renderList = (items) => {
    if (!items?.length) {
      return <p className="empty-card-copy">No suggestions returned yet.</p>;
    }

    return (
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  const cards = [
    {
      id: "ats",
      icon: "ATS",
      title: "ATS Score",
      intro: "Check how well your resume passes Applicant Tracking Systems",
      back: analysis ? (
        <>
          <div className="score-ring" style={{ "--score": `${analysis.atsScore}%` }}>
            {analysis.atsScore}%
          </div>
          {analysis.source ? <span className="analysis-source">{analysis.source}</span> : null}
          <p>{analysis.atsSummary}</p>
        </>
      ) : (
        <p>Upload your resume and run analysis to see the score.</p>
      ),
    },
    {
      id: "skills",
      icon: "SK",
      title: "Skill Gaps",
      intro: "Identify missing skills for your target role",
      back: analysis ? (
        analysis.skillGaps?.length ? (
          <ul>
            {analysis.skillGaps.map((gap, index) => (
              <li key={`${gap.skill}-${index}`}>
                <strong>{gap.skill}</strong> ({gap.priority}): {gap.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-card-copy">No skill gaps returned yet.</p>
        )
      ) : (
        <p>Skill gaps will appear here after analysis.</p>
      ),
    },
    {
      id: "improvements",
      icon: "UP",
      title: "Improvements",
      intro: "Get actionable suggestions to enhance your resume",
      back: analysis ? renderList(analysis.improvements) : <p>Improvement ideas will appear here after analysis.</p>,
    },
    {
      id: "projects",
      icon: "PR",
      title: "Projects",
      intro: "Find projects that can make your resume stronger",
      back: analysis ? (
        analysis.projects?.length ? (
          <ul>
            {analysis.projects.map((project, index) => (
              <li key={`${project.title}-${index}`}>
                <strong>{project.title}</strong>: {project.description}
                {project.skillsToShow?.length ? (
                  <span className="project-skills">Skills: {project.skillsToShow.join(", ")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-card-copy">No project ideas returned yet.</p>
        )
      ) : (
        <p>Project ideas will appear here after analysis.</p>
      ),
    },
    {
      id: "keywords",
      icon: "KW",
      title: "Keywords",
      intro: "Optimize with role-relevant keywords",
      back: analysis ? (
        analysis.keywords?.length ? (
          <div className="keyword-list">
            {analysis.keywords.map((keyword, index) => (
              <span key={`${keyword}-${index}`}>{keyword}</span>
            ))}
          </div>
        ) : (
          <p className="empty-card-copy">No keywords returned yet.</p>
        )
      ) : (
        <p>Keywords will appear here after analysis.</p>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="resume-analysis-container">
        <div className="header-section">
          <h1>AI Resume Analysis</h1>
          <p className="subtitle">Upload your resume and get ATS, skill gap, project, and keyword guidance.</p>
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
                <div className="upload-icon">FILE</div>
                <h3>Drag and drop your resume</h3>
                <p>or</p>
                <label htmlFor="file-upload" className="upload-btn">
                  Choose File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <p className="file-info">Supported formats: PDF, DOCX, TXT, RTF. Legacy DOC uploads should be converted to DOCX.</p>
              </>
            ) : (
              <div className="file-selected">
                <div className="file-icon">FILE</div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                <button className="remove-btn" onClick={() => setFile(null)} type="button">
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="target-role-panel">
            <label htmlFor="target-role">Applying role</label>
            <input
              id="target-role"
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="e.g., Frontend Developer, Data Analyst"
            />
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          {file && (
            <button className="analyze-btn" onClick={handleAnalyze} disabled={analyzing} type="button">
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          )}
        </div>

        <div className="analysis-results">
          <h2>Analysis Results</h2>
          <p className="results-helper">
            {analysis ? "Click any card to flip between the summary and details." : "Your resume analysis will appear here."}
          </p>

          <div className="features-grid">
            {cards.map((card) => (
              <button
                className={`feature-card flip-card ${flippedCards[card.id] ? "is-flipped" : ""}`}
                key={card.id}
                onClick={() => toggleCard(card.id)}
                type="button"
              >
                <span className="flip-card-inner">
                  <span className="flip-card-face flip-card-front">
                    <span className="feature-icon">{card.icon}</span>
                    <span className="feature-title">{card.title}</span>
                    <span className="feature-copy">{card.intro}</span>
                  </span>
                  <span className="flip-card-face flip-card-back">
                    <span className="feature-title">{card.title}</span>
                    <span className="detail-content">{card.back}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;
