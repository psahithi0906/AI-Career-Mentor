import "./Home.css";

function Home() {
  return (
    <div>
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">AI Career</div>
        <ul className="nav-links">
          <li>Features</li>
          <li>Pricing</li>
          <li>Contact</li>
          <button className="login-btn">Sign In</button>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1>
          Empower Your Career with <span>AI</span>
        </h1>
        <p>
          Get personalized career paths and resume analysis powered by AI.
        </p>

        <div className="buttons">
          <button className="primary-btn">Get Started</button>
        </div>

        {/* Image
        <div className="hero-image">
          <img src="/hero.png" alt="career" />
        </div> */}
      </div>

      {/* Features */}
      {/* <div className="features">
        <button className="options">🎯 Personalized Career Paths</button>
        <button className="options">📄 AI Resume Analysis</button>
        <button className="options">💡 Skill Recommendations</button>
      </div> */}
    </div>
      <div className="features">
        <button className="options">🎯 Personalized Career Paths</button>
        <button className="options">📄 AI Resume Analysis</button>
        <button className="options">💡 Skill Recommendations</button>
      </div>
    <div/>
    </div>
  );
}

export default Home;