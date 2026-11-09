import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../../components/organisms/PageHeader/PageHeader";
import PurchaseTable from "../../components/organisms/PurchaseTable/PurchaseTable";
import InfoHint from "../../components/molecules/InfoHint/InfoHint";
import Notice from "../../components/molecules/Notice/Notice";
import useUser from "../../contexts/UserContext/useUser";
import { obtenerMisCompras } from "../../services/ventaService";

const MyPurchasesScreen = () => {
  const { usuario } = useUser();
  const { esMovil } = useOutletContext();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const respuesta = await obtenerMisCompras(usuario.id);
      if (respuesta.ok) setCompras([...respuesta.datos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id));
      else setAviso("No se pudieron cargar tus compras.");
      setCargando(false);
    };
    cargar();
  }, [usuario.id]);

  return (
    <>
      <PageHeader titulo="Mis compras" subtitulo="Todas tus compras y el estado de cada una." />

      <PurchaseTable compras={compras} cargando={cargando} esMovil={esMovil} />

      <InfoHint
        texto="Entra al detalle de una compra para ver el seguimiento del envío. Cuando el pedido esté entregado podrás calificarlo o pedir una devolución."
        sx={{ mt: 2 }}
      />

      <Notice mensaje={aviso} onClose={() => setAviso("")} />
    </>
  );
};

export default MyPurchasesScreen;
