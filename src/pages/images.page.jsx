import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
import getCategories from "../services/categoryService";
import { ProductsProvider } from "../hooks/context/productWrapper";
import { PageContainer } from "@toolpad/core";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import Searchbox from "../components/UI/Searchbox";
import { Refresh } from "@mui/icons-material";
import MultiImageManager from "../components/UI/MultiImageManager";
import { CustomNoRowsOverlay } from "../components/Table/GenericDataGrid";
import {
  clearProductImages,
  deleteProductImage,
  getProductImages,
  uploadImages,
} from "../services/imageService";
import getLabs from "../services/labService";

export default function ProductsImageWrapper() {
  return (
    <ProductsProvider>
      <ImagesPage />
    </ProductsProvider>
  );
}

export function ImagesPage() {
  const {
    items,
    pagination,
    loading,
    error,
    sort,
    setPage,
    setLimit,
    setSort,
    setSearch,
    refresh,
  } = useCRUD();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hasPrincipalImage = useMemo(() => {
    const existingHasMain = existingImages.some((img) => img.isMain);
    const newHasMain = newImages.some((img) => img.role === "principal");
    return existingHasMain || newHasMain;
  }, [existingImages, newImages]);

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        const labsRes = await getLabs();
        setLabs(
          labsRes.data.items.map((l) => ({ value: l.lab, label: l.lab }))
        );
        const catsRes = await getCategories();
        setCategories(
          catsRes.data.items.map((c) => ({
            value: c.category,
            label: c.category,
          }))
        );
      } catch (error) {
        console.error("Error al cargar datos auxiliares:", error);
      }
    };
    fetchAuxData();
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setExistingImages([]);
      setNewImages([]);
      return;
    }

    const fetchImages = async () => {
      setImagesLoading(true);
      setNewImages([]);
      try {
        const images = await getProductImages(selectedProduct._id);
        setExistingImages(images);
      } catch (error) {
        console.error(error.message || "Error al cargar imágenes");
        setExistingImages([]);
        setNotification({
          open: true,
          title: "Error",
          message: "No se pudieron cargar las imágenes del producto.",
        });
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [selectedProduct]);

  const handleRowClick = (params) => {
    if (selectedProduct?._id === params.row._id) {
      setSelectedProduct(null);
    } else {
      setSelectedProduct(params.row);
    }
  };

  const handleNewImages = (processedImages) => {
    setNewImages((prev) => [...prev, ...processedImages]);
  };

  const handleUpload = async () => {
    if (!selectedProduct || newImages.length === 0) return;
    setUploading(true);
    try {
      await uploadImages(selectedProduct._id, newImages);
      setNewImages([]);
      const updatedImages = await getProductImages(selectedProduct._id);
      setExistingImages(updatedImages);
      setNotification({
        open: true,
        title: "Éxito",
        message: "¡Imágenes subidas correctamente!",
      });
    } catch (error) {
      console.error(error);
      setNotification({
        open: true,
        title: "Error de Subida",
        message: error.message || "Hubo un problema al subir las imágenes.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExisting = (imageId) => {
    if (!selectedProduct) return;

    const imageToDelete = existingImages.find((img) => img._id === imageId);

    setConfirmDialog({
      open: true,
      title: "Confirmar Eliminación",
      message: `¿Está seguro de que desea eliminar esta imagen ${imageToDelete?.isMain ? "PRINCIPAL" : ""}?`,
      onConfirm: async () => {
        handleCloseConfirm();
        try {
          await deleteProductImage(selectedProduct._id, imageId);
          const updatedImages = await getProductImages(selectedProduct._id);
          setExistingImages(updatedImages);
        } catch (err) {
          console.error("Error al borrar la imagen", err);
          setNotification({
            open: true,
            title: "Error",
            message: "No se pudo borrar la imagen.",
          });
        }
      },
    });
  };

  const handleDeleteNew = (imageId) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleClearAllImages = () => {
    if (!selectedProduct) return;
    setConfirmDialog({
      open: true,
      title: "¡Atención!",
      message: `¿Desea eliminar TODAS las imágenes de ${selectedProduct.desc}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        handleCloseConfirm();
        try {
          await clearProductImages(selectedProduct._id);
          setExistingImages([]);
          setNotification({
            open: true,
            title: "Éxito",
            message: "Todas las imágenes fueron eliminadas.",
          });
        } catch (err) {
          console.error("Error al borrar todas las imágenes", err);
          setNotification({
            open: true,
            title: "Error",
            message: "No se pudieron eliminar las imágenes.",
          });
        }
      },
    });
  };

  const handleCloseNotification = () =>
    setNotification({ ...notification, open: false });
  const handleCloseConfirm = () =>
    setConfirmDialog({ ...confirmDialog, open: false });

  const productColumns = useMemo(
    () => [
      { field: "code", headerName: "Código", width: 120 },
      { field: "desc", headerName: "Descripción", flex: 1, minWidth: 225 },
      { field: "lab", headerName: "Laboratorio", minWidth: 100 },
      { field: "category", headerName: "Categoría", minWidth: 135 },
      {
        field: "image",
        headerName: "Imágenes",
        type: "boolean",
        minWidth: 80,
        align: "center",
      },
    ],
    []
  );

  const handleSortModelChange = (model) =>
    setSort(
      model.length > 0 ? { key: model[0].field, direction: model[0].sort } : {}
    );
  const sortModel = useMemo(
    () => (sort?.key ? [{ field: sort.key, sort: sort.direction }] : []),
    [sort]
  );
  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== (pagination?.limit || 25))
      setLimit(newModel.pageSize);
    if (newModel.page !== (pagination?.page - 1 || 0))
      setPage(newModel.page + 1);
  };
  const paginationModel = {
    page: (pagination?.page || 1) - 1,
    pageSize: pagination?.limit || 25,
  };
  const handleRefresh = useCallback(() => {
    setSearch("");
    refresh();
  }, [setSearch, refresh]);

  function ToolBox() {
    return (
      <Stack direction="row" sx={{ mb: 2 }} spacing={1}>
        <Searchbox setSearch={setSearch} />
        <Tooltip title="Actualizar" arrow>
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <PageContainer maxWidth={false}>
      <ToolBox />
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ width: "100%", height: "75vh" }}
      >
        <Paper
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
          variant="outlined"
        >
          <DataGrid
            rows={items || []}
            columns={productColumns}
            getRowId={(row) => row._id}
            loading={loading}
            paginationMode="server"
            rowCount={pagination?.total || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[25, 50, 100]}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            onRowClick={handleRowClick}
            selectionModel={selectedProduct ? selectedProduct._id : undefined}
            sx={{
              border: 0,
              "& .MuiDataGrid-row--selected": {
                bgcolor: "action.selected",
                "&:hover": { bgcolor: "action.hover" },
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus-within": {
                outline: "none",
              },
            }}
            components={{
              NoRowsOverlay: () => (
                <CustomNoRowsOverlay
                  message={
                    error
                      ? `Error: ${error.message}`
                      : "No se encontraron resultados."
                  }
                />
              ),
              LoadingOverlay: CircularProgress,
            }}
          />
        </Paper>

        <Box sx={{ width: "35%", minWidth: "350px", maxWidth: "500px" }}>
          <MultiImageManager
            selectedProduct={selectedProduct}
            existingImages={existingImages}
            newImages={newImages}
            onNewImages={handleNewImages}
            onUpload={handleUpload}
            onDeleteExisting={handleDeleteExisting}
            onDeleteNew={handleDeleteNew}
            onClearAll={handleClearAllImages}
            isLoading={imagesLoading}
            isUploading={uploading}
            alreadyHasPrincipal={hasPrincipalImage}
          />
        </Box>
      </Stack>

      <Dialog open={notification.open} onClose={handleCloseNotification}>
        <DialogTitle>{notification.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{notification.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotification} autoFocus>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button onClick={confirmDialog.onConfirm} color="error" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
