import React, { useState, useEffect } from "react";
import { Typography, Box, Skeleton, Avatar, Paper, Stack } from "@mui/material";
import { getProductImages } from "../../services/imageService";
import { IconPhoto } from "@tabler/icons-react";

const formatCurrency = (value) =>
  `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OrderItem({ item }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!item.product?._id) {
        setLoading(false);
        return;
      }
      try {
        const images = await getProductImages(item.product._id);
        const mainImage =
          images.find((img) => img.role === "principal") || images[0];
        if (mainImage) {
          setImageUrl(mainImage.url);
        }
      } catch (error) {
        console.error("Error al cargar la imagen del producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [item.product?._id]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        mb: 2,
        backgroundColor: "#00000000",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {loading ? (
          <Skeleton variant="rounded" width={100} height={100} />
        ) : (
          <Avatar
            variant="rounded"
            src={imageUrl}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#00000015",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <IconPhoto color="disabled" />
          </Avatar>
        )}

        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {item.product?.desc || "Producto no disponible"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Código: {item.product?.code || "N/A"}
          </Typography>

          <Stack direction="row" spacing={4} justifyContent="flex-end">
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Precio Unit.
              </Typography>
              <Typography variant="body2">
                {formatCurrency(item.priceDiscount)}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Cantidad
              </Typography>
              <Typography variant="body2">{item.quantity}</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {formatCurrency(item.priceDiscount * item.quantity)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
