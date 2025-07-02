import React, { useState, useMemo } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { ClientsProvider, useClients } from "../hooks/context/useClients";
import {
  Add,
  Cancel,
  Close,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Save,
} from "@mui/icons-material";
import { GenericDataGrid } from "../components/Table/GenericDataGrid";

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

  const [isFullScreen, setIsFullScreen] = useState(false);

  const columns = useMemo(
    () => [
      {
        accessor: "cod_client",
        header: "Código Cliente",
        width: 150,
      },
      {
        accessor: "razon_soci",
        header: "Razón Social",
        flex: 1,
        minWidth: 200,
      },
      {
        accessor: "identiftri",
        header: "Identificador Fiscal",
        minWidth: 180,
      },
      {
        accessor: "username",
        header: "Usuario",
        minWidth: 150,
      },
      {
        accessor: "active",
        header: "Activo",
        minWidth: 100,
        render: (row) => (row.active ? "Sí" : "No"),
      },
      {
        accessor: "createdAt",
        header: "Fecha de Creación",
        width: 180,
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
    ],
    []
  );

  const handleToggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  const ToolbarButtons = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2}>
          <IconButton onClick={fetchClients}>
            <Refresh />
          </IconButton>
          <IconButton onClick={handleToggleFullScreen}>
            {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Cancel />}>
            Cancelar Edición
          </Button>
          <Button variant="contained" color="success" startIcon={<Save />}>
            Guardar Cambios
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Crear cliente
          </Button>
        </Stack>
      </Box>
    );
  };

  const containerSx = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: 2,
      ...(isFullScreen
        ? {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "background.paper",
            zIndex: 1300,
            padding: "16px",
            boxSizing: "border-box",
          }
        : {
            mt: 2,
          }),
    }),
    [isFullScreen]
  );

  return (
    <PageContainer maxWidth={false}>
      <Box sx={containerSx}>
        <ToolbarButtons />
        <GenericDataGrid
          data={clients}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          sort={sort}
          onSortChange={handleSortChange}
          isFullScreen={isFullScreen}
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
      </Box>
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
