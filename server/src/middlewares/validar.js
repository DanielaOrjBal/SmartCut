/**
 * Valida una parte de la petición con un esquema de Zod 4.
 *
 * Si pasa, reemplaza el objeto original por el ya parseado (con los valores
 * por defecto y las conversiones aplicadas). Si no pasa, responde 400 con la
 * lista de campos que fallaron, para que la app pueda señalar el input exacto.
 *
 * @param {import('zod').ZodType} esquema
 * @param {'body'|'params'|'query'} origen
 */
function validar(esquema, origen = 'body') {
  return (req, res, next) => {
    const resultado = esquema.safeParse(req[origen]);

    if (!resultado.success) {
      // En Zod 4 los fallos vienen en error.issues, con path como array.
      const errores = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(raíz)',
        mensaje: issue.message,
      }));

      return res.status(400).json({
        mensaje: errores[0]?.mensaje || 'Los datos enviados no son válidos.',
        errores,
      });
    }

    // req.query es de solo lectura en Express 5: se guarda aparte.
    if (origen === 'query') {
      req.queryValidada = resultado.data;
    } else {
      req[origen] = resultado.data;
    }
    return next();
  };
}

module.exports = { validar };
