import { useEffect, useState } from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import CategoryTree from "../../components/organisms/CategoryTree/CategoryTree";
import CategoryFormDialog from "../../components/organisms/CategoryFormDialog/CategoryFormDialog";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import CustomButton from "../../components/atoms/Button/CustomButton";
import SearchBar from "../../components/molecules/SearchBar/SearchBar";
import Notice from "../../components/molecules/Notice/Notice";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from "../../services/catalogService";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const CategoriesScreen = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recargas, setRecargas] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerCategorias();
      if (respuesta.ok) setCategorias(respuesta.datos);
      else setAviso("No se pudieron cargar las categorías.");
      setCargando(false);
    };
    cargar();
  }, [recargas]);

  const totalSubcategorias = categorias.reduce((suma, c) => suma + c.subcategorias.length, 0);
  const sinSubcategorias = categorias.filter((c) => c.subcategorias.length === 0).length;

  const guardar = async (datos) => {
    const original = formulario.categoria;
    console.log(original ? "Datos para actualizar categoría:" : "Datos para crear categoría:", datos);
    const respuesta = original
      ? await actualizarCategoria(original.id, datos)
      : await crearCategoria(datos);
    if (!respuesta.ok) return respuesta.error;

    if (original) setAviso("Categoría actualizada");
    else setAviso(datos.padreId ? "Subcategoría creada" : "Categoría creada");
    setFormulario(null);
    setRecargas((n) => n + 1);
    return "";
  };

  const confirmarBorrado = async () => {
    const categoria = aBorrar;
    const respuesta = await eliminarCategoria(categoria.id);
    setABorrar(null);
    if (!respuesta.ok) {
      setAviso(`No se pudo eliminar "${categoria.nombre}". ${respuesta.error}`);
      return;
    }
    console.log("Categoría eliminada:", { id: categoria.id, nombre: categoria.nombre, padreId: categoria.padreId });
    setAviso("Categoría eliminada");
    setRecargas((n) => n + 1);
  };

  return (
    <>
      <PageHeader
        titulo="Categorías"
        subtitulo="Organiza los productos y servicios en un árbol. Cada categoría puede tener una categoría padre."
        acciones={
          <CustomButton startIcon={<AddIcon />} onClick={() => setFormulario({ categoria: null, padreId: null })}>
            Nueva categoría
          </CustomButton>
        }
      />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Typography variant="h3">Árbol de categorías</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Usa la flecha para abrir o cerrar cada categoría principal.
            </Typography>
            <Box sx={{ maxWidth: { sm: 360 }, mt: 2, mb: 1.5 }}>
              <SearchBar
                label="Buscar categoría"
                placeholder="Nombre de la categoría"
                value={busqueda}
                onChange={setBusqueda}
              />
            </Box>
            <CategoryTree
              categorias={categorias}
              busqueda={busqueda}
              cargando={cargando}
              onAgregarSub={(padre) => setFormulario({ categoria: null, padreId: padre.id })}
              onEditar={(categoria) => setFormulario({ categoria, padreId: null })}
              onEliminar={setABorrar}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={tarjeta}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <InfoOutlinedIcon fontSize="small" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography>
                    Las categorías se usan al publicar productos y servicios: en el formulario se elige una
                    subcategoría. Los clientes pueden buscar y filtrar por ellas en la tienda.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    No se puede eliminar una categoría que tenga subcategorías o publicaciones.
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={tarjeta}>
              <Typography variant="h3" sx={{ mb: 1.5 }}>
                Resumen
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography>Categorías principales</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{categorias.length}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography>Subcategorías</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{totalSubcategorias}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography>Principales sin subcategorías</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{sinSubcategorias}</Typography>
                </Box>
              </Stack>
              {sinSubcategorias > 0 && (
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  Agrégales al menos una subcategoría para que se puedan usar al publicar.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {formulario && (
        <CategoryFormDialog
          categoria={formulario.categoria}
          padreInicial={formulario.padreId}
          categorias={categorias}
          onCerrar={() => setFormulario(null)}
          onGuardar={guardar}
        />
      )}

      <DeleteDialog
        open={Boolean(aBorrar)}
        titulo="¿Eliminar categoría?"
        mensaje={aBorrar ? `Vas a eliminar "${aBorrar.nombre}". Esta acción no se puede deshacer.` : ""}
        onCancelar={() => setABorrar(null)}
        onConfirmar={confirmarBorrado}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default CategoriesScreen;
