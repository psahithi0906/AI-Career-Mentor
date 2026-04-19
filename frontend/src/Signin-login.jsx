import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./services/api";
import "./Signin-login.css";

export default function Login() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    try {
      setMessage("");
      if (isNewUser) {
        await API.post("/auth/register", form);
        localStorage.setItem("user", JSON.stringify({
          name: form.name,
          email: form.email,
        }));
        setMessage("Registered successfully");
        setTimeout(() => navigate("/home"), 900);
      } else {
        const res = await API.post("/auth/login", form);

        const loggedUser = {
          ...res.data.user,
          email: res.data.user.email || form.email,
        };

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setMessage("Login successful");
        setTimeout(() => navigate("/home"), 900);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="auth-title">
          {isNewUser ? "Create Account" : "Welcome!"}
        </h1>

        {isNewUser && (
          <input
            className="auth-input"
            placeholder="Name"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        )}

        <input
          className="auth-input"
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="auth-btn" onClick={handleSubmit}>
          {isNewUser ? "Register" : "Login"}
        </button>

        {message && (
          <div className="auth-feedback">{message}</div>
        )}

        {!message && (
          <p
            className="auth-toggle"
            onClick={() => setIsNewUser(!isNewUser)}
          >
            {isNewUser
              ? "Already have an account? Login"
              : "New user? Create account"}
          </p>
        )}

      </div>
    </div>
  );
}