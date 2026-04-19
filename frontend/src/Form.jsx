import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Form() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, []);

  return <h1>Form Page</h1>;
}