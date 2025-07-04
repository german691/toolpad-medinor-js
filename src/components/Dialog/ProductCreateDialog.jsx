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
  notes: null,
  lab: "",
  desc: "",
  extra_desc: null,
  iva: false,
  listed: false,
  medinor_price: 0,
  public_price: 0,
  price: 0,
};

export default function ProductCreateDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [labs, setLabs] = useState();

  const handleGetLabs = async () => {
    try {
      const response = await getLabs();
      setLabs(response.data.items || []);
      console.log(response.data.items);
    } catch (err) {
      setLabs([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    handleGetLabs();

    setFormData(initialFormState);
    handleGetLabs();
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            opacity: "80%",
            mt: 2,
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
          sx={{ display: "flex", my: 2, flexDirection: "column", gap: 1 }}
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
              value={formData.cod_client}
              onChange={handleInputChange}
              sx={{ flex: 1 }}
            />
            <TextField
              autoFocus
              margin="dense"
              name="notes"
              label="Notas"
              type="text"
              value={formData.cod_client}
              onChange={handleInputChange}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            name="desc"
            label="Descripción"
            type="text"
            value={formData.cod_client}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            multiline
            maxRows={3}
            margin="dense"
            name="extra_desc"
            label="Descripción adicional"
            type="text"
            value={formData.cod_client}
            onChange={handleInputChange}
          />
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            {/* <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Laboratorio</InputLabel>
              <Select>
                {labs.map((lab) => (
                  <MenuItem key={lab} value={lab}>
                    {lab}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="overline">Precios</Typography>
          </Box>
          <Divider />
          <Box></Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.active}
                onChange={handleCheckboxChange}
              />
            }
            label="Listado"
            labelPlacement="end"
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

ProductCreateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
