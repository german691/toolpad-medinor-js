import React, { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

const CustomNoRowsOverlay = ({ message }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      p: 2,
    }}
  >
    <Typography variant="body2">{message}</Typography>
  </Box>
);

export const GenericDataGrid = ({
  data,
  columns,
  loading,
  error,
  pagination,
  onPageChange,
  onLimitChange,
  sort,
  onSortChange,
  isFullScreen,
}) => {
  const gridColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        field: col.accessor,
        headerName: col.header,
        sortable: col.sortable,
        align: col.align || "left",
        headerAlign: col.align || "left",
        renderCell: col.render ? (params) => col.render(params.row) : undefined,
        type: col.type,
        width: col.width,
        minWidth: col.minWidth,
        flex: col.flex,
      })),
    [columns]
  );

  const handleSortModelChange = (model) => {
    if (!onSortChange) return;
    if (model.length === 0) {
      onSortChange({});
    } else {
      const { field, sort: direction } = model[0];
      onSortChange({ key: field, direction });
    }
  };

  const sortModel = React.useMemo(
    () => (sort && sort.key ? [{ field: sort.key, sort: sort.direction }] : []),
    [sort]
  );

  const noRowsMessage = error
    ? `Error: ${error.message || "Ocurrió un error al cargar los datos."}`
    : "No se encontraron resultados.";

  const paginationModel = {
    page: pagination ? pagination.page - 1 : 0,
    pageSize: pagination?.limit || 25,
  };

  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== paginationModel.pageSize) {
      onLimitChange(newModel.pageSize);
    }
    if (newModel.page !== paginationModel.page) {
      onPageChange(newModel.page + 1);
    }
  };

  const paperSx = useMemo(
    () => ({
      width: "100%",
      borderRadius: 3,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...(isFullScreen
        ? {
            flex: 1,
          }
        : {
            height: "72vh",
          }),
    }),
    [isFullScreen]
  );

  return (
    <Paper sx={paperSx} variant="outlined">
      <DataGrid
        rows={data || []}
        columns={gridColumns}
        getRowId={(row) => row.id || row.cod_client}
        loading={loading}
        components={{
          NoRowsOverlay: () => <CustomNoRowsOverlay message={noRowsMessage} />,
          LoadingOverlay: CircularProgress,
        }}
        pagination
        paginationMode="server"
        rowCount={pagination?.total || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[5, 10, 25, 50]}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        rowHeight={40}
        sx={{ border: 0, flex: 1 }}
      />
    </Paper>
  );
};
