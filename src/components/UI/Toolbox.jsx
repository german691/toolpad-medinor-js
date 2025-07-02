export default function ToolbarButtons() {
  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        startIcon={<Cancel />}
        onClick={handleCancelEdit}
        disabled={!isEditing}
      >
        Cancelar Edición
      </Button>
      <Button
        variant="contained"
        color="success"
        startIcon={<Save />}
        onClick={handleSaveChanges}
        disabled={!isEditing}
      >
        Guardar Cambios
      </Button>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpenCreateModal}
      >
        Crear {title.slice(0, -1)}
      </Button>
    </Stack>
  );
}
