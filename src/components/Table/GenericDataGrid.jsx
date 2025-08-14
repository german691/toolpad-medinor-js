import React, { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

export const CustomNoRowsOverlay = ({ message }) => (
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
  onEditChange,
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
        editable: col.editable,
        renderEditCell: col.renderEditCell,
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

  // --- Paginación

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

  /* MANEJO DE CAMBIO DE ESTADO AL EDITAR
   * Le notifica a GenericCRUDPage (componente padre)
   * que una fila fue editada
   *
   * es útil para manejar la lógica de guardado,
   * como por ejemplo, deshabilitar el botón de guardado
   * cuando todavía no hay filas editadas
   */
  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (onEditChange) {
      onEditChange(newRow, oldRow);
    }
    return newRow;
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
        getRowId={(row) => row._id}
        loading={loading}
        components={{
          NoRowsOverlay: () => <CustomNoRowsOverlay message={noRowsMessage} />,
          LoadingOverlay: CircularProgress,
        }}
        pagination
        paginationMode="server"
        rowCount={pagination?.total || 0}
        // --- manejo de paginación
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[25, 50, 100]}
        // --- manejo de ordenamiento
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        // --- manejo de edición
        editMode="row"
        processRowUpdate={handleProcessRowUpdate}
        //!!!!!
        // ver si se puede implementar con snackbar
        onProcessRowUpdateError={(error) => console.error(error)}
        // ---------------------------------------
        rowHeight={40}
        sx={{ border: 0, flex: 1 }}
      />
    </Paper>
  );
};
