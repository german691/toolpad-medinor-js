import React, { useState, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import { useCRUD } from "../../hooks/context/useCRUD";
import {
  Add,
  Cancel,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Save,
} from "@mui/icons-material";
import { GenericDataGrid } from "../Table/GenericDataGrid";
import Searchbox from "../UI/Searchbox";

export function GenericCRUDPage({ columns, entityName, onAdd, onUpdate }) {
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
  } = useCRUD();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleToggleFullScreen = () => setIsFullScreen((prev) => !prev);

  const [hasChanges, setHasChanges] = useState(false);
  const [modifiedRows, setModifiedRows] = useState({});

  const handleRefresh = useCallback(() => {
    setSearch("");
  }, [setSearch]);

  const handleDataGridCancelChanges = useCallback(() => {
    setHasChanges(false);
    setModifiedRows({});
  }, []);

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

  const ToolbarButtons = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
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
          data={items}
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
        />
        <Snackbar open={error} autoHideDuration={6000} onClose={clearError}>
          <Alert severity="error" onClose={clearError} sx={{ width: "100%" }}>
            {error?.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}
