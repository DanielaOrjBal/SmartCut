const pool = require('../config/db');

const registrarBarberia = async (req, res) => {
  try {
    // Extraemos los datos que vendrán desde el formulario de la app móvil
    const { 
      nombre_barberia, 
      direccion, 
      telefono_barberia, 
      correo_barberia, 
      nombre_admin, 
      apellido_admin, 
      correo_admin, 
      contrasena_hash_admin, 
      telefono_admin 
    } = req.body;

    // Validación rápida para asegurar que no falten datos obligatorios
    if (!nombre_barberia || !nombre_admin || !correo_admin || !contrasena_hash_admin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la barbería y su administrador.' });
    }

    // Llamamos al procedimiento almacenado que ya tienes creado en tu base de datos
    const [resultado] = await pool.query(
      'CALL sp_crear_barberia_con_admin(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        nombre_barberia,
        direccion || null,
        telefono_barberia || null,
        correo_barberia || null,
        nombre_admin,
        apellido_admin || '',
        correo_admin,
        contrasena_hash_admin,
        telefono_admin || ''
      ]
    );

    // MySQL devuelve los resultados de los procedimientos en un array anidado
    const idBarberiaGenerado = resultado[0][0]?.id_barberia;

    return res.status(201).json({
      mensaje: '¡Barbería y administrador registrados con éxito usando el procedimiento almacenado!',
      id_barberia: idBarberiaGenerado
    });

  } catch (error) {
    console.error('Error al registrar la barbería mediante procedimiento:', error.message);
    return res.status(500).json({ error: error.message || 'Error interno en el servidor.' });
  }
};

module.exports = {
  registrarBarberia
};