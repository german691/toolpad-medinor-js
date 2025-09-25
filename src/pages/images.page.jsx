import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import Searchbox from "../components/UI/Searchbox";
import { AddPhotoAlternate, Refresh } from "@mui/icons-material";
import MultiImageManager from "../components/UI/MultiImageManager";
import { CustomNoRowsOverlay } from "../components/Table/GenericDataGrid";
import {
  clearProductImages,
  deleteProductImage,
  getProductImages,
  uploadImages,
} from "../services/imageService";
import UploadByCodeDialog from "../components/Dialog/UploadByCodeDialog";
import { esES } from "@mui/x-data-grid/locales";

export default function ProductsImageWrapper() {
  return (
    <ProductsProvider
      initialFilters={{
        categoryName: { $nin: ["ESTUCHADOS", "HOSPITALARIOS"] },
      }}
    >
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
    filters,
    setFilters,
    fetchItems,
  } = useCRUD();

  const mappedItems = useMemo(() => {
    return (items || []).map((prod) => ({
      ...prod,
      image: Boolean(prod.mainImage) || prod.secondaryImages?.length > 0,
    }));
  }, [items]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasImageFilter, setImageFilter] = useState("any");
  const [isUploadByCodeDialogOpen, setIsUploadByCodeDialogOpen] =
    useState(false);

  const handleImageFilterChange = (event) => {
    const value = event.target.value;
    setImageFilter(value);
    setFilters({ ...filters, images: value === "any" ? "any" : value });
  };

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
      fetchItems();
    }
  };

  const handleDeleteExisting = (imageId) => {
    if (!selectedProduct) return;

    const imageToDelete = existingImages.find((img) => img._id === imageId);
    console.log({
      selected: selectedProduct,
      selected_id: selectedProduct._id,
      imageId: imageId,
    });

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

          await fetchItems();
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
      {
        field: "code",
        headerName: "Código",
        width: 120,
        filterable: false,
        sortable: false,
      },
      {
        field: "desc",
        headerName: "Descripción",
        flex: 1,
        minWidth: 225,
        filterable: false,
        sortable: false,
      },
      {
        field: "lab",
        headerName: "Laboratorio",
        minWidth: 100,
        filterable: false,
        sortable: false,
      },
      {
        field: "category",
        headerName: "Categoría",
        minWidth: 135,
        type: "singleSelect",
        filterable: false,
        sortable: false,
      },
      {
        field: "image",
        headerName: "Imágenes",
        type: "boolean",
        minWidth: 80,
        align: "center",
        filterable: false,
        sortable: false,
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
  }, [setSearch]);

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

  function ToolBox() {
    return (
      <Stack direction="row" sx={{ mb: 2 }} spacing={1}>
        <Searchbox setSearch={setSearch} />
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Filtrar por:</InputLabel>
          <Select
            value={hasImageFilter}
            onChange={handleImageFilterChange}
            label="Filtrar por:"
          >
            <MenuItem value={"any"} selected>
              Todos
            </MenuItem>
            <MenuItem value={"false"}>Sin imagen</MenuItem>
            <MenuItem value={"true"}>Con imagen</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Actualizar" arrow>
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tooltip title="Añadir imágenes por código de producto" arrow>
          <IconButton onClick={() => setIsUploadByCodeDialogOpen(true)}>
            <AddPhotoAlternate />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <PageContainer maxWidth={false} breadcrumbs={[]}>
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
            rows={mappedItems || []}
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
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
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
            rowHeight={40}
            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
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

      <UploadByCodeDialog
        open={isUploadByCodeDialogOpen}
        onClose={() => setIsUploadByCodeDialogOpen(false)}
        onUploadComplete={() => (fetchItems(), setSearch(""))}
      />
    </PageContainer>
  );
}
