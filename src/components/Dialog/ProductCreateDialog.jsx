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
  level: z
    .number({ invalid_type_error: "Nivel debe ser un número" })
    .int("Debe ser un entero")
    .min(0, "No puede ser negativo")
    .default(10),
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
  discount: 0,
  level: 0,
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

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // coerciones suaves
    if (["price", "public_price", "medinor_price", "discount"].includes(name)) {
      setField(name, value === "" ? "" : Number(value));
      return;
    }
    if (name === "level") {
      setField(name, value === "" ? "" : Number(value));
      return;
    }

    setField(name, value);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setField(name, checked);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);

    // construir payload
    const base = {
      ...formData,
      medinor_price:
        formData.medinor_price === "" ? 0 : Number(formData.medinor_price),
      public_price:
        formData.public_price === "" ? 0 : Number(formData.public_price),
      price: formData.price === "" ? 0 : Number(formData.price),
      discount: formData.discount === "" ? 0 : Number(formData.discount),
      level:
        formData.level === "" || Number.isNaN(Number(formData.level))
          ? 10
          : Number(formData.level),
    };

    const dataToSave = {
      code: base.code,
      notes: base.notes || "",
      lab: base.lab,
      category: base.category,
      desc: base.desc,
      extra_desc: base.extra_desc || "",
      iva: !!base.iva,
      listed: !!base.listed,
      medinor_price: Number(base.medinor_price) || 0,
      public_price: Number(base.public_price) || 0,
      price: Number(base.price) || 0,
      discount:
        base.discount === undefined || base.discount === null
          ? 0
          : Number(base.discount),
      level: Number(base.level),
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
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
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
          title="Sé cuidadoso: Los productos creados no figurarán en Tango Gestión. Usá este panel para altas individuales."
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
            name="notes"
            label="Notas"
            type="text"
            value={formData.notes}
            onChange={handleInputChange}
            sx={{ flex: 1 }}
          />
        </Box>

        <TextField
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
          name="extra_desc"
          label="Descripción adicional"
          type="text"
          value={formData.extra_desc}
          onChange={handleInputChange}
        />

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Laboratorio</InputLabel>
            <Select
              name="lab"
              value={formData.lab}
              onChange={handleInputChange}
              error={!!errors.lab}
              label="Laboratorio"
            >
              {labs.map((labObj) => (
                <MenuItem
                  key={labObj.lab || labObj._id}
                  value={labObj.lab || labObj._id}
                >
                  {labObj.lab || labObj.name || labObj._id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              error={!!errors.category}
              label="Categoría"
            >
              {categories.map((catObj) => (
                <MenuItem
                  key={catObj.category || catObj._id}
                  value={catObj.category || catObj._id}
                >
                  {catObj.category || catObj.name || catObj._id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="overline" sx={{ mt: 2 }}>
          Precios, Descuentos y Estado
        </Typography>
        <Divider />

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 1 }}>
          <TextField
            name="price"
            label="Precio"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
            sx={{ flex: 1 }}
            slotProps={{ min: 0, step: "0.01" }}
          />
          <TextField
            name="public_price"
            label="Precio Público"
            type="number"
            value={formData.public_price}
            onChange={handleInputChange}
            error={!!errors.public_price}
            helperText={errors.public_price}
            sx={{ flex: 1 }}
            slotProps={{ min: 0, step: "0.01" }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
          <TextField
            name="medinor_price"
            label="Precio Medinor"
            type="number"
            value={formData.medinor_price}
            onChange={handleInputChange}
            error={!!errors.medinor_price}
            helperText={errors.medinor_price}
            sx={{ flex: 1 }}
            slotProps={{ min: 0, step: "0.01" }}
          />
          <TextField
            name="level"
            label="Nivel"
            type="number"
            value={formData.level}
            onChange={handleInputChange}
            error={!!errors.level}
            helperText={errors.level}
            sx={{ flex: 1 }}
            slotProps={{
              htmlInput: {
                min: 0,
                max: 10,
                step: 1,
              },
            }}
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
