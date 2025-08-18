import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  logout,
  selectIsAuthenticated,
  selectCurrentUserRole,
  selectCurrentToken,
} from "../features/authSlice";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectCurrentUserRole);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);

        if (decodedToken.exp * 1000 < Date.now()) {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Invalid token specified", error);
        dispatch(logout());
      }
    }
  }, [token, dispatch, location]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
