import Home from "./Home";
import hero from "../public/hero.png";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import Login from "./Signin-login";
import Form from "./Form";
import Results from "./Result";
import CareerPaths from "./CareerPaths";
import ResumeAnalysis from "./ResumeAnalysis";
import SkillRecommendations from "./SkillRecommendations";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  return token ? children : null;
};

export default function App() {
  const sectionStyle = {
    width: "100%",
    minHeight: "100vh",
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  return (
    <BrowserRouter>
      <div style={sectionStyle}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/form" element={<ProtectedRoute><Form /></ProtectedRoute>} />
          <Route path="/career-paths" element={<ProtectedRoute><CareerPaths /></ProtectedRoute>} />
          <Route path="/resume-analysis" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
          <Route path="/skill-recommendations" element={<ProtectedRoute><SkillRecommendations /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}