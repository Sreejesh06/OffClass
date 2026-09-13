import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RouteChangeFocus } from "./components/RouteChangeFocus";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import './App.css'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouteChangeFocus />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<h1>House Leaderboards</h1>} />
              <Route path="/redeem" element={<h1>Redeem Perks</h1>} />
              <Route path="/complaints" element={<h1>Anonymous Complaints</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

