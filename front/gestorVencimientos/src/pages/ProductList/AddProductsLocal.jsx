import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";

export default function AddProductsLocal() {
  const { listId } = useParams();
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState([]);

  const storageKey = `tempCodesForList_${listId}`;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setCodes(stored);
  }, [storageKey]);

  const handleAdd = () => {
    const cleanCode = code.trim();
    if (!cleanCode || codes.includes(cleanCode)) return;
    const updated = [...codes, cleanCode];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setCodes(updated);
    setCode("");
  };

  const handleRemove = (c) => {
    const updated = codes.filter((x) => x !== c);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setCodes(updated);
  };

  return (
    <Box p={3}>
      <Typography variant="h6">
        Códigos escaneados para la lista: {listId}
      </Typography>

      <Box display="flex" gap={2} mt={2}>
        <TextField
          label="Código de barra"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button variant="contained" onClick={handleAdd}>
          Agregar
        </Button>
      </Box>

      <List>
        {codes.map((c) => (
          <ListItem
            key={c}
            secondaryAction={
              <IconButton onClick={() => handleRemove(c)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            {c}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
