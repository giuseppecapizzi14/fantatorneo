import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './responsive.css';
import './theme.css'; // Importa il nuovo file di stile
import './global.css'; // Import the global CSS with background and text shadows

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
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminBonus from './pages/admin/AdminBonus';
import Landing from './pages/Landing';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funzione per gestire il logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // In the useEffect hook where you check authentication
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
          
          console.log('Decoded token in App.js:', decoded); // Debug log
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setIsAuthenticated(true);
            // Fix: Ensure we're correctly extracting the role
            setUser({ 
              id: decoded.userId || decoded.id, 
              role: decoded.role || decoded.userRole || (decoded.isAdmin === true ? 'admin' : 'user')
            });
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Remove the automatic logout on page close - this is causing issues
    // const handleBeforeUnload = () => {
    //   handleLogout();
    // };
    // window.addEventListener('beforeunload', handleBeforeUnload);
    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    console.log('ProtectedRoute check - user:', user, 'adminOnly:', adminOnly); // Debug log
    
    if (adminOnly && (!user || user.role !== 'admin')) {
      console.log('User is not admin, redirecting to dashboard');
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
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
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
            
            {/* Admin routes - rimuovi la rotta /admin e mantieni solo le rotte specifiche */}
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
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
