import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.js";
import SearchBar from "./searchBar.js";
import Results from "./Results";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> 
        <SearchBar /> {/* ✅ Now SearchBar is on every page */}
        <Routes>
          <Route path="/" element={<div />} /> {/* Home doesn't need extra UI */}
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
