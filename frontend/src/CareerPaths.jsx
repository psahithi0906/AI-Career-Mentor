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
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyInsights, setCompanyInsights] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

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

  const fetchCompanyInsights = async (companyName, jobTitle, jobLocation) => {
    setLoadingInsights(true);
    setSelectedCompany(companyName);
    setCompanyInsights(null);
    setSalaryData(null);
    
    try {
      const companyResponse = await API.get(`/insights/company/${encodeURIComponent(companyName)}`);
      
      if (companyResponse.data.success) {
        setCompanyInsights(companyResponse.data.data);
      } else {
        setCompanyInsights({ error: true, companyName, message: companyResponse.data.message });
      }
      
      try {
        const salaryResponse = await API.get(
          `/insights/salary/${encodeURIComponent(jobTitle)}/${encodeURIComponent(jobLocation || "United States")}`
        );
        
        if (salaryResponse.data.success) {
          setSalaryData(salaryResponse.data.data);
        }
      } catch (salaryError) {
        setSalaryData(null);
      }
    } catch (error) {
      console.error("Error fetching company insights:", error);
      setCompanyInsights({ error: true, companyName, message: "Failed to fetch company data" });
    } finally {
      setLoadingInsights(false);
    }
  };

  const closeModal = () => {
    setSelectedCompany(null);
    setCompanyInsights(null);
    setSalaryData(null);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star">★</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
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
          <h2>Search Job openings of your current role</h2>
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
                  <div className="job-actions">
                    <button
                      type="button"
                      className="insights-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fetchCompanyInsights(job.company, job.title, job.location);
                      }}
                    >
                      📊 Company Insights
                    </button>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-btn"
                    >
                      Apply Now →
                    </a>
                  </div>
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

        {/* Company Insights Modal */}
        {selectedCompany && (
          <div className="modal-overlay" onClick={closeModal} style={{zIndex: 9999}}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{position: 'relative', zIndex: 10000}}>
              <button className="modal-close" onClick={closeModal}>×</button>
              
              {loadingInsights ? (
                <div className="loading-insights">
                  <p>Loading company insights...</p>
                </div>
              ) : !companyInsights ? (
                <div className="loading-insights">
                  <p>No data available</p>
                </div>
              ) : companyInsights?.error ? (
                <>
                  <h2 className="modal-title">📊 {selectedCompany}</h2>
                  <div className="no-data-message">
                    <p style={{ fontSize: "1.2rem", color: "#64748b", textAlign: "center", padding: "3rem" }}>
                      😔 {companyInsights.message || "No data available for this company"}
                      <br /><br />
                      This company may not be in Glassdoor's database yet.
                    </p>
                  </div>
                </>
              ) : companyInsights && !companyInsights.error && (companyInsights.overallRating || companyInsights.reviewCount > 0 || companyInsights.pros?.length > 0) ? (
                <>
                  <h2 className="modal-title">📊 {selectedCompany} - Company Insights</h2>
                  
                  <div style={{padding: '30px', background: 'white'}}>
                    {/* Overall Rating */}
                    <div style={{textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px', color: 'white', marginBottom: '20px'}}>
                      <h3 style={{fontSize: '3rem', margin: '10px 0'}}>{companyInsights.overallRating}</h3>
                      <p style={{fontSize: '1.5rem'}}>{'⭐'.repeat(Math.round(companyInsights.overallRating))}</p>
                      <p>Based on {companyInsights.reviewCount?.toLocaleString() || 0} reviews</p>
                    </div>

                    {/* Detailed Ratings */}
                    <div style={{marginBottom: '20px'}}>
                      <h3 style={{fontSize: '1.5rem', marginBottom: '15px'}}>Detailed Ratings</h3>
                      {companyInsights.ratings && Object.entries(companyInsights.ratings)
                        .filter(([key, value]) => key !== 'culture' && key !== 'compensation' && value > 0)
                        .map(([key, value]) => (
                        <div key={key} style={{marginBottom: '10px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                            <span style={{textTransform: 'capitalize'}}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span><strong>{value}</strong></span>
                          </div>
                          <div style={{height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden'}}>
                            <div style={{height: '100%', width: `${(value / 5) * 100}%`, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pros */}
                    {companyInsights.pros?.length > 0 && (
                      <div style={{marginBottom: '20px', padding: '15px', background: '#f0fdf4', borderRadius: '10px'}}>
                        <h3 style={{fontSize: '1.3rem', marginBottom: '10px'}}>✅ Pros</h3>
                        <ul style={{paddingLeft: '20px'}}>
                          {companyInsights.pros.map((pro, index) => (
                            <li key={index} style={{marginBottom: '8px'}}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cons */}
                    {companyInsights.cons?.length > 0 && (
                      <div style={{marginBottom: '20px', padding: '15px', background: '#fef2f2', borderRadius: '10px'}}>
                        <h3 style={{fontSize: '1.3rem', marginBottom: '10px'}}>⚠️ Cons</h3>
                        <ul style={{paddingLeft: '20px'}}>
                          {companyInsights.cons.map((con, index) => (
                            <li key={index} style={{marginBottom: '8px'}}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Salary Data */}
                    {salaryData && (
                      <div style={{marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '15px', color: 'white'}}>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>💰 Salary Insights</h3>
                        <p style={{marginBottom: '15px'}}>📍 {salaryData.location}</p>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
                          <div style={{textAlign: 'center'}}>
                            <p style={{fontSize: '0.9rem', opacity: 0.9}}>Minimum</p>
                            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>${salaryData.salary?.min?.toLocaleString()}</p>
                          </div>
                          <div style={{textAlign: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '10px'}}>
                            <p style={{fontSize: '0.9rem', opacity: 0.9}}>Median</p>
                            <p style={{fontSize: '1.8rem', fontWeight: 'bold'}}>${salaryData.salary?.median?.toLocaleString()}</p>
                          </div>
                          <div style={{textAlign: 'center'}}>
                            <p style={{fontSize: '0.9rem', opacity: 0.9}}>Maximum</p>
                            <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>${salaryData.salary?.max?.toLocaleString()}</p>
                          </div>
                        </div>
                        <p style={{marginTop: '15px', fontSize: '0.9rem'}}>Based on {salaryData.salaryCount?.toLocaleString()} salaries</p>
                      </div>
                    )}

                    {/* Interview Tips */}
                    {companyInsights.interviewQuestions?.length > 0 && (
                      <div style={{marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '10px'}}>
                        <h3 style={{fontSize: '1.3rem', marginBottom: '10px'}}>🎯 Interview Preparation</h3>
                        {companyInsights.interviewDifficulty && (
                          <p style={{marginBottom: '15px'}}>
                            Difficulty: <span style={{padding: '5px 15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '20px', fontSize: '0.9rem'}}>{companyInsights.interviewDifficulty}</span>
                          </p>
                        )}
                        <h4 style={{fontSize: '1.1rem', marginTop: '15px', marginBottom: '10px'}}>Common Questions:</h4>
                        <ul style={{paddingLeft: '20px'}}>
                          {companyInsights.interviewQuestions.map((q, index) => (
                            <li key={index} style={{marginBottom: '8px'}}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {companyInsights.recommendToFriend && (
                      <div style={{padding: '20px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                        <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{companyInsights.recommendToFriend}% of employees recommend this company</p>
                        {companyInsights.ceoApproval && (
                          <p style={{fontSize: '1.1rem', marginTop: '10px'}}>{companyInsights.ceoApproval}% approve of the CEO</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {false && companyInsights && (
                    <div className="insights-content" style={{display: 'none'}}>
                      {/* Overall Rating */}
                      <div className="rating-section">
                        <div className="overall-rating">
                          <span className="rating-number">{companyInsights.overallRating}</span>
                          <div className="stars-container">
                            {renderStars(companyInsights.overallRating)}
                          </div>
                          <span className="review-count">
                            Based on {companyInsights.reviewCount?.toLocaleString() || 0} reviews
                          </span>
                        </div>
                      </div>

                      {/* Detailed Ratings */}
                      <div className="detailed-ratings">
                        <h3>Detailed Ratings</h3>
                        <div className="rating-bars">
                          <div className="rating-item">
                            <span className="rating-label">Culture & Values</span>
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{width: `${((companyInsights.ratings?.culture || 0) / 5) * 100}%`}}
                              ></div>
                            </div>
                            <span className="rating-value">{companyInsights.ratings?.culture || 0}</span>
                          </div>
                          <div className="rating-item">
                            <span className="rating-label">Work-Life Balance</span>
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{width: `${((companyInsights.ratings?.workLifeBalance || 0) / 5) * 100}%`}}
                              ></div>
                            </div>
                            <span className="rating-value">{companyInsights.ratings?.workLifeBalance || 0}</span>
                          </div>
                          <div className="rating-item">
                            <span className="rating-label">Compensation</span>
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{width: `${((companyInsights.ratings?.compensation || 0) / 5) * 100}%`}}
                              ></div>
                            </div>
                            <span className="rating-value">{companyInsights.ratings?.compensation || 0}</span>
                          </div>
                          <div className="rating-item">
                            <span className="rating-label">Career Growth</span>
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{width: `${((companyInsights.ratings?.careerGrowth || 0) / 5) * 100}%`}}
                              ></div>
                            </div>
                            <span className="rating-value">{companyInsights.ratings?.careerGrowth || 0}</span>
                          </div>
                          <div className="rating-item">
                            <span className="rating-label">Management</span>
                            <div className="rating-bar">
                              <div
                                className="rating-fill"
                                style={{width: `${((companyInsights.ratings?.management || 0) / 5) * 100}%`}}
                              ></div>
                            </div>
                            <span className="rating-value">{companyInsights.ratings?.management || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pros and Cons */}
                      {(companyInsights.pros?.length > 0 || companyInsights.cons?.length > 0) && (
                        <div className="pros-cons-section">
                          {companyInsights.pros?.length > 0 && (
                            <div className="pros">
                              <h3>✅ Pros</h3>
                              <ul>
                                {companyInsights.pros.map((pro, index) => (
                                  <li key={index}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {companyInsights.cons?.length > 0 && (
                            <div className="cons">
                              <h3>⚠️ Cons</h3>
                              <ul>
                                {companyInsights.cons.map((con, index) => (
                                  <li key={index}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Salary Insights */}
                      {salaryData ? (
                        <div className="salary-section">
                          <h3>💰 Salary Insights - {salaryData.jobTitle}</h3>
                          <p className="salary-location">📍 {salaryData.location}</p>
                          <div className="salary-ranges">
                            <div className="salary-card">
                              <span className="salary-label">Minimum</span>
                              <span className="salary-amount">
                                ${salaryData.salary.min.toLocaleString()}
                              </span>
                            </div>
                            <div className="salary-card highlight">
                              <span className="salary-label">Median</span>
                              <span className="salary-amount">
                                ${salaryData.salary.median.toLocaleString()}
                              </span>
                            </div>
                            <div className="salary-card">
                              <span className="salary-label">Maximum</span>
                              <span className="salary-amount">
                                ${salaryData.salary.max.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="salary-info">
                            Based on {salaryData.salaryCount.toLocaleString()} salaries •
                            Confidence: {salaryData.confidence}
                          </p>
                          <a
                            href={salaryData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glassdoor-link"
                          >
                            View on Glassdoor →
                          </a>
                        </div>
                      ) : (
                        <div className="salary-section" style={{ background: "linear-gradient(135deg, #64748b 0%, #475569 100%)" }}>
                          <h3>💰 Salary Insights</h3>
                          <p style={{ fontSize: "1rem", opacity: 0.9, marginTop: "1rem" }}>
                            Salary data not available for this specific role/location combination.
                            <br />
                            This might be a niche role or the company may not have enough salary data reported.
                          </p>
                        </div>
                      )}

                      {/* Interview Tips */}
                      {(companyInsights.interviewQuestions?.length > 0 || companyInsights.interviewTips?.length > 0) && (
                        <div className="interview-section">
                          <h3>🎯 Interview Preparation</h3>
                          {companyInsights.interviewDifficulty && (
                            <p className="interview-difficulty">
                              Difficulty: <span className="difficulty-badge">{companyInsights.interviewDifficulty}</span>
                            </p>
                          )}
                          
                          {companyInsights.interviewQuestions?.length > 0 && (
                            <div className="interview-questions">
                              <h4>Common Interview Questions:</h4>
                              <ul>
                                {companyInsights.interviewQuestions.map((question, index) => (
                                  <li key={index}>{question}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {companyInsights.interviewTips?.length > 0 && (
                            <div className="interview-tips">
                              <h4>Interview Tips:</h4>
                              <ul>
                                {companyInsights.interviewTips.map((tip, index) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendations */}
                      {(companyInsights.recommendToFriend || companyInsights.ceoApproval) && (
                        <div className="recommendation-section">
                          {companyInsights.recommendToFriend && (
                            <p className="recommend-stat">
                              {companyInsights.recommendToFriend}% of employees would recommend this company to a friend
                            </p>
                          )}
                          {companyInsights.ceoApproval && (
                            <p className="ceo-stat">
                              {companyInsights.ceoApproval}% approve of the CEO
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="loading-insights">
                  <p>Unable to display insights</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerPaths;


