import { useState } from "react";
import { Box, Divider, Grid, Paper, Typography } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import CheckoutSteps from "../../components/organisms/CheckoutSteps/CheckoutSteps";
import PurchaseSummary from "../../components/organisms/PurchaseSummary/PurchaseSummary";
import DeleteDialog from "../../components/organisms/DeleteDialog/DeleteDialog";
import CartItem from "../../components/molecules/CartItem/CartItem";
import Notice from "../../components/molecules/Notice/Notice";
import CustomButton from "../../components/atoms/Button/CustomButton";
import StatusChip from "../../components/atoms/StatusChip/StatusChip";
import { formatearPrecio } from "../../utils/formato";

const tarjeta = { p: 2.5, borderRadius: 1.5, borderColor: "text.primary" };

const CartScreen = () => {
  const navigate = useNavigate();
  const { carro, cambiarCantidad, quitarDelCarro, vaciarCarro, esMovil } = useOutletContext();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const [aviso, setAviso] = useState("");

  const unidades = carro.reduce((suma, item) => suma + item.cantidad, 0);
  const subtotal = carro.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  const cerrarAviso = (_, razon) => {
    if (razon !== "clickaway") setAviso("");
  };

  const quitar = (item) => {
    console.log("Producto quitado del carro:", { productoId: item.productoId, nombre: item.nombre, cantidad: item.cantidad });
    quitarDelCarro(item.productoId);
    setAviso("Producto quitado del carro");
  };

  const vaciar = () => {
    console.log("Carro vaciado:", {
      tienda: carro[0]?.tienda,
      productos: carro.map((item) => ({ productoId: item.productoId, nombre: item.nombre, cantidad: item.cantidad })),
    });
    vaciarCarro();
    setConfirmarVaciar(false);
    setAviso("Carro vaciado");
  };

  if (carro.length === 0) {
    return (
      <>
        <PageHeader titulo="Carro de compras" subtitulo="Aquí aparecen los productos que vas a comprar." />
        <Paper variant="outlined" sx={{ ...tarjeta, p: 4, textAlign: "center" }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" sx={{ mt: 1 }}>
            Tu carro está vacío
          </Typography>
          <Typography sx={{ mt: 1, mb: 2 }}>
            Entra a la ficha de un producto, elige la cantidad y toca "Agregar al carro".
          </Typography>
          <CustomButton onClick={() => navigate("/tienda")}>Ir a la tienda</CustomButton>
        </Paper>
        <Notice mensaje={aviso} onClose={cerrarAviso} />
      </>
    );
  }

  const tienda = carro[0].tienda;

  return (
    <>
      <CheckoutSteps actual={1} esMovil={esMovil} />
      <PageHeader
        titulo="Carro de compras"
        subtitulo={`${unidades} ${unidades === 1 ? "unidad" : "unidades"} de ${tienda}. Los precios incluyen IVA.`}
      />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={tarjeta}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", pb: 1.5 }}>
              <StorefrontOutlinedIcon fontSize="small" />
              <Typography sx={{ fontWeight: 600 }}>Vendedor: {tienda}</Typography>
              <StatusChip texto="Un vendedor por compra" />
              <CustomButton
                tono="contorno"
                size="small"
                startIcon={<DeleteOutlinedIcon />}
                onClick={() => setConfirmarVaciar(true)}
                sx={{ ml: "auto", minHeight: 32 }}
              >
                Vaciar carro
              </CustomButton>
            </Box>
            <Divider />
            {carro.map((item, i) => (
              <Box key={item.productoId}>
                {i > 0 && <Divider />}
                <CartItem
                  item={item}
                  onCantidad={(cantidad) => cambiarCantidad(item.productoId, cantidad)}
                  onQuitar={() => quitar(item)}
                />
              </Box>
            ))}
          </Paper>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              border: "1px solid",
              borderColor: "text.primary",
              borderRadius: 1,
              p: 1.25,
              mt: 2,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
            <Typography>
              Cada compra es de un solo emprendedor. Para comprarle a otro, termina esta compra o vacía el carro. Las
              cantidades no pueden superar el stock disponible.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PurchaseSummary
            filas={[
              { texto: `Productos (${unidades})`, valor: formatearPrecio(subtotal) },
              { texto: "Despacho", valor: "Se calcula en el siguiente paso" },
            ]}
            total={{ texto: "Subtotal", valor: formatearPrecio(subtotal) }}
          >
            <CustomButton fullWidth onClick={() => navigate("/tienda/compra")}>
              Continuar con el despacho
            </CustomButton>
            <CustomButton tono="contorno" fullWidth onClick={() => navigate("/tienda")}>
              Seguir comprando
            </CustomButton>
          </PurchaseSummary>
        </Grid>
      </Grid>

      <DeleteDialog
        open={confirmarVaciar}
        titulo="¿Vaciar el carro?"
        mensaje={`Se quitarán ${carro.length === 1 ? "el producto" : `los ${carro.length} productos`} de ${tienda}. Esta acción no se puede deshacer.`}
        onCancelar={() => setConfirmarVaciar(false)}
        onConfirmar={vaciar}
      />

      <Notice mensaje={aviso} onClose={cerrarAviso} />
    </>
  );
};

export default CartScreen;
