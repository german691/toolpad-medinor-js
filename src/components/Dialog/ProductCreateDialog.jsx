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
import getLabs from "../../services/labService";

const initialFormState = {
  code: "",
  notes: "",
  lab: "",
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

  const handleGetLabs = async () => {
    try {
      const response = await getLabs();
      setLabs(response.data.items || []);
    } catch (error) {
      console.log(error);
      setLabs([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    handleGetLabs();
    setFormData(initialFormState);
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
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        medinor_price: parseFloat(formData.medinor_price) || 0,
        public_price: parseFloat(formData.public_price) || 0,
        price: parseFloat(formData.price) || 0,
      };
      console.log(dataToSave);
      await onSave(dataToSave);
      handleClose();
    } catch (err) {
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
        <FormControl fullWidth margin="dense">
          <InputLabel>Laboratorio</InputLabel>
          <Select name="lab" value={formData.lab} onChange={handleInputChange}>
            {labs.map((labObj) => (
              <MenuItem key={labObj.lab} value={labObj.lab}>
                {labObj.lab}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="public_price"
            label="Precio Público"
            type="number"
            value={formData.public_price}
            onChange={handleInputChange}
            sx={{ flex: 1 }}
          />
          <TextField
            margin="dense"
            name="medinor_price"
            label="Precio Medinor"
            type="number"
            value={formData.medinor_price}
            onChange={handleInputChange}
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
