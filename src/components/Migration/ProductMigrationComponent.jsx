import { Alert } from "@mui/material";
import CsvDropzone from "../UI/CsvDropzone";
import ProductMigrationDataGrid from "../Table/ProductMigrationDataGrid";
import { useProductMigrationContext } from "../../hooks/context/productMigrationProvider";

export default function ProductMigrationComponent() {
  const { error, parsedData, onErrorClose } = useProductMigrationContext();

  return (
    <>
      {error && (
        <Alert severity="error" onClose={onErrorClose} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {parsedData ? (
        <ProductMigrationDataGrid />
      ) : (
        <CsvDropzone context={() => useProductMigrationContext()} />
      )}
    </>
  );
}
