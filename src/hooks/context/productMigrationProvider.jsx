import { createContext, useState, useContext } from "react";
import { processProductFile } from "../../func/onProductFileAccept";
import { api } from "../../api";

const ProductMigrationContext = createContext(null);

export const useProductMigrationContext = () => {
  const context = useContext(ProductMigrationContext);
  if (!context) {
    throw new Error(
      "useProductMigrationContext debe ser usado dentro de un ProductMigrationProvider"
    );
  }
  return context;
};

export function ProductMigrationProvider({ children }) {
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
    setProcessedData(null);
    setMigrationComplete(false);
    setIsProcessing(false);
    setIsConfirming(false);
    try {
      const data = await processProductFile(file);
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
      const response = await api.post("/products/analyze", {
        products: parsedData,
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
    if (
      !processedData ||
      !processedData.data.productsReadyForMigration ||
      processedData.data.productsReadyForMigration.length === 0
    ) {
      setError("No hay nuevos productos válidos para migrar.");
      return;
    }

    setIsConfirming(true);
    setError(null);
    try {
      const response = await api.post("/products/make-migration", {
        productsToMigrate: processedData.data.productsReadyForMigration,
      });

      const createdCount =
        response.data?.data?.createdCount ??
        processedData.data.productsReadyForMigration.length;

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
    <ProductMigrationContext.Provider value={value}>
      {children}
    </ProductMigrationContext.Provider>
  );
}
