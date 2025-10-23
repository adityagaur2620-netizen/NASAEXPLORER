import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";

const API_URL = "https://images-api.nasa.gov/search?q=";


function Home() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("mars");
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
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "20px",
    margin: 0,
    background: "linear-gradient(to bottom right, #0e1727ff, #3b7608ff)",
    color: "white",
    }}
    >
      <h1>🌌 NASA Image Gallery</h1>

      <input
        type="text"
        placeholder="Search space images..."
        value={query}
        onChange={handleSearch}
        style={{
          padding: "10px", 
          width: "250px",
          marginbottom: "20px",
          borderradius: "20px",
          border: "1px solid #140b0bff", 
          fontsize: "16px", 
          outline: "none", 
          boxshadow: "0 2px 5px rgba(0,0,0,0.1)",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
            padding: "20px",
            justifyItems: "center",
          }}
        >
          {images.map((img) => (
            <div key={img.id} style={{ perspective: "1000px", width: "100%" }}>
              <div
                className="flip-card"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "250px",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.7s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "rotateY(180deg)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "rotateY(0deg)")}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>

                
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: "#0b3d91",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <h4 style={{ margin: "5px 0" }}>{img.title}</h4>
                  <p>{img.date || "Unknown Date"}</p>
                  <Link
                    to={`/image/${encodeURIComponent(img.url)}`}
                    style={{
                      marginTop: "10px",
                      color: "#fff",
                      background: "#1e63d0",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      textDecoration: "none",
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

function ImageDetails() {
  const { id } = useParams();
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Image Details</h2>
      <img src={decodeURIComponent(id)} alt="NASA" style={{ maxWidth: "80%" }} />
      <p>URL: {decodeURIComponent(id)}</p>
      <Link to="/">⬅ Back to Gallery</Link>
    </div>
  );
}
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image/:id" element={<ImageDetails />} />
      </Routes>
    </Router>
  );
} 
