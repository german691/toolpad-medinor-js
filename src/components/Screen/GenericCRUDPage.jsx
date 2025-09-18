import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useCRUD } from "../../hooks/context/useCRUD";
import {
  Add,
  Cancel,
  Delete,
  Fullscreen,
  FullscreenExit,
  LocalOffer,
  LockReset,
  Refresh,
  Save,
} from "@mui/icons-material";
import { GenericDataGrid } from "../Table/GenericDataGrid";
import Searchbox from "../UI/Searchbox";
import { restoreClientPassword } from "../../services/clientService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import {
  deleteProductOffer,
  setProductOffer,
} from "../../services/productService";

const toStartOfDayISO = (d) => dayjs(d).startOf("day").toISOString();
const toEndOfDayISO = (d) => dayjs(d).endOf("day").toISOString();
const getSelectedCount = (selectionModel) => selectionModel?.ids?.size ?? 0;
const getSingleSelectedId = (selectionModel) =>
  getSelectedCount(selectionModel) === 1 ? Array.from(selectionModel.ids)[0] : null;

const hasOfferField = (row) => !!row?.offer;

const getDisplayName = (row, { isProductPage, isClientPage }) => {
  if (!row) return "";
  if (isProductPage) return row.desc || row.code || row._id || "";
  if (isClientPage)
    return (
      row.razon_soci ||
      row.nickname ||
      row.identiftri ||
      ""
    );
  return row.desc || row.title || "";
};

export function GenericCRUDPage({
  columns,
  entityName,
  onAdd,
  onUpdate,
  selectionModel,
  onSelectionChange,
  isClientPage = false,
  isProductPage = false,
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
  const handleToggleFullScreen = useCallback(
    () => setIsFullScreen((prev) => !prev),
    []
  );

  const [modifiedRows, setModifiedRows] = useState({});
  const hasChanges = useMemo(
    () => Object.keys(modifiedRows).length > 0,
    [modifiedRows]
  );

  const [productHasOffer, setProductHasOffer] = useState(false);
  const [isRestPwdDialogOpen, setRestPwdDialogOpen] = useState(false);
  const [isClearOfferDialogOpen, setClearOfferDialogOpen] = useState(false);
  const [hasOfferActive, setOfferActive] = useState("any"); // any | true | false
  const [isOfferDialogOpen, setOfferDialogOpen] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    startsAt: toStartOfDayISO(new Date()),
    endsAt: toEndOfDayISO(dayjs().add(1, "day")),
    percent: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showSnack = useCallback((message, severity = "info") => {
    setSnack({ open: true, message, severity });
  }, []);
  const closeSnack = useCallback(
    () => setSnack((s) => ({ ...s, open: false })),
    []
  );

  const handleRefresh = useCallback(() => setSearch(""), [setSearch]);

  const handleDataGridCancelChanges = useCallback(() => {
    setModifiedRows({});
    fetchItems();
    showSnack("Cambios descartados", "info");
  }, [fetchItems, showSnack]);

  const handleDataGridEditChange = useCallback((newRow, oldRow) => {
    const hasRowChanged = JSON.stringify(newRow) !== JSON.stringify(oldRow);
    if (!hasRowChanged) return;
    setModifiedRows((prev) => ({
      ...prev,
      [newRow._id]: newRow,
    }));
  }, []);

  const handleSaveWrapper = useCallback(async () => {
    if (!onUpdate || !hasChanges) return;
    try {
      await onUpdate(Object.values(modifiedRows));
      setModifiedRows({});
      showSnack("Cambios guardados", "success");
    } catch (e) {
      showSnack(e?.message || "Error al guardar cambios", "error");
    }
  }, [onUpdate, modifiedRows, hasChanges, showSnack]);

  const handleFilterModelChange = useCallback(
    (newModel) => {
      setFilterModel(newModel);
      const newFilters = newModel.items.reduce((acc, item) => {
        if (item.value) acc[item.field] = item.value;
        return acc;
      }, {});
      setFilters(newFilters);
    },
    [setFilters]
  );

  const mergedAllData = useMemo(() => {
    if (!items) return [];
    return items.map((row) => modifiedRows[row._id] || row);
  }, [items, modifiedRows]);

  const filteredAndMergedData = useMemo(() => {
    let base = mergedAllData;
    if (hasOfferActive === "true") {
      base = base.filter(hasOfferField); 
    } else if (hasOfferActive === "false") {
      base = base.filter((r) => !hasOfferField(r)); 
    }
    return base;
  }, [mergedAllData, hasOfferActive]);

  const selectedRow = useMemo(() => {
    const selectedId = getSingleSelectedId(selectionModel);
    if (!selectedId) return null;
    return mergedAllData.find((r) => r._id === selectedId) || null;
  }, [selectionModel, mergedAllData]);

  useEffect(() => {
    setProductHasOffer(hasOfferField(selectedRow));
  }, [selectedRow]);

  const selectedRowName = useMemo(
    () => getDisplayName(selectedRow, { isProductPage, isClientPage }),
    [selectedRow, isProductPage, isClientPage]
  );

  const handleResetPassword = useCallback(async () => {
    const selectedId = getSingleSelectedId(selectionModel);
    if (!selectedId) {
      showSnack("Ocurrió un problema al seleccionar cliente", "warning");
      setRestPwdDialogOpen(false);
      return;
    }
    try {
      await restoreClientPassword(selectedId);
      setRestPwdDialogOpen(false);
      showSnack("Contraseña restaurada correctamente", "success");
    } catch (e) {
      showSnack("Error inesperado al restaurar contraseña del cliente", "error");
    }
  }, [selectionModel, showSnack]);

  const handleDeleteOffer = useCallback(async () => {
    const selectedId = getSingleSelectedId(selectionModel);
    if (!selectedId) {
      showSnack("Ocurrió un problema al seleccionar producto", "warning");
      setClearOfferDialogOpen(false);
      return;
    }
    try {
      await deleteProductOffer({ productId: selectedId });
      setClearOfferDialogOpen(false);
      showSnack("Oferta eliminada correctamente", "success");
      fetchItems();
    } catch (e) {
      showSnack("Error inesperado al eliminar la oferta", "error");
    }
  }, [selectionModel, showSnack, fetchItems]);

  const handleOpenOfferDialog = useCallback(() => setOfferDialogOpen(true), []);
  const handleCloseOfferDialog = useCallback(() => setOfferDialogOpen(false), []);
  const handleOfferActiveChange = useCallback((event) => {
    setOfferActive(event.target.value);
  }, []);

  const handleSetOffer = useCallback(
    async () => {
      const selectedId = getSingleSelectedId(selectionModel);
      if (!selectedId) {
        showSnack("Debes seleccionar exactamente 1 producto.", "warning");
        return;
      }
      const percentNum = offerForm.percent === "" ? NaN : Number(offerForm.percent);
      if (Number.isNaN(percentNum)) {
        showSnack("El porcentaje es requerido y debe ser numérico.", "warning");
        return;
      }
      if (percentNum < 0 || percentNum > 100) {
        showSnack("El porcentaje debe estar entre 0 y 100.", "warning");
        return;
      }
      if (!dayjs(offerForm.startsAt).isValid() || !dayjs(offerForm.endsAt).isValid()) {
        showSnack("Las fechas deben ser válidas (ISO 8601).", "warning");
        return;
      }
      const payload = {
        percent: Math.round(percentNum * 100) / 100,
        startsAt: toStartOfDayISO(offerForm.startsAt),
        endsAt: toEndOfDayISO(offerForm.endsAt),
      };
      if (!dayjs(payload.endsAt).isAfter(payload.startsAt)) {
        showSnack("La fecha de fin debe ser posterior a la de inicio.", "warning");
        return;
      }
      setIsSubmittingOffer(true);
      try {
        await setProductOffer({ productId: selectedId, offer: payload });
        handleCloseOfferDialog();
        await fetchItems();
        showSnack("Oferta aplicada", "success");
      } catch (e) {
        showSnack(e?.message || "Error inesperado al aplicar la oferta.", "error");
      } finally {
        setIsSubmittingOffer(false);
      }
    },
    [selectionModel, offerForm, fetchItems, showSnack, handleCloseOfferDialog]
  );

  const ToolbarButtons = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Dialog open={isRestPwdDialogOpen} onClose={() => setRestPwdDialogOpen(false)}>
        <DialogTitle>{"Restaurar contraseña"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRowName
              ? <>Vas a restaurar la contraseña de <strong>{selectedRowName}</strong>.</>
              : "Al hacer click en confirmar, el cliente volverá a tener como contraseña el \"identiftri\" inicial."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestPwdDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleResetPassword} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isClearOfferDialogOpen} onClose={() => setClearOfferDialogOpen(false)}>
        <DialogTitle>{"Eliminar oferta"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRowName
              ? <>Se eliminará la oferta del producto <strong>{selectedRowName}</strong>.</>
              : "Se eliminará la oferta del producto seleccionado."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOfferDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteOffer} autoFocus>
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
          <IconButton onClick={handleDataGridCancelChanges} disabled={!hasChanges}>
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
              onClick={() => setRestPwdDialogOpen(true)}
              disabled={getSelectedCount(selectionModel) !== 1}
            >
              <LockReset />
            </IconButton>
          </Tooltip>
        )}

        {isProductPage && (
          <>
            {productHasOffer ? (
              <Tooltip title="Eliminar oferta" arrow>
                <IconButton
                  onClick={() => setClearOfferDialogOpen(true)}
                  disabled={getSelectedCount(selectionModel) !== 1}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Añadir oferta" arrow>
                <IconButton
                  onClick={handleOpenOfferDialog}
                  disabled={getSelectedCount(selectionModel) !== 1}
                >
                  <LocalOffer />
                </IconButton>
              </Tooltip>
            )}

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filtrar ofertas:</InputLabel>
              <Select
                value={hasOfferActive}
                onChange={handleOfferActiveChange}
                label="Filtrar ofertas:"
              >
                <MenuItem value={"any"}>Cualquiera</MenuItem>
                <MenuItem value={"true"}>Contiene</MenuItem>
                <MenuItem value={"false"}>No contiene</MenuItem>
              </Select>
            </FormControl>
          </>
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
          data={filteredAndMergedData}
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
          open={snack.open || !!error}
          autoHideDuration={6000}
          onClose={() => {
            closeSnack();
            if (error) clearError();
          }}
        >
          <Alert
            severity={error ? "error" : snack.severity}
            onClose={() => {
              closeSnack();
              if (error) clearError();
            }}
            sx={{ width: "100%" }}
          >
            {error?.message || snack.message}
          </Alert>
        </Snackbar>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Dialog onClose={handleCloseOfferDialog} open={isOfferDialogOpen}>
          <DialogTitle>Establecer oferta</DialogTitle>
          <DialogContent>
            <Typography color="textSecondary">
              {selectedRowName
                ? <>Aplicando oferta a <strong>{selectedRowName}</strong>:</>
                : "Determine el período de vigencia y porcentaje de la oferta:"}
            </Typography>
            <Stack direction={"row"} spacing={2} sx={{ mt: 3 }}>
              <DatePicker
                label="Inicia"
                value={dayjs(offerForm.startsAt)}
                onChange={(v) =>
                  setOfferForm((f) => ({
                    ...f,
                    startsAt: v ? v.startOf("day").toISOString() : f.startsAt,
                  }))
                }
              />
              <DatePicker
                label="Finaliza"
                value={dayjs(offerForm.endsAt)}
                onChange={(v) =>
                  setOfferForm((f) => ({
                    ...f,
                    endsAt: v ? v.endOf("day").toISOString() : f.endsAt,
                  }))
                }
              />
              <TextField
                label="Porcentaje"
                type="number"
                value={offerForm.percent}
                onChange={(e) => {
                  const raw = e.target.value;
                  const val =
                    raw === "" ? "" : Math.max(0, Math.min(100, Number(raw)));
                  setOfferForm((f) => ({ ...f, percent: val }));
                }}
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOfferDialog}>Cancelar</Button>
            <Button onClick={handleSetOffer} disabled={isSubmittingOffer}>
              {isSubmittingOffer ? <CircularProgress size={20} /> : "Aceptar"}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </PageContainer>
  );
}
