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
function getCroppedImg(image, crop, targetWidth = null) {
  return new Promise((resolve, reject) => {
    const cropCanvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    cropCanvas.width = Math.ceil(crop.width * scaleX);
    cropCanvas.height = Math.ceil(crop.height * scaleY);
    const ctx = cropCanvas.getContext("2d");

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
      cropCanvas.width,
      cropCanvas.height
    );

    if (!targetWidth) {
      resolve(cropCanvas.toDataURL("image/png"));
      return;
    }

    const resizeCanvas = document.createElement("canvas");
    const cropAspectRatio = cropCanvas.width / cropCanvas.height;
    resizeCanvas.width = targetWidth;
    resizeCanvas.height = Math.ceil(targetWidth / cropAspectRatio);
    const resizeCtx = resizeCanvas.getContext("2d");

    if (!resizeCtx) {
      reject(
        new Error(
          "No se pudo obtener el contexto 2D del canvas de redimensionamiento."
        )
      );
      return;
    }

    resizeCtx.imageSmoothingQuality = "high";
    resizeCtx.drawImage(
      cropCanvas,
      0,
      0,
      resizeCanvas.width,
      resizeCanvas.height
    );

    resolve(resizeCanvas.toDataURL("image/png"));
  });
}

// --- COMPONENTE ---

export default function CroppingDialog({
  open,
  onClose,
  images,
  onComplete,
  aspect = 16 / 9,
}) {
  const [localImages, setLocalImages] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [targetResolution, setTargetResolution] = useState(null); // Estado para la resolución
  const imgRef = useRef(null);

  const activeImage = localImages.find((img) => img.id === activeImageId);
  const allCropped =
    localImages.length > 0 && localImages.every((img) => img.croppedSrc);

  const RESOLUTIONS = [256, 328, 512, 768, 1024];

  useEffect(() => {
    if (open) {
      setLocalImages(images);
      const principalImage = images.find((img) => img.role === "principal");
      setActiveImageId(
        principalImage ? principalImage.id : images[0]?.id || null
      );
      setTargetResolution(null); // Resetea la resolución al abrir
    }
  }, [open, images]);

  const handleConfirmCrop = async () => {
    if (!activeImage?.completedCrop || !imgRef.current) return;

    // Pasa la resolución seleccionada a la función de recorte
    const croppedSrc = await getCroppedImg(
      imgRef.current,
      activeImage.completedCrop,
      targetResolution
    );

    const updatedImages = localImages.map((img) =>
      img.id === activeImageId ? { ...img, croppedSrc } : img
    );
    setLocalImages(updatedImages);
    const currentIndex = updatedImages.findIndex(
      (img) => img.id === activeImageId
    );
    const nextImage = updatedImages.find(
      (img, index) => index > currentIndex && !img.croppedSrc
    );
    setActiveImageId(nextImage ? nextImage.id : null);
    setTargetResolution(null); // Resetea para la siguiente imagen
  };

  // El resto de los handlers y la lógica permanecen sin cambios
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
              <Stack spacing={2}>
                {/* Contenedor de la imagen con tus estilos originales */}
                <Box
                  sx={{
                    width: "400px",
                    maxWidth: "400px",
                    height: "500px",
                    maxHeight: "500px",
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
                        width: "100%",
                        maxHeight: "500px",
                      }}
                      alt="Para recortar"
                    />
                  </ReactCrop>
                </Box>

                {/* --- INICIO: SECCIÓN DE RESOLUCIONES AÑADIDA --- */}
                <Paper variant="outlined" sx={{ p: 2, width: "400px" }}>
                  <Typography gutterBottom sx={{ fontWeight: 500 }}>
                    Resolución Final (Opcional)
                  </Typography>
                  <ButtonGroup fullWidth size="small">
                    {RESOLUTIONS.map((res) => (
                      <Button
                        key={res}
                        variant={
                          targetResolution === res ? "contained" : "outlined"
                        }
                        onClick={() => setTargetResolution(res)}
                      >
                        {res}px
                      </Button>
                    ))}
                  </ButtonGroup>
                </Paper>
                {/* --- FIN: SECCIÓN DE RESOLUCIONES AÑADIDA --- */}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              {/* La cola de recorte permanece exactamente igual */}
              <Paper variant="outlined" sx={{ height: "100%" }}>
                <Typography sx={{ p: 2, fontWeight: 500 }}>
                  Cola de Recorte
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2} sx={{ px: 2 }}>
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
                        outline: `${activeImageId === img.id ? "2px" : "1px"} solid ${activeImageId === img.id ? "#1976d2" : "rgba(0, 0, 0, 0.0)"}`,
                        outlineOffset: "-1px",
                        opacity: img.croppedSrc ? 0.6 : 1,
                      }}
                      variant="outlined"
                    >
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={!img.croppedSrc}
                        sx={{ mr: 2 }}
                      >
                        <img
                          src={img.originalSrc}
                          alt="thumbnail"
                          width={60}
                          height={60}
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      </Badge>
                      <Typography sx={{ flexGrow: 1, fontSize: ".8rem" }}>
                        {img.file.name}
                      </Typography>
                      {img.croppedSrc && <CheckCircleIcon color="success" />}
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // El resto del componente permanece igual
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
        <Button onClick={onClose}>
          {activeImage ? "Cancelar" : "Finalizar"}
        </Button>
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
            Finalizar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
