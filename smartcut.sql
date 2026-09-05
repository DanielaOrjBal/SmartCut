-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-08-2026 a las 07:17:52
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `smartcut`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_coordenadas_barberia` (IN `p_id_barberia` BIGINT UNSIGNED, IN `p_latitud` DECIMAL(10,8), IN `p_longitud` DECIMAL(11,8))   BEGIN
    UPDATE Barberia SET latitud = p_latitud, longitud = p_longitud WHERE id_barberia = p_id_barberia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_estado_cita` (IN `p_id_cita` BIGINT UNSIGNED, IN `p_nuevo_estado` VARCHAR(20))   BEGIN
    UPDATE Cita SET estado = p_nuevo_estado WHERE id_cita = p_id_cita;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_horario_barberia` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_dias_atencion` VARCHAR(100), IN `p_hora_apertura` TIME, IN `p_hora_cierre` TIME, IN `p_duracion_turno_minutos` INT UNSIGNED)   BEGIN
    UPDATE Barberia
    SET dias_atencion = p_dias_atencion,
        hora_apertura = p_hora_apertura,
        hora_cierre = p_hora_cierre,
        duracion_turno_minutos = p_duracion_turno_minutos
    WHERE id_barberia = p_barberia_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agregar_servicio_a_cita` (IN `p_cita_id` BIGINT UNSIGNED, IN `p_servicio_id` BIGINT UNSIGNED)   BEGIN
    DECLARE v_precio DECIMAL(14,2);
    DECLARE v_duracion INT UNSIGNED;

    SELECT precio, duracion_minutos INTO v_precio, v_duracion
    FROM Servicio WHERE id_servicio = p_servicio_id;

    INSERT INTO CitaServicio(cita_id, servicio_id, precio_aplicado, duracion_aplicada)
    VALUES (p_cita_id, p_servicio_id, v_precio, v_duracion);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_buscar_barberias_cercanas` (IN `p_latitud` DECIMAL(10,8), IN `p_longitud` DECIMAL(11,8), IN `p_radio_km` DECIMAL(10,2))   BEGIN
    SELECT id_barberia, nombre, direccion, telefono,
           fn_calcular_distancia_barberia(p_latitud, p_longitud, latitud, longitud) AS distancia_km
    FROM Barberia
    WHERE estado = 'activa' AND latitud IS NOT NULL AND longitud IS NOT NULL
    HAVING distancia_km <= p_radio_km
    ORDER BY distancia_km ASC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cancelar_cita` (IN `p_id_cita` BIGINT UNSIGNED, IN `p_cancelada_por` VARCHAR(10), IN `p_motivo` VARCHAR(255))   BEGIN
    -- trg_cita_validar_cancelacion_1h valida automáticamente el tiempo mínimo
    UPDATE Cita
    SET estado = 'cancelada', cancelada_por = p_cancelada_por,
        motivo_cancelacion = p_motivo, fecha_cancelacion = NOW()
    WHERE id_cita = p_id_cita;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_barberia` (IN `p_nombre` VARCHAR(150), IN `p_direccion` VARCHAR(200), IN `p_telefono` VARCHAR(20), IN `p_correo` VARCHAR(150))   BEGIN
    INSERT INTO Barberia(nombre, direccion, telefono, correo)
    VALUES (p_nombre, p_direccion, p_telefono, p_correo);
    SELECT LAST_INSERT_ID() AS id_barberia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_barberia_con_admin` (IN `p_nombre_barberia` VARCHAR(150), IN `p_direccion` VARCHAR(200), IN `p_telefono_barberia` VARCHAR(20), IN `p_correo_barberia` VARCHAR(150), IN `p_nombre_admin` VARCHAR(80), IN `p_apellido_admin` VARCHAR(80), IN `p_correo_admin` VARCHAR(150), IN `p_contrasena_hash_admin` VARCHAR(255), IN `p_telefono_admin` VARCHAR(20))   BEGIN
    DECLARE v_id_barberia BIGINT UNSIGNED;
    START TRANSACTION;
        INSERT INTO Barberia(nombre, direccion, telefono, correo)
        VALUES (p_nombre_barberia, p_direccion, p_telefono_barberia, p_correo_barberia);
        SET v_id_barberia = LAST_INSERT_ID();

        INSERT INTO Barbero(barberia_id, nombre, apellido, correo, contrasena_hash, telefono, es_admin, estado, fecha_ingreso)
        VALUES (v_id_barberia, p_nombre_admin, p_apellido_admin, p_correo_admin, p_contrasena_hash_admin, p_telefono_admin, TRUE, 'activo', CURDATE());
    COMMIT;
    SELECT v_id_barberia AS id_barberia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_barbero` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(80), IN `p_apellido` VARCHAR(80), IN `p_correo` VARCHAR(150), IN `p_contrasena_hash` VARCHAR(255), IN `p_telefono` VARCHAR(20), IN `p_es_admin` BOOLEAN)   BEGIN
    INSERT INTO Barbero(barberia_id, nombre, apellido, correo, contrasena_hash, telefono, es_admin, estado, fecha_ingreso)
    VALUES (p_barberia_id, p_nombre, p_apellido, p_correo, p_contrasena_hash, p_telefono, p_es_admin, 'activo', CURDATE());
    SELECT LAST_INSERT_ID() AS id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_categoria_movimiento` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(50), IN `p_tipo` VARCHAR(10))   BEGIN
    INSERT INTO CategoriaMovimiento(barberia_id, nombre, tipo) VALUES (p_barberia_id, p_nombre, p_tipo);
    SELECT LAST_INSERT_ID() AS id_categoria;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_cita` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_cliente_id` BIGINT UNSIGNED, IN `p_barbero_id` BIGINT UNSIGNED, IN `p_fecha` DATE, IN `p_hora_inicio` TIME)   BEGIN
    INSERT INTO Cita(barberia_id, cliente_id, barbero_id, fecha, hora_inicio, hora_fin)
    VALUES (p_barberia_id, p_cliente_id, p_barbero_id, p_fecha, p_hora_inicio, p_hora_inicio);
    SELECT LAST_INSERT_ID() AS id_cita;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_cliente` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(80), IN `p_apellido` VARCHAR(80), IN `p_cedula` VARCHAR(20), IN `p_telefono` VARCHAR(20), IN `p_correo` VARCHAR(150), IN `p_fecha_nacimiento` DATE)   BEGIN
    INSERT INTO Cliente(barberia_id, nombre, apellido, cedula, telefono, correo, fecha_nacimiento)
    VALUES (p_barberia_id, p_nombre, p_apellido, p_cedula, p_telefono, p_correo, p_fecha_nacimiento);
    SELECT LAST_INSERT_ID() AS id_cliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_disponibilidad` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_barbero_id` BIGINT UNSIGNED, IN `p_fecha` DATE, IN `p_hora_inicio` TIME, IN `p_hora_fin` TIME)   BEGIN
    INSERT INTO DisponibilidadBarbero(barberia_id, barbero_id, fecha, hora_inicio, hora_fin)
    VALUES (p_barberia_id, p_barbero_id, p_fecha, p_hora_inicio, p_hora_fin)
    ON DUPLICATE KEY UPDATE hora_inicio = p_hora_inicio, hora_fin = p_hora_fin;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_servicio` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_categoria` VARCHAR(20), IN `p_nombre` VARCHAR(100), IN `p_descripcion` TEXT, IN `p_duracion_minutos` INT UNSIGNED, IN `p_precio` DECIMAL(14,2))   BEGIN
    INSERT INTO Servicio(barberia_id, categoria, nombre, descripcion, duracion_minutos, precio)
    VALUES (p_barberia_id, p_categoria, p_nombre, p_descripcion, p_duracion_minutos, p_precio);
    SELECT LAST_INSERT_ID() AS id_servicio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_desactivar_barbero` (IN `p_id_barbero` BIGINT UNSIGNED)   BEGIN
    UPDATE Barbero SET estado = 'inactivo' WHERE id_barbero = p_id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_desactivar_categoria_movimiento` (IN `p_id_categoria` BIGINT UNSIGNED)   BEGIN
    UPDATE CategoriaMovimiento SET activo = FALSE WHERE id_categoria = p_id_categoria;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_desactivar_cliente` (IN `p_id_cliente` BIGINT UNSIGNED)   BEGIN
    UPDATE Cliente SET estado = 'inactivo' WHERE id_cliente = p_id_cliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_desactivar_servicio` (IN `p_id_servicio` BIGINT UNSIGNED)   BEGIN
    UPDATE Servicio SET estado = 'inactivo' WHERE id_servicio = p_id_servicio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_eliminar_disponibilidad` (IN `p_id_disponibilidad` BIGINT UNSIGNED)   BEGIN
    DELETE FROM DisponibilidadBarbero WHERE id_disponibilidad = p_id_disponibilidad;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_incapacitar_barbero` (IN `p_id_barbero` BIGINT UNSIGNED)   BEGIN
    -- Dispara automáticamente trg_barbero_incapacidad_cancela_citas
    UPDATE Barbero SET estado = 'incapacitado' WHERE id_barbero = p_id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_barberos` (IN `p_barberia_id` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Barbero WHERE barberia_id = p_barberia_id ORDER BY apellido, nombre;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_categorias_movimiento` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_tipo` VARCHAR(10))   BEGIN
    SELECT * FROM CategoriaMovimiento
    WHERE barberia_id = p_barberia_id AND (p_tipo IS NULL OR tipo = p_tipo) AND activo = TRUE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_citas_barbero` (IN `p_barbero_id` BIGINT UNSIGNED, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE)   BEGIN
    SELECT * FROM Cita
    WHERE barbero_id = p_barbero_id AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY fecha, hora_inicio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_citas_cliente` (IN `p_cliente_id` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Cita WHERE cliente_id = p_cliente_id ORDER BY fecha DESC, hora_inicio DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_clientes` (IN `p_barberia_id` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Cliente WHERE barberia_id = p_barberia_id ORDER BY apellido, nombre;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_disponibilidad` (IN `p_barbero_id` BIGINT UNSIGNED, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE)   BEGIN
    SELECT * FROM DisponibilidadBarbero
    WHERE barbero_id = p_barbero_id AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY fecha;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_historial` (IN `p_barberia_id` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM HistorialActividad WHERE barberia_id = p_barberia_id ORDER BY fecha_registro DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_movimientos` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_barbero_id` BIGINT UNSIGNED, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_tipo` VARCHAR(10))   BEGIN
    SELECT * FROM MovimientoFinanciero
    WHERE barberia_id = p_barberia_id
      AND (p_barbero_id IS NULL OR barbero_id = p_barbero_id)
      AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_tipo IS NULL OR tipo = p_tipo)
    ORDER BY fecha DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_servicios` (IN `p_barberia_id` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Servicio WHERE barberia_id = p_barberia_id ORDER BY categoria, nombre;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_barberia` (IN `p_id_barberia` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(150), IN `p_direccion` VARCHAR(200), IN `p_telefono` VARCHAR(20), IN `p_correo` VARCHAR(150))   BEGIN
    UPDATE Barberia SET nombre = p_nombre, direccion = p_direccion,
        telefono = p_telefono, correo = p_correo
    WHERE id_barberia = p_id_barberia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_barbero` (IN `p_id_barbero` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(80), IN `p_apellido` VARCHAR(80), IN `p_telefono` VARCHAR(20), IN `p_correo` VARCHAR(150))   BEGIN
    UPDATE Barbero SET nombre = p_nombre, apellido = p_apellido,
        telefono = p_telefono, correo = p_correo
    WHERE id_barbero = p_id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_cliente` (IN `p_id_cliente` BIGINT UNSIGNED, IN `p_nombre` VARCHAR(80), IN `p_apellido` VARCHAR(80), IN `p_telefono` VARCHAR(20), IN `p_correo` VARCHAR(150), IN `p_fecha_nacimiento` DATE)   BEGIN
    UPDATE Cliente SET nombre = p_nombre, apellido = p_apellido, telefono = p_telefono,
        correo = p_correo, fecha_nacimiento = p_fecha_nacimiento
    WHERE id_cliente = p_id_cliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_modificar_servicio` (IN `p_id_servicio` BIGINT UNSIGNED, IN `p_categoria` VARCHAR(20), IN `p_nombre` VARCHAR(100), IN `p_descripcion` TEXT, IN `p_duracion_minutos` INT UNSIGNED, IN `p_precio` DECIMAL(14,2))   BEGIN
    UPDATE Servicio SET categoria = p_categoria, nombre = p_nombre, descripcion = p_descripcion,
        duracion_minutos = p_duracion_minutos, precio = p_precio
    WHERE id_servicio = p_id_servicio;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reactivar_barbero` (IN `p_id_barbero` BIGINT UNSIGNED)   BEGIN
    UPDATE Barbero SET estado = 'activo' WHERE id_barbero = p_id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_movimiento` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_barbero_id` BIGINT UNSIGNED, IN `p_tipo` VARCHAR(10), IN `p_categoria_id` BIGINT UNSIGNED, IN `p_monto` DECIMAL(14,2), IN `p_cantidad` DECIMAL(10,2), IN `p_unidad_medida` VARCHAR(20), IN `p_descripcion` VARCHAR(255), IN `p_cita_id` BIGINT UNSIGNED, IN `p_registrado_por` BIGINT UNSIGNED)   BEGIN
    DECLARE v_es_admin BOOLEAN;

    IF p_tipo IN ('gasto','compra') THEN
        SELECT es_admin INTO v_es_admin FROM Barbero WHERE id_barbero = p_registrado_por;
        IF v_es_admin = FALSE THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo el administrador puede registrar gastos o compras.';
        END IF;
    END IF;

    -- trg_movimiento_validar_categoria valida que la categoría coincida con el tipo
    INSERT INTO MovimientoFinanciero(
        barberia_id, barbero_id, tipo, categoria_id, monto, cantidad,
        unidad_medida, descripcion, cita_id, registrado_por
    ) VALUES (
        p_barberia_id, p_barbero_id, p_tipo, p_categoria_id, p_monto, p_cantidad,
        p_unidad_medida, p_descripcion, p_cita_id, p_registrado_por
    );
    SELECT LAST_INSERT_ID() AS id_movimiento;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte_financiero` (IN `p_barberia_id` BIGINT UNSIGNED, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE)   BEGIN
    SELECT
        COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS total_gastos,
        COALESCE(SUM(CASE WHEN tipo = 'compra' THEN monto ELSE 0 END), 0) AS total_compras,
        fn_calcular_ganancia_periodo(p_barberia_id, p_fecha_inicio, p_fecha_fin) AS utilidad
    FROM MovimientoFinanciero
    WHERE barberia_id = p_barberia_id AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_barberia` (IN `p_id_barberia` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Barberia WHERE id_barberia = p_id_barberia;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_barbero` (IN `p_id_barbero` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Barbero WHERE id_barbero = p_id_barbero;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_cliente` (IN `p_id_cliente` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Cliente WHERE id_cliente = p_id_cliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_horario_barberia` (IN `p_barberia_id` BIGINT UNSIGNED)   BEGIN
    SELECT dias_atencion, hora_apertura, hora_cierre, duracion_turno_minutos
    FROM Barberia WHERE id_barberia = p_barberia_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ver_servicio` (IN `p_id_servicio` BIGINT UNSIGNED)   BEGIN
    SELECT * FROM Servicio WHERE id_servicio = p_id_servicio;
END$$

--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_barberia_atiende_dia` (`p_barberia_id` BIGINT UNSIGNED, `p_dia_semana` VARCHAR(10)) RETURNS TINYINT(1) DETERMINISTIC BEGIN
    DECLARE v_dias SET('lunes','martes','miercoles','jueves','viernes','sabado','domingo');
    SELECT dias_atencion INTO v_dias FROM Barberia WHERE id_barberia = p_barberia_id;
    RETURN FIND_IN_SET(p_dia_semana, v_dias) > 0;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_distancia_barberia` (`p_lat1` DECIMAL(10,8), `p_lon1` DECIMAL(11,8), `p_lat2` DECIMAL(10,8), `p_lon2` DECIMAL(11,8)) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN
    RETURN 6371 * ACOS(
        COS(RADIANS(p_lat1)) * COS(RADIANS(p_lat2)) * COS(RADIANS(p_lon2) - RADIANS(p_lon1))
        + SIN(RADIANS(p_lat1)) * SIN(RADIANS(p_lat2))
    );
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_duracion_cita` (`p_id_cita` BIGINT UNSIGNED) RETURNS INT(10) UNSIGNED DETERMINISTIC BEGIN
    DECLARE v_total INT UNSIGNED;
    SELECT COALESCE(SUM(duracion_aplicada), 0) INTO v_total
    FROM CitaServicio WHERE cita_id = p_id_cita;
    RETURN v_total;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_ganancia_periodo` (`p_barberia_id` BIGINT UNSIGNED, `p_fecha_inicio` DATE, `p_fecha_fin` DATE) RETURNS DECIMAL(14,2) DETERMINISTIC BEGIN
    DECLARE v_ingresos DECIMAL(14,2);
    DECLARE v_egresos DECIMAL(14,2);

    SELECT COALESCE(SUM(monto),0) INTO v_ingresos FROM MovimientoFinanciero
    WHERE barberia_id = p_barberia_id AND tipo = 'ingreso'
      AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;

    SELECT COALESCE(SUM(monto),0) INTO v_egresos FROM MovimientoFinanciero
    WHERE barberia_id = p_barberia_id AND tipo IN ('gasto','compra')
      AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;

    RETURN v_ingresos - v_egresos;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_monto_cita` (`p_id_cita` BIGINT UNSIGNED) RETURNS DECIMAL(14,2) DETERMINISTIC BEGIN
    DECLARE v_total DECIMAL(14,2);
    SELECT COALESCE(SUM(precio_aplicado), 0) INTO v_total
    FROM CitaServicio WHERE cita_id = p_id_cita;
    RETURN v_total;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_horario_disponible` (`p_barbero_id` BIGINT UNSIGNED, `p_fecha` DATE, `p_hora_inicio` TIME, `p_hora_fin` TIME) RETURNS TINYINT(1) DETERMINISTIC BEGIN
    DECLARE v_dentro_horario BOOLEAN DEFAULT FALSE;
    DECLARE v_cruce BOOLEAN DEFAULT FALSE;

    SELECT EXISTS(
        SELECT 1 FROM DisponibilidadBarbero
        WHERE barbero_id = p_barbero_id AND fecha = p_fecha
          AND hora_inicio <= p_hora_inicio AND hora_fin >= p_hora_fin
    ) INTO v_dentro_horario;

    SELECT EXISTS(
        SELECT 1 FROM Cita
        WHERE barbero_id = p_barbero_id AND fecha = p_fecha
          AND estado NOT IN ('cancelada','no_asistio')
          AND hora_inicio < p_hora_fin AND hora_fin > p_hora_inicio
    ) INTO v_cruce;

    RETURN v_dentro_horario AND NOT v_cruce;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `barberia`
--

CREATE TABLE `barberia` (
  `id_barberia` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `dias_atencion` set('lunes','martes','miercoles','jueves','viernes','sabado','domingo') DEFAULT NULL,
  `hora_apertura` time DEFAULT NULL,
  `hora_cierre` time DEFAULT NULL,
  `duracion_turno_minutos` int(10) UNSIGNED NOT NULL DEFAULT 30,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `estado` enum('activa','inactiva') NOT NULL DEFAULT 'activa',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `barbero`
--

CREATE TABLE `barbero` (
  `id_barbero` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `es_admin` tinyint(1) NOT NULL DEFAULT 0,
  `estado` enum('activo','incapacitado','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_ingreso` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `barbero`
--
DELIMITER $$
CREATE TRIGGER `trg_barbero_admin_insert` BEFORE INSERT ON `barbero` FOR EACH ROW BEGIN
    IF NEW.es_admin = TRUE AND EXISTS (
        SELECT 1 FROM Barbero WHERE barberia_id = NEW.barberia_id AND es_admin = TRUE
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Esta barbería ya tiene un administrador asignado.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_barbero_admin_update` BEFORE UPDATE ON `barbero` FOR EACH ROW BEGIN
    IF NEW.es_admin = TRUE AND OLD.es_admin = FALSE AND EXISTS (
        SELECT 1 FROM Barbero
        WHERE barberia_id = NEW.barberia_id AND es_admin = TRUE AND id_barbero <> NEW.id_barbero
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Esta barbería ya tiene un administrador asignado.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_barbero_incapacidad_cancela_citas` AFTER UPDATE ON `barbero` FOR EACH ROW BEGIN
    IF NEW.estado = 'incapacitado' AND OLD.estado <> 'incapacitado' THEN
        SET @bypass_cancelacion = 1;
        UPDATE Cita
        SET estado = 'cancelada',
            cancelada_por = 'admin',
            motivo_cancelacion = 'Barbero incapacitado',
            fecha_cancelacion = NOW()
        WHERE barbero_id = NEW.id_barbero
          AND estado IN ('pendiente','confirmada')
          AND fecha >= CURDATE();
        SET @bypass_cancelacion = NULL;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_log_barbero_estado` AFTER UPDATE ON `barbero` FOR EACH ROW BEGIN
    IF NEW.estado <> OLD.estado THEN
        INSERT INTO HistorialActividad(barberia_id, descripcion, barbero_id)
        VALUES (NEW.barberia_id, CONCAT('El barbero ', NEW.nombre, ' ', NEW.apellido, ' cambió de estado: ', OLD.estado, ' -> ', NEW.estado), @usuario_actual);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoriamovimiento`
--

CREATE TABLE `categoriamovimiento` (
  `id_categoria` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `tipo` enum('ingreso','gasto','compra') NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `cliente_id` bigint(20) UNSIGNED NOT NULL,
  `barbero_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `monto_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `duracion_total_minutos` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `estado` enum('pendiente','confirmada','en_proceso','finalizada','cancelada','no_asistio') NOT NULL DEFAULT 'pendiente',
  `cancelada_por` enum('cliente','admin','barbero') DEFAULT NULL,
  `motivo_cancelacion` varchar(255) DEFAULT NULL,
  `fecha_cancelacion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `cita`
--
DELIMITER $$
CREATE TRIGGER `trg_cita_validar_cancelacion_1h` BEFORE UPDATE ON `cita` FOR EACH ROW BEGIN
    IF NEW.estado = 'cancelada' AND OLD.estado <> 'cancelada' THEN
        IF @bypass_cancelacion IS NULL THEN
            IF TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(OLD.fecha, OLD.hora_inicio)) < 60 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'No se puede cancelar con menos de 1 hora de anticipación.';
            END IF;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citaservicio`
--

CREATE TABLE `citaservicio` (
  `id_cita_servicio` bigint(20) UNSIGNED NOT NULL,
  `cita_id` bigint(20) UNSIGNED NOT NULL,
  `servicio_id` bigint(20) UNSIGNED NOT NULL,
  `precio_aplicado` decimal(14,2) NOT NULL,
  `duracion_aplicada` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `citaservicio`
--
DELIMITER $$
CREATE TRIGGER `trg_citaservicio_recalcular_delete` AFTER DELETE ON `citaservicio` FOR EACH ROW BEGIN
    UPDATE Cita
    SET duracion_total_minutos = fn_calcular_duracion_cita(OLD.cita_id),
        monto_total = fn_calcular_monto_cita(OLD.cita_id),
        hora_fin = ADDTIME(hora_inicio, SEC_TO_TIME(fn_calcular_duracion_cita(OLD.cita_id) * 60))
    WHERE id_cita = OLD.cita_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_citaservicio_recalcular_insert` AFTER INSERT ON `citaservicio` FOR EACH ROW BEGIN
    UPDATE Cita
    SET duracion_total_minutos = fn_calcular_duracion_cita(NEW.cita_id),
        monto_total = fn_calcular_monto_cita(NEW.cita_id),
        hora_fin = ADDTIME(hora_inicio, SEC_TO_TIME(fn_calcular_duracion_cita(NEW.cita_id) * 60))
    WHERE id_cita = NEW.cita_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidadbarbero`
--

CREATE TABLE `disponibilidadbarbero` (
  `id_disponibilidad` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `barbero_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL DEFAULT '08:00:00',
  `hora_fin` time NOT NULL DEFAULT '17:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historialactividad`
--

CREATE TABLE `historialactividad` (
  `id_historial` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `barbero_id` bigint(20) UNSIGNED NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientofinanciero`
--

CREATE TABLE `movimientofinanciero` (
  `id_movimiento` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `barbero_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` enum('ingreso','gasto','compra') NOT NULL,
  `categoria_id` bigint(20) UNSIGNED NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `cita_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registrado_por` bigint(20) UNSIGNED NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `movimientofinanciero`
--
DELIMITER $$
CREATE TRIGGER `trg_movimiento_bloquear_delete` BEFORE DELETE ON `movimientofinanciero` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar un movimiento financiero.';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_movimiento_bloquear_update` BEFORE UPDATE ON `movimientofinanciero` FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede modificar un movimiento financiero ya registrado.';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_movimiento_validar_categoria` BEFORE INSERT ON `movimientofinanciero` FOR EACH ROW BEGIN
    DECLARE v_tipo_categoria ENUM('ingreso','gasto','compra');
    SELECT tipo INTO v_tipo_categoria FROM CategoriaMovimiento WHERE id_categoria = NEW.categoria_id;
    IF v_tipo_categoria <> NEW.tipo THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La categoría seleccionada no corresponde al tipo de movimiento.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `id_servicio` bigint(20) UNSIGNED NOT NULL,
  `barberia_id` bigint(20) UNSIGNED NOT NULL,
  `categoria` enum('corte','barba','combo','tratamiento','otro') NOT NULL DEFAULT 'otro',
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion_minutos` int(10) UNSIGNED NOT NULL,
  `precio` decimal(14,2) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `servicio`
--
DELIMITER $$
CREATE TRIGGER `trg_servicio_bitacora_creacion` AFTER INSERT ON `servicio` FOR EACH ROW BEGIN
    INSERT INTO HistorialActividad(barberia_id, descripcion, barbero_id)
    VALUES (NEW.barberia_id, CONCAT('Se agregó el servicio "', NEW.nombre, '" al catálogo'), @usuario_actual);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_servicio_bitacora_modificacion` AFTER UPDATE ON `servicio` FOR EACH ROW BEGIN
    INSERT INTO HistorialActividad(barberia_id, descripcion, barbero_id)
    VALUES (NEW.barberia_id, CONCAT('Se modificó el servicio "', NEW.nombre, '"'), @usuario_actual);
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `barberia`
--
ALTER TABLE `barberia`
  ADD PRIMARY KEY (`id_barberia`);

--
-- Indices de la tabla `barbero`
--
ALTER TABLE `barbero`
  ADD PRIMARY KEY (`id_barbero`),
  ADD UNIQUE KEY `uq_barbero_correo` (`correo`),
  ADD KEY `fk_barbero_barberia` (`barberia_id`);

--
-- Indices de la tabla `categoriamovimiento`
--
ALTER TABLE `categoriamovimiento`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `uq_categoria_movimiento_barberia_nombre` (`barberia_id`,`nombre`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `idx_cita_barbero_fecha` (`barbero_id`,`fecha`),
  ADD KEY `idx_cita_cliente` (`cliente_id`),
  ADD KEY `idx_cita_estado` (`barberia_id`,`estado`);

--
-- Indices de la tabla `citaservicio`
--
ALTER TABLE `citaservicio`
  ADD PRIMARY KEY (`id_cita_servicio`),
  ADD KEY `fk_citaservicio_servicio` (`servicio_id`),
  ADD KEY `idx_citaservicio_cita` (`cita_id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `uq_cliente_barberia_cedula` (`barberia_id`,`cedula`);

--
-- Indices de la tabla `disponibilidadbarbero`
--
ALTER TABLE `disponibilidadbarbero`
  ADD PRIMARY KEY (`id_disponibilidad`),
  ADD UNIQUE KEY `uq_disponibilidad_barbero_fecha` (`barbero_id`,`fecha`),
  ADD KEY `idx_disponibilidad_fecha` (`barberia_id`,`fecha`);

--
-- Indices de la tabla `historialactividad`
--
ALTER TABLE `historialactividad`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_historialactividad_barbero` (`barbero_id`),
  ADD KEY `idx_historialactividad_fecha` (`barberia_id`,`fecha_registro`);

--
-- Indices de la tabla `movimientofinanciero`
--
ALTER TABLE `movimientofinanciero`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `fk_movimiento_categoria` (`categoria_id`),
  ADD KEY `fk_movimiento_cita` (`cita_id`),
  ADD KEY `fk_movimiento_registrado_por` (`registrado_por`),
  ADD KEY `idx_movimiento_barberia_fecha` (`barberia_id`,`fecha`),
  ADD KEY `idx_movimiento_barbero_fecha` (`barbero_id`,`fecha`),
  ADD KEY `idx_movimiento_tipo` (`tipo`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`id_servicio`),
  ADD KEY `fk_servicio_barberia` (`barberia_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `barberia`
--
ALTER TABLE `barberia`
  MODIFY `id_barberia` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `barbero`
--
ALTER TABLE `barbero`
  MODIFY `id_barbero` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoriamovimiento`
--
ALTER TABLE `categoriamovimiento`
  MODIFY `id_categoria` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `citaservicio`
--
ALTER TABLE `citaservicio`
  MODIFY `id_cita_servicio` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `disponibilidadbarbero`
--
ALTER TABLE `disponibilidadbarbero`
  MODIFY `id_disponibilidad` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historialactividad`
--
ALTER TABLE `historialactividad`
  MODIFY `id_historial` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientofinanciero`
--
ALTER TABLE `movimientofinanciero`
  MODIFY `id_movimiento` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `id_servicio` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `barbero`
--
ALTER TABLE `barbero`
  ADD CONSTRAINT `fk_barbero_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`);

--
-- Filtros para la tabla `categoriamovimiento`
--
ALTER TABLE `categoriamovimiento`
  ADD CONSTRAINT `fk_categoriamovimiento_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`);

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  ADD CONSTRAINT `fk_cita_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`),
  ADD CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id_cliente`);

--
-- Filtros para la tabla `citaservicio`
--
ALTER TABLE `citaservicio`
  ADD CONSTRAINT `fk_citaservicio_cita` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id_cita`),
  ADD CONSTRAINT `fk_citaservicio_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cliente_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`);

--
-- Filtros para la tabla `disponibilidadbarbero`
--
ALTER TABLE `disponibilidadbarbero`
  ADD CONSTRAINT `fk_disponibilidad_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  ADD CONSTRAINT `fk_disponibilidad_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`);

--
-- Filtros para la tabla `historialactividad`
--
ALTER TABLE `historialactividad`
  ADD CONSTRAINT `fk_historialactividad_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  ADD CONSTRAINT `fk_historialactividad_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`);

--
-- Filtros para la tabla `movimientofinanciero`
--
ALTER TABLE `movimientofinanciero`
  ADD CONSTRAINT `fk_movimiento_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  ADD CONSTRAINT `fk_movimiento_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`),
  ADD CONSTRAINT `fk_movimiento_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoriamovimiento` (`id_categoria`),
  ADD CONSTRAINT `fk_movimiento_cita` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id_cita`),
  ADD CONSTRAINT `fk_movimiento_registrado_por` FOREIGN KEY (`registrado_por`) REFERENCES `barbero` (`id_barbero`);

--
-- Filtros para la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD CONSTRAINT `fk_servicio_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
