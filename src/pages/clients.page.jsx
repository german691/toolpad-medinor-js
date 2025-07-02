import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { ClientsProvider, useClients } from "../hooks/context/useClients";
import { useEffect } from "react";
import { GenericTable } from "../components/Table/GenericTable";
import { Close } from "@mui/icons-material";

export function ClientsPage() {
  const {
    clients,
    pagination,
    loading,
    error,
    sort,
    fetchClients,
    setPage,
    setLimit,
    setSort,
    clearError,
  } = useClients();

  const columns = [
    {
      accessor: "cod_client",
      header: "Código Cliente",
      sortable: true,
      align: "center",
    },
    { accessor: "razon_soci", header: "Razón Social", sortable: true },
    { accessor: "identiftri", header: "Identificador Fiscal", sortable: true },
    { accessor: "username", header: "Usuario", sortable: true },
    {
      accessor: "active",
      header: "Activo",
      sortable: true,
      render: (row) => (row.active ? "Sí" : "No"),
      align: "center",
    },
    {
      accessor: "createdAt",
      header: "Fecha de Creación",
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  useEffect(() => {
    fetchClients();
    console.log(clients);
  }, [fetchClients]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  return (
    <PageContainer maxWidth={false}>
      <>
        <GenericTable
          data={clients}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {error && (
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={clearError}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>
              {error?.message ||
                "Ocurrió un error inesperado al cargar los clientes."}
            </AlertTitle>
          </Alert>
        )}
      </>
    </PageContainer>
  );
}

export default function clientsWrapper() {
  return (
    <ClientsProvider>
      <ClientsPage />
    </ClientsProvider>
  );
}
