import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

// tabla de "lugar, nombre, cantidad, total" que usan los reportes
const RankingTable = ({ columnas, filas, vacio }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, borderColor: "text.primary" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columnas.map((columna, i) => (
              <TableCell key={columna} align={i >= 2 ? "right" : "left"} sx={{ fontWeight: 600 }}>
                {columna}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.map((fila) => (
            <TableRow key={fila[0]}>
              {fila.map((valor, i) => (
                <TableCell key={columnas[i]} align={i >= 2 ? "right" : "left"} sx={{ fontWeight: i === 0 ? 600 : 400 }}>
                  {valor}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {filas.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnas.length} sx={{ py: 3, textAlign: "center" }}>
                {vacio}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RankingTable;
