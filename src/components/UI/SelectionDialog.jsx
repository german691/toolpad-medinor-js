import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CropIcon from "@mui/icons-material/Crop";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SelectionDialog({ open, onClose, images, onComplete }) {
  const [step, setStep] = useState(1);
  const [primaryId, setPrimaryId] = useState(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setPrimaryId(null);
    }
  }, [open]);

  const handleNextStep = () => {
    if (primaryId) {
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleFinish = (workflowChoice) => {
    if (primaryId) {
      onComplete({ primaryId, workflowChoice });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const dialogTitle =
    step === 1 ? "Paso 1: Seleccionar Imagen Principal" : "¿Qué deseas hacer?";

  return (
    <Dialog open={open} onClose={handleCancel} width="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        {step === 2 && (
          <IconButton onClick={handleBackStep} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        {dialogTitle}
      </DialogTitle>

      <DialogContent dividers sx={{ p: step === 2 ? 0 : 3 }}>
        {step === 1 && (
          <>
            <Typography gutterBottom>
              Por favor, haz clic en una imagen para establecerla como la
              principal:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {images.map((img) => (
                <Grid item xs={6} sm={4} md={3} key={img.id}>
                  <Paper
                    onClick={() => setPrimaryId(img.id)}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      border: `3px solid ${
                        primaryId === img.id ? "#1976d2" : "transparent"
                      }`,
                      borderRadius: "8px",
                      overflow: "hidden",
                      transition: "border .2s ease-in-out",
                    }}
                  >
                    <Badge
                      badgeContent={
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            mt: 4,
                            mr: 4,
                          }}
                        />
                      }
                      invisible={primaryId !== img.id}
                      sx={{ width: "100%" }}
                    >
                      <img
                        src={img.originalSrc}
                        alt={img.file.name}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Badge>
                  </Paper>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {img.file.name}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {step === 2 && (
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleFinish("crop")}
                sx={{ px: 4 }}
              >
                <ListItemIcon>
                  <CropIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Recortar Imágenes"
                  secondary="Abre la herramienta para ajustar cada imagen."
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleFinish("save")}
                sx={{ px: 4 }}
              >
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Guardar Directamente"
                  secondary="Usa las imágenes tal como están, sin recortes."
                />
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </DialogContent>

      {step === 1 && (
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            onClick={handleNextStep}
            variant="contained"
            disabled={!primaryId}
          >
            Siguiente
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
