import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCRUD } from "../hooks/context/useCRUD";
import getCategories from "../services/categoryService";
import { GenericCRUDPage } from "../components/Screen/GenericCRUDPAge";
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
} from "@mui/material";
import Searchbox from "../components/UI/Searchbox";
import {
  Add,
  AddPhotoAlternate,
  AddToPhotos,
  HideImage,
  Image,
  ImageNotSupported,
  Refresh,
} from "@mui/icons-material";
import ImageDropzone from "../components/UI/MultiImageManager";
import MultiImageManager from "../components/UI/MultiImageManager";

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

  const handleRefresh = useCallback(() => {
    setSearch("");
  }, [setSearch]);

  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);

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

        console.log("formatted", formattedCats);
        setCategories(formattedCats);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const productColumns = useMemo(
    () => [
      {
        field: "code",
        headerName: "Código",
        width: 120,
        editable: false,
      },
      {
        field: "desc",
        headerName: "Descripción",
        flex: 1,
        minWidth: 225,
        editable: false,
      },
      {
        field: "extra_desc",
        headerName: "Descripción Adicional",
        minWidth: 200,
        editable: false,
      },
      {
        field: "lab",
        headerName: "Laboratorio",
        minWidth: 100,
        editable: false,
        type: "string",
        renderEditCell: (params) => <ItemSelect {...params} options={labs} />,
        render: (params) => {
          const selectedOption = labs.find((opt) => opt.value === params.value);
          return selectedOption ? selectedOption.label : params.value;
        },
      },
      {
        field: "category",
        headerName: "Categorías",
        minWidth: 135,
        editable: false,
        type: "string",
        renderEditCell: (params) => (
          <ItemSelect {...params} options={categories} />
        ),
        render: (params) => {
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
        editable: false,
      },
      {
        field: "image",
        headerName: "Imagen",
        type: "boolean",
        minWidth: 60,
        align: "center",
        editable: false,
      },
    ],
    [labs]
  );

  const noRowsMessage = error
    ? `Error: ${error.message || "Ocurrió un error al cargar los datos."}`
    : "No se encontraron resultados.";

  const handleSortModelChange = (model) => {
    if (model.length === 0) {
      setSort({});
    } else {
      const { field, sort: direction } = model[0];
      setSort({ key: field, direction });
    }
  };

  const sortModel = React.useMemo(
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
          <Tooltip title="Actualizar" arrow>
            <IconButton>
              <AddToPhotos />
            </IconButton>
          </Tooltip>
          <Tooltip title="Actualizar" arrow>
            <IconButton>
              <ImageNotSupported />
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
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "72vh",
          }}
          variant="outlined"
        >
          <DataGrid
            rows={items || []}
            columns={productColumns}
            getRowId={(row) => row._id}
            loading={loading}
            components={{
              NoRowsOverlay: () => (
                <CustomNoRowsOverlay message={noRowsMessage} />
              ),
              LoadingOverlay: CircularProgress,
            }}
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
            sx={{ border: 0, flex: 1 }}
          />
        </Paper>
        <Box sx={{ width: "30%" }}>
          <MultiImageManager />
        </Box>
      </Stack>
    </PageContainer>
  );
}
