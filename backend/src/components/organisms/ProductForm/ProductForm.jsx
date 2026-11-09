import { useState } from "react";
import { Box, Button, Grid, InputAdornment, Paper, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PageHeader from "../PageHeader/PageHeader";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";

const DOS_MB = 2 * 1024 * 1024;
const MAX_FOTOS = 4;
const ESTADOS = ["Publicada", "Pausada", "Borrador"];
const tarjeta = { p: 3, borderRadius: 1.5, borderColor: "text.primary" };

const ProductForm = ({ producto, tipoNuevo, categorias, productos, onGuardar, onCancelar }) => {
  const editando = Boolean(producto);
  const tipo = producto?.tipo ?? tipoNuevo;
  const esServicio = tipo === "Servicio";

  const [datos, setDatos] = useState({
    nombre: producto?.nombre ?? "",
    subcategoriaId: producto?.subcategoriaId ?? "",
    descripcion: producto?.descripcion ?? "",
    material: producto?.material ?? "",
    peso: producto?.peso ?? "",
    tamano: producto?.tamano ?? "",
    color: producto?.color ?? "",
    duracion: producto?.duracion ?? "",
    sku: producto?.sku ?? "",
    stock: producto?.stock ?? "",
    precio: producto?.precio ?? "",
    precioOferta: producto?.precioOferta ?? "",
    estado: producto?.estado ?? "Publicada",
    textoAlternativo: "",
  });
  const [fotos, setFotos] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    const valor = name === "sku" ? value.toUpperCase().replace(/[^A-Z0-9-]/g, "") : value;
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const subirFotos = (e) => {
    const archivos = [...(e.target.files ?? [])];
    if (archivos.length === 0) return;
    if (archivos.some((a) => !["image/jpeg", "image/png"].includes(a.type))) {
      setErrores({ ...errores, fotos: "Las fotos deben ser JPG o PNG." });
      return;
    }
    if (archivos.some((a) => a.size > DOS_MB)) {
      setErrores({ ...errores, fotos: "Cada foto puede pesar hasta 2 MB." });
      return;
    }
    const nuevas = archivos.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }));
    setFotos([...fotos, ...nuevas].slice(0, MAX_FOTOS));
    setErrores({ ...errores, fotos: undefined });
  };

  const opcionesCategoria = categorias.flatMap((c) =>
    c.subcategorias.map((s) => ({ valor: s.id, texto: `${c.nombre} › ${s.nombre}` }))
  );

  const validar = () => {
    const e = {};
    const entero = (valor) => /^\d+$/.test(String(valor));
    if (datos.nombre.trim().length < 3) e.nombre = "Ingresa un nombre de al menos 3 letras.";
    if (!datos.subcategoriaId) e.subcategoriaId = "Elige una categoría.";
    if (datos.descripcion.trim().length < 10) e.descripcion = "Describe la publicación con al menos 10 caracteres.";
    if (esServicio) {
      if (!datos.duracion.trim()) e.duracion = "Ingresa la duración del servicio.";
    } else {
      if (!datos.material.trim()) e.material = "Ingresa el material principal.";
      if (!datos.peso.trim()) e.peso = "Ingresa el peso.";
      if (!datos.tamano.trim()) e.tamano = "Ingresa el tamaño.";
      if (!datos.color.trim()) e.color = "Ingresa el color.";
      if (datos.sku.length < 3) e.sku = "El SKU debe tener al menos 3 caracteres.";
      else if (productos.some((p) => p.id !== producto?.id && p.sku === datos.sku)) e.sku = "Ya tienes una publicación con este SKU.";
    }
    if (!entero(datos.stock)) e.stock = esServicio ? "Ingresa los cupos, solo números." : "Ingresa el stock, solo números.";
    if (!entero(datos.precio) || Number(datos.precio) < 100) e.precio = "Ingresa un precio válido, sin puntos.";
    if (datos.precioOferta !== "" && datos.precioOferta !== null) {
      if (!entero(datos.precioOferta)) e.precioOferta = "Solo números, sin puntos.";
      else if (Number(datos.precioOferta) >= Number(datos.precio)) e.precioOferta = "Debe ser menor que el precio oficial.";
    }
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const comoBorrador = evento.nativeEvent.submitter?.value === "borrador";
    const subcategoriaId = Number(datos.subcategoriaId);
    const categoria = categorias.find((c) => c.subcategorias.some((s) => s.id === subcategoriaId));
    const datosProducto = {
      tipo,
      nombre: datos.nombre.trim(),
      categoriaId: categoria.id,
      subcategoriaId,
      descripcion: datos.descripcion.trim(),
      material: esServicio ? "" : datos.material.trim(),
      peso: esServicio ? "" : datos.peso.trim(),
      tamano: esServicio ? "" : datos.tamano.trim(),
      color: esServicio ? "" : datos.color.trim(),
      duracion: esServicio ? datos.duracion.trim() : "",
      sku: esServicio ? "" : datos.sku,
      stock: Number(datos.stock),
      precio: Number(datos.precio),
      precioOferta: datos.precioOferta === "" || datos.precioOferta === null ? null : Number(datos.precioOferta),
      estado: comoBorrador ? "Borrador" : datos.estado,
      fotos: fotos.map((f) => f.archivo.name),
      textoAlternativo: datos.textoAlternativo.trim(),
    };
    console.log(editando ? "Datos para actualizar publicación:" : "Datos para crear publicación:", datosProducto);

    setGuardando(true);
    await onGuardar(datosProducto);
    setGuardando(false);
  };

  const titulo = editando ? "Editar publicación" : esServicio ? "Publicar servicio" : "Publicar producto";
  const descuento =
    datos.precioOferta && Number(datos.precio) > Number(datos.precioOferta)
      ? Math.round((1 - Number(datos.precioOferta) / Number(datos.precio)) * 100)
      : 0;
  const campo = (name, props) => ({
    name,
    value: datos[name],
    onChange: cambiar,
    error: Boolean(errores[name]),
    helperText: errores[name] ?? props?.ayuda,
  });

  return (
    <Box component="form" onSubmit={enviar} noValidate>
      <PageHeader
        titulo={titulo}
        subtitulo="Los campos marcados con * son obligatorios."
        acciones={
          <>
            <CustomButton tono="contorno" onClick={onCancelar}>
              Cancelar
            </CustomButton>
            <CustomButton tono="contorno" type="submit" value="borrador" disabled={guardando}>
              Guardar borrador
            </CustomButton>
            <CustomButton type="submit" value="guardar" startIcon={<CheckIcon />} disabled={guardando}>
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Publicar"}
            </CustomButton>
          </>
        }
      />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Información básica
              </Typography>
              <Stack spacing={2}>
                <FormField
                  label={esServicio ? "Nombre del servicio" : "Nombre del producto"}
                  placeholder={esServicio ? "Taller de bordado a mano" : "Polerón bordado Osorno"}
                  required
                  {...campo("nombre")}
                />
                <SelectField
                  label="Categoría"
                  required
                  opciones={opcionesCategoria}
                  {...campo("subcategoriaId", { ayuda: "Elige la categoría y subcategoría." })}
                />
                <FormField label="Descripción" multiline minRows={3} required {...campo("descripcion")} />
                {esServicio ? (
                  <FormField label="Duración" placeholder="3 horas" required {...campo("duracion")} />
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField label="Material principal" placeholder="Algodón orgánico" required {...campo("material")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField label="Peso" placeholder="450 g" required {...campo("peso")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField label="Tamaño" placeholder="Tallas S a XL" required {...campo("tamano")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField label="Color" placeholder="Gris, azul marino y negro" required {...campo("color")} />
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {esServicio ? "Cupos" : "SKU y stock"}
              </Typography>
              <Grid container spacing={2}>
                {!esServicio && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField
                      label="SKU"
                      placeholder="TDS-POL"
                      required
                      {...campo("sku", { ayuda: "Código interno, letras, números y guion." })}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label={esServicio ? "Cupos disponibles" : "Stock (unidades)"}
                    type="number"
                    required
                    slotProps={{ htmlInput: { min: 0 } }}
                    {...campo("stock")}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Fotos
              </Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<FileUploadOutlinedIcon />}
                sx={{ borderStyle: "dashed", py: 2 }}
                disabled={fotos.length >= MAX_FOTOS}
              >
                Subir fotos (máximo {MAX_FOTOS})
                <Box component="input" hidden type="file" multiple accept="image/png,image/jpeg" onChange={subirFotos} />
              </Button>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: errores.fotos ? 600 : 400 }} role={errores.fotos ? "alert" : undefined}>
                {errores.fotos ?? "JPG o PNG de hasta 2 MB cada una."}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, my: 2 }}>
                {Array.from({ length: MAX_FOTOS }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      aspectRatio: "1",
                      border: "1px solid",
                      borderColor: "text.primary",
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    {fotos[i] ? (
                      <Box component="img" src={fotos[i].url} alt={`Foto ${i + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ImageOutlinedIcon fontSize="small" />
                    )}
                  </Box>
                ))}
              </Box>
              <FormField
                label="Texto alternativo de la foto principal"
                placeholder="Polerón gris con volcanes bordados"
                {...campo("textoAlternativo", { ayuda: "Describe la foto para personas que usan lector de pantalla." })}
              />
            </Paper>

            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Precio y estado
              </Typography>
              <Stack spacing={2}>
                <FormField
                  label="Precio oficial"
                  type="number"
                  required
                  slotProps={{
                    htmlInput: { min: 0 },
                    input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                  }}
                  {...campo("precio", { ayuda: "IVA incluido, en pesos chilenos." })}
                />
                <FormField
                  label="Precio de oferta (opcional)"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0 },
                    input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                  }}
                  {...campo("precioOferta", { ayuda: descuento ? `Descuento de ${descuento}%` : "Déjalo vacío si no tiene oferta." })}
                />
                <SelectField
                  label="Estado"
                  required
                  opciones={ESTADOS.map((estado) => ({ valor: estado, texto: estado }))}
                  {...campo("estado")}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
