import React, { useState, useMemo, useCallback } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useCRUD } from "../../hooks/context/useCRUD";
import {
  Add,
  Cancel,
  Close,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Save,
} from "@mui/icons-material";
import { GenericDataGrid } from "../Table/GenericDataGrid";

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
  } = useCRUD();

  /* Manejo de pantalla completa
   */
  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleToggleFullScreen = () => setIsFullScreen((prev) => !prev);

  // estados para edición de fila
  const [hasChanges, setHasChanges] = useState(false);
  const [modifiedRows, setModifiedRows] = useState({});

  const handleDataGridCancelChanges = useCallback(() => {
    setHasChanges(false);
    setModifiedRows({});
  });

  const handleDataGridEditChange = useCallback((newRow, oldRow) => {
    const hasRowChanged = JSON.stringify(newRow) !== JSON.stringify(oldRow);
    if (hasRowChanged) {
      setHasChanges(true);
      setModifiedRows((prevModifiedRows) => ({
        ...prevModifiedRows,
        [newRow._id]: newRow,
      }));
    }
  }, []);

  const handleSaveWrapper = useCallback(async () => {
    if (onUpdate) {
      console.log(
        "datos impresos desde wrapper: ",
        Object.values(modifiedRows)
      );
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
        <IconButton onClick={fetchItems}>
          <Refresh />
        </IconButton>
        <IconButton onClick={handleToggleFullScreen}>
          {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
        <IconButton
          onClick={handleDataGridCancelChanges}
          disabled={!hasChanges}
        >
          <Cancel />
        </IconButton>
        <IconButton onClick={handleSaveWrapper} disabled={!hasChanges}>
          <Save />
        </IconButton>
      </Stack>
      <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
        Crear {entityName}
      </Button>
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
          // el handler para que actúe al editar
          onEditChange={handleDataGridEditChange}
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
                `Ocurrió un error inesperado al cargar los ${entityName}s.`}
            </AlertTitle>
          </Alert>
        )}
      </Box>
    </PageContainer>
  );
}
