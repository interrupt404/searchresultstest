import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <span 
        className="navbar-logo" 
        onClick={() => navigate("/")} // ✅ Redirect to "/" on click
        style={{ cursor: "pointer" }} // ✅ Show pointer cursor
      >
        Search Test
      </span>
    </div>
  );
};

export default Navbar;
