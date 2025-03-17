// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import { ROLES } from "./constants";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;

          // Log the role for debugging
          console.log("User role in App.js:", role);

          // Set user with role
          setUser({ ...user, role });
        }
      } else {
        setUser(null); // Set user to null if logged out
      }
      setLoading(false); // Set loading to false after auth state is resolved
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleLogout = () => {
    auth.signOut(); // Sign out the user
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while checking auth state
  }

  // Log the current user and route for debugging
  console.log("Current user:", user);
  console.log("Current route:", window.location.pathname);

  return (
    <Router>
      {user && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route
          path="/"
          element={
            user ? (
              user.role === ROLES.SUPER_ADMIN ? (
                <Navigate to="/superadmin" />
              ) : user.role === ROLES.ADMIN ? (
                <Navigate to="/admin" />
              ) : (
                <Dashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={user?.role === ROLES.ADMIN ? <AdminPanel /> : <Navigate to="/" />}
        />
        <Route
          path="/superadmin"
          element={user?.role === ROLES.SUPER_ADMIN ? <SuperAdminPanel /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;