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
import PropTypes from "prop-types";
import { z } from "zod";
import { IconInfoCircle } from "@tabler/icons-react";

const initialFormState = {
  cod_client: "",
  identiftri: "",
  razon_soci: "",
  username: "",
  password: "",
  active: false,
  level: 0,
  nickname: "",
};

const clientSchema = z.object({
  cod_client: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{3}$/, "Formato inválido. Debe ser AAA000"),
  identiftri: z
    .string()
    .regex(/^\d{11}$/, "El identiftri debe tener 11 dígitos"),
  razon_soci: z.string().min(1, "La razón social es obligatoria"),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números o guiones bajos"),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
  active: z.boolean(),
  level: z
    .number({ invalid_type_error: "Nivel debe ser un número" })
    .int("Debe ser un entero")
    .min(0, "No puede ser negativo"),
  nickname: z.string().optional().or(z.literal("")),
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

  const validateField = (name, value) => {
    // arma un mini-schema solo con el campo para validar onChange
    const fieldSchema = clientSchema.pick({ [name]: true });
    try {
      fieldSchema.parse({ [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [name]: err?.errors?.[0]?.message || "Valor inválido",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "cod_client") newValue = value.toUpperCase();
    if (name === "identiftri") newValue = value.replace(/\D/g, "").slice(0, 11);
    if (name === "level") {
      newValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "nickname" && newValue === "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (name === "level" && newValue === "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    validateField(name, newValue);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    validateField(name, checked);
  };

  const handleSaveClick = async () => {
    try {
      const toParse = {
        ...formData,
        level: formData.level === "" ? NaN : Number(formData.level),
      };
      const parsed = clientSchema.parse(toParse);

      setIsSaving(true);

      await onSave(parsed);
      handleClose();
    } catch (err) {
      if (err?.errors) {
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
          title="Los clientes creados aquí deben existir en Tango si necesitás integración. Usá este panel para altas individuales."
          arrow
        >
          <IconInfoCircle color="action" fontSize="medium" />
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
            label="Código (AAA000)"
            type="text"
            fullWidth
            value={formData.cod_client}
            onChange={handleInputChange}
            error={!!errors.cod_client}
            helperText={errors.cod_client}
            sx={{ flex: 1 }}
            inputProps={{ maxLength: 6 }}
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
            inputProps={{ inputMode: "numeric" }}
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

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            margin="dense"
            name="nickname"
            label="Nombre corto / Apodo (opcional)"
            type="text"
            fullWidth
            value={formData.nickname}
            onChange={handleInputChange}
            error={!!errors.nickname}
            helperText={errors.nickname}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="level"
            label="Nivel (entero)"
            type="number"
            fullWidth
            value={formData.level}
            onChange={handleInputChange}
            error={!!errors.level}
            helperText={errors.level}
            sx={{ flex: 1 }}
            inputProps={{ min: 0, step: 1 }}
          />
        </Box>

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
              name="active"
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
