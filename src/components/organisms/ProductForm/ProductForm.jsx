import { useState } from "react";
import { Autocomplete, Box, Chip, Grid, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PageHeader from "../PageHeader/PageHeader";
import VariantTable from "../VariantTable/VariantTable";
import PhotoUploader from "../PhotoUploader/PhotoUploader";
import CustomButton from "../../atoms/Button/CustomButton";
import FormField from "../../molecules/FormField/FormField";
import SelectField from "../../molecules/SelectField/SelectField";
import { urlFoto } from "../../../services/api";

const ESTADOS = ["Publicada", "Pausada", "Borrador"];
const MAX_RELACIONADOS = 6;
const tarjeta = { p: 3, borderRadius: 1.5, borderColor: "text.primary" };
const entero = (valor) => /^\d+$/.test(String(valor));

// clave solo para React (las variantes nuevas todavia no tienen id)
let siguienteClave = 1;
const aFila = (v) => ({ ...v, clave: siguienteClave++, stock: String(v.stock), precio: String(v.precio) });

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
    edadMinima: producto?.edadMinima ?? 0,
    estado: producto?.estado ?? "Publicada",
    textoAlternativo: producto?.textoAlternativo ?? "",
  });
  const [fotos, setFotos] = useState(() => (producto?.fotos ?? []).map((f) => ({ id: f.id, url: urlFoto(f) })));
  const [variantes, setVariantes] = useState(() => (producto?.variantes ?? []).map(aFila));
  const [relacionados, setRelacionados] = useState(producto?.relacionados ?? []);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const conVariantes = !esServicio && variantes.length > 0;
  const stockVariantes = variantes.reduce((suma, v) => suma + (Number(v.stock) || 0), 0);
  const elegibles = productos.filter((p) => p.id !== producto?.id);

  const cambiarVariante = (indice, fila) => {
    setVariantes(variantes.map((v, i) => (i === indice ? fila : v)));
    setErrores({ ...errores, variantes: undefined });
  };

  const agregarVariante = () => {
    const sku = datos.sku ? `${datos.sku}-${variantes.length + 1}` : "";
    setVariantes([...variantes, aFila({ talla: "", color: "", sku, stock: 0, precio: datos.precio || "" })]);
  };

  const cambiar = (e) => {
    const { name, value } = e.target;
    const valor = name === "sku" ? value.toUpperCase().replace(/[^A-Z0-9-]/g, "") : value;
    setDatos({ ...datos, [name]: valor });
    setErrores({ ...errores, [name]: undefined });
  };

  const revisarVariantes = () => {
    const vistas = new Set();
    const skus = new Set([datos.sku]);
    for (const v of variantes) {
      const nombre = [v.talla.trim(), v.color.trim()].filter(Boolean).join(" ");
      if (!nombre) return "Cada variante necesita una talla, un color o ambos.";
      if (!/^[A-Z0-9-]{3,20}$/.test(v.sku)) return `El SKU de la variante ${nombre} debe tener al menos 3 caracteres.`;
      if (skus.has(v.sku)) return `El SKU ${v.sku} está repetido. Cada variante debe tener un SKU distinto.`;
      if (!entero(v.stock)) return `Ingresa el stock de la variante ${nombre}, solo números.`;
      if (!entero(v.precio) || Number(v.precio) < 100) return `Ingresa un precio válido para la variante ${nombre}.`;
      const combinacion = `${v.talla.trim().toLowerCase()}|${v.color.trim().toLowerCase()}`;
      if (vistas.has(combinacion)) return `La variante ${nombre} está repetida.`;
      vistas.add(combinacion);
      skus.add(v.sku);
    }
    return undefined;
  };

  const opcionesCategoria = categorias.flatMap((c) =>
    c.subcategorias.map((s) => ({ valor: s.id, texto: `${c.nombre} › ${s.nombre}` }))
  );

  const validar = () => {
    const e = {};
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
    if (!conVariantes && !entero(datos.stock)) e.stock = esServicio ? "Ingresa los cupos, solo números." : "Ingresa el stock, solo números.";
    if (conVariantes) e.variantes = revisarVariantes();
    if (!e.variantes) delete e.variantes;
    if (!entero(datos.precio) || Number(datos.precio) < 100) e.precio = "Ingresa un precio válido, sin puntos.";
    if (esServicio && (!entero(datos.edadMinima) || Number(datos.edadMinima) > 99))
      e.edadMinima = "Ingresa una edad entre 0 y 99. Usa 0 si no tiene restricción.";
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
      stock: conVariantes ? stockVariantes : Number(datos.stock),
      precio: Number(datos.precio),
      edadMinima: esServicio ? Number(datos.edadMinima) : 0,
      estado: comoBorrador ? "Borrador" : datos.estado,
      textoAlternativo: datos.textoAlternativo.trim(),
      variantes: esServicio
        ? []
        : variantes.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            talla: v.talla.trim(),
            color: v.color.trim(),
            sku: v.sku,
            stock: Number(v.stock),
            precio: Number(v.precio),
          })),
      relacionados,
    };
    // las fotos nuevas se suben despues de guardar; las que se quitaron se eliminan
    const cambiosFotos = {
      nuevas: fotos.filter((f) => f.nueva).map((f) => f.nueva),
      borradas: (producto?.fotos ?? []).filter((f) => !fotos.some((actual) => actual.id === f.id)).map((f) => f.id),
    };
    console.log(editando ? "Datos para actualizar publicación:" : "Datos para crear publicación:", {
      ...datosProducto,
      fotosNuevas: cambiosFotos.nuevas.map((f) => f.nombre),
      fotosQuitadas: cambiosFotos.borradas,
    });

    setGuardando(true);
    await onGuardar(datosProducto, cambiosFotos);
    setGuardando(false);
  };

  const titulo = editando ? "Editar publicación" : esServicio ? "Publicar servicio" : "Publicar producto";
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
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField label="Duración" placeholder="3 horas" required {...campo("duracion")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormField
                        label="Edad mínima"
                        type="number"
                        required
                        slotProps={{ htmlInput: { min: 0, max: 99 } }}
                        {...campo("edadMinima", { ayuda: "0 si cualquier edad puede tomar el servicio." })}
                      />
                    </Grid>
                  </Grid>
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
                {esServicio ? "Cupos" : "Variantes, SKU y stock"}
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
                  {conVariantes ? (
                    <FormField
                      label="Stock (unidades)"
                      value={stockVariantes}
                      disabled
                      helperText="Suma del stock de las variantes."
                    />
                  ) : (
                    <FormField
                      label={esServicio ? "Cupos disponibles" : "Stock (unidades)"}
                      type="number"
                      required
                      slotProps={{ htmlInput: { min: 0 } }}
                      {...campo("stock")}
                    />
                  )}
                </Grid>
              </Grid>
              {!esServicio && (
                <Box sx={{ mt: 2.5 }}>
                  <VariantTable
                    variantes={variantes}
                    errores={errores}
                    onCambiar={cambiarVariante}
                    onAgregar={agregarVariante}
                    onQuitar={(indice) => setVariantes(variantes.filter((_, i) => i !== indice))}
                  />
                </Box>
              )}
            </Paper>

            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Productos relacionados
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Elige hasta {MAX_RELACIONADOS} publicaciones tuyas para mostrarlas en la ficha como "También te puede
                interesar".
              </Typography>
              <Autocomplete
                multiple
                options={elegibles.map((p) => p.id)}
                value={relacionados}
                onChange={(_, valor) => setRelacionados(valor.slice(0, MAX_RELACIONADOS))}
                getOptionLabel={(id) => elegibles.find((p) => p.id === id)?.nombre ?? `Publicación ${id}`}
                noOptionsText="No hay publicaciones con ese nombre"
                renderValue={(valor, getItemProps) =>
                  valor.map((id, indice) => {
                    const { key, ...props } = getItemProps({ index: indice });
                    return (
                      <Chip
                        key={key}
                        label={elegibles.find((p) => p.id === id)?.nombre ?? `Publicación ${id}`}
                        {...props}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Buscar en mis publicaciones" aria-label="Buscar en mis publicaciones" />
                )}
              />
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Fotos
              </Typography>
              <PhotoUploader
                fotos={fotos}
                error={errores.fotos}
                onCambiar={setFotos}
                onError={(texto) => setErrores((actuales) => ({ ...actuales, fotos: texto || undefined }))}
              />
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
                <Typography variant="body2">Las ofertas por tiempo limitado se crean en la sección Ofertas.</Typography>
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
