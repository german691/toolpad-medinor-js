import { Box, Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core";

import LoadingOverlay from "../components/UI/LoadingOverlay";
import {
  ProductMigrationProvider,
  useProductMigrationContext,
} from "../hooks/context/productMigrationProvider";
import ProductMigrationComponent from "../components/Migration/ProductMigrationComponent";

function ProductsView() {
  const { isLoadingFile, isProcessing, isConfirming } =
    useProductMigrationContext();
  return (
    <Box sx={{ position: "relative", minHeight: "400px" }}>
      <LoadingOverlay open={isLoadingFile || isProcessing || isConfirming} />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Utilice el panel inferior para cargar un archivo con la información de
        sus productos. El sistema validará los datos, eliminará duplicados y
        mostrará los resultados. Posteriormente, podrá gestionar los productos
        recientemente cargados.
      </Typography>
      <ProductMigrationComponent />
    </Box>
  );
}

export default function ProductMigrationPage() {
  return (
    <PageContainer>
      <ProductMigrationProvider>
        <ProductsView />
      </ProductMigrationProvider>
    </PageContainer>
  );
}
