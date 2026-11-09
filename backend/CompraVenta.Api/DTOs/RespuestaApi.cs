namespace CompraVenta.Api.DTOs
{
    public class RespuestaApi
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
        public List<string> Errors { get; set; }

        public static RespuestaApi Exito(string mensaje, object datos)
        {
            return new RespuestaApi { Success = true, Message = mensaje, Data = datos, Errors = null };
        }

        public static RespuestaApi Error(string mensaje, List<string> errores = null)
        {
            return new RespuestaApi { Success = false, Message = mensaje, Data = null, Errors = errores };
        }
    }
}
