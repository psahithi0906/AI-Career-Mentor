import "./Home.css";
import logo from "../public/logo.png";
function Home() {
  return (
    <div>
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo"><img src={logo} alt="AI Career" /></div>
        <ul className="nav-links">
          
          <a href="#" class="hbtn hb-fill-left-rev-bg-br hpill">Sign In</a>
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