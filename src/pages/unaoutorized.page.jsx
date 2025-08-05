import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { GppBad } from "@mui/icons-material";

export default function UnauthorizedPage() {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <GppBad sx={{ fontSize: 150 }} />
        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
          ACCESO DENEGADO
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Lo sentimos, no tienes los permisos necesarios para acceder a esta
          página.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  );
}
