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
import { useProductMigrationContext } from "../../hooks/context/productMigrationProvider";

const mainColumns = [
  { field: "code", headerName: "Cód. Producto" },
  { field: "desc", headerName: "Descripción", flex: 1 },
  { field: "lab", headerName: "Laboratorio" },
  { field: "category", headerName: "Categoría" },
  {
    field: "iva",
    headerName: "IVA",
    type: "boolean",
    valueFormatter: (value) => (value ? "Sí" : "No"),
  },
  {
    field: "medinor_price",
    headerName: "P. Medinor",
    type: "number",
  },
  {
    field: "public_price",
    headerName: "P. Público",
    type: "number",
  },
  { field: "price", headerName: "P. Costo", width: 120, type: "number" },
];

const errorColumns = [
  {
    field: "code",
    headerName: "Cód. Prod. (Original)",
    width: 150,
    valueGetter: (_value, row) => row.data.code,
  },
  {
    field: "desc",
    headerName: "Descripción (Original)",
    width: 250,
    valueGetter: (_value, row) => row.data.desc,
  },
  {
    field: "lab",
    headerName: "Laboratorio (Original)",
    width: 180,
    valueGetter: (_value, row) => row.data.lab,
  },
  {
    field: "category",
    headerName: "Categoría (Original)",
    width: 180,
    valueGetter: (_value, row) => row.data.lab,
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
  { field: "code", headerName: "Cód. Producto", width: 150 },
  { field: "desc", headerName: "Descripción", width: 250 },
  { field: "lab", headerName: "Laboratorio", width: 200 },
  { field: "category", headerName: "Categoría", width: 200 },
  {
    field: "conflictReason",
    headerName: "Motivo del Conflicto",
    flex: 1,
    minWidth: 300,
  },
];

export default function ProductMigrationDataGrid() {
  const {
    parsedData,
    processedData,
    migrationComplete,
    isConfirming,
    handleProcess,
    executeMigration,
    handleClear,
  } = useProductMigrationContext();

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
          <strong>{processedData.createdCount}</strong> nuevos productos.
        </Alert>
      ) : !processedData ? (
        <>
          {/* PRIMERA ETAPA: CARGA INICIAL DEL ARCHIVO */}
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
                  getRowId={(row) => row.code}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                  }}
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
          {/* SEGUNDA ETAPA: ARCHIVO PARSEADO Y FILTRADO */}
          <Typography variant="h6" gutterBottom>
            Paso 2: Revisar y Confirmar Migración
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Análisis completado: Se encontraron{" "}
            <strong>{processedData.summary.totalNew} productos nuevos</strong>,{" "}
            <strong>{processedData.summary.totalCurrent} existentes</strong>,{" "}
            <strong>
              {processedData.summary.totalConflicts} con conflictos
            </strong>
            , <strong>{processedData.summary.totalInvalid} con errores</strong>
            {processedData.summary.totalFilteredOut > 0 && (
              <>
                {" "}
                y{" "}
                <strong>
                  {processedData.summary.totalFilteredOut} dados de baja
                </strong>
              </>
            )}
            .
          </Alert>
          <Typography variant="subtitle1" gutterBottom>
            Productos Nuevos a Crear:
          </Typography>
          <Box sx={{ height: 400, width: "100%", mb: 2 }}>
            <DataGrid
              rows={processedData.data.newProducts}
              columns={mainColumns}
              getRowId={(row) => row.code}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              localeText={{
                noRowsLabel:
                  "No se hallaron nuevos productos en la nómina procesada. Si cree que esto es un error, por favor, verifique la última fecha de subida de los registros con la fecha de creación de la nómina.",
              }}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenConfirmDialog}
              disabled={
                isConfirming || processedData.data.newProducts.length === 0
              }
            >
              {`Confirmar Creación (${processedData.data.newProducts.length})`}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenConflictModal}
              disabled={processedData.data.conflictingProducts.length === 0}
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
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                  }}
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
              Productos con Conflictos (Código ya en uso o similar)
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
                Estos productos no se pueden crear debido a un conflicto (ej.
                código ya existe, o similar).
              </DialogContentText>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={processedData.data.conflictingProducts.map((r, i) => ({
                    ...r,
                    id: `conflict-${i}`,
                  }))}
                  columns={conflictColumns}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                  }}
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
                {processedData.data.newProducts.length} nuevos productos? Esta
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
