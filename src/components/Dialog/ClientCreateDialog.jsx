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
  Alert,
  AlertTitle,
} from "@mui/material";
import PropTypes from "prop-types";
import { Info } from "@mui/icons-material";

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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleInputChange = (e) => {
    if (error) setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    if (error) setError(null);
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
      handleClose();
    } catch (err) {
      console.error("Error al guardar el cliente:", err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          opacity: "85%",
        }}
      >
        Crear Nuevo Cliente
        <Tooltip
          title="Sé cuidadoso: Los clientes creados no figurarán en Tango Gestión. Utiliza este panel si solo debes migrar un único cliente."
          arrow
        >
          <Info color="action" fontSize="small" />
        </Tooltip>
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", my: 2, flexDirection: "column", gap: 1 }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            <AlertTitle>Error al guardar</AlertTitle>
            {error}
          </Alert>
        )}
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
          />
          <TextField
            margin="dense"
            name="identiftri"
            label="Identificador Fiscal (CUIT/CUIL)"
            type="text"
            fullWidth
            value={formData.identiftri}
            onChange={handleInputChange}
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
        <TextField
          margin="dense"
          name="username"
          label="Nombre de Usuario"
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
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.active}
              onChange={handleCheckboxChange}
            />
          }
          label="Activo"
        />
      </DialogContent>
      <DialogActions>
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
  );
}

ClientCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
