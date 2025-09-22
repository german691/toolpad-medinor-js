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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import PropTypes from "prop-types";
import { z } from "zod";

const DEFAULT_ROLES = ["admin", "superadmin", "images"];

const initialFormState = {
  username: "",
  fullName: "",
  password: "",
  role: DEFAULT_ROLES[0],
  active: true,
};

const adminSchema = (rolesArr) =>
  z.object({
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números o guiones bajos"),
    fullName: z.string().min(1, "El nombre es obligatorio"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    role: z.enum(rolesArr, {
      errorMap: () => ({ message: "Rol inválido" }),
    }),
    active: z.boolean(),
  });

export default function AdminCreateDialog({
  open,
  onClose,
  onSave,
  roles = DEFAULT_ROLES,
}) {
  const [formData, setFormData] = useState({
    ...initialFormState,
    role: roles[0] || DEFAULT_ROLES[0],
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({ ...initialFormState, role: roles[0] || DEFAULT_ROLES[0] });
      setErrors({});
      setIsSaving(false);
    }
  }, [open, roles]);

  const schema = adminSchema(roles && roles.length ? roles : DEFAULT_ROLES);

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const validateSingleField = (name, value) => {
    try {
      schema.pick({ [name]: true }).parse({ [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      const msg = err?.errors?.[0]?.message || "Valor inválido";
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    validateSingleField(name, newValue);
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData((p) => ({ ...p, role: value }));
    validateSingleField("role", value);
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, active: checked }));
    validateSingleField("active", checked);
  };

  const handleSaveClick = async () => {
    try {
      const parsedData = schema.parse(formData);
      setIsSaving(true);
      await onSave(parsedData);
      handleClose();
    } catch (err) {
      if (err?.errors) {
        const formatted = err.errors.reduce((acc, e) => {
          acc[e.path[0]] = e.message;
          return acc;
        }, {});
        setErrors(formatted);
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
        Crear Nuevo Administrador
        <Tooltip
          title="Creá administradores internos del sistema. Asegúrate de asignar el rol correcto y usar una contraseña segura."
          arrow
        >
          <Info color="action" fontSize="medium" />
        </Tooltip>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", my: 2, flexDirection: "column", gap: 1 }}
      >
        <Typography variant="overline" sx={{ mt: 2 }}>
          Información del administrador
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            autoFocus
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
            name="fullName"
            label="Nombre y Apellido"
            type="text"
            fullWidth
            value={formData.fullName}
            onChange={handleInputChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            sx={{ flex: 1 }}
          />
        </Box>

        <Typography variant="overline" sx={{ mt: 2 }}>
          Credenciales y Rol
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            margin="dense"
            name="password"
            label="Contraseña"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ flex: 1 }}
          />

          <FormControl sx={{ flex: 1, mt: 1 }} error={!!errors.role}>
            <InputLabel>Rol</InputLabel>
            <Select
              label="Rol"
              value={formData.role}
              onChange={handleRoleChange}
            >
              {(roles && roles.length ? roles : DEFAULT_ROLES).map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>
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
          sx={{ mt: 1 }}
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

AdminCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired, // (data) => Promise<void>
  roles: PropTypes.arrayOf(PropTypes.string), // opcional: ["ADMIN", "SUPERADMIN", ...]
};
