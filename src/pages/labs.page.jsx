import { useEffect, useState } from "react";
import getLabs from "../services/labService";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function LabsPage() {
  const [formData, setFormData] = useState({ lab: "" });
  const [labs, setLabs] = useState([]);

  const handleGetLabs = async () => {
    try {
      const response = await getLabs();
      setLabs(response.data.items || []);
    } catch (error) {
      console.log(error);
      setLabs([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    handleGetLabs();
  }, []);

  return (
    <PageContainer>
      <Box>
        <Typography>
          En esta sección se crean y listan los laboratorios
        </Typography>
        <FormControl fullWidth margin="dense">
          <InputLabel>Laboratorio</InputLabel>
          <Select name="lab" value={formData.lab} onChange={handleInputChange}>
            {labs.map((labObj) => (
              <MenuItem key={labObj.lab} value={labObj.lab}>
                {labObj.lab}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </PageContainer>
  );
}
