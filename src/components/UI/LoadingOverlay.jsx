import { Box, CircularProgress } from "@mui/material";

export default function LoadingOverlay({ open }) {
  if (!open) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.0)",
        zIndex: 10,
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
