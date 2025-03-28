import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 🔹 Import for navigation
import axios from "axios";
import { FiSearch } from "react-icons/fi"; // 🔍 Importing magnifying glass icon
import "./SearchBar.scss";

const filterOptions = ["all", "video", "player", "tag", "category", "series", "sub_series"];

const SearchBar = () => {
  const location = useLocation(); // 🔹 Hook to get current location
  const [query, setQuery] = useState(location.state?.searchQuery || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // Default filter is "all"
  const [showSuggestions, setShowSuggestions] = useState(false); // ✅ Control suggestion visibility
  const navigate = useNavigate(); // 🔹 Hook to navigate between pages
  const searchRef = useRef(null); // ✅ Reference for outside click detection

  useEffect(() => {
    if (!query || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query, filter);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, filter, showSuggestions]);

  useEffect(() => {
    // 🔹 Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery((prevQuery) => {
      // If on home page ("/"), reset query
      if (location.pathname === "/") return "";
  
      // ✅ Only update if it's a new search query and user hasn't typed anything
      if (location.state?.searchQuery && location.state.searchQuery !== prevQuery) {
        return location.state.searchQuery;
      }
  
      return prevQuery; // ✅ Otherwise, keep what the user typed
    });
  }, [location.state?.searchQuery, location.pathname]); 
  


  const fetchSuggestions = async (input, selectedFilter) => {
    setLoading(true);
    const apiUrl = `${process.env.REACT_APP_SUGGESTION_API_URL}?query=${input}&filter=${selectedFilter}&size=10000`; // ✅ Always send size=1000

    try {
      const response = await axios.get(apiUrl);
      if (response.data?.response?.data?.length) {
        setSuggestions(response.data.response.data);
        setShowSuggestions(true); // ✅ Show suggestions when data is received
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setLoading(false);
  };

  // 🔹 Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, item) => {
    const type = item.autocomplete_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item.autocomplete_text);
    return acc;
  }, {});

  // 🔹 Order of sections
  const sectionOrder = {
    video_name: "Videos",
    category_name: "Categories",
    series_name: "Series",
    sub_series_name: "Sub-Series",
    player_name: "Players",
    tag_name: "Tags",
  };

  // 🔹 Handle search (Enter key or suggestion click)
  const handleSearch = (selectedText = null) => {
    const finalQuery = selectedText || query.trim(); // ✅ Ensure no trailing spaces
    if (finalQuery === "") {
      setQuery(""); // ✅ Allow full clearing
      return;
    }
  
    setQuery(finalQuery);
    setShowSuggestions(false);
    navigate("/results", { state: { searchQuery: finalQuery, filter } });
  };
  

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true); // ✅ Show suggestions when typing
            }}
            onFocus={() => setShowSuggestions(true)} // ✅ Show when input is focused
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }} // 🔹 Handle Enter key
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all" disabled hidden>Filter</option>
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="loading">Loading...</p>}

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestion-box">
            {Object.keys(sectionOrder).map((type) => {
              if (!groupedSuggestions[type]) return null;
              if (filter !== "all" && filter !== type.replace("_name", "")) return null;

              return (
                <div key={type} className="suggestion-section">
                  <h4 className="section-title">{sectionOrder[type]}</h4>
                  <div className="divider"></div>
                  {groupedSuggestions[type].map((text, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // ✅ Prevent input blur before search
                        handleSearch(text);
                      }}
                    >
                      <p className="title">{text}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
