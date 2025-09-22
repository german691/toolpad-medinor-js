import { createContext, useState, useContext } from "react";
import { processClientFile } from "../../func/onClientFileAccepted";
import { api } from "../../api";

const ClientMigrationContext = createContext(null);

export const useClientMigrationContext = () => {
  const context = useContext(ClientMigrationContext);
  if (!context) {
    throw new Error(
      "useClientMigrationContext debe ser usado dentro de un ClientMigrationProvider"
    );
  }
  return context;
};

// Campos seleccionables por el usuario (front). El back valida su propia whitelist.
const DEFAULT_REPLACE_FIELDS = {
  RAZON_SOCI: true,
  IDENTIFTRI: true,
  LEVEL: false, // por defecto desmarcado
};

export function ClientMigrationProvider({ children }) {
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Flags
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [replaceFields, setReplaceFields] = useState(DEFAULT_REPLACE_FIELDS);

  const getSelectedFieldKeys = () =>
    Object.entries(replaceFields)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);

  const handleFileAccepted = async (file) => {
    setIsLoadingFile(true);
    setError(null);
    setParsedData(null);
    try {
      const data = await processClientFile(file);
      setParsedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const compareFields = getSelectedFieldKeys();
      const response = await api.post("/clients/analyze", {
        clients: parsedData,
        compareFields, // el back usará sólo los permitidos
      });
      setProcessedData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `${err}`;
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeMigration = async () => {
    if (!processedData) {
      setError("No hay datos procesados para migrar.");
      return;
    }
    setIsConfirming(true);
    setError(null);
    try {
      const fieldsToReplace = getSelectedFieldKeys();
      const response = await api.post("/clients/make-migration", {
        ...processedData,
        replaceExisting,
        fieldsToReplace, // el back usará sólo los permitidos
      });

      const createdCount =
        response.data?.data?.createdCount ??
        processedData.data.newClients.length;

      const modifiedCount = response.data?.data?.modifiedCount ?? 0;

      setProcessedData((prev) =>
        prev ? { ...prev, createdCount, modifiedCount } : null
      );
      setMigrationComplete(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al guardar los datos en la base de datos.";
      setError(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClear = () => {
    setParsedData(null);
    setError(null);
    setIsLoadingFile(false);
    setProcessedData(null);
    setMigrationComplete(false);
    setIsProcessing(false);
    setIsConfirming(false);
    setReplaceExisting(false);
    setReplaceFields(DEFAULT_REPLACE_FIELDS);
  };

  const onErrorClose = () => setError(null);

  const value = {
    parsedData,
    error,
    isLoadingFile,
    isProcessing,
    isConfirming,
    processedData,
    migrationComplete,
    handleFileAccepted,
    handleProcess,
    executeMigration,
    handleClear,
    onErrorClose,
    replaceExisting,
    setReplaceExisting,
    replaceFields,
    setReplaceFields,
  };

  return (
    <ClientMigrationContext.Provider value={value}>
      {children}
    </ClientMigrationContext.Provider>
  );
}
