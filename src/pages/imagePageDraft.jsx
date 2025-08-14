import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
import getCategories from "../services/categoryService";
import getLabs from "../services/labService";
import { ProductsProvider } from "../hooks/context/productWrapper";

import { PageContainer } from "@toolpad/core";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Grid,
  Badge,
} from "@mui/material";
import Searchbox from "../components/UI/Searchbox";
import { Refresh, CloudUpload } from "@mui/icons-material";
import MultiImageManager from "../components/UI/MultiImageManager";
import { CustomNoRowsOverlay } from "../components/Table/GenericDataGrid";
import { getProductImages, uploadImages } from "../services/imageService";

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
  } = useCRUD();

  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await getLabs();
        const formattedLabs = response.data.items.map((labObj) => ({
          value: labObj.lab,
          label: labObj.lab,
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
        }));
        setCategories(formattedCats);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
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
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [selectedProduct]);

  const handleRefresh = useCallback(() => {
    setSearch("");
  }, [setSearch]);

  const productColumns = useMemo(
    () => [
      { field: "code", headerName: "Código", width: 120 },
      { field: "desc", headerName: "Descripción", flex: 1, minWidth: 225 },
      {
        field: "lab",
        headerName: "Laboratorio",
        minWidth: 100,
        type: "string",
        renderCell: (params) => {
          const selectedOption = labs.find((opt) => opt.value === params.value);
          return selectedOption ? selectedOption.label : params.value;
        },
      },
      {
        field: "category",
        headerName: "Categorías",
        minWidth: 135,
        type: "string",
        renderCell: (params) => {
          const selectedOption = categories.find(
            (opt) => opt.value === params.value
          );
          return selectedOption ? selectedOption.label : params.value;
        },
      },
      {
        field: "listed",
        headerName: "Visible",
        type: "boolean",
        minWidth: 60,
        align: "center",
      },
      {
        field: "image",
        headerName: "Imagen",
        type: "boolean",
        minWidth: 60,
        align: "center",
      },
    ],
    [labs, categories]
  );

  const noRowsMessage = error
    ? `Error: ${error.message || "Ocurrió un error al cargar los datos."}`
    : "No se encontraron resultados.";

  const handleRowClick = (params) => {
    if (selectedProduct?._id === params.row._id) {
      setSelectedProduct(null);
    } else {
      setSelectedProduct(params.row);
    }
  };

  const handleProcessingComplete = (processedImages) => {
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
      alert("¡Imágenes subidas con éxito!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Hubo un error al subir las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  const allImages = [...existingImages, ...newImages];

  const handleSortModelChange = (model) => {
    setSort(
      model.length > 0 ? { key: model[0].field, direction: model[0].sort } : {}
    );
  };

  const sortModel = useMemo(
    () => (sort && sort.key ? [{ field: sort.key, sort: sort.direction }] : []),
    [sort]
  );

  const handlePaginationModelChange = (newModel) => {
    if (newModel.pageSize !== paginationModel.pageSize) {
      setLimit(newModel.pageSize);
    }
    if (newModel.page !== paginationModel.page) {
      setPage(newModel.page + 1);
    }
  };

  const paginationModel = {
    page: pagination ? pagination.page - 1 : 0,
    pageSize: pagination?.limit || 25,
  };

  function ToolBox() {
    return (
      <Stack direction={"row"} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Searchbox setSearch={setSearch} />
          <Tooltip title="Actualizar" arrow>
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    );
  }

  return (
    <PageContainer maxWidth={false}>
      <ToolBox />
      <Stack direction={"row"} spacing={3} sx={{ width: "100%", flex: 1 }}>
        <Paper
          sx={{
            width: "70%",
            height: "72vh",
            display: "flex",
            flexDirection: "column",
          }}
          variant="outlined"
        >
          <DataGrid
            rows={items || []}
            columns={productColumns}
            getRowId={(row) => row._id}
            onRowClick={handleRowClick}
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
            sx={{
              border: 0,
              flex: 1,
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "rgba(25, 118, 210, 0.12)", // Color de selección
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.22)",
                },
              },
            }}
            components={{
              NoRowsOverlay: () => (
                <CustomNoRowsOverlay message={noRowsMessage} />
              ),
              LoadingOverlay: CircularProgress,
            }}
          />
        </Paper>

        {/* --- Gestor de Imágenes a la derecha --- */}
        <Stack spacing={2} sx={{ width: "30%" }}>
          <Typography variant="h6">
            {selectedProduct
              ? `Imágenes de: ${selectedProduct.desc}`
              : "Gestor de Imágenes"}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {imagesLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
                <Grid container spacing={1.5}>
                  {allImages.map((img, index) => (
                    <Grid item key={img.id || index} xs={6}>
                      <Badge
                        badgeContent={img.role || "Actual"}
                        color={
                          img.role === "principal"
                            ? "primary"
                            : img.role === "secundaria"
                              ? "secondary"
                              : "success"
                        }
                      >
                        <img
                          src={img.croppedSrc || img.url}
                          alt="thumbnail"
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "4px",
                            display: "block",
                          }}
                        />
                      </Badge>
                    </Grid>
                  ))}
                  {allImages.length === 0 && !imagesLoading && (
                    <Typography
                      sx={{
                        p: 2,
                        color: "text.secondary",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      {selectedProduct
                        ? "Este producto no tiene imágenes."
                        : "Seleccione un producto para ver/agregar imágenes."}
                    </Typography>
                  )}
                </Grid>
              </Box>
            )}
            <MultiImageManager
              onProcessingComplete={handleProcessingComplete}
              disabled={!selectedProduct || uploading}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={
                uploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CloudUpload />
                )
              }
              disabled={!selectedProduct || newImages.length === 0 || uploading}
              onClick={handleUpload}
              sx={{ mt: 2 }}
            >
              {uploading
                ? "Subiendo..."
                : `Subir ${newImages.length} imágen(es)`}
            </Button>
          </Paper>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
