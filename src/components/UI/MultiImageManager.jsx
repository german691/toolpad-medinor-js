import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import {
  AddPhotoAlternate,
  CloudUpload,
  Delete,
  HighlightOff,
  Close,
} from "@mui/icons-material";
import CroppingDialog from "./CroppingDialog";
import {
  IconHighlightOff,
  IconPhotoFilled,
  IconPhotoPlus,
} from "@tabler/icons-react";

export default function MultiImageManager({
  selectedProduct,
  existingImages = [],
  newImages = [],
  onNewImages,
  onUpload,
  onDeleteExisting,
  onDeleteNew,
  onClearAll,
  isLoading,
  isUploading,
  alreadyHasPrincipal,
}) {
  const [localFiles, setLocalFiles] = useState([]);
  const [croppingModalOpen, setCroppingModalOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const allImages = useMemo(() => {
    const formattedExisting = existingImages.map((img) => ({
      ...img,
      id: img.id,
      src: img.url,
      isNew: false,
      role: img.isMain ? "Principal" : "Secundaria",
    }));

    const formattedNew = newImages.map((img) => ({
      ...img,
      src: img.croppedSrc,
      isNew: true,
      role: img.role === "principal" ? "Principal" : "Secundaria",
    }));

    return [...formattedExisting, ...formattedNew];
  }, [existingImages, newImages]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      const filesToProcess = acceptedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        originalSrc: URL.createObjectURL(file),
      }));
      setLocalFiles(filesToProcess);
      setCroppingModalOpen(true);
    }
  }, []);

  const handleCroppingComplete = (processedImages) => {
    onNewImages(processedImages);
    handleCloseCroppingDialog();
  };

  const handleCloseCroppingDialog = () => {
    setCroppingModalOpen(false);
    localFiles.forEach((f) => URL.revokeObjectURL(f.originalSrc));
    setLocalFiles([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    disabled: !selectedProduct || isUploading,
  });

  const dropzoneStyles = {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    fontWeight: 600,
    border: `2px dashed ${isDragActive ? "primary.main" : "grey.500"}`,
    textAlign: "center",
    color: isDragActive ? "primary.main" : "text.secondary",
    bgcolor: isDragActive ? "action.hover" : "transparent",
    cursor: "pointer",
    transition: "all .24s ease-in-out",
    borderRadius: 2,
    p: 2,
  };

  if (!selectedProduct) {
    return (
      <Paper
        variant="outlined"
        sx={{
          ...dropzoneStyles,
        }}
      >
        <Typography variant="h6">Seleccione un Producto</Typography>
        <Typography variant="body2">
          Elija un producto de la tabla para administrar sus imágenes.
        </Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          ...dropzoneStyles,
          cursor: "default",
          borderStyle: "solid",
          borderColor: "grey.300",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando Imágenes...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          sx={{ fontWeight: 500 }}
          noWrap
          title={selectedProduct.desc}
        >
          {selectedProduct.desc}
        </Typography>
        <Typography sx={{ color: "text.secondary", flexShrink: 0, ml: 1 }}>
          Imágenes: {allImages.length}
        </Typography>
      </Stack>

      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        {allImages.length === 0 ? (
          <Box {...getRootProps()} sx={dropzoneStyles}>
            <input {...getInputProps()} />
            <Box sx={{ p: 1 }}>
              <IconPhotoFilled size="48" />
            </Box>
            <Typography>Arrastre imágenes o haga clic para agregar</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto", pr: 1, mr: -1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 1.5,
              }}
            >
              {allImages.map((img) => (
                <Box
                  key={img.id}
                  sx={{ position: "relative", cursor: "pointer" }}
                  onClick={() => setFullScreenImage(img.src)}
                >
                  <img
                    src={img.src}
                    alt={img.role}
                    style={{
                      display: "block",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: "8px",
                      outline: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                  <Typography
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      left: 6,
                      bgcolor:
                        img.role === "Principal"
                          ? "primary.main"
                          : "rgba(0,0,0,0.6)",
                      color: "white",
                      px: 1,
                      py: "2px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                    }}
                  >
                    {img.role}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      img.isNew
                        ? onDeleteNew(img.id)
                        : onDeleteExisting(img.id);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255,255,255,0.8)",
                      "&:hover": { bgcolor: "white" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Box
                {...getRootProps()}
                sx={{
                  ...dropzoneStyles,
                  aspectRatio: "1 / 1",
                  minHeight: "120px",
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <input {...getInputProps()} />
                <IconPhotoFilled />
                <Typography variant="caption">Añadir más</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Stack sx={{ mt: 2 }} spacing={1}>
        <Button
          onClick={onUpload}
          fullWidth
          variant="contained"
          startIcon={
            isUploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CloudUpload />
            )
          }
          disabled={newImages.length === 0 || isUploading}
        >
          {isUploading ? "Subiendo..." : `Subir ${newImages.length} Imágenes`}
        </Button>
        <Button
          onClick={() => newImages.forEach((img) => onDeleteNew(img.id))}
          fullWidth
          variant="outlined"
          color="warning"
          startIcon={<IconHighlightOff />}
          disabled={newImages.length === 0 || isUploading}
        >
          Limpiar Nuevas
        </Button>
        <Button
          onClick={onClearAll}
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          disabled={allImages.length === 0 || isUploading}
        >
          Borrar Todo
        </Button>
      </Stack>

      <Dialog
        open={!!fullScreenImage}
        onClose={() => setFullScreenImage(null)}
        maxWidth="xl"
      >
        <DialogContent sx={{ p: 1, position: "relative" }}>
          <img
            src={fullScreenImage}
            alt="Vista completa"
            style={{ maxWidth: "90vw", maxHeight: "90vh", display: "block" }}
          />
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setFullScreenImage(null)}
          >
            <Close />
          </IconButton>
        </DialogContent>
      </Dialog>

      <CroppingDialog
        open={croppingModalOpen}
        onClose={handleCloseCroppingDialog}
        images={localFiles}
        onComplete={handleCroppingComplete}
        aspect={1}
        principalExists={alreadyHasPrincipal}
      />
    </Paper>
  );
}
