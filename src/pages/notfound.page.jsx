import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { IconArrowLeft, IconWorldQuestion } from "@tabler/icons-react";

export default function NotFoundPage() {
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
        <Box>
          <IconWorldQuestion size={150} />
        </Box>
        <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
          PÁGINA NO ENCONTRADA
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Lo sentimos, la página a la que intentas acceder no existe o ha sido
          movida.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<IconArrowLeft />}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  );
}
