import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Box,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function centerAspectCrop(mediaWidth, mediaHeight, aspect = 1) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

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
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("La creación del Blob de la imagen falló."));
          return;
        }
        resolve({
          blob,
          dataURL: URL.createObjectURL(blob),
        });
      },
      "image/png",
      0.95
    );
  });
}

export default function CroppingDialog({
  open,
  onClose,
  images: initialImages,
  onComplete,
  aspect = 1,
  principalExists = false,
}) {
  const [localImages, setLocalImages] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [primaryImageId, setPrimaryImageId] = useState(null);
  const imgRef = useRef(null);

  const activeImage = localImages.find((img) => img.id === activeImageId);

  useEffect(() => {
    if (open && initialImages.length > 0) {
      const preparedImages = initialImages.map((img) => ({
        ...img,
        crop: undefined,
        completedCrop: undefined,
        croppedSrc: null,
        blob: null,
      }));
      setLocalImages(preparedImages);
      setActiveImageId(preparedImages[0].id);

      if (!principalExists) {
        setPrimaryImageId(preparedImages[0].id);
      } else {
        setPrimaryImageId(null);
      }
    }
  }, [open, initialImages, principalExists]);

  const onImageLoad = useCallback(
    (e) => {
      if (aspect && activeImage) {
        const { width, height } = e.currentTarget;
        const initialCrop = centerAspectCrop(width, height, aspect);
        setLocalImages((prev) =>
          prev.map((img) =>
            img.id === activeImageId
              ? { ...img, crop: initialCrop, completedCrop: initialCrop }
              : img
          )
        );
      }
    },
    [activeImage, aspect, activeImageId]
  );

  const handleApplyCrop = async () => {
    if (!activeImage?.completedCrop || !imgRef.current) return;
    try {
      const { blob, dataURL } = await getCroppedImg(
        imgRef.current,
        activeImage.completedCrop
      );
      setLocalImages((prev) =>
        prev.map((img) =>
          img.id === activeImageId
            ? { ...img, croppedSrc: dataURL, blob: blob }
            : img
        )
      );

      const currentIndex = localImages.findIndex(
        (img) => img.id === activeImageId
      );
      const nextUncroppedImage = localImages.find(
        (img, index) => index > currentIndex && !img.croppedSrc
      );
      if (nextUncroppedImage) {
        setActiveImageId(nextUncroppedImage.id);
      }
    } catch (e) {
      console.error("Error al recortar la imagen:", e);
    }
  };

  const handleFinish = () => {
    const processedImages = localImages.map((img) => {
      const role =
        primaryImageId && img.id === primaryImageId
          ? "principal"
          : "secundaria";
      return {
        ...img,
        role,
      };
    });
    onComplete(processedImages);
    onClose();
  };

  const allImagesCropped = localImages.every((img) => !!img.croppedSrc);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}>
      <DialogTitle>Editar y Preparar Imágenes</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Panel de Recorte (Izquierda) */}

          <Grid item xs={12} md={8}>
            <Box
              sx={{
                width: "600px",
                height: "600px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {activeImage ? (
                <ReactCrop
                  crop={activeImage.crop}
                  onChange={(_, percentCrop) =>
                    setLocalImages((prev) =>
                      prev.map((img) =>
                        img.id === activeImageId
                          ? { ...img, crop: percentCrop }
                          : img
                      )
                    )
                  }
                  onComplete={(c) =>
                    setLocalImages((prev) =>
                      prev.map((img) =>
                        img.id === activeImageId
                          ? { ...img, completedCrop: c }
                          : img
                      )
                    )
                  }
                  aspect={aspect}
                >
                  <img
                    ref={imgRef}
                    src={activeImage.originalSrc}
                    onLoad={onImageLoad}
                    style={{ maxHeight: "600px" }}
                    alt="Recorte"
                  />
                </ReactCrop>
              ) : (
                <Typography>Seleccione una imagen para editar.</Typography>
              )}
            </Box>
          </Grid>

          {/* Panel de Imágenes (Derecha) */}
          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{ height: "600px", display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Imágenes a Subir
                </Typography>
                {principalExists && (
                  <Typography variant="caption" color="text.secondary">
                    Ya existe una imagen principal. Todas las nuevas serán
                    secundarias.
                  </Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                <RadioGroup
                  value={primaryImageId}
                  onChange={(e) => setPrimaryImageId(e.target.value)}
                >
                  <Stack spacing={1.5}>
                    {localImages.map((img) => (
                      <Paper
                        key={img.id}
                        onClick={() => setActiveImageId(img.id)}
                        variant="outlined"
                        sx={{
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          borderColor:
                            activeImageId === img.id
                              ? "primary.main"
                              : "rgba(0,0,0,0.12)",
                          boxShadow:
                            activeImageId === img.id
                              ? (theme) =>
                                  `0 0 0 2px ${theme.palette.primary.main}`
                              : "none",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: 60,
                            height: 60,
                            flexShrink: 0,
                            mr: 1.5,
                          }}
                        >
                          <img
                            src={img.originalSrc}
                            alt={img.file.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          {img.croppedSrc && (
                            <CheckCircleIcon
                              color="success"
                              sx={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                bgcolor: "white",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          noWrap
                          sx={{ flexGrow: 1, fontSize: ".8rem" }}
                        >
                          {img.file.name}
                        </Typography>
                        <Tooltip
                          title={
                            principalExists
                              ? "Ya existe una imagen principal"
                              : "Marcar como imagen principal"
                          }
                        >
                          <span>
                            <FormControlLabel
                              value={img.id}
                              control={<Radio />}
                              label=""
                              labelPlacement="start"
                              onClick={(e) => e.stopPropagation()}
                              disabled={principalExists}
                            />
                          </span>
                        </Tooltip>
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: "16px 24px" }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="outlined"
          onClick={handleApplyCrop}
          disabled={!activeImage?.completedCrop || !!activeImage?.croppedSrc}
        >
          {activeImage?.croppedSrc ? "Recorte Guardado" : "Guardar Recorte"}
        </Button>
        <Button
          variant="contained"
          onClick={handleFinish}
          disabled={!allImagesCropped}
        >
          Finalizar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
