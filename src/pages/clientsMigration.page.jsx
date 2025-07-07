import { Box, Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core";

import LoadingOverlay from "../components/UI/LoadingOverlay";
import ClientMigrationComponent from "../components/Migration/ClientMigrationComponent";
import {
  ClientMigrationProvider,
  useClientMigrationContext,
} from "../hooks/context/clientMigrationProvider";

function ClientsView() {
  const { isLoadingFile, isProcessing, isConfirming } =
    useClientMigrationContext();
  return (
    <Box sx={{ position: "relative", minHeight: "400px" }}>
      <LoadingOverlay open={isLoadingFile || isProcessing || isConfirming} />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Utilice el panel inferior para cargar un archivo con la información de
        sus productos. El sistema validará los datos, eliminará duplicados y
        mostrará los resultados. Posteriormente, podrá gestionar los productos
        recientemente cargados.
      </Typography>
      <ClientMigrationComponent />
    </Box>
  );
}

export default function ClientMigrationPage() {
  return (
    <PageContainer>
      <ClientMigrationProvider>
        <ClientsView />
      </ClientMigrationProvider>
    </PageContainer>
  );
}
