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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import { useClientMigrationContext } from "../../hooks/context/clientMigrationProvider.jsx";
import { esES } from "@mui/x-data-grid/locales";

const mainColumns = [
  { field: "COD_CLIENT", headerName: "Cód. Cliente", width: 150 },
  { field: "RAZON_SOCI", headerName: "Razón Social", flex: 1, minWidth: 250 },
  { field: "IDENTIFTRI", headerName: "Identificador Fiscal", width: 200 },
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
          ¡Migración completada! Se han creado{" "}
          <strong>{processedData.createdCount}</strong> nuevos clientes.
        </Alert>
      ) : !processedData ? (
        <>
          {parsedData && parsedData.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Paso 1: Analizar Datos Cargados ({parsedData.length} registros)
              </Typography>
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
            Análisis completado: Se encontraron{" "}
            <strong>{processedData.summary.totalNew} clientes nuevos</strong>,{" "}
            <strong>{processedData.summary.totalCurrent} existentes</strong>,{" "}
            <strong>
              {processedData.summary.totalConflicts} con conflictos
            </strong>{" "}
            y <strong>{processedData.summary.totalInvalid} con errores</strong>.
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
                noRowsLabel:
                  "No se hallaron nuevos clientes en la nómina procesada. Si cree que esto es un error, por favor, verifique la última fecha de subida de los registros con la fecha de creación de la nómina.",
              }}
              disableColumnFilter={true}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenConfirmDialog}
              disabled={
                isConfirming || processedData.data.newClients.length === 0
              }
            >
              {`Confirmar Creación (${processedData.data.newClients.length})`}
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
              disabled={processedData.data.invalidRows.length === 0}
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
                ¿Estás seguro de que deseas crear{" "}
                {processedData.data.newClients.length} nuevos usuarios? Esta
                acción no se puede deshacer.
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
