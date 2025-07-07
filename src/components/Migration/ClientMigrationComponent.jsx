import { Alert } from "@mui/material";
import CsvDropzone from "../UI/CsvDropzone";
import ClientMigrationDataGrid from "../Table/ClientMigrationDataGrid";
import { useClientMigrationContext } from "../../hooks/context/clientMigrationProvider";

export default function ClientMigration() {
  const { error, parsedData, onErrorClose } = useClientMigrationContext();

  return (
    <>
      {error && (
        <Alert severity="error" onClose={onErrorClose} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {parsedData ? (
        <ClientMigrationDataGrid />
      ) : (
        <CsvDropzone context={() => useClientMigrationContext()} />
      )}
    </>
  );
}
