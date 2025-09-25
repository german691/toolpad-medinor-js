import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { z } from "zod";

const schema = z
  .object({
    newPassword: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function AdminPasswordDialog({ open, onClose, onSubmit, selectedName }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleConfirm = useCallback(async () => {
    const res = schema.safeParse({ newPassword, confirmPassword });
    if (!res.success) {
      const e = {};
      res.error.errors.forEach((x) => {
        e[x.path[0]] = x.message;
      });
      setErrors(e);
      return;
    }
    await onSubmit(res.data.newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  }, [newPassword, confirmPassword, onSubmit]);

  const handleClose = useCallback(() => {
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} keepMounted>
      <DialogTitle>Restablecer contraseña de administrador</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />
          <TextField
            fullWidth
            type="password"
            label="Repetir contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          disabled={!newPassword || !confirmPassword}
          autoFocus
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AdminPasswordDialog);
