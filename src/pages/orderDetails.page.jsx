import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PageContainer } from "@toolpad/core";
import { useParams, useNavigate } from "react-router-dom";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useSelector } from "react-redux";
import { selectCurrentUserRole } from "../features/authSlice";
import { getProductImages } from "../services/imageService";
import { closeOrder, getOrderById } from "../services/orderService";

const formatCurrency = (value) => {
  if (value === null || typeof value === "undefined") {
    return "$ N/A";
  }
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const OrderItemRow = ({ item, onImageClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImage = async () => {
    if (imageUrl || !item.product?._id) return null;
    setIsLoading(true);
    try {
      const images = await getProductImages(item.product._id);
      if (images && images.length > 0) {
        const url = images[0].url;
        setImageUrl(url);
        return url;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener la imagen del producto:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (!item.product?._id) return;
    if (imageUrl) {
      onImageClick(imageUrl);
      return;
    }
    const url = await fetchImage();
    if (url) {
      onImageClick(url);
    }
  };

  const itemTotalWithDiscount = item.priceDiscount * item.quantity;

  return (
    <TableRow
      onClick={handleClick}
      hover
      sx={{
        cursor: item.product?._id ? "pointer" : "default",
      }}
    >
      <TableCell component="th" scope="row">
        {item.product?.desc || "N/A"}
      </TableCell>
      <TableCell align="right">{item.quantity || "N/A"}</TableCell>
      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
      <TableCell align="right">
        {item.discountAmount > 0 ? `${item.discountAmount}%` : "0%"}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(itemTotalWithDiscount)}
      </TableCell>
    </TableRow>
  );
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const userRole = useSelector(selectCurrentUserRole);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError(
          "No se pudo cargar el pedido. Verifique el ID e intente de nuevo."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleImageClick = (url) => {
    setFullScreenImage(url);
  };

  const handleOpenDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmCloseOrder = async () => {
    handleCloseDialog();
    try {
      const updatedOrder = await closeOrder(order._id);
      setOrder(updatedOrder.order);
      setSnackbar({
        open: true,
        message: "Orden cerrada exitosamente.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al cerrar la orden.",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <Alert severity="error">{error || "Pedido no encontrado."}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/orders/manage")}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Dialog
        open={!!fullScreenImage}
        onClose={() => setFullScreenImage(null)}
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 1, position: "relative" }}>
          <img
            src={fullScreenImage}
            alt="Vista completa del producto"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "block",
            }}
          />
          <IconButton
            aria-label="close"
            onClick={() => setFullScreenImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.8)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar Cierre de Orden"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que quieres cerrar esta orden? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmCloseOrder} autoFocus color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton
            onClick={() => navigate("/orders/manage")}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <ReceiptLongIcon fontSize="large" />
          <Box>
            <Typography variant="h5" component="div">
              Detalle del Pedido Nº {order.orderNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cliente: {order.client?.razon_soci || "N/A"} | Fecha:{" "}
              {new Date(order.createdAt).toLocaleDateString("es-AR")}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          {order.closed ? (
            <Button variant="outlined" disabled>
              Orden Cerrada
            </Button>
          ) : (
            <Button variant="outlined" onClick={handleOpenDialog}>
              Cerrar Orden
            </Button>
          )}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table aria-label="Order details table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "semibold" }}>Producto</TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Cantidad
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Precio Unitario
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Descuento
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item, index) => (
                <OrderItemRow
                  key={item.product?._id || index}
                  item={item}
                  onImageClick={handleImageClick}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "400px" }}>
          {order.totalDiscountAmount > 0 && (
            <>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">
                  {formatCurrency(order.total)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Ahorro Total</Typography>
                <Typography
                  variant="body1"
                  color="success.main"
                  fontWeight="semibold"
                >
                  -{formatCurrency(order.totalDiscountAmount)}
                </Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
            </>
          )}
          <Typography align="right" fontWeight="semibold">
            Total general: {formatCurrency(order.totalWithDiscount)}
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
}
