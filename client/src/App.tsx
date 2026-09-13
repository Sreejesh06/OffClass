import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { RouteChangeFocus } from "./components/RouteChangeFocus";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <RouteChangeFocus />
      <div className="app-container">
        
        {/* Semantic Landmark: Navigation */}
        <nav aria-label="Main Navigation">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
        
        {/* Semantic Landmark: Main Content */}
        <main id="main-content">
          <Routes>
            <Route path="/" element={<h1>Cryptid Dashboard</h1>} />
            <Route path="/leaderboard" element={<h1>House Leaderboards</h1>} />
            <Route path="/profile" element={<h1>Student Profile</h1>} />
          </Routes>
        </main>
        
        {/* Semantic Landmark: Aside/Secondary info */}
        <aside aria-label="Announcements">
          <h2>Latest News</h2>
          <p>No new announcements.</p>
        </aside>
        
      </div>
    </BrowserRouter>
  )
}

export default App
