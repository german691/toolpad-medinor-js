import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Badge,
  Stack,
  Box,
  Divider,
  ButtonGroup, // Importado para los botones de resolución
} from "@mui/material";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// --- FUNCIONES DE AYUDA ---

function centerAspectCrop(mediaWidth, mediaHeight, aspect = 1) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 100 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Función getCroppedImg actualizada para manejar el redimensionamiento.
 * @param {HTMLImageElement} image El elemento de la imagen original.
 * @param {import('react-image-crop').PixelCrop} crop El área de recorte en píxeles.
 * @param {number | null} targetWidth El ancho final deseado en píxeles.
 * @returns {Promise<string>} La URL de datos de la imagen final.
 */
function getCroppedImg(image, crop) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.ceil(crop.width * scaleX);
    canvas.height = Math.ceil(crop.height * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("No se pudo obtener el contexto 2D del canvas."));
      return;
    }

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    resolve(canvas.toDataURL("image/png"));
  });
}
export default function CroppingDialog({
  open,
  onClose,
  images,
  onComplete,
  aspect = 1 / 1,
}) {
  const [localImages, setLocalImages] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const imgRef = useRef(null);

  const activeImage = localImages.find((img) => img.id === activeImageId);
  const allCropped =
    localImages.length > 0 && localImages.every((img) => img.croppedSrc);

  useEffect(() => {
    if (open) {
      setLocalImages(images);
      const principalImage = images.find((img) => img.role === "principal");
      setActiveImageId(
        principalImage ? principalImage.id : images[0]?.id || null
      );
    }
  }, [open, images]);

  const handleConfirmCrop = async () => {
    if (!activeImage?.completedCrop || !imgRef.current) return;

    // Llamada a getCroppedImg simplificada, sin pasar la resolución.
    const croppedSrc = await getCroppedImg(
      imgRef.current,
      activeImage.completedCrop
    );

    const updatedImages = localImages.map((img) =>
      img.id === activeImageId ? { ...img, croppedSrc } : img
    );
    setLocalImages(updatedImages);

    const nextImage = updatedImages.find((img) => !img.croppedSrc);
    setActiveImageId(nextImage ? nextImage.id : null);
  };

  function onImageLoad(e) {
    if (aspect && activeImage) {
      const { width, height } = e.currentTarget;
      const initialCrop = centerAspectCrop(width, height, aspect);
      setLocalImages((prevImages) =>
        prevImages.map((img) =>
          img.id === activeImageId ? { ...img, crop: initialCrop } : img
        )
      );
    }
  }

  const handleCropChange = (newCrop) => {
    setLocalImages((prevImages) =>
      prevImages.map((img) =>
        img.id === activeImageId ? { ...img, crop: newCrop } : img
      )
    );
  };

  const handleCompletedCrop = (newCompletedCrop) => {
    setLocalImages((prevImages) =>
      prevImages.map((img) =>
        img.id === activeImageId
          ? { ...img, completedCrop: newCompletedCrop }
          : img
      )
    );
  };

  const handleFinish = () => {
    onComplete(localImages);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}>
      <DialogTitle>Recortar Imágenes</DialogTitle>
      <DialogContent dividers>
        {activeImage ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: "400px",
                    maxWidth: "100%",
                    height: "500px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReactCrop
                    crop={activeImage.crop}
                    onChange={handleCropChange}
                    onComplete={handleCompletedCrop}
                    aspect={aspect}
                  >
                    <img
                      ref={imgRef}
                      src={activeImage.originalSrc}
                      onLoad={onImageLoad}
                      style={{
                        maxHeight: "500px",
                      }}
                      alt="Para recortar"
                    />
                  </ReactCrop>
                </Box>
                {/* --- Interfaz de selección de resolución eliminada --- */}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ height: "100%" }}>
                <Typography sx={{ p: 2, fontWeight: 500 }}>
                  Cola de Recorte
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack
                  spacing={2}
                  sx={{ px: 2, overflowY: "auto", maxHeight: 450 }}
                >
                  {localImages.map((img) => (
                    <Paper
                      key={img.id}
                      onClick={() =>
                        !img.croppedSrc && setActiveImageId(img.id)
                      }
                      sx={{
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        cursor: img.croppedSrc ? "default" : "pointer",
                        outline: `${
                          activeImageId === img.id ? "2px" : "1px"
                        } solid ${
                          activeImageId === img.id
                            ? "#1976d2"
                            : "rgba(0, 0, 0, 0.0)"
                        }`,
                        outlineOffset: "-1px",
                        opacity: img.croppedSrc ? 0.6 : 1,
                      }}
                      variant="outlined"
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 60,
                          height: 60,
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={img.originalSrc}
                          alt="thumbnail"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                        {img.croppedSrc && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(255, 255, 255, 0.5)",
                              borderRadius: "4px",
                            }}
                          >
                            <CheckCircleIcon color="success" fontSize="large" />
                          </Box>
                        )}
                      </Box>
                      <Typography
                        noWrap
                        sx={{
                          flexGrow: 1,
                          fontSize: ".8rem",
                          ml: 2,
                          alignSelf: "center",
                        }}
                      >
                        {img.file.name}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              width: "600px",
            }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h4" mt={4}>
              ¡Recorte Completado!
            </Typography>
            <Typography mt={1}>
              Todas las imágenes han sido procesadas.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{allCropped ? "Cerrar" : "Cancelar"}</Button>
        {activeImage && (
          <Button
            variant="contained"
            onClick={handleConfirmCrop}
            disabled={!activeImage.completedCrop}
          >
            Siguiente
          </Button>
        )}
        {allCropped && (
          <Button variant="contained" color="success" onClick={handleFinish}>
            Finalizar y Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
