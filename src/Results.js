import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Results.scss";

const placeholderImages = ["/img1.svg", "/img2.svg", "/img3.svg"]; // 🎨 Random SVGs

const filterMappings = {
  All: "all",
  Videos: "video",
  Category: "category",
  Series: "series",
  "Sub Series": "sub_series",
  Players: "player",
  Tags: "tag",
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  const [searchQuery, setSearchQuery] = useState(
    location.state?.searchQuery || ""
  );
  const [filter, setFilter] = useState(location.state?.filter || "all");
  const [size, setSize] = useState(100);
  const [results, setResults] = useState([]);

  useEffect(() => {
    setSearchQuery((prevQuery) =>
      location.state?.searchQuery && location.state.searchQuery !== prevQuery
        ? location.state.searchQuery
        : prevQuery
    );
  
    setFilter((prevFilter) =>
      location.state?.filter && location.state.filter !== prevFilter
        ? location.state.filter
        : prevFilter
    );
  }, [location.state?.searchQuery, location.state?.filter]); // ✅ Only re-runs when location.state changes
  

  const handleNewSearch = (newQuery) => {
    setSearchQuery(""); // ✅ Keep input empty
    setFilter("all");

    navigate("/results", {
      state: { searchQuery: newQuery, filter: "all", placeholder: newQuery },
    });
  };

  // 🔹 Fetch results from API
  const fetchResults = async (query, selectedFilter, resultSize) => {
    try {
      const response = await axios.post(process.env.REACT_APP_RESULTS_API_URL, {
        query,
        filter: selectedFilter,
        size: resultSize,
      });

      const resultData = Array.isArray(response.data?.response?.data)
        ? response.data.response.data
        : [];
      setResults(resultData);
    } catch (error) {
      console.error("Error fetching results:", error);
      setResults([]);
    }
  };

  // 🔹 Fetch results when query/filter/size changes
  useEffect(() => {
    if (searchQuery) {
      fetchResults(searchQuery, filter, size);
    }
  }, [searchQuery, filter, size]);

  // 🔹 Handle filter click (update filter & fetch results)
  const handleFilterClick = (selectedFilter) => {
    const mappedFilter = filterMappings[selectedFilter];
    setFilter(mappedFilter);
    fetchResults(searchQuery, mappedFilter, size); // 🔹 Fetch results instantly
  };

  // 🔹 Handle tag click (replace search query & fetch results)
  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  // 🔹 Handle size change (fetch results only on Enter key)
  const handleSizeChange = (e) => {
    if (e.key === "Enter") {
      fetchResults(searchQuery, filter, size);
    }
  };

  // 🔹 Render Video
  const renderVideo = (video) => (
    <div key={video.video_id} className="video-item">
      <div className="thumbnail">
        <img
          src={video.thumbnail_url || getRandomPlaceholder()}
          alt={video.name}
        />
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.name}</h3>
        <p className="video-series">{video.series_title}</p>
        <p className="video-description">{video.video_description}</p>
        <div className="video-tags">
          {Array.isArray(video.tags) &&
            video.tags.map((tag) => (
              <span
                key={tag.tag_id}
                className="tag"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </span>
            ))}
        </div>
      </div>
    </div>
  );

  // 🔹 Render Player
  const renderPlayer = (player) => (
    <div key={player.player_id} className="entity-item">
      <div className="entity-icon">
        <img src={getRandomPlaceholder()} alt={player.name} />
      </div>
      <div className="entity-info">
        <h3 className="entity-title">{player.name}</h3>
      </div>
      <button className="subscribe-btn">Subscribe</button>
    </div>
  );

  // 🔹 Render Tag
  const renderTag = (tag) => (
    <div key={tag.tag_id} className="entity-item">
      <div className="entity-icon">
        <img src={getRandomPlaceholder()} alt={tag.name} />
      </div>
      <div className="entity-info">
        <h3 className="entity-title">{tag.name}</h3>
      </div>
      <button className="subscribe-btn">Subscribe</button>
    </div>
  );

  // 🔹 Render Category
  const renderCategory = (category) => (
    <div key={category.category_id} className="entity-item">
      <div className="entity-icon">
        <img src={getRandomPlaceholder()} alt={category.name} />
      </div>
      <div className="entity-info">
        <h3 className="entity-title">{category.name}</h3>
      </div>
      <button className="subscribe-btn">Subscribe</button>
    </div>
  );

  // 🔹 Render Series
  const renderSeries = (series) => (
    <div key={series.series_id} className="entity-item">
      <div className="entity-icon">
        <img src={getRandomPlaceholder()} alt={series.name} />
      </div>
      <div className="entity-info">
        <h3 className="entity-title">{series.name}</h3>
      </div>
      <button className="subscribe-btn">Subscribe</button>
    </div>
  );

  // 🔹 Render Sub Series
  const renderSubSeries = (subSeries) => (
    <div key={subSeries.sub_series_id} className="entity-item">
      <div className="entity-icon">
        <img src={getRandomPlaceholder()} alt={subSeries.name} />
      </div>
      <div className="entity-info">
        <h3 className="entity-title">{subSeries.name}</h3>
      </div>
      <button className="subscribe-btn">Subscribe</button>
    </div>
  );

  return (
    <div className="results-page">
      {/* 🔹 FILTER BAR */}
      <div className="filter-bar">
        {Object.keys(filterMappings).map((option) => (
          <button
            key={option}
            className={filter === filterMappings[option] ? "active" : ""}
            onClick={() => handleFilterClick(option)}
          >
            {option}
          </button>
        ))}

        {/* 🔹 SIZE INPUT (Triggers fetch on Enter key) */}
        <input
          type="number"
          min="5"
          max="500"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))} // ✅ Ensure size is updated correctly
          onKeyDown={handleSizeChange} // ✅ Fetches on Enter key
          className="size-input"
          placeholder="Size"
        />
      </div>

      {/* 🔹 RESULTS LIST (One Item per Row) */}
      <div className="results-list">
        {results && results.length > 0 ? ( // ✅ Check for both undefined and empty array
          results.map((item) => {
            const handleClick = () => handleNewSearch(item.name); // ✅ Always search in "all" mode

            if (item.type === "video") {
              return (
                <div key={item.video_id} onClick={handleClick}>
                  {renderVideo(item)}
                </div>
              );
            } else if (item.type === "player") {
              return (
                <div key={item.player_id} onClick={handleClick}>
                  {renderPlayer(item)}
                </div>
              );
            } else if (item.type === "tag") {
              return (
                <div key={item.tag_id} onClick={handleClick}>
                  {renderTag(item)}
                </div>
              );
            } else if (item.type === "category") {
              return (
                <div key={item.category_id} onClick={handleClick}>
                  {renderCategory(item)}
                </div>
              );
            } else if (item.type === "series") {
              return (
                <div key={item.series_id} onClick={handleClick}>
                  {renderSeries(item)}
                </div>
              );
            } else if (item.type === "sub_series") {
              return (
                <div key={item.sub_series_id} onClick={handleClick}>
                  {renderSubSeries(item)}
                </div>
              );
            } else {
              return null;
            }
          })
        ) : (
          // ✅ Show "No Results Found" message correctly
          <div className="no-results">
            <img
              src="/no-results.jpeg"
              alt="No Results"
              className="no-results-img"
            />
            <p>
              No results found for <strong>"{searchQuery}"</strong> in{" "}
              <strong>{filter}</strong>
            </p>
            <p>Try a different search or select another category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 🔹 Selects a random placeholder image
const getRandomPlaceholder = () => {
  return placeholderImages[
    Math.floor(Math.random() * placeholderImages.length)
  ];
};

export default Results;
