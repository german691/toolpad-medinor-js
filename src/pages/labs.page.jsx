import { useEffect, useMemo, useRef, useState } from "react";
import getLabs from "../services/labService";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import Searchbox from "../components/UI/Searchbox";
import { Add, Delete, Edit, Save } from "@mui/icons-material";

function LabDeleteDialog({ open, handleClose, handleConfirm, selectedLabs }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{"Confirmar eliminación"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Estás seguro que deseas eliminar los siguientes laboratorios?
        </DialogContentText>
        <DialogContentText>({selectedLabs.join(", ")}).</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleConfirm}>Aceptar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LabsPage() {
  const [allLabs, setAllLabs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabs, setEditedLabs] = useState({});

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSelectedLabs([]);
        setIsEditing(false);
        setEditedLabs({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGetLabs = async () => {
    try {
      const response = await getLabs();
      setAllLabs(response.data.items || []);
    } catch (error) {
      console.error("Error al cargar laboratorios:", error);
      setAllLabs([]);
    }
  };

  useEffect(() => {
    handleGetLabs();
  }, []);

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const filteredLabs = useMemo(() => {
    if (!searchTerm) return allLabs;
    return allLabs.filter((labObj) =>
      labObj.lab.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLabs, searchTerm]);

  const handleListItemClick = (labName) => {
    setSelectedLabs((prev) =>
      prev.includes(labName)
        ? prev.filter((name) => name !== labName)
        : [...prev, labName]
    );
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    setSelectedLabs([]);
    setOpen(false);
  };

  const handleSave = () => {
    const updatedLabs = allLabs.map((lab) => {
      if (editedLabs[lab.lab]) {
        return { ...lab, lab: editedLabs[lab.lab] };
      }
      return lab;
    });

    setAllLabs(updatedLabs);
    setIsEditing(false);
    setEditedLabs({});
    setSelectedLabs([]);
  };

  return (
    <PageContainer sx={{ width: "800px" }} breadcrumbs={[]}>
      <LabDeleteDialog
        open={open}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
        selectedLabs={selectedLabs}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            gap: 1,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: "100%",
              height: "50vh",
              bgcolor: "background.paper",
              overflow: "auto",
              p: 1,
            }}
          >
            <List>
              {filteredLabs.length > 0 ? (
                filteredLabs.map((labObj) => {
                  const isSelected = selectedLabs.includes(labObj.lab);
                  return (
                    <ListItemButton
                      key={labObj.lab}
                      onClick={() => handleListItemClick(labObj.lab)}
                      selected={isSelected}
                    >
                      {isEditing && isSelected ? (
                        <TextField
                          ref={containerRef}
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={editedLabs[labObj.lab] ?? labObj.lab}
                          onChange={(e) =>
                            setEditedLabs((prev) => ({
                              ...prev,
                              [labObj.lab]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <ListItemText primary={labObj.lab} />
                      )}
                    </ListItemButton>
                  );
                })
              ) : (
                <ListItemText
                  primary="No se encontraron laboratorios."
                  sx={{ textAlign: "center", mt: 2 }}
                />
              )}
            </List>
          </Paper>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            <Searchbox overrideWidth="100%" setSearch={handleSearch} />
            <Divider />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                sx={{ width: "100%" }}
                startIcon={<Add />}
                disabled={selectedLabs.length > 0}
              >
                Agregar
              </Button>

              <Button
                color="secondary"
                variant="outlined"
                sx={{ width: "100%" }}
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                disabled={selectedLabs.length === 0}
              >
                Editar
              </Button>

              <Button
                color="error"
                variant="outlined"
                sx={{ width: "100%" }}
                startIcon={<Delete />}
                onClick={handleOpen}
                disabled={selectedLabs.length === 0}
              >
                Eliminar
              </Button>

              {isEditing && (
                <Button
                  color="success"
                  variant="outlined"
                  sx={{ width: "100%" }}
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Guardar
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
