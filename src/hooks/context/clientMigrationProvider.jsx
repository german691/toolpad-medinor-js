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

export function ClientMigrationProvider({ children }) {
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [migrationComplete, setMigrationComplete] = useState(false);

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
      const response = await api.post("/clients/analyze", {
        clients: parsedData,
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
      const response = await api.post("/clients/make-migration", processedData);

      const createdCount =
        response.data?.data?.createdCount ??
        processedData.data.newClients.length;

      setProcessedData((prev) => (prev ? { ...prev, createdCount } : null));
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
  };

  return (
    <ClientMigrationContext.Provider value={value}>
      {children}
    </ClientMigrationContext.Provider>
  );
}
