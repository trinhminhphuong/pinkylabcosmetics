import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/store";

export default function AdminGuard() {
  const { isAuthenticated } = useAuth();
  
  // A simple check: parse JWT from local storage
  const token = localStorage.getItem("token");
  let isAdmin = false;

  if (token) {
    try {
      // Decode the payload of the JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // Spring Security puts authorities in the "scope" or "authorities" or "role" claim
      // Let's check common keys:
      const roles = payload.scope || payload.roles || payload.authorities || "";
      isAdmin = typeof roles === "string" 
                  ? roles.includes("ADMIN") 
                  : Array.isArray(roles) && roles.some(r => r.includes("ADMIN"));
                  
      // Fallback: check email if role decoding fails
      if (!isAdmin && payload.sub === "admin@minhphuong.com") {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to parse token for role checking", e);
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
