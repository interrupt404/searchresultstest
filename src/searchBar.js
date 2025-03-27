import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 🔹 Import for navigation
import axios from "axios";
import { FiSearch } from "react-icons/fi"; // 🔍 Importing magnifying glass icon
import "./SearchBar.scss";

const filterOptions = ["all", "video", "player", "tag", "category", "series", "sub_series"];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // Default filter is "all"
  const [size, setSize] = useState(10); // Default number of suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // ✅ Control suggestion visibility
  const navigate = useNavigate(); // 🔹 Hook to navigate between pages
  const searchRef = useRef(null); // ✅ Reference for outside click detection

  useEffect(() => {
    if (!query || !showSuggestions) {
      setSuggestions([]);
      return;
    }
  
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query, filter, size);
    }, 300);
  
    return () => clearTimeout(delayDebounce);
  }, [query, filter, size, showSuggestions]);
  

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

  const fetchSuggestions = async (input, selectedFilter, resultSize) => {
    setLoading(true);
    const apiUrl = `${process.env.REACT_APP_SUGGESTION_API_URL}?query=${input}&filter=${selectedFilter}&size=${resultSize}`;

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
    const finalQuery = selectedText || query; // Use selected suggestion or typed query
    if (!finalQuery.trim()) return;

    setQuery(finalQuery); // ✅ Update search bar text
    setShowSuggestions(false); // ✅ Hide suggestion box
    navigate("/results", { state: { searchQuery: finalQuery, filter } }); // 🔹 Pass data to next component
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
          <input
            type="number"
            min="5"
            max="500"
            value={size === 10 ? "" : size}
            onFocus={(e) => e.target.value = size}
            onBlur={(e) => !e.target.value && setSize(10)}
            onChange={(e) => setSize(e.target.value)}
            className="size-input"
            placeholder="Size"
          />
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
