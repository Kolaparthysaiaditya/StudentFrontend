import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // check if expired
  } catch (e) {
    return false;
  }
};

const ProtectRoute = ({ children }) => {
  const token = localStorage.getItem("access");

  if (!isTokenValid(token)) {
    localStorage.removeItem("access");
    alert("Session over or expire")
    return <Navigate to="/" replace />;
  }
  console.log("Token valid:", isTokenValid(localStorage.getItem("access")));

  return children; // ✅ render the protected component
};

export default ProtectRoute;
