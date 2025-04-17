import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamCreate from './pages/teamcreate';
import TeamsList from './pages/TeamsList';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/admin/AdminPanel';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminBonus from './pages/admin/AdminBonus';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode token to get user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setIsAuthenticated(true);
            setUser({ id: decoded.id, role: decoded.role });
          }
        } catch (err) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar isAuthenticated={isAuthenticated} user={user} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        <main className="flex-grow-1 container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
            <Route path="/register" element={
              <ProtectedRoute adminOnly={true}>
                <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/create-team" element={
              <ProtectedRoute>
                <TeamCreate />
              </ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute>
                <TeamsList />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute adminOnly={true}>
                <AdminTeams />
              </ProtectedRoute>
            } />
            <Route path="/admin/players" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPlayers />
              </ProtectedRoute>
            } />
            <Route path="/admin/bonus" element={
              <ProtectedRoute adminOnly={true}>
                <AdminBonus />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
