import React, { useState, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useCRUD } from "../../hooks/context/useCRUD";
import {
  Add,
  Cancel,
  Fullscreen,
  FullscreenExit,
  LockReset,
  Refresh,
  Save,
} from "@mui/icons-material";
import { GenericDataGrid } from "../Table/GenericDataGrid";
import Searchbox from "../UI/Searchbox";
import { restoreClientPassword } from "../../services/clientService";

export function GenericCRUDPage({
  columns,
  entityName,
  onAdd,
  onUpdate,
  selectionModel,
  onSelectionChange,
  isClientPage = false,
}) {
  const {
    items,
    pagination,
    loading,
    error,
    sort,
    fetchItems,
    setPage,
    setLimit,
    setSort,
    clearError,
    setSearch,
    setFilters,
  } = useCRUD();

  const [filterModel, setFilterModel] = useState({ items: [] });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleToggleFullScreen = () => setIsFullScreen((prev) => !prev);

  const [hasChanges, setHasChanges] = useState(false);
  const [modifiedRows, setModifiedRows] = useState({});
  const [customError, setCustomError] = useState(null);
  const [isRestPwdDialogOpen, setRestPwdDialogOpen] = useState(false);

  const handleCloseRestPwdDialog = () => {
    setRestPwdDialogOpen(false);
  };

  const handleOpenRestPwdDialog = () => {
    setRestPwdDialogOpen(true);
  };

  const handleRefresh = useCallback(() => {
    setSearch("");
  }, [setSearch]);

  const handleDataGridCancelChanges = useCallback(() => {
    setHasChanges(false);
    setModifiedRows({});
    fetchItems();
  }, [fetchItems]);

  const handleDataGridEditChange = useCallback((newRow, oldRow) => {
    const hasRowChanged = JSON.stringify(newRow) !== JSON.stringify(oldRow);
    if (hasRowChanged) {
      setHasChanges(true);
      setModifiedRows((prev) => ({
        ...prev,
        [newRow._id]: newRow,
      }));
    }
  }, []);

  const handleSaveWrapper = useCallback(async () => {
    if (onUpdate) {
      onUpdate(Object.values(modifiedRows));
      setHasChanges(false);
      setModifiedRows({});
    }
  }, [onUpdate, modifiedRows]);

  const handleFilterModelChange = useCallback(
    (newModel) => {
      setFilterModel(newModel);

      const newFilters = newModel.items.reduce((acc, item) => {
        if (item.value) {
          acc[item.field] = item.value;
        }
        return acc;
      }, {});

      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleResetPassword = async () => {
    const selectedCount = selectionModel?.ids?.size ?? 0;
    if (selectedCount !== 1) {
      setCustomError("Ocurrió un problema al seleccionar cliente");
      handleCloseRestPwdDialog();
      return;
    }
    try {
      const selectedId = Array.from(selectionModel.ids)[0];
      await restoreClientPassword(selectedId);
      handleCloseRestPwdDialog();
    } catch (error) {
      setCustomError("Error inesperado al restaurar contraseña del cliente");
      throw error;
    }
  };

  const mergedData = useMemo(() => {
    if (!items) return [];
    return items.map((row) => modifiedRows[row._id] || row);
  }, [items, modifiedRows]);

  const ToolbarButtons = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Dialog open={isRestPwdDialogOpen} onClose={handleCloseRestPwdDialog}>
        <DialogTitle>{"Restaurar contraseña"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Al hacer click en confirmar, el cliente volverá a tener como
            contraseña el "identiftri" inicial
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestPwdDialog}>Cancelar</Button>
          <Button onClick={handleResetPassword} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Actualizar" arrow>
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pantalla completa" arrow>
          <IconButton onClick={handleToggleFullScreen}>
            {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancelar" arrow>
          <IconButton
            onClick={handleDataGridCancelChanges}
            disabled={!hasChanges}
          >
            <Cancel />
          </IconButton>
        </Tooltip>
        <Tooltip title="Guardar cambios" arrow>
          <IconButton onClick={handleSaveWrapper} disabled={!hasChanges}>
            <Save />
          </IconButton>
        </Tooltip>
        {isClientPage && (
          <Tooltip title="Restaurar Contraseña" arrow>
            <IconButton
              onClick={handleOpenRestPwdDialog}
              disabled={
                !selectionModel || (selectionModel.ids?.size ?? 0) !== 1
              }
            >
              <LockReset />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Stack direction="row" spacing={2}>
        <Searchbox setSearch={setSearch} />
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Crear {entityName}
        </Button>
      </Stack>
    </Box>
  );

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
        : { mt: 2 }),
    }),
    [isFullScreen]
  );

  return (
    <PageContainer maxWidth={false}>
      <Box sx={containerSx}>
        <ToolbarButtons />
        <GenericDataGrid
          data={mergedData}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
          sort={sort}
          onSortChange={setSort}
          isFullScreen={isFullScreen}
          onEditChange={handleDataGridEditChange}
          fetchItems={fetchItems}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          selectionModel={selectionModel}
          onSelectionChange={onSelectionChange}
        />
        <Snackbar
          open={error || customError}
          autoHideDuration={6000}
          onClose={clearError}
        >
          <Alert severity="error" onClose={clearError} sx={{ width: "100%" }}>
            {error?.message || customError}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
