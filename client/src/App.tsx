import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouteChangeFocus } from "./components/RouteChangeFocus";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import './App.css'

const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ProfilePortfolio = React.lazy(() => import('./pages/ProfilePortfolio').then(m => ({ default: m.ProfilePortfolio })));
const HallOfFame = React.lazy(() => import('./pages/HallOfFame').then(m => ({ default: m.HallOfFame })));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Redeem = React.lazy(() => import('./pages/Redeem').then(m => ({ default: m.Redeem })));
const Complaints = React.lazy(() => import('./pages/Complaints').then(m => ({ default: m.Complaints })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <RouteChangeFocus />
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hall-of-fame" element={<HallOfFame />} />
                <Route path="/complaints" element={<Complaints />} />
                {/* Public shareable profile — no login needed */}
                <Route path="/profile/:userId" element={<Layout><ProfilePortfolio /></Layout>} />
                
                <Route element={<ProtectedLayout />}>
                  {/* Own profile — render the Bento layout */}
                  <Route path="/profile" element={<ProfilePortfolio />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/redeem" element={<Redeem />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
