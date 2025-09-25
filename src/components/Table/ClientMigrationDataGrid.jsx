import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  FormControlLabel,
  Checkbox,
  Chip,
  Stack,
  FormGroup,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import { useClientMigrationContext } from "../../hooks/context/clientMigrationProvider.jsx";
import { esES } from "@mui/x-data-grid/locales";

const mainColumns = [
  { field: "COD_CLIENT", headerName: "Cód. Cliente", width: 150 },
  { field: "RAZON_SOCI", headerName: "Razón Social", flex: 1, minWidth: 250 },
  { field: "IDENTIFTRI", headerName: "Identificador Fiscal", width: 200 },
  { field: "USERNAME_ASSIGNED", headerName: "Usuario Asignado", width: 220 },
  { field: "LEVEL", headerName: "Level", width: 120 },
];

const diffColumns = [
  ...mainColumns,
  {
    field: "__changedFields",
    headerName: "Diferencias (según selección)",
    flex: 1,
    minWidth: 320,
    renderCell: (params) => {
      const fields = params.value || [];
      if (!fields.length) return "—";
      return (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {fields.map((f, i) => f)}
        </Stack>
      );
    },
  },
];

const errorColumns = [
  {
    field: "COD_CLIENT",
    headerName: "Cód. Cliente (Original)",
    width: 150,
    valueGetter: (_value, row) => row.data.COD_CLIENT,
  },
  {
    field: "RAZON_SOCI",
    headerName: "Razón Social (Original)",
    width: 250,
    valueGetter: (_value, row) => row.data.RAZON_SOCI,
  },
  {
    field: "errors",
    headerName: "Motivo del Rechazo",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <List dense sx={{ p: 0 }}>
        {params.value &&
          params.value.map((error, index) => (
            <ListItem key={index} sx={{ p: 0 }}>
              <ListItemText primary={`• ${error}`} sx={{ m: 0 }} />
            </ListItem>
          ))}
      </List>
    ),
  },
];

const conflictColumns = [
  { field: "COD_CLIENT", headerName: "Cód. Cliente", width: 150 },
  { field: "RAZON_SOCI", headerName: "Razón Social", width: 250 },
  { field: "IDENTIFTRI", headerName: "Identificador Fiscal", width: 200 },
  {
    field: "conflictReason",
    headerName: "Motivo del Conflicto",
    flex: 1,
    minWidth: 300,
  },
];

export default function ClientMigrationDataGrid() {
  const {
    parsedData,
    processedData,
    migrationComplete,
    isConfirming,
    handleProcess,
    executeMigration,
    handleClear,
    replaceExisting,
    setReplaceExisting,
    replaceFields,
    setReplaceFields,
  } = useClientMigrationContext();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleOpenErrorModal = () => setIsErrorModalOpen(true);
  const handleCloseErrorModal = () => setIsErrorModalOpen(false);
  const handleOpenConflictModal = () => setIsConflictModalOpen(true);
  const handleCloseConflictModal = () => setIsConflictModalOpen(false);
  const handleOpenConfirmDialog = () => setIsConfirmDialogOpen(true);
  const handleCloseConfirmDialog = () => setIsConfirmDialogOpen(false);

  const confirmAndExecuteMigration = () => {
    handleCloseConfirmDialog();
    executeMigration();
  };

  const equalCount = processedData?.summary?.totalCurrentEqual ?? 0;
  const differentCount = processedData?.summary?.totalCurrentDifferent ?? 0;

  const currentDifferent = processedData?.data?.currentClientsDifferent ?? [];
  const currentEqual = processedData?.data?.currentClientsEqual ?? [];

  const comparedFields =
    processedData?.summary?.comparedFields ??
    Object.entries(replaceFields)
      .filter(([, v]) => v)
      .map(([k]) => k);

  return (
    <Box sx={{ width: "100%" }}>
      {migrationComplete && processedData ? (
        <Alert
          severity="success"
          action={
            <Button color="inherit" size="small" onClick={handleClear}>
              VOLVER AL INICIO
            </Button>
          }
          sx={{ mt: 2 }}
        >
          ¡Migración completada!{" "}
          {typeof processedData.createdCount === "number" && (
            <>
              Creados: <strong>{processedData.createdCount}</strong>.{" "}
            </>
          )}
          {typeof processedData.modifiedCount === "number" &&
            processedData.modifiedCount > 0 && (
              <>
                Reemplazados: <strong>{processedData.modifiedCount}</strong>.
              </>
            )}
        </Alert>
      ) : !processedData ? (
        <>
          {parsedData && parsedData.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Paso 1: Analizar Datos Cargados ({parsedData.length} registros)
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={3}
                  flexWrap="wrap"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                      />
                    }
                    label="Reemplazar existentes (solo los diferentes)"
                  />
                  <Divider flexItem orientation="vertical" />
                  <Stack>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Atributos a comparar/actualizar:
                    </Typography>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={replaceFields.RAZON_SOCI}
                            onChange={(e) =>
                              setReplaceFields((p) => ({
                                ...p,
                                RAZON_SOCI: e.target.checked,
                              }))
                            }
                          />
                        }
                        label="Razón Social"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={replaceFields.IDENTIFTRI}
                            onChange={(e) =>
                              setReplaceFields((p) => ({
                                ...p,
                                IDENTIFTRI: e.target.checked,
                              }))
                            }
                          />
                        }
                        label="Identificador Fiscal"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={replaceFields.LEVEL}
                            onChange={(e) =>
                              setReplaceFields((p) => ({
                                ...p,
                                LEVEL: e.target.checked,
                              }))
                            }
                          />
                        }
                        label="Level"
                      />
                    </FormGroup>
                    <Typography variant="caption" color="text.secondary">
                      Cambiar estos checks y volver a “Analizar” recalcula qué
                      clientes son diferentes/iguales con esa selección.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Typography variant="subtitle1" gutterBottom>
                Datos Cargados:
              </Typography>
              <Box sx={{ height: 400, width: "100%", mb: 2 }}>
                <DataGrid
                  rows={parsedData}
                  columns={mainColumns}
                  getRowId={(row) => `${row.COD_CLIENT}-${row.IDENTIFTRI}`}
                  autoPageSize
                  localeText={
                    esES.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableColumnFilter={true}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleProcess}
                  disabled={parsedData.length === 0}
                >
                  Analizar {parsedData.length} registros
                </Button>
                <Button variant="outlined" onClick={handleClear}>
                  Cancelar
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No hay datos cargados para mostrar.
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Paso 2: Revisar y Confirmar Migración
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Comparando:{" "}
            {comparedFields.length ? comparedFields.join(", ") : "ninguno"}
            .&nbsp; Nuevos: <strong>{processedData.summary.totalNew}</strong> ·
            Existentes: <strong>{processedData.summary.totalCurrent}</strong> (
            {differentCount} diferentes / {equalCount} iguales) · Conflictos:{" "}
            <strong>{processedData.summary.totalConflicts}</strong> · Errores:{" "}
            <strong>{processedData.summary.totalInvalid}</strong>.
          </Alert>

          <Typography variant="subtitle1" gutterBottom>
            Clientes Nuevos a Crear:
          </Typography>
          <Box sx={{ height: 400, width: "100%", mb: 2 }}>
            <DataGrid
              rows={processedData.data.newClients}
              columns={mainColumns}
              getRowId={(row) => `${row.COD_CLIENT}-${row.IDENTIFTRI}`}
              autoPageSize
              localeText={{
                ...esES.components.MuiDataGrid.defaultProps.localeText,
                noRowsLabel: "No se hallaron nuevos clientes.",
              }}
              disableColumnFilter={true}
            />
          </Box>

          {processedData.summary.totalCurrent > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Clientes Existentes (según selección)
              </Typography>

              <Alert severity="warning" sx={{ mb: 2 }}>
                {replaceExisting ? (
                  <>
                    <strong>Reemplazará</strong> solo los{" "}
                    <strong>{differentCount}</strong> con diferencias en los
                    campos seleccionados. Los <strong>{equalCount}</strong>{" "}
                    iguales no se tocan. Nunca se modifican usuario ni
                    contraseña.
                  </>
                ) : (
                  <>El reemplazo está desactivado.</>
                )}
              </Alert>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Diferentes (se reemplazarán): {differentCount}
              </Typography>
              <Box sx={{ height: 360, width: "100%", mb: 2 }}>
                <DataGrid
                  rows={currentDifferent}
                  columns={diffColumns}
                  getRowId={(row) => `diff-${row.COD_CLIENT}-${row.IDENTIFTRI}`}
                  autoPageSize
                  localeText={
                    esES.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableColumnFilter={true}
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Iguales (no se reemplazan): {equalCount}
              </Typography>
              <Box sx={{ height: 300, width: "100%", mb: 2 }}>
                <DataGrid
                  rows={currentEqual}
                  columns={mainColumns}
                  getRowId={(row) => `eq-${row.COD_CLIENT}-${row.IDENTIFTRI}`}
                  autoPageSize
                  localeText={
                    esES.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableColumnFilter={true}
                />
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenConfirmDialog}
              disabled={
                isConfirming ||
                (processedData.data.newClients.length === 0 &&
                  (!replaceExisting || differentCount === 0))
              }
            >
              {`Confirmar ${
                processedData.data.newClients.length > 0
                  ? `Creación (${processedData.data.newClients.length})`
                  : ""
              }${
                replaceExisting && differentCount > 0
                  ? `${
                      processedData.data.newClients.length > 0 ? " y " : ""
                    }Reemplazo (${differentCount})`
                  : ""
              }`}
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenConflictModal}
              disabled={processedData.data.conflictingClients.length === 0}
            >
              Ver Conflictos ({processedData.summary.totalConflicts})
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleOpenErrorModal}
              disabled={processedData.summary.totalInvalid === 0}
            >
              Ver Errores ({processedData.summary.totalInvalid})
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={isConfirming}
            >
              Cancelar Migración
            </Button>
          </Box>
        </>
      )}

      {processedData && (
        <>
          <Dialog
            open={isErrorModalOpen}
            onClose={handleCloseErrorModal}
            fullWidth
            maxWidth="lg"
          >
            <DialogTitle>
              Filas con Errores (Descartadas)
              <IconButton
                aria-label="close"
                onClick={handleCloseErrorModal}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ height: 400, width: "100%", mt: 2 }}>
                <DataGrid
                  rows={processedData.data.invalidRows.map((r, i) => ({
                    ...r,
                    id: `error-${i}`,
                  }))}
                  columns={errorColumns}
                  getRowId={(row) => row.id}
                  autoPageSize
                  localeText={
                    esES.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableColumnFilter={true}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseErrorModal}>Cerrar</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={isConflictModalOpen}
            onClose={handleCloseConflictModal}
            fullWidth
            maxWidth="lg"
          >
            <DialogTitle>
              Clientes con Conflictos (CUIT ya en uso)
              <IconButton
                aria-label="close"
                onClick={handleCloseConflictModal}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Estos clientes tienen un Cód. Cliente nuevo, pero su CUIT ya
                está registrado. No se pueden crear.
              </DialogContentText>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={processedData.data.conflictingClients.map((r, i) => ({
                    ...r,
                    id: `conflict-${i}`,
                  }))}
                  columns={conflictColumns}
                  getRowId={(row) => row.id}
                  autoPageSize
                  localeText={
                    esES.components.MuiDataGrid.defaultProps.localeText
                  }
                  disableColumnFilter={true}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConflictModal}>Cerrar</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={isConfirmDialogOpen} onClose={handleCloseConfirmDialog}>
            <DialogTitle>Confirmar Migración</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {processedData.data.newClients.length > 0 && (
                  <>
                    Se crearán{" "}
                    <strong>{processedData.data.newClients.length}</strong>{" "}
                    usuario(s).{" "}
                  </>
                )}
                {replaceExisting && differentCount > 0 && (
                  <>
                    Se reemplazarán <strong>{differentCount}</strong> existentes
                    con diferencias en los campos seleccionados. Nunca se tocan
                    usuario ni contraseña.{" "}
                  </>
                )}
                Los existentes sin diferencias no se modificarán. Esta acción no
                se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
              <Button
                onClick={confirmAndExecuteMigration}
                color="primary"
                autoFocus
              >
                Aceptar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
