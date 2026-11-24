import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CustomButton from "../../atoms/Button/CustomButton";

const celda = { py: 1, px: 1, borderColor: "text.primary" };
const campo = { "& .MuiOutlinedInput-root": { height: 38 } };

// tabla editable de variantes: cada fila es una talla y/o color con su SKU, stock y precio
const VariantTable = ({ variantes, errores = {}, onCambiar, onAgregar, onQuitar }) => {
  const cambiar = (indice, nombre, valor) => {
    const limpio = nombre === "sku" ? valor.toUpperCase().replace(/[^A-Z0-9-]/g, "") : valor;
    onCambiar(indice, { ...variantes[indice], [nombre]: limpio });
  };

  const sumar = (indice, cantidad) => {
    const actual = Number(variantes[indice].stock) || 0;
    onCambiar(indice, { ...variantes[indice], stock: String(Math.max(0, actual + cantidad)) });
  };

  return (
    <Box>
      {variantes.length > 0 && (
        <TableContainer sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, mb: 1.5 }}>
          <Table size="small" aria-label="Variantes del producto" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                {["Talla", "Color", "SKU", "Stock", "Precio", ""].map((titulo) => (
                  <TableCell key={titulo} sx={{ ...celda, fontWeight: 600 }}>
                    {titulo}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {variantes.map((v, i) => (
                <TableRow key={v.clave}>
                  <TableCell sx={{ ...celda, width: 76 }}>
                    <TextField
                      size="small"
                      value={v.talla}
                      placeholder="M"
                      onChange={(e) => cambiar(i, "talla", e.target.value)}
                      slotProps={{ htmlInput: { "aria-label": `Talla de la variante ${i + 1}`, maxLength: 20 } }}
                      sx={campo}
                    />
                  </TableCell>
                  <TableCell sx={celda}>
                    <TextField
                      size="small"
                      value={v.color}
                      placeholder="Azul marino"
                      onChange={(e) => cambiar(i, "color", e.target.value)}
                      slotProps={{ htmlInput: { "aria-label": `Color de la variante ${i + 1}`, maxLength: 40 } }}
                      sx={campo}
                    />
                  </TableCell>
                  <TableCell sx={{ ...celda, width: 175 }}>
                    <TextField
                      size="small"
                      value={v.sku}
                      placeholder="TDS-POL-M"
                      onChange={(e) => cambiar(i, "sku", e.target.value)}
                      slotProps={{ htmlInput: { "aria-label": `SKU de la variante ${i + 1}`, maxLength: 20 } }}
                      sx={campo}
                    />
                  </TableCell>
                  <TableCell sx={{ ...celda, width: 150 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => sumar(i, -1)} aria-label={`Restar stock a la variante ${i + 1}`}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={v.stock}
                        onChange={(e) => cambiar(i, "stock", e.target.value.replace(/\D/g, ""))}
                        slotProps={{ htmlInput: { "aria-label": `Stock de la variante ${i + 1}`, inputMode: "numeric" } }}
                        sx={{ ...campo, width: 64 }}
                      />
                      <IconButton size="small" onClick={() => sumar(i, 1)} aria-label={`Sumar stock a la variante ${i + 1}`}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...celda, width: 120 }}>
                    <TextField
                      size="small"
                      value={v.precio}
                      onChange={(e) => cambiar(i, "precio", e.target.value.replace(/\D/g, ""))}
                      slotProps={{ htmlInput: { "aria-label": `Precio de la variante ${i + 1}`, inputMode: "numeric" } }}
                      sx={campo}
                    />
                  </TableCell>
                  <TableCell sx={{ ...celda, width: 48 }}>
                    <IconButton onClick={() => onQuitar(i)} aria-label={`Quitar la variante ${i + 1}`} sx={{ color: "text.primary" }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {errores.variantes && (
        <Typography role="alert" sx={{ fontWeight: 600, mb: 1 }}>
          {errores.variantes}
        </Typography>
      )}
      <CustomButton tono="contorno" startIcon={<AddIcon />} onClick={onAgregar}>
        Agregar variante
      </CustomButton>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Cada variante tiene su propio SKU, stock y precio. Si agregas variantes, el stock del producto es la suma de todas.
      </Typography>
    </Box>
  );
};

export default VariantTable;
