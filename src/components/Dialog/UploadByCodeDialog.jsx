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
  List,
  ListItem,
  ListItemText,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { IconCloudUpload } from "@tabler/icons-react";
import { uploadImagesByCode } from "../../services/imageService";
import { createProductsByCode } from "../../services/productService";
import { IconCirclePlus, IconDeviceFloppy } from "@tabler/icons-react";

/** ---------- Utils ---------- */

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

/** Quita la extensión, TRIM al basename y devuelve el código limpio */
function extractCodeFromFilename(name) {
  const str = String(name || "");
  const lastDot = str.lastIndexOf(".");
  const base = lastDot > 0 ? str.slice(0, lastDot) : str;
  return base.trim(); // 👈 aquí está la magia
}

/** Recompone un nombre de archivo con el basename TRIMeado y la misma extensión */
function sanitizeFilename(name) {
  const str = String(name || "");
  const lastDot = str.lastIndexOf(".");
  if (lastDot <= 0) return str.trim(); // sin extensión o punto al inicio
  const base = str.slice(0, lastDot).trim(); // 👈 trim sólo al basename
  const ext = str.slice(lastDot); // conserva la extensión original (incluye el punto)
  return `${base}${ext}`;
}

/** Crea un File nuevo con el nombre saneado para que el backend reciba el nombre correcto */
function sanitizeFile(file) {
  const cleanName = sanitizeFilename(file.name);
  if (cleanName === file.name) return file; // ya está limpio, reusa el mismo objeto
  return new File([file], cleanName, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

const norm = (s) =>
  String(s || "")
    .trim()
    .toUpperCase();

export default function UploadByCodeDialog({
  open,
  onClose,
  onUploadComplete,
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creatingMissing, setCreatingMissing] = useState(false);
  const [reUploading, setReUploading] = useState(false);

  const [uploadResult, setUploadResult] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [viewingImage, setViewingImage] = useState(null);
  const [snackStatus, setSnackStatus] = useState({
    open: false,
    variant: "success",
    message: "",
  });

  const handleSetSnackStatus = (info) => setSnackStatus(info);

  /** -------- Dropzone -------- */
  const onDrop = useCallback((acceptedFiles) => {
    const processedFiles = acceptedFiles.map((raw) => {
      const file = sanitizeFile(raw);
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        code: extractCodeFromFilename(file.name),
      });
    });
    setFiles(processedFiles);
    setUploadResult(null);
    setCompleted(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const isBusy = uploading || creatingMissing || reUploading;
  const hasResult = !!uploadResult;
  const hasFailures = hasResult && uploadResult.failedUploads > 0;

  const canUpload = files.length > 0 && !isBusy && !hasResult;
  const canCreateAndReupload = hasFailures && !isBusy;
  const canFinish = !isBusy && (completed || (!files.length && !hasResult));

  /** -------- Handlers -------- */

  const handleUpload = async () => {
    setUploading(true);
    setUploadResult(null);
    setCompleted(false);
    try {
      const result = await uploadImagesByCode(files);
      setUploadResult(result.data);

      const allOk =
        result?.data?.failedUploads === 0 &&
        result?.data?.successfulUploads > 0;
      setCompleted(allOk);

      if (allOk) {
        handleSetSnackStatus({
          variant: "success",
          message: "Todas las imágenes fueron subidas exitosamente.",
          open: true,
        });
      } else if (result?.data?.failedUploads > 0) {
        handleSetSnackStatus({
          variant: "warning",
          message: `${result.data.failedUploads} imágenes fallaron. Podés crear los productos faltantes y reintentar.`,
          open: true,
        });
      }
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
      setCompleted(false);
      handleSetSnackStatus({
        variant: "error",
        message: "Error en la subida masiva.",
        open: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMissingProds = async () => {
    if (!uploadResult?.details?.length) return;

    const initialErrors = uploadResult.details.filter(
      (d) => d.status === "error"
    );

    const codesToCreate = Array.from(
      new Set(initialErrors.map((d) => norm(extractCodeFromFilename(d.file))))
    );
    if (codesToCreate.length === 0) return;

    try {
      setCreatingMissing(true);

      const response = await createProductsByCode(codesToCreate);
      const createdCodes = Array.isArray(response?.data?.items)
        ? response.data.items.map((p) => norm(p.code))
        : [];

      if (createdCodes.length === 0) {
        handleSetSnackStatus({
          variant: "warning",
          message:
            "No se recibieron códigos creados desde el backend (items vacío).",
          open: true,
        });
        return;
      }

      handleSetSnackStatus({
        variant: "success",
        message: `Productos creados: ${createdCodes.length}. Re-subiendo imágenes...`,
        open: true,
      });

      const createdSet = new Set(createdCodes);
      const filesToRetry = files.filter((f) => createdSet.has(norm(f.code)));

      if (filesToRetry.length === 0) {
        handleSetSnackStatus({
          variant: "warning",
          message:
            "No se encontraron imágenes que coincidan con los códigos creados.",
          open: true,
        });
        return;
      }

      // 4) Re-subir
      setReUploading(true);
      const reuploadRes = await uploadImagesByCode(filesToRetry);
      const reuploadData = reuploadRes?.data || {
        successfulUploads: 0,
        failedUploads: 0,
        details: [],
      };

      const initialSuccess = uploadResult.successfulUploads || 0;
      const reSuccess = reuploadData.successfulUploads || 0;

      const initialErrorsNotRetried = initialErrors.filter(
        (d) => !createdSet.has(norm(extractCodeFromFilename(d.file)))
      );

      const reuploadErrors = (reuploadData.details || []).filter(
        (d) => d.status === "error"
      );

      const finalSuccessful = initialSuccess + reSuccess;
      const finalErrorList = [...initialErrorsNotRetried, ...reuploadErrors];
      const finalFailed = finalErrorList.length;

      const finalResult = {
        successfulUploads: finalSuccessful,
        failedUploads: finalFailed,
        details: finalErrorList,
      };

      setUploadResult(finalResult);

      const allOk = finalFailed === 0 && finalSuccessful > 0;
      setCompleted(allOk);

      handleSetSnackStatus({
        variant: allOk ? "success" : "warning",
        message: allOk
          ? "Re-subida completada. Todo OK."
          : `Re-subida completada. Quedan ${finalFailed} fallas.`,
        open: true,
      });
    } catch (err) {
      console.error(err);
      handleSetSnackStatus({
        variant: "error",
        message:
          err?.message || "Error al crear faltantes o re-subir imágenes.",
        open: true,
      });
    } finally {
      setReUploading(false);
      setCreatingMissing(false);
    }
  };

  const handleExportCsv = () => {
    if (!uploadResult?.details?.length) return;
    const errorFiles = uploadResult.details; // ya son solo errores
    const codes = Array.from(
      new Set(
        errorFiles.map((d) => extractCodeFromFilename(d.file)).filter(Boolean)
      )
    );
    if (!codes.length) return;

    const csvContent = codes.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `codigos_fallidos_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (isBusy) return;
    const hadSuccess = uploadResult?.successfulUploads > 0;
    setFiles([]);
    setUploadResult(null);
    setCompleted(false);
    onClose();
    if (hadSuccess) onUploadComplete();
  };

  const handleViewImage = (url) => setViewingImage(url);
  const handleCloseViewer = () => setViewingImage(null);

  /** -------- Render -------- */

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Subir imágenes por código de producto</DialogTitle>

        <DialogContent dividers sx={{ px: 2 }}>
          {!hasResult && (
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
                  }}
                >
                  <input {...getInputProps()} />
                  <IconCloudUpload size={48} sx={{ color: "text.secondary" }} />
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
                <Box sx={{ p: 1, maxHeight: "40vh", overflowY: "auto" }}>
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
                </Box>
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

          {hasResult && (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography>
                  {completed
                    ? `Listo: ${uploadResult.successfulUploads} imágenes subidas correctamente.`
                    : uploadResult.failedUploads > 0
                      ? `${uploadResult.failedUploads} de ${
                          uploadResult.failedUploads +
                          uploadResult.successfulUploads
                        } imágenes han fallado:`
                      : "Todas las imágenes fueron subidas exitosamente."}
                </Typography>
              </Stack>

              {uploadResult.failedUploads > 0 && (
                <Box>
                  <Box
                    sx={{
                      maxHeight: "40vh",
                      overflow: "auto",
                      textAlign: "left",
                      mt: 0,
                    }}
                  >
                    <List dense>
                      {uploadResult.details.map((detail, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={detail.file}
                            secondary={detail.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        {/* -------- Acciones -------- */}
        <DialogActions>
          <Button onClick={handleClose} disabled={isBusy}>
            Cancelar
          </Button>

          {canUpload && (
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!canUpload}
            >
              {uploading ? (
                <CircularProgress size={24} />
              ) : (
                `Subir ${files.length} Imágenes`
              )}
            </Button>
          )}

          {canCreateAndReupload && (
            <>
              <Button
                onClick={handleCreateMissingProds}
                variant="outlined"
                disableElevation
                startIcon={<IconCirclePlus />}
                disabled={!canCreateAndReupload}
              >
                {creatingMissing || reUploading
                  ? "Procesando..."
                  : "Crear y subir imágenes"}
              </Button>
              <Button
                onClick={handleExportCsv}
                variant="outlined"
                disableElevation
                startIcon={<IconDeviceFloppy />}
                disabled={isBusy}
              >
                Exportar CSV
              </Button>
            </>
          )}

          {canFinish && (
            <Button
              onClick={handleClose}
              variant="contained"
              disableElevation
              disabled={!canFinish}
            >
              Finalizar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ImageViewer
        open={!!viewingImage}
        imageUrl={viewingImage}
        onClose={handleCloseViewer}
      />

      <Snackbar
        open={snackStatus.open}
        autoHideDuration={10000}
        onClose={() => setSnackStatus((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackStatus((s) => ({ ...s, open: false }))}
          severity={snackStatus.variant}
        >
          {snackStatus.message}
        </Alert>
      </Snackbar>
    </>
  );
}
