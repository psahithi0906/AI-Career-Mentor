import Home from "./Home";
import hero from "../public/hero.png";

export default function App() {
  const sectionStyle = {
    width: "100%",
    height: "700px",
    backgroundImage: `url(${hero})`,
    backgroundSize : 'cover',
    backgroundPosition: 'center'
  };
  return (
    <div style = {sectionStyle}>
      <Home />
    </div>
  );
}