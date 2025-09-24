import { useCallback, useMemo } from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function CsvDropzone({ context }) {
  const { handleFileAccepted, isLoadingFile } = context();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length) handleFileAccepted(acceptedFiles[0]);
    },
    [handleFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    disabled: isLoadingFile,
  });

  const state = useMemo(
    () => (isLoadingFile ? "loading" : isDragActive ? "active" : "idle"),
    [isLoadingFile, isDragActive]
  );

  return (
    <Box
      {...getRootProps()}
      sx={(theme) => ({
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        borderRadius: 3,
        p: { xs: 4, sm: 6 },
        minHeight: 320,
        cursor: isLoadingFile ? "default" : "pointer",
        border: "2px dashed",
        borderColor:
          state === "active"
            ? theme.palette.success.main
            : theme.palette.primary.main,
        color:
          state === "active"
            ? theme.palette.success.main
            : theme.palette.primary.main,
        background:
          state === "active"
            ? theme.palette.success.main + "14"
            : theme.palette.primary.main + "0A",
        transition: "all .2s ease",
        boxShadow:
          state === "active"
            ? "0 6px 24px rgba(0,0,0,.08)"
            : "0 4px 18px rgba(0,0,0,.06)",
        "&:hover": {
          boxShadow: isLoadingFile ? undefined : "0 10px 30px rgba(0,0,0,.10)",
          transform: isLoadingFile ? undefined : "translateY(-1px)",
        },
        opacity: isLoadingFile ? 0.75 : 1,
      })}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 56 }} />
      <Typography variant="h6">
        {isLoadingFile
          ? "Procesando archivo..."
          : isDragActive
            ? "Soltá el archivo aquí"
            : "Arrastrá tu archivo o hacé clic"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Formatos aceptados
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip size="small" label=".csv" />
        <Chip size="small" label=".xls" />
        <Chip size="small" label=".xlsx" />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Máximo 1 archivo por vez
      </Typography>
    </Box>
  );
}
