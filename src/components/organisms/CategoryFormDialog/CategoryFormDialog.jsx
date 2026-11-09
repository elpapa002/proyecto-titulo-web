import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import { normalizar } from "../../../utils/formato";

const NINGUNA = "ninguna";
const MINIMO = 3;
const MAXIMO = 40;

const limpiarNombre = (texto) => texto.trim().replace(/\s+/g, " ");

const CategoryFormDialog = ({ categoria, padreInicial, categorias, onCerrar, onGuardar }) => {
  const editando = Boolean(categoria);
  const [datos, setDatos] = useState({
    nombre: categoria?.nombre ?? "",
    padreId: (editando ? categoria.padreId : padreInicial) ?? NINGUNA,
  });
  const [errores, setErrores] = useState({});
  const [errorServicio, setErrorServicio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const tieneHijos = editando && categoria.padreId === null && categoria.subcategorias?.length > 0;
  const opciones = [
    { valor: NINGUNA, texto: "Ninguna (categoría principal)" },
    ...categorias.filter((c) => c.id !== categoria?.id).map((c) => ({ valor: c.id, texto: c.nombre })),
  ];

  const titulo = editando ? "Editar categoría" : padreInicial ? "Nueva subcategoría" : "Nueva categoría";

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    setErrores({ ...errores, [name]: undefined });
    setErrorServicio("");
  };

  const validar = () => {
    const e = {};
    const nombre = limpiarNombre(datos.nombre);
    const padre = categorias.find((c) => c.id === datos.padreId);
    const hermanas = datos.padreId === NINGUNA ? categorias : padre?.subcategorias ?? [];
    const repetida = hermanas.some(
      (h) => h.id !== categoria?.id && normalizar(limpiarNombre(h.nombre)) === normalizar(nombre)
    );

    if (!nombre) e.nombre = "Ingresa el nombre de la categoría.";
    else if (nombre.length < MINIMO || nombre.length > MAXIMO)
      e.nombre = `Debe tener entre ${MINIMO} y ${MAXIMO} caracteres.`;
    else if (!/^[\p{L} ]+$/u.test(nombre)) e.nombre = "Usa solo letras y espacios, sin números ni símbolos.";
    else if (repetida)
      e.nombre = padre
        ? `Ya existe una subcategoría con ese nombre en "${padre.nombre}".`
        : "Ya existe una categoría principal con ese nombre.";

    if (tieneHijos && datos.padreId !== NINGUNA)
      e.padreId = "Esta categoría tiene subcategorías, por eso no puede quedar dentro de otra.";
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datosCategoria = {
      nombre: limpiarNombre(datos.nombre),
      padreId: datos.padreId === NINGUNA ? null : datos.padreId,
    };

    setGuardando(true);
    const error = await onGuardar(datosCategoria);
    setGuardando(false);
    if (error) setErrorServicio(error);
  };

  const largo = limpiarNombre(datos.nombre).length;

  return (
    <Dialog
      open
      onClose={onCerrar}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { component: "form", onSubmit: enviar, noValidate: true } }}
    >
      <Box sx={{ px: 3, pt: 3, pr: 7, position: "relative" }}>
        <Typography variant="h2">{titulo}</Typography>
        <Typography sx={{ mt: 0.5 }}>
          Cada categoría puede tener una categoría padre. Los campos marcados con * son obligatorios.
        </Typography>
        <IconButton onClick={onCerrar} aria-label="Cerrar" sx={{ position: "absolute", top: 20, right: 16 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "20px !important" }}>
        <FormField
          label="Nombre"
          name="nombre"
          required
          placeholder="Guantes"
          value={datos.nombre}
          onChange={cambiar}
          error={Boolean(errores.nombre)}
          helperText={errores.nombre ?? `Solo letras y espacios · ${largo}/${MAXIMO} caracteres`}
        />
        <SelectField
          label="Categoría padre"
          name="padreId"
          value={datos.padreId}
          onChange={cambiar}
          opciones={opciones}
          error={Boolean(errores.padreId)}
          helperText={
            errores.padreId ??
            (tieneHijos
              ? "Tiene subcategorías, así que debe seguir como categoría principal."
              : "Elige 'Ninguna' para crear una categoría principal.")
          }
          sx={{ mt: 2 }}
        />

        {errorServicio && (
          <Box
            role="alert"
            sx={{
              mt: 2,
              p: 1.5,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 1,
            }}
          >
            <ErrorOutlineIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 600, color: "primary.main" }}>{errorServicio}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <CustomButton tono="contorno" onClick={onCerrar}>
          Cancelar
        </CustomButton>
        <CustomButton type="submit" startIcon={<CheckIcon />} disabled={guardando}>
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear categoría"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;
