import { useMemo, useCallback, useState, useEffect } from "react";
import { PageContainer } from "@toolpad/core";
import { DataGrid } from "@mui/x-data-grid";
import {
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import Searchbox from "../components/UI/Searchbox";
import { CustomNoRowsOverlay } from "../components/Table/GenericDataGrid";
import { getOrders } from "../services/orderService";
import { CRUDProvider, useCRUD } from "../hooks/context/useCRUD";
import { useNavigate } from "react-router-dom";
import { esES } from "@mui/x-data-grid/locales";

export default function OrdersPageWrapper() {
  return (
    <CRUDProvider services={{ getItems: getOrders }}>
      <OrdersPage />
    </CRUDProvider>
  );
}

export function OrdersPage() {
  const {
    items: orders,
    pagination,
    loading,
    error,
    sort,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setFilters,
  } = useCRUD();

  const [isFilteringBy, setFilteringBy] = useState("");

  const navigate = useNavigate();

  const handleRowClick = (params) => {
    navigate(`/orders/manage/${params.row._id}`);
  };

  const handleRefresh = useCallback(() => {
    setSearch("");
  }, [setSearch]);

  const handleChangeFilters = (event) => {
    setFilters({ closed: event.target.value });
    setFilteringBy(event.target.value);
  };

  const columns = useMemo(
    () => [
      {
        field: "orderNumber",
        headerName: "Nº Pedido",
        width: 100,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "client",
        headerName: "Cliente",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => params.value?.razon_soci || "N/A",
      },
      {
        field: "items",
        headerName: "Items",
        width: 80,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => {
          const totalQuantity =
            params.row.items?.reduce(
              (total, item) => total + item.quantity,
              0
            ) || 0;
          return totalQuantity;
        },
      },
      {
        field: "createdAt",
        headerName: "Fecha Creación",
        width: 150,
        renderCell: (params) => {
          const dateValue = params.row.createdAt;
          if (!dateValue) return "";
          const date = new Date(dateValue);
          return isNaN(date.getTime())
            ? "Fecha Inválida"
            : date.toLocaleDateString("es-AR");
        },
      },
      {
        field: "closed",
        headerName: "Estado",
        width: 120,
        renderCell: (params) => (
          <Typography
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              fontSize: 14,
            }}
          >
            {params.value ? "Cerrado" : "Pendiente"}
          </Typography>
        ),
      },
      {
        field: "totalWithDiscount",
        headerName: "Monto Total",
        width: 150,
        type: "number",
        renderCell: (params) =>
          `$ ${params.value.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
    ],
    []
  );

  const handleSortModelChange = (model) =>
    setSort(
      model.length > 0 ? { key: model[0].field, direction: model[0].sort } : {}
    );
  const sortModel = useMemo(
    () => (sort?.key ? [{ field: sort.key, sort: sort.direction }] : []),
    [sort]
  );

  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== (pagination?.limit || 25))
      setLimit(newModel.pageSize);
    if (newModel.page !== (pagination?.page - 1 || 0))
      setPage(newModel.page + 1);
  };
  const paginationModel = {
    page: (pagination?.page || 1) - 1,
    pageSize: pagination?.limit || 25,
  };

  return (
    <PageContainer maxWidth={false}>
      <Stack direction="row" sx={{ mb: 2 }} justifyContent={"space-between"}>
        <Stack direction="row" gap={1}>
          <Searchbox
            setSearch={setSearch}
            placeholder="Buscar por cliente..."
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Filtrar por:</InputLabel>
            <Select
              value={isFilteringBy}
              onChange={handleChangeFilters}
              label="Filtrar por:"
            >
              <MenuItem value={""}>Todos</MenuItem>
              <MenuItem value={"false"}>Pendientes</MenuItem>
              <MenuItem value={"true"}>Cerrados</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Actualizar" arrow>
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Paper
        sx={{
          height: "75vh",
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
        }}
        variant="outlined"
      >
        <DataGrid
          rows={orders || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          // --- manejo de paginación
          pagination
          paginationMode="server"
          rowCount={pagination?.total || 0}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[25, 50, 100]}
          // --- manejo de ordenamiento
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          // --- redirección
          onRowClick={handleRowClick}
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
            border: 0,
            "& .MuiDataGrid-row--selected": {
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.hover" },
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
          }}
          components={{
            NoRowsOverlay: () => (
              <CustomNoRowsOverlay
                message={
                  error
                    ? `Error: ${error.message}`
                    : "No se encontraron pedidos."
                }
              />
            ),
            LoadingOverlay: CircularProgress,
          }}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
      </Paper>
    </PageContainer>
  );
}
