import { createSlice } from "@reduxjs/toolkit";

const saved = JSON.parse(localStorage.getItem("auth") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: saved?.token ?? null,
    user: saved?.user ?? null,
    isAuthenticated: !!saved?.token,
    status: "idle",
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.status = "loading";
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, username, role, fullName } = action.payload;
      state.status = "succeeded";
      state.token = token;
      state.user = { username, role, fullName };
      state.isAuthenticated = true;
      localStorage.setItem(
        "auth",
        JSON.stringify({ token, user: { username, role, fullName } })
      );
    },
    loginFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
    setCredentials: (state, action) => {
      const { token, username, role, fullName } = action.payload;
      state.token = token;
      state.user = { username, role, fullName };
      state.isAuthenticated = true;
      localStorage.setItem(
        "auth",
        JSON.stringify({ token, user: { username, role, fullName } })
      );
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
  },
});

export const { loginStart, loginSuccess, loginFailed, setCredentials, logout } =
  authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentUserRole = (state) => state.auth.user?.role ?? null;
export const selectUsername = (state) => state.auth.user?.username ?? null;
export const selectFullName = (state) => state.auth.user?.fullName ?? null;
