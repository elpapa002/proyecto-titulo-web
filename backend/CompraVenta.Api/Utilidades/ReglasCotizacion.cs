using CompraVenta.Api.Models;

namespace CompraVenta.Api.Utilidades
{
    // una cotizacion respondida mantiene sus valores 15 dias; si el cliente no la acepta pasa a Expirada,
    // su precio se reajusta cada semana y se elimina a los 45 dias de haber expirado
    public static class ReglasCotizacion
    {
        public const int DiasVigencia = 15;
        public const int DiasParaEliminar = 45;

        // porcentaje de reajuste por semana (Cotizaciones__ReajusteSemanal en el .env o appsettings.json)
        public static decimal ReajusteSemanal { get; private set; } = 2m;

        public static void Configurar(decimal? porcentaje)
        {
            if (porcentaje != null && porcentaje >= 0 && porcentaje <= 50) ReajusteSemanal = porcentaje.Value;
        }

        public static bool EstaExpirada(Cotizacion cotizacion)
        {
            return cotizacion.Estado == "Respondida" && cotizacion.Vigencia != null && cotizacion.Vigencia < Validaciones.Hoy();
        }

        // cuenta la semana en que expiro y cada semana completa despues de esa
        public static int Semanas(Cotizacion cotizacion)
        {
            if (!EstaExpirada(cotizacion)) return 0;
            return (Validaciones.Hoy().DayNumber - cotizacion.Vigencia.Value.DayNumber - 1) / 7 + 1;
        }

        public static int Reajustar(int valor, int semanas)
        {
            if (semanas <= 0) return valor;
            var factor = Math.Pow(1 + (double)ReajusteSemanal / 100, semanas);
            return (int)Math.Round(valor * factor, MidpointRounding.AwayFromZero);
        }

        public static DateOnly? EliminaEl(Cotizacion cotizacion)
        {
            return cotizacion.Vigencia?.AddDays(DiasParaEliminar);
        }

        public static bool DebeEliminarse(Cotizacion cotizacion)
        {
            return EstaExpirada(cotizacion) && EliminaEl(cotizacion) <= Validaciones.Hoy();
        }
    }
}
