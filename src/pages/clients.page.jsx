import { Box, Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { ClientsProvider, useClients } from "../hooks/context/useClients";
import { useEffect } from "react";
import { GenericTable } from "../components/Table/GenericTable";

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
      accessor: "must_change_password",
      header: "Cambiar Contraseña",
      sortable: true,
      render: (row) => (row.must_change_password ? "Sí" : "No"),
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
      <Typography variant="body1" color="text.secondary">
        Alta, Baja y Modificación de Clientes.
      </Typography>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "auto" }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            mb: 4,
            textAlign: "center",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Gestión de Clientes
        </Typography>

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
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              borderRadius: "8px",
              border: "1px solid #ef9a9a",
            }}
          >
            <Typography variant="body1">
              Error:{" "}
              {error.message ||
                "Ocurrió un error inesperado al cargar los clientes."}
            </Typography>
            <button
              onClick={clearError}
              style={{
                background: "none",
                border: "none",
                color: "#d32f2f",
                textDecoration: "underline",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Cerrar
            </button>
          </Box>
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
