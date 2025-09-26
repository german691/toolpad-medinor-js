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
import { getProductImages } from "../services/imageService";
import { closeOrder, getOrderById } from "../services/orderService";
import { IconArrowBackUp, IconReceiptDollarFilled } from "@tabler/icons-react";

const formatCurrency = (value) => {
  if (value === null || typeof value === "undefined" || isNaN(value)) {
    return "$ N/A";
  }
  return `$ ${Number(value).toLocaleString("es-AR", {
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
    if (url) onImageClick(url);
  };

  // Totales por ítem:
  const itemTotalFinal =
    Number(item.priceWithOffer || 0) * Number(item.quantity || 0);

  return (
    <TableRow
      onClick={handleClick}
      hover
      sx={{
        cursor: item.product?._id ? "pointer" : "default",
        height: "40px",
      }}
    >
      <TableCell component="th" scope="row">
        {item.product?.code || "N/A"}
      </TableCell>
      <TableCell component="th" scope="row">
        {item.product?.desc || "N/A"}
      </TableCell>

      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
      <TableCell align="right">
        {item.discountAmount > 0
          ? formatCurrency(item.discountAmount)
          : "$ 0,00"}
      </TableCell>
      <TableCell align="right">
        {formatCurrency(item.priceWithDiscount)}
      </TableCell>
      <TableCell align="right">
        {item.offerAmount > 0 ? formatCurrency(item.offerAmount) : "$ 0,00"}
      </TableCell>
      <TableCell align="right">{formatCurrency(item.priceWithOffer)}</TableCell>

      <TableCell align="right">{item.quantity || "N/A"}</TableCell>
      <TableCell align="right">{formatCurrency(itemTotalFinal)}</TableCell>
    </TableRow>
  );
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

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

  const handleImageClick = (url) => setFullScreenImage(url);
  const handleOpenDialog = () => setOpenConfirmDialog(true);
  const handleCloseDialog = () => setOpenConfirmDialog(false);
  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

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
      <PageContainer breadcrumbs={[]}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer breadcrumbs={[]}>
        <Alert severity="error">{error || "Pedido no encontrado."}</Alert>
        <Button
          startIcon={<IconArrowBackUp />}
          onClick={() => navigate("/orders/manage")}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </PageContainer>
    );
  }

  const showDiscount = Number(order.totalDiscountAmount || 0) > 0;
  const showOffer = Number(order.totalOfferAmount || 0) > 0;

  return (
    <PageContainer breadcrumbs={[]}>
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
            <IconArrowBackUp />
          </IconButton>
          <IconReceiptDollarFilled size={48} />
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
        <TableContainer sx={{ maxHeight: "64vh" }}>
          <Table aria-label="Order details table" stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "semibold" }}>Código</TableCell>
                <TableCell sx={{ fontWeight: "semibold" }}>Producto</TableCell>

                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Precio
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Descuento
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  P. con descuento
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Oferta
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Precio Final
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: "semibold" }}>
                  Cantidad
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
        <Box sx={{ width: "100%", maxWidth: "420px" }}>
          {/* Subtotal y ahorros */}
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Subtotal</Typography>
            <Typography variant="body1">
              {formatCurrency(order.total)}
            </Typography>
          </Stack>

          {showDiscount && (
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Ahorro por descuento</Typography>
              <Typography
                variant="body1"
                color="success.main"
                fontWeight="semibold"
              >
                -{formatCurrency(order.totalDiscountAmount)}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Total con descuento</Typography>
            <Typography variant="body1">
              {formatCurrency(order.totalWithDiscount)}
            </Typography>
          </Stack>

          {showOffer && (
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Ahorro por oferta</Typography>
              <Typography
                variant="body1"
                color="success.main"
                fontWeight="semibold"
              >
                -{formatCurrency(order.totalOfferAmount)}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body1">Total con oferta</Typography>
            <Typography variant="body1">
              {formatCurrency(order.totalWithOffer)}
            </Typography>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography align="right" fontWeight="semibold">
            Total general: {formatCurrency(order.totalFinal)}
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
}
