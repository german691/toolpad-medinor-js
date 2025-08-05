import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  CssBaseline,
} from "@mui/material";
import {
  loginStart,
  loginSuccess,
  loginFailed,
  selectIsAuthenticated,
} from "../features/authSlice";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(loginStart());
    try {
      const data = await loginUser({ username, password });
      dispatch(
        loginSuccess({ token: data.token, user: data.user, role: data.role })
      );
      navigate("/", { replace: true });
    } catch (error) {
      const errorMessage =
        error?.message || "Error desconocido al iniciar sesión.";
      dispatch(loginFailed(errorMessage));
    }
  };

  return (
    <>
      <CssBaseline />
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Bienvenido
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setusername(e.target.value)}
              disabled={authStatus === "loading"}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authStatus === "loading"}
            />
            {authError && (
              <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                {authError}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={authStatus === "loading"}
            >
              <Typography>
                {authStatus === "loading" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Ingresar"
                )}
              </Typography>
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
