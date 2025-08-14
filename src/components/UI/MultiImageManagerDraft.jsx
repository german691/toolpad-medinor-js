import React, { useCallback, useState } from "react";
import { Box, Typography, Button, Grid, Badge, Paper } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { AddPhotoAlternate } from "@mui/icons-material";

import SelectionDialog from "./SelectionDialog";
import CroppingDialog from "./CroppingDialog";

export default function MultiImageManager({ disabled }) {
  const [images, setImages] = useState([]);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [croppingModalOpen, setCroppingModalOpen] = useState(false);

  const handleReset = () => {
    images.forEach((img) => {
      if (img.originalSrc) URL.revokeObjectURL(img.originalSrc);
      if (img.croppedSrc && img.croppedSrc.startsWith("blob:")) {
        URL.revokeObjectURL(img.croppedSrc);
      }
    });
    setImages([]);
    setSelectionModalOpen(false);
    setCroppingModalOpen(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      const newImages = acceptedFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        originalSrc: URL.createObjectURL(file),
        role: null,
        croppedSrc: null,
      }));
      setImages(newImages);
      setSelectionModalOpen(true);
    }
  }, []);

  const handleSelectionComplete = ({ primaryId, workflowChoice }) => {
    const imagesWithRoles = images.map((img) => ({
      ...img,
      role: img.id === primaryId ? "principal" : "secundaria",
    }));

    setImages(imagesWithRoles);
    setSelectionModalOpen(false);

    if (workflowChoice === "crop") {
      setCroppingModalOpen(true);
    } else if (workflowChoice === "save") {
      const finalImages = imagesWithRoles.map((img) => ({
        ...img,
        croppedSrc: img.originalSrc,
      }));
      setImages(finalImages);
    }
  };

  const handleCroppingComplete = (processedImages) => {
    setImages(processedImages);
    setCroppingModalOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
  });

  const croppedImages = images.filter((img) => img.croppedSrc);

  const dropzoneStyles = {
    display: "flex",
    width: "100%",
    padding: 2,
    borderRadius: 3,
    height: "auto",
    minHeight: "150px",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    fontWeight: 600,
    border: `2px dashed ${
      disabled ? "#9e9e9e" : isDragActive ? "#4caf50" : "gray"
    }`,
    color: disabled ? "#9e9e9e" : isDragActive ? "#4caf50" : "gray",
    backgroundColor: disabled
      ? "#eeeeee"
      : isDragActive
        ? "#c8e6c963"
        : "#d3d3d325",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .24s ease-in-out",
  };

  return (
    <Box>
      {croppedImages.length === 0 ? (
        <Box {...getRootProps()} sx={dropzoneStyles}>
          <input {...getInputProps()} />
          <AddPhotoAlternate sx={{ fontSize: 40, mb: 1 }} />
          <Typography>Agregar Imágenes</Typography>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 500 }}>
            Imágenes Cargadas
          </Typography>
          <Box sx={{ flex: 1, overflow: "auto", maxHeight: "60vh" }}>
            <Grid container spacing={1}>
              {croppedImages.map((img) => (
                <Grid item key={img.id} xs={6}>
                  <Box sx={{ display: "flex", position: "relative" }}>
                    <img
                      src={img.croppedSrc}
                      alt="thumbnail"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        outline: "1px solid rgba(0, 0, 0, 0.1)",
                        outlineOffset: "-1px",
                      }}
                    />
                    <Badge
                      color={img.role === "principal" ? "primary" : "secondary"}
                      anchorOrigin={{ vertical: "top", horizontal: "left" }}
                      badgeContent={
                        img.role === "principal" ? "Principal" : "Secundario"
                      }
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        "& .MuiBadge-badge": {
                          transform: "none",
                          borderRadius: "6px",
                          padding: "0 6px",
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Button
            onClick={handleReset}
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
          >
            Limpiar
          </Button>
        </Paper>
      )}

      {/* Se completan las props de los diálogos para conectarlos al estado */}
      <SelectionDialog
        open={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        images={images}
        onComplete={handleSelectionComplete}
      />
      <CroppingDialog
        open={croppingModalOpen}
        onClose={() => setCroppingModalOpen(false)}
        images={images}
        onComplete={handleCroppingComplete}
        aspect={1 / 1}
      />
    </Box>
  );
}
