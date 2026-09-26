import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { colors } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { nombreMesPorNumero } from '../../../../core/utils/fechas';
import type { InformeMensual } from '../../domain/finanzas';

/** 'YYYY-MM-DD' → '7 de septiembre de 2026', sin depender de zona horaria del motor. */
function formatearFechaCompleta(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return `${dia} de ${nombreMesPorNumero(mes)} de ${anio}`;
}

/**
 * Arma el HTML del informe. Diseño sobrio, con la paleta del proyecto: nada
 * de gráficas dentro del PDF, solo las cifras y el desglose en tablas.
 */
function construirHtml(informe: InformeMensual): string {
  const nombreMes = nombreMesPorNumero(informe.periodo.mes);
  const filasEgresos = informe.egresosPorCategoria
    .map(
      (categoria) => `
        <tr>
          <td>${categoria.nombre}</td>
          <td class="tipo">${categoria.tipo === 'gasto' ? 'Gasto' : 'Compra'}</td>
          <td class="num">${categoria.movimientos}</td>
          <td class="num">${formatearCOP(categoria.total)}</td>
        </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, Helvetica, Arial, sans-serif;
    color: ${colors.text};
    padding: 32px 40px;
    margin: 0;
  }
  .encabezado {
    border-bottom: 3px solid ${colors.primary};
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .encabezado h1 { color: ${colors.navy}; font-size: 22px; margin: 0 0 4px; }
  .encabezado .barberia { font-size: 14px; color: ${colors.textSecondary}; }
  .encabezado .periodo {
    display: inline-block;
    margin-top: 10px;
    background: ${colors.border};
    color: ${colors.navy};
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 12px;
  }
  h2 {
    color: ${colors.navy};
    font-size: 15px;
    margin: 28px 0 12px;
    border-left: 4px solid ${colors.primary};
    padding-left: 10px;
  }
  .tarjetas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .tarjeta {
    flex: 1 1 30%;
    border: 1px solid ${colors.border};
    border-radius: 10px;
    padding: 14px;
  }
  .tarjeta .etiqueta { font-size: 11px; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.4px; }
  .tarjeta .valor { font-size: 18px; font-weight: 700; color: ${colors.navy}; margin-top: 4px; }
  .tarjeta.utilidad { border-color: ${colors.primary}; background: #FBF4E7; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid ${colors.border}; }
  th { color: ${colors.textMuted}; font-weight: 700; font-size: 11px; text-transform: uppercase; }
  td.num, th.num { text-align: right; }
  td.tipo { color: ${colors.textMuted}; }
  .pie { margin-top: 32px; font-size: 10px; color: ${colors.placeholder}; text-align: center; }
</style>
</head>
<body>
  <div class="encabezado">
    <h1>${informe.barberia.nombre}</h1>
    <div class="barberia">
      ${informe.barberia.direccion ?? ''}${informe.barberia.telefono !== null ? ' · ' + informe.barberia.telefono : ''}
    </div>
    <div class="periodo">Informe de ${nombreMes} de ${informe.periodo.anio}</div>
  </div>

  <h2>Resumen del período</h2>
  <div class="tarjetas">
    <div class="tarjeta"><div class="etiqueta">Ingresos</div><div class="valor">${formatearCOP(informe.totales.ingresos)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Gastos</div><div class="valor">${formatearCOP(informe.totales.gastos)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Compras</div><div class="valor">${formatearCOP(informe.totales.compras)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Comisiones pagadas</div><div class="valor">${formatearCOP(informe.totales.comisiones)}</div></div>
    <div class="tarjeta utilidad"><div class="etiqueta">Utilidad</div><div class="valor">${formatearCOP(informe.totales.utilidad)}</div></div>
    <div class="tarjeta"><div class="etiqueta">Citas finalizadas</div><div class="valor">${informe.citasFinalizadas}</div></div>
  </div>

  <h2>Egresos por categoría</h2>
  ${
    informe.egresosPorCategoria.length === 0
      ? '<p style="color:' + colors.textMuted + '; font-size:12px;">No hubo gastos ni compras registrados en este período.</p>'
      : `<table>
          <thead>
            <tr><th>Categoría</th><th>Tipo</th><th class="num">Movimientos</th><th class="num">Total</th></tr>
          </thead>
          <tbody>${filasEgresos}</tbody>
        </table>`
  }

  <div class="pie">
    Generado por SmartCut · ${formatearFechaCompleta(informe.periodo.desde)} – ${formatearFechaCompleta(informe.periodo.hasta)}
  </div>
</body>
</html>`;
}

/**
 * Genera el PDF del informe mensual y abre el diálogo de compartir/guardar.
 *
 * `Print.printToFileAsync` deja el archivo en un nombre aleatorio dentro de
 * la caché de impresión; se copia a un nombre real con `expo-file-system`
 * (API de `File`/`Paths` de SDK 54 — la de `FileSystem.copyAsync` quedó
 * obsoleta y revienta en tiempo de ejecución) antes de compartirlo, para que
 * el archivo que la persona guarda se llame `SmartCut_Informe_2026-03.pdf` y
 * no algo como `image001.pdf`.
 */
export async function generarInformePDF(informe: InformeMensual): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: construirHtml(informe) });

  const mesPadded = `${informe.periodo.mes}`.padStart(2, '0');
  const nombreArchivo = `SmartCut_Informe_${informe.periodo.anio}-${mesPadded}.pdf`;

  const origen = new File(uri);
  const destino = new File(Paths.cache, nombreArchivo);
  origen.copy(destino);

  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    throw new Error('Compartir archivos no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(destino.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Informe mensual de SmartCut',
    UTI: 'com.adobe.pdf',
  });
}
