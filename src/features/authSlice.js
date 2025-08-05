import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("jwtToken");
const role = localStorage.getItem("userRole");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    user: null,
    userRole: role || null,
    isAuthenticated: !!token,
    status: "idle",
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.token = token;
      state.user = user;
      state.userRole = role;
      state.isAuthenticated = true;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", role);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.userRole = null;
      state.isAuthenticated = false;
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
    },
    loginStart: (state) => {
      state.status = "loading";
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user, role } = action.payload;
      state.status = "succeeded";
      state.token = token;
      state.user = user;
      state.userRole = role;
      state.isAuthenticated = true;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", role);
    },
    loginFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.token = null;
      state.user = null;
      state.userRole = null;
      state.isAuthenticated = false;
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
    },
  },
});

export const { setCredentials, logout, loginStart, loginSuccess, loginFailed } =
  authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUserRole = (state) => state.auth.userRole;
