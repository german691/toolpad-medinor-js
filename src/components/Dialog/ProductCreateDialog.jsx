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
  Divider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import PropTypes from "prop-types";
import { z } from "zod";
import getLabs from "../../services/labService";
import getCategories from "../../services/categoryService";

const productSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .regex(/^[a-zA-Z0-9-ñÑ]*$/, "El código no debe tener caracteres especiales")
    .max(50, "El código no puede tener más de 50 caracteres"),
  notes: z.string().optional(),
  lab: z.string().min(1, "El laboratorio es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  desc: z.string().min(1, "La descripción es un campo obligatorio"),
  extra_desc: z.string().optional(),
  iva: z.boolean().default(false),
  listed: z.boolean().default(false),
  medinor_price: z.number().nonnegative("El precio no puede ser negativo"),
  public_price: z.number().nonnegative("El precio no puede ser negativo"),
  price: z.number().nonnegative("El precio no puede ser negativo"),
});

const initialFormState = {
  code: "",
  notes: "",
  lab: "",
  category: "",
  desc: "",
  extra_desc: "",
  iva: false,
  listed: false,
  medinor_price: 0,
  public_price: 0,
  price: 0,
};

export default function ProductCreateDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  const handleGetLabs = async () => {
    try {
      const response = await getLabs();
      setLabs(response.data.items || []);
    } catch (error) {
      console.error(error);
      setLabs([]);
    }
  };

  const handleGetCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.items || []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    handleGetLabs();
    handleGetCategories();
    setFormData(initialFormState);
    setErrors({});
  }, [open]);

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const dataToSave = {
      ...formData,
      medinor_price: parseFloat(formData.medinor_price) || 0,
      public_price: parseFloat(formData.public_price) || 0,
      price: parseFloat(formData.price) || 0,
    };

    try {
      productSchema.parse(dataToSave);
      setErrors({});

      await onSave(dataToSave);
      handleClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        for (const issue of err.issues) {
          fieldErrors[issue.path[0]] = issue.message;
        }
        setErrors(fieldErrors);
      }
      console.error("Error al guardar el producto:", err);
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
          alignItems: "center",
          opacity: "80%",
          mt: 1,
        }}
      >
        Crear Nuevo Producto
        <Tooltip
          title="Sé cuidadoso: Los productos creados no figurarán en Tango Gestión. Utiliza este panel si solo debes migrar un único producto o quieres crear uno particular."
          arrow
        >
          <Info color="action" fontSize="medium" />
        </Tooltip>
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", my: 1, flexDirection: "column", gap: 2 }}
      >
        <Typography variant="overline">Información general</Typography>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="code"
            label="Código"
            type="text"
            value={formData.code}
            onChange={handleInputChange}
            error={!!errors.code}
            helperText={errors.code}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notas"
            type="text"
            value={formData.notes}
            onChange={handleInputChange}
            sx={{ flex: 1 }}
          />
        </Box>
        <TextField
          margin="dense"
          name="desc"
          label="Descripción"
          type="text"
          value={formData.desc}
          onChange={handleInputChange}
          error={!!errors.desc}
          helperText={errors.desc}
        />
        <TextField
          multiline
          maxRows={3}
          margin="dense"
          name="extra_desc"
          label="Descripción adicional"
          type="text"
          value={formData.extra_desc}
          onChange={handleInputChange}
        />
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Laboratorio</InputLabel>
            <Select
              name="lab"
              value={formData.lab}
              onChange={handleInputChange}
              error={!!errors.lab}
            >
              {labs.map((labObj) => (
                <MenuItem key={labObj.lab} value={labObj.lab}>
                  {labObj.lab}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Categoría</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              error={!!errors.category}
            >
              {categories.map((catObj) => (
                <MenuItem key={catObj.category} value={catObj.category}>
                  {catObj.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="overline" sx={{ mt: 2 }}>
          Precios y Estado
        </Typography>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 1 }}>
          <TextField
            margin="dense"
            name="price"
            label="Precio"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="public_price"
            label="Precio Público"
            type="number"
            value={formData.public_price}
            onChange={handleInputChange}
            error={!!errors.public_price}
            helperText={errors.public_price}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="medinor_price"
            label="Precio Medinor"
            type="number"
            value={formData.medinor_price}
            onChange={handleInputChange}
            error={!!errors.medinor_price}
            helperText={errors.medinor_price}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                name="listed"
                checked={formData.listed}
                onChange={handleCheckboxChange}
              />
            }
            label="Listado"
            labelPlacement="end"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="iva"
                checked={formData.iva}
                onChange={handleCheckboxChange}
              />
            }
            label="Aplica IVA"
            labelPlacement="end"
          />
        </Box>
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

ProductCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
