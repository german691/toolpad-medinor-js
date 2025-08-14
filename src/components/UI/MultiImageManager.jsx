import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
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

import SelectionDialog from "./SelectionDialog";
import CroppingDialog from "./CroppingDialog";

export default function MultiImageManager({
  selectedProduct,
  existingImages = [],
  newImages = [],
  onProcessingComplete,
  onUpload,
  onDeleteExisting,
  onDeleteNew,
  isLoading,
  isUploading,
}) {
  const [localFiles, setLocalFiles] = useState([]);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [croppingModalOpen, setCroppingModalOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const allImages = useMemo(
    () => [
      ...existingImages.map((img) => ({
        ...img,
        id: img.id, // Corrección: Usar `img.id` de los datos de la API
        isNew: false,
        role: img.isMain ? "principal" : "secundaria",
      })),
      ...newImages.map((img) => ({
        ...img,
        isNew: true,
        isMain: img.role === "principal",
        role: img.role || "secundaria",
      })),
    ],
    [existingImages, newImages]
  );

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      handleResetLocal();
      const filesToProcess = acceptedFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        originalSrc: URL.createObjectURL(file),
        role: null,
        croppedSrc: null,
      }));
      setLocalFiles(filesToProcess);
      setSelectionModalOpen(true);
    }
  }, []);

  const handleSelectionComplete = ({ primaryId, workflowChoice }) => {
    const imagesWithRoles = localFiles.map((img) => ({
      ...img,
      role: img.id === primaryId ? "principal" : "secundaria",
    }));
    setLocalFiles(imagesWithRoles);
    setSelectionModalOpen(false);

    if (workflowChoice === "crop") {
      setCroppingModalOpen(true);
    } else if (workflowChoice === "save") {
      const imagesToSave = imagesWithRoles.map((img) => ({
        ...img,
        croppedSrc: img.originalSrc,
      }));

      console.log("Guardando directamente. Imágenes procesadas:", imagesToSave);

      onProcessingComplete(imagesToSave);
      handleResetLocal();
    }
  };

  const handleCroppingComplete = (processedImages) => {
    onProcessingComplete(processedImages);
    setCroppingModalOpen(false);
    handleResetLocal();
  };

  const handleResetLocal = () => {
    localFiles.forEach((img) => URL.revokeObjectURL(img.originalSrc));
    setLocalFiles([]);
    setSelectionModalOpen(false);
    setCroppingModalOpen(false);
  };

  const handleClearNewImages = () => {
    newImages.forEach((img) => onDeleteNew(img.id));
  };

  const handleImageClick = useCallback((imageSrc) => {
    setFullScreenImage(imageSrc);
  }, []);

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
  };

  if (!selectedProduct) {
    return (
      <Paper variant="outlined" sx={{ ...dropzoneStyles }}>
        <Typography variant="h6">Seleccione un Producto</Typography>
        <Typography variant="body2">
          Elija un producto de la tabla para ver y administrar sus imágenes.
        </Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper
        variant="outlined"
        sx={{ ...dropzoneStyles, cursor: "default", borderStyle: "solid" }}
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
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography sx={{ mb: 2, fontWeight: 500 }}>
          {selectedProduct.desc}
        </Typography>
        <Typography sx={{ color: "grey.800" }}>
          Imágenes: {allImages.length}
        </Typography>
      </Stack>

      {allImages.length === 0 ? (
        <Box {...getRootProps()} sx={dropzoneStyles}>
          <input {...getInputProps()} />
          <AddPhotoAlternate sx={{ fontSize: 48, mb: 1 }} />
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
            {allImages.map((img, index) => (
              <Box
                key={img.id || index}
                sx={{ position: "relative", cursor: "pointer" }}
                onClick={() =>
                  handleImageClick(img.isNew ? img.croppedSrc : img.url)
                }
              >
                <img
                  src={img.isNew ? img.croppedSrc : img.url}
                  alt={img.role || "Imagen de producto"}
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    borderRadius: "8px",
                    outline: "1px solid rgba(0,0,0,0.1)",
                    outlineOffset: "-1px",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    left: 6,
                    bgcolor: `${img.isMain ? "#1976d2" : "rgba(0,0,0,0.6)"}`,
                    color: "white",
                    px: 1,
                    py: "2px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                  }}
                >
                  {img.isMain ? "Principal" : "Secundaria"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    img.isNew ? onDeleteNew(img.id) : onDeleteExisting(img.id);
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(255,255,255,0.8)",
                    "&:hover": { bgcolor: "white" },
                  }}
                >
                  <Delete fontSize="small" color="#000" />
                </IconButton>
              </Box>
            ))}

            <Box
              {...getRootProps()}
              sx={{
                ...dropzoneStyles,
                aspectRatio: "1 / 1",
                border: "2px dashed",
                borderColor: "grey.500",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input {...getInputProps()} />
              <AddPhotoAlternate sx={{ fontSize: 32 }} />
              <Typography variant="caption">Añadir más</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
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
          onClick={handleClearNewImages}
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<HighlightOff />}
          disabled={newImages.length === 0 || isUploading}
        >
          Limpiar Nuevas
        </Button>
      </Box>

      <Dialog
        open={!!fullScreenImage}
        onClose={() => setFullScreenImage(null)}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            m: 2,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={fullScreenImage}
            alt="Imagen en pantalla completa"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "block",
              objectFit: "contain",
            }}
          />
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
            onClick={() => setFullScreenImage(null)}
          >
            <Close />
          </IconButton>
        </DialogContent>
      </Dialog>

      <SelectionDialog
        open={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        images={localFiles}
        onComplete={handleSelectionComplete}
      />
      <CroppingDialog
        open={croppingModalOpen}
        onClose={() => setCroppingModalOpen(false)}
        images={localFiles}
        onComplete={handleCroppingComplete}
        aspect={1 / 1}
      />
    </Paper>
  );
}
