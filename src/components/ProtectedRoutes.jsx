// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth"; // Optional: npm install react-firebase-hooks

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser; 
  // Note: For a more robust check, use an AuthContext or the state from App.jsx
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;