import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";

const API_URL = "https://images-api.nasa.gov/search?q=";


function Home() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("galaxy");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceTimer = useRef(null);

  const fetchImages = async (searchTerm, newPage = 1, append = false) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}${searchTerm}&media_type=image&page=${newPage}`
      );

      const items = res.data.collection.items;

      const imageData = items
        .filter((item) => item.links && item.links[0].href)
        .map((item, i) => ({
          id: `${searchTerm}-${newPage}-${i}`,
          title: item.data[0].title,
          date: item.data[0].date_created?.split("T")[0],
          url: item.links[0].href,
        }));

      setImages((prev) => (append ? [...prev, ...imageData] : imageData));

      if (imageData.length < 100) setHasMore(false);
    } catch (err) {
      console.error("NASA API Error:", err);
      setError("Failed to fetch NASA images. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(query);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchImages(value || "galaxy");
    }, 600);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    fetchImages(query, nextPage, true);
    setPage(nextPage);
  };

  return (
    <div
    style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(to bottom, #0b132b, #1c2541, #3a506b)",
    color: "white",
    }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>🚀 NASA Image Gallery</h1>

      <input
        type="text"
        placeholder="Search space images..."
        value={query}
        onChange={handleSearch}
        style={{
          padding: "10px",
          width: "250px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <InfiniteScroll
        dataLength={images.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<h4>🚀 Loading more...</h4>}
        endMessage={<p>🌠 End of results</p>}
        style={{ width: "100%" }}
      >
        