import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import PropTypes from "prop-types";

const initialFormState = {
  cod_client: "",
  identiftri: "",
  razon_soci: "",
  username: "",
  password: "",
  active: false,
};

export default function ClientCreateDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
    }
  }, [open]);

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      handleClose();
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
    } finally {
      setIsSaving(false);
      handleClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            opacity: "80%",
            mt: 2,
          }}
        >
          Crear Nuevo Cliente
          <Tooltip
            title="Sé cuidadoso: Los productos creados no figurarán en Tango Gestión. Utiliza este panel si solo debes migrar un único producto."
            arrow
          >
            <Info color="action" fontSize="medium" />
          </Tooltip>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", my: 2, flexDirection: "column", gap: 1 }}
        >
          <Typography variant="overline" sx={{ mt: 2 }}>
            Información de cliente
          </Typography>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              name="cod_client"
              label="Código"
              type="text"
              fullWidth
              value={formData.cod_client}
              onChange={handleInputChange}
              sx={{ width: "25%" }}
            />
            <TextField
              margin="dense"
              name="identiftri"
              label="Identificador Fiscal (CUIT/CUIL)"
              type="text"
              fullWidth
              value={formData.identiftri}
              onChange={handleInputChange}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            margin="dense"
            name="razon_soci"
            label="Razón Social"
            type="text"
            fullWidth
            value={formData.razon_soci}
            onChange={handleInputChange}
          />
          <Typography variant="overline" sx={{ mt: 2 }}>
            credenciales
          </Typography>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <TextField
              margin="dense"
              name="username"
              label="Usuario"
              type="text"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="password"
              label="Contraseña"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.active}
                onChange={handleCheckboxChange}
              />
            }
            label="Activo"
            labelPlacement="start"
          />
        </DialogContent>
        <DialogActions sx={{ mx: 2, mb: 2 }}>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClick}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ClientCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
