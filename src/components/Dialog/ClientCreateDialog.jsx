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
import { z } from "zod";

const initialFormState = {
  cod_client: "",
  identiftri: "",
  razon_soci: "",
  username: "",
  password: "",
  active: false,
};

const clientSchema = z.object({
  cod_client: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{3}$/, "Formato inválido. Debe ser AAA000"),
  identiftri: z
    .string()
    .regex(/^\d{11}$/, "El identiftri debe tener 11 caracteres"),
  razon_soci: z.string().min(1, "La razón social es obligatoria"),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números o guiones bajos"),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
  active: z.boolean(),
});

export default function ClientCreateDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [open]);

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const newValue = name === "cod_client" ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    try {
      clientSchema.pick({ [name]: true }).parse({ [name]: newValue });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.errors[0].message }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSaveClick = async () => {
    try {
      const parsedData = clientSchema.parse(formData);
      setIsSaving(true);
      await onSave(parsedData);
      handleClose();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.reduce((acc, e) => {
          acc[e.path[0]] = e.message;
          return acc;
        }, {});
        setErrors(formattedErrors);
      }
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          title="Sé cuidadoso: Los clientes creados no figurarán en Tango Gestión a menos que estos hayan sido guardados previamente. Utiliza este panel si solo debes migrar un único producto."
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
            error={!!errors.cod_client}
            helperText={errors.cod_client}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="identiftri"
            label="Identificador Tributario (CUIT/CUIL)"
            type="text"
            fullWidth
            value={formData.identiftri}
            onChange={handleInputChange}
            error={!!errors.identiftri}
            helperText={errors.identiftri}
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
          error={!!errors.razon_soci}
          helperText={errors.razon_soci}
        />
        <Typography variant="overline" sx={{ mt: 2 }}>
          Credenciales
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
            error={!!errors.username}
            helperText={errors.username}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Contraseña"
            type="password"
            fullWidth
            error={!!errors.password}
            value={formData.password}
            helperText={errors.password}
            onChange={handleInputChange}
            sx={{ flex: 1 }}
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
  );
}

ClientCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
