import Home from "./Home";
import hero from "../public/hero.png";

export default function App() {
  const sectionStyle = {
   width: "100%",
  minHeight: "100vh",   // 🔥 key fix
  backgroundImage: `url(${hero})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat"
  };
  return (
    <div style = {sectionStyle}>
      <Home />
    </div>
  );
}