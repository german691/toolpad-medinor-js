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
  DeleteForever,
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
import {
  hardDeleteAdmin,
  resetAdminPassword,
} from "../../services/adminService";
import { z } from "zod";
import AdminPasswordDialog from "../Dialog/AdminPasswordDialog";

const toStartOfDayISO = (d) => dayjs(d).startOf("day").toISOString();
const toEndOfDayISO = (d) => dayjs(d).endOf("day").toISOString();
const getSelectedCount = (selectionModel) => selectionModel?.ids?.size ?? 0;
const getSingleSelectedId = (selectionModel) =>
  getSelectedCount(selectionModel) === 1
    ? Array.from(selectionModel.ids)[0]
    : null;

const hasOfferField = (row) => !!row?.offer;

const getDisplayName = (row, { isProductPage, isClientPage }) => {
  if (!row) return "";
  if (isProductPage) return row.desc || row.code || row._id || "";
  if (isClientPage)
    return row.razon_soci || row.nickname || row.identiftri || "";
  return row.desc || row.title || "";
};

const resetAdminPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export function GenericCRUDPage({
  columns,
  entityName,
  onAdd,
  onUpdate,
  selectionModel,
  onSelectionChange,
  isClientPage = false,
  isProductPage = false,
  isAdminPage = false,
}) {
  const {
    filters,
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
  const [modifiedRows, setModifiedRows] = useState({});
  const [productHasOffer, setProductHasOffer] = useState(false);
  const [isRestPwdDialogOpen, setRestPwdDialogOpen] = useState(false);
  const [isSetAdminPwdDialogOpen, setAdminPwdDialogOpen] = useState(false);
  const [isHardDeleteAdminDialogOpen, setHardDeleteAdminDialogOpen] =
    useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isClearOfferDialogOpen, setClearOfferDialogOpen] = useState(false);
  const [hasOfferFilter, setOfferFilter] = useState("any");
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
  const handleToggleFullScreen = useCallback(
    () => setIsFullScreen((p) => !p),
    []
  );
  const handleRefresh = useCallback(() => setSearch(""), [setSearch]);

  const hasChanges = useMemo(
    () => Object.keys(modifiedRows).length > 0,
    [modifiedRows]
  );

  const handleDataGridCancelChanges = useCallback(() => {
    setModifiedRows({});
    fetchItems();
    showSnack("Cambios descartados", "info");
  }, [fetchItems, showSnack]);

  const handleDataGridEditChange = useCallback((newRow, oldRow) => {
    const hasRowChanged = JSON.stringify(newRow) !== JSON.stringify(oldRow);
    if (!hasRowChanged) return;
    setModifiedRows((prev) => ({ ...prev, [newRow._id]: newRow }));
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
      showSnack(
        "Error inesperado al restaurar contraseña del cliente",
        "error"
      );
    }
  }, [selectionModel, showSnack]);

  const handleSubmitAdminPassword = useCallback(
    async (password) => {
      const selectedId = getSingleSelectedId(selectionModel);
      if (!selectedId) return;
      await resetAdminPassword(selectedId, password);
      setAdminPwdDialogOpen(false);
      showSnack(
        "Contraseña de administrador modificada correctamente",
        "success"
      );
    },
    [selectionModel, showSnack]
  );

  const handleHardDeleteAdmin = useCallback(async () => {
    const selectedId = getSingleSelectedId(selectionModel);
    if (!selectedId) {
      showSnack("Ocurrió un problema al seleccionar usuario", "warning");
      setHardDeleteAdminDialogOpen(false);
      return;
    }
    try {
      await hardDeleteAdmin(selectedId);
      setHardDeleteAdminDialogOpen(false);
      showSnack("Usuario eliminado correctamente", "success");
      fetchItems();
    } catch (e) {
      showSnack(e?.message || "Error inesperado al eliminar usuario", "error");
    }
  }, [selectionModel, showSnack, fetchItems]);

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

  const handleOfferFilterChange = (event) => {
    const value = event.target.value;
    setOfferFilter(value);
    setFilters({ ...filters, offer: value === "any" ? "any" : value });
  };

  const handleOpenOfferDialog = useCallback(() => setOfferDialogOpen(true), []);
  const handleCloseOfferDialog = useCallback(
    () => setOfferDialogOpen(false),
    []
  );

  const handleSetOffer = useCallback(async () => {
    const selectedId = getSingleSelectedId(selectionModel);
    if (!selectedId) {
      showSnack("Debes seleccionar exactamente 1 producto.", "warning");
      return;
    }
    const percentNum =
      offerForm.percent === "" ? NaN : Number(offerForm.percent);
    if (Number.isNaN(percentNum)) {
      showSnack("El porcentaje es requerido y debe ser numérico.", "warning");
      return;
    }
    if (percentNum < 0 || percentNum > 100) {
      showSnack("El porcentaje debe estar entre 0 y 100.", "warning");
      return;
    }
    if (
      !dayjs(offerForm.startsAt).isValid() ||
      !dayjs(offerForm.endsAt).isValid()
    ) {
      showSnack("Las fechas deben ser válidas (ISO 8601).", "warning");
      return;
    }
    const payload = {
      percent: Math.round(percentNum * 100) / 100,
      startsAt: toStartOfDayISO(offerForm.startsAt),
      endsAt: toEndOfDayISO(offerForm.endsAt),
    };
    if (!dayjs(payload.endsAt).isAfter(payload.startsAt)) {
      showSnack(
        "La fecha de fin debe ser posterior a la de inicio.",
        "warning"
      );
      return;
    }
    setIsSubmittingOffer(true);
    try {
      await setProductOffer({ productId: selectedId, offer: payload });
      handleCloseOfferDialog();
      await fetchItems();
      showSnack("Oferta aplicada", "success");
    } catch (e) {
      showSnack(
        e?.message || "Error inesperado al aplicar la oferta.",
        "error"
      );
    } finally {
      setIsSubmittingOffer(false);
    }
  }, [
    selectionModel,
    offerForm,
    fetchItems,
    showSnack,
    handleCloseOfferDialog,
  ]);

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
          <span style={{ display: "inline-flex" }}>
            <IconButton
              onClick={handleDataGridCancelChanges}
              disabled={!hasChanges}
            >
              <Cancel />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Guardar cambios" arrow>
          <span style={{ display: "inline-flex" }}>
            <IconButton onClick={handleSaveWrapper} disabled={!hasChanges}>
              <Save />
            </IconButton>
          </span>
        </Tooltip>
        {isClientPage && (
          <Tooltip title="Restaurar Contraseña" arrow>
            <span style={{ display: "inline-flex" }}>
              <IconButton
                onClick={() => setRestPwdDialogOpen(true)}
                disabled={getSelectedCount(selectionModel) !== 1}
              >
                <LockReset />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {isProductPage && (
          <>
            {productHasOffer ? (
              <Tooltip title="Eliminar oferta" arrow>
                <span style={{ display: "inline-flex" }}>
                  <IconButton
                    onClick={() => setClearOfferDialogOpen(true)}
                    disabled={getSelectedCount(selectionModel) !== 1}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Añadir oferta" arrow>
                <span style={{ display: "inline-flex" }}>
                  <IconButton
                    onClick={handleOpenOfferDialog}
                    disabled={getSelectedCount(selectionModel) !== 1}
                  >
                    <LocalOffer />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filtrar ofertas:</InputLabel>
              <Select
                value={hasOfferFilter}
                onChange={handleOfferFilterChange}
                label="Filtrar ofertas:"
              >
                <MenuItem value={"any"}>Cualquiera</MenuItem>
                <MenuItem value={"true"}>Contiene</MenuItem>
                <MenuItem value={"false"}>No contiene</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        {isAdminPage && (
          <>
            <Tooltip title="Restablecer contraseña" arrow>
              <span style={{ display: "inline-flex" }}>
                <IconButton
                  onClick={() => setAdminPwdDialogOpen(true)}
                  disabled={getSelectedCount(selectionModel) !== 1}
                >
                  <LockReset />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Eliminar Administrador" arrow>
              <span style={{ display: "inline-flex" }}>
                <IconButton
                  onClick={() => setHardDeleteAdminDialogOpen(true)}
                  disabled={getSelectedCount(selectionModel) !== 1}
                >
                  <DeleteForever />
                </IconButton>
              </span>
            </Tooltip>
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
    <PageContainer maxWidth={false} breadcrumbs={[]}>
      <Box sx={containerSx}>
        <ToolbarButtons />
        <GenericDataGrid
          data={mergedAllData}
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

      <Dialog
        open={isRestPwdDialogOpen}
        keepMounted
        disablePortal
        onClose={(e, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setRestPwdDialogOpen(false);
        }}
      >
        <DialogTitle>Restaurar contraseña</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRowName ? (
              <>
                Vas a restaurar la contraseña de{" "}
                <strong>{selectedRowName}</strong>.
              </>
            ) : (
              'Al hacer click en confirmar, el cliente volverá a tener como contraseña el "identiftri" inicial.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestPwdDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleResetPassword} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isClearOfferDialogOpen}
        keepMounted
        disablePortal
        onClose={(e, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setClearOfferDialogOpen(false);
        }}
      >
        <DialogTitle>Eliminar oferta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRowName ? (
              <>
                Se eliminará la oferta del producto{" "}
                <strong>{selectedRowName}</strong>.
              </>
            ) : (
              "Se eliminará la oferta del producto seleccionado."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOfferDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteOffer} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <AdminPasswordDialog
        open={isSetAdminPwdDialogOpen}
        onClose={() => setAdminPwdDialogOpen(false)}
        onSubmit={handleSubmitAdminPassword}
        selectedName={selectedRowName}
      />

      <Dialog
        open={isHardDeleteAdminDialogOpen}
        keepMounted
        disablePortal
        onClose={(e, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          setHardDeleteAdminDialogOpen(false);
        }}
      >
        <DialogTitle>Eliminar administrador</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRowName ? (
              <>
                Vas a eliminar definitivamente a{" "}
                <strong>{selectedRowName}</strong>.
              </>
            ) : (
              "Vas a eliminar definitivamente al usuario seleccionado."
            )}
          </DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            Esta acción no se puede deshacer. Si es el último SUPERADMIN, será
            bloqueado por el servidor.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHardDeleteAdminDialogOpen(false)}>
            Cancelar
          </Button>
          <Button color="error" onClick={handleHardDeleteAdmin} autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <Dialog
          open={isOfferDialogOpen}
          keepMounted
          disablePortal
          onClose={(e, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            handleCloseOfferDialog();
          }}
        >
          <DialogTitle>Establecer oferta</DialogTitle>
          <DialogContent>
            <Typography color="textSecondary">
              {selectedRowName ? (
                <>
                  Aplicando oferta a <strong>{selectedRowName}</strong>:
                </>
              ) : (
                "Determine el período de vigencia y porcentaje de la oferta:"
              )}
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
