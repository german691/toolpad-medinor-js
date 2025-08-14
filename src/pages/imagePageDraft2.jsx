import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
import getCategories from "../services/categoryService";
import { ProductsProvider } from "../hooks/context/productWrapper";
import { PageContainer } from "@toolpad/core";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
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
    refresh, // Asumimos que useCRUD provee una función para refrescar
  } = useCRUD();

  const handleRefresh = useCallback(() => {
    setSearch("");
    refresh();
  }, [setSearch, refresh]);

  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- ESTADO CENTRALIZADO ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // Imágenes locales listas para subir
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Efectos para cargar datos auxiliares (Laboratorios y Categorías)
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await getLabs();
        const formattedLabs = response.data.items.map((labObj) => ({
          value: labObj.lab,
          label: labObj.lab,
          key: labObj.lab,
        }));
        setLabs(formattedLabs);
      } catch (error) {
        console.error("Error al cargar los laboratorios:", error);
      }
    };
    fetchLabs();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const formattedCats = response.data.items.map((catObj) => ({
          value: catObj.category,
          label: catObj.category,
          key: catObj.category,
        }));
        setCategories(formattedCats);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  // Efecto principal: Carga las imágenes cuando se selecciona un producto
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
        // La API debe devolver imágenes con una estructura como { _id, url, role }
        const images = await getProductImages(selectedProduct._id);
        setExistingImages(images);
      } catch (error) {
        console.error(error.message || "Error al cargar imágenes");
        setExistingImages([]);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [selectedProduct]);

  // --- FUNCIONES CONTROLADORAS ---

  const handleRowClick = (params) => {
    if (selectedProduct?._id === params.row._id) {
      setSelectedProduct(null); // Deseleccionar si se hace clic de nuevo
    } else {
      setSelectedProduct(params.row);
    }
  };

  // Recibe las imágenes procesadas desde MultiImageManager
  const handleProcessingComplete = (processedImages) => {
    // Estas son las nuevas imágenes listas para ser subidas
    setNewImages((prev) => [...prev, ...processedImages]);
  };

  // Sube las nuevas imágenes al servidor
  const handleUpload = async () => {
    if (!selectedProduct || newImages.length === 0) return;
    setUploading(true);
    try {
      // `uploadImages` debe aceptar el ID del producto y un array de archivos/blobs
      await uploadImages(selectedProduct._id, newImages);
      setNewImages([]); // Limpiar las imágenes locales

      // Volver a cargar las imágenes existentes para mostrar las recién subidas
      const updatedImages = await getProductImages(selectedProduct._id);
      setExistingImages(updatedImages);

      alert("¡Imágenes subidas con éxito!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Hubo un error al subir las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  // Borra una imagen existente
  const handleDeleteExisting = async (imageId) => {
    if (!selectedProduct) return;
    try {
      await deleteProductImage(selectedProduct._id, imageId);
      setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
      alert("Imagen borrada (simulado).");
    } catch (err) {
      console.error("Error al borrar la imagen", err);
      alert("Error al borrar la imagen.");
    }
  };

  // Borra una imagen nueva (local) antes de subirla
  const handleDeleteNew = (imageId) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // --- LÓGICA DE LA TABLA (Sin cambios) ---
  const productColumns = useMemo(
    () => [
      { field: "code", headerName: "Código", width: 120 },
      { field: "desc", headerName: "Descripción", flex: 1, minWidth: 225 },
      {
        field: "lab",
        headerName: "Laboratorio",
        minWidth: 100,
        valueGetter: (params) =>
          labs.find((l) => l.value === params.value)?.label || params.value,
      },
      {
        field: "category",
        headerName: "Categoría",
        minWidth: 135,
        valueGetter: (params) =>
          categories.find((c) => c.value === params.value)?.label ||
          params.value,
      },
      {
        field: "image",
        headerName: "Imágenes",
        type: "boolean",
        minWidth: 80,
        align: "center",
      },
    ],
    [labs, categories]
  );

  const noRowsMessage = error
    ? `Error: ${error.message}`
    : "No se encontraron resultados.";
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

  function ToolBox() {
    return (
      <Stack direction="row" sx={{ mb: 2 }}>
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
            pagination
            paginationMode="server"
            rowCount={pagination?.total || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[25, 50, 100]}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            rowHeight={40}
            onRowClick={handleRowClick}
            sx={{
              border: 0,
              "& .MuiDataGrid-row--selected": {
                bgcolor: "action.selected",
                "&:hover": { bgcolor: "action.hover" },
              },
            }}
            selectionModel={selectedProduct ? selectedProduct._id : undefined}
            components={{
              NoRowsOverlay: () => (
                <CustomNoRowsOverlay message={noRowsMessage} />
              ),
              LoadingOverlay: CircularProgress,
            }}
          />
        </Paper>
        <Box sx={{ width: "35%", minWidth: "300px" }}>
          <MultiImageManager
            selectedProduct={selectedProduct}
            existingImages={existingImages}
            newImages={newImages}
            onProcessingComplete={handleProcessingComplete}
            onUpload={handleUpload}
            onDeleteExisting={handleDeleteExisting}
            onDeleteNew={handleDeleteNew}
            isLoading={imagesLoading}
            isUploading={uploading}
          />
        </Box>
      </Stack>
    </PageContainer>
  );
}
