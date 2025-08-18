import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  CheckCircle,
  Cancel,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { uploadImagesByCode } from "../../services/imageService";

function ImageViewer({ open, imageUrl, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <img
        src={imageUrl}
        alt="Preview"
        style={{ maxWidth: "100%", maxHeight: "80vh" }}
      />
    </Dialog>
  );
}

export default function UploadByCodeDialog({
  open,
  onClose,
  onUploadComplete,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [showFailedDetails, setShowFailedDetails] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const processedFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        code: file.name.replace(/\.[^/.]+$/, ""),
      })
    );
    setFiles(processedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const handleUpload = async () => {
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadImagesByCode(files);
      setUploadResult(result.data);
    } catch (error) {
      console.error("Error en la subida masiva:", error);
      setUploadResult({
        successfulUploads: 0,
        failedUploads: files.length,
        details: files.map((f) => ({
          file: f.name,
          status: "error",
          message: error.message || "Error de conexión",
        })),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setUploadResult(null);
    setShowFailedDetails(false);
    onClose();
    if (uploadResult?.successfulUploads > 0) {
      onUploadComplete();
    }
  };

  const handleViewImage = (url) => setViewingImage(url);
  const handleCloseViewer = () => setViewingImage(null);

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Añadir Imágenes por Código de Producto</DialogTitle>
        <DialogContent dividers>
          {!uploadResult && (
            <Box>
              {files.length < 1 && (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: "2px dashed grey",
                    borderRadius: 2,
                    p: 4,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isDragActive ? "action.hover" : "transparent",
                    mb: files.length > 0 ? 2 : 0,
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 48, color: "text.secondary" }} />
                  <Typography>
                    {isDragActive
                      ? "Suelta las imágenes aquí..."
                      : "Arrastra y suelta las imágenes aquí, o haz clic para seleccionarlas"}
                  </Typography>
                  <Typography variant="caption">
                    El nombre de cada archivo debe ser el código del producto
                    (ej: "COD123.jpg")
                  </Typography>
                </Box>
              )}

              {files.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{ p: 1, maxHeight: "40vh", overflowY: "auto" }}
                >
                  <Grid container spacing={2}>
                    {files.map((file, index) => (
                      <Grid item xs={4} sm={3} md={2} key={file.name + index}>
                        <Box sx={{ textAlign: "center" }}>
                          <img
                            src={file.preview}
                            alt={file.name}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewImage(file.preview)}
                          />
                          <Typography variant="caption" display="block" noWrap>
                            {file.code}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Box>
          )}

          {uploading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
                flexDirection: "column",
              }}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Subiendo imágenes...</Typography>
            </Box>
          )}

          {uploadResult && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Proceso Terminado</Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ my: 2 }}
              >
                <Chip
                  icon={<CheckCircle />}
                  label={`Éxito: ${uploadResult.successfulUploads}`}
                  color="success"
                />
                <Chip
                  icon={<Cancel />}
                  label={`Fallaron: ${uploadResult.failedUploads}`}
                  color="error"
                />
              </Stack>
              {uploadResult.failedUploads > 0 && (
                <Box>
                  <Button
                    onClick={() => setShowFailedDetails(!showFailedDetails)}
                    endIcon={
                      <ExpandMoreIcon
                        sx={{
                          transform: showFailedDetails
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "0.2s",
                        }}
                      />
                    }
                  >
                    Ver detalles de errores
                  </Button>
                  <Collapse in={showFailedDetails}>
                    <Paper
                      variant="outlined"
                      sx={{
                        maxHeight: 200,
                        overflow: "auto",
                        mt: 1,
                        textAlign: "left",
                      }}
                    >
                      <List dense>
                        {uploadResult.details
                          .filter((d) => d.status === "error")
                          .map((detail, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={detail.file}
                                secondary={detail.message}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Paper>
                  </Collapse>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!uploadResult ? (
            <>
              <Button onClick={handleClose} disabled={uploading}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                variant="contained"
                disabled={files.length === 0 || uploading}
              >
                {uploading ? (
                  <CircularProgress size={24} />
                ) : (
                  `Subir ${files.length} Imágenes`
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Cerrar</Button>
          )}
        </DialogActions>
      </Dialog>
      <ImageViewer
        open={!!viewingImage}
        imageUrl={viewingImage}
        onClose={handleCloseViewer}
      />
    </>
  );
}
