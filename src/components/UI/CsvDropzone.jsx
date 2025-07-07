import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";

export default function CsvDropzone({ context }) {
  const { handleFileAccepted, isLoadingFile } = context();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileAccepted(acceptedFiles[0]);
      }
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

  const isActive = isDragActive || isLoadingFile;

  return (
    <Box
      {...getRootProps()}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontWeight: 600,
        border: `2px dashed ${isActive ? "#4caf50" : "#1976d2"}`,
        padding: "2rem",
        textAlign: "center",
        borderRadius: "8px",
        color: isActive ? "#4caf50" : "#1976d2",
        background: isActive ? "#c8e6c999" : "#e3f2fd02",
        cursor: isLoadingFile ? "default" : "pointer",
        transition:
          "border .24s ease-in-out, background-color .24s ease-in-out",
        opacity: isLoadingFile ? 0.7 : 1,
        minHeight: "200px",
        mt: 4,
      }}
    >
      <input {...getInputProps()} />

      <Typography variant="body1">
        {isLoadingFile
          ? "Procesando archivo..."
          : isDragActive
            ? "¡Suelta el archivo aquí!"
            : "Arrastra un archivo (CSV, XLS, XLSX) aquí, o haz clic para seleccionarlo"}
      </Typography>
    </Box>
  );
}
