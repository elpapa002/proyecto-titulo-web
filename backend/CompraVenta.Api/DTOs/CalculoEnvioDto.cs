namespace CompraVenta.Api.DTOs
{
    // costo de despacho para una comuna y un peso
    public class CalculoEnvioDto
    {
        public string Comuna { get; set; }
        // la fila de la tabla que se uso (la comuna o "Resto de la región")
        public string Zona { get; set; }
        public string Forma { get; set; }
        public decimal Peso { get; set; }
        public int Costo { get; set; }
        public int Dias { get; set; }
        public string Detalle { get; set; }
    }
}
