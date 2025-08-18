import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import OrderItem from "../UI/OrderItem";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CloseIcon from "@mui/icons-material/Close";

const formatCurrency = (value) =>
  `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderDetailsDialog({ order, open, onClose }) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={"sm"} fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <ReceiptLongIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              Detalle del Pedido Nº {order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cliente: {order.client?.razon_soci || "N/A"} | Fecha:{" "}
              {new Date(order.createdAt).toLocaleDateString("es-AR")}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {order.items.map((item) => (
            <OrderItem key={item.product?._id || Math.random()} item={item} />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, pt: 2, flexDirection: "column", alignItems: "flex-end" }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "350px",
          }}
        >
          {order.totalDiscountAmount > 0 && (
            <>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">
                  {formatCurrency(order.total)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">Ahorro Total:</Typography>
                <Typography
                  variant="body1"
                  color="success.main"
                  fontWeight="bold"
                >
                  -{formatCurrency(order.totalDiscountAmount)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
            </>
          )}
          <Stack direction="row" justifyContent="end" sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: "semibold" }}>
              Total a Pagar: {formatCurrency(order.totalWithDiscount)}
            </Typography>
          </Stack>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
