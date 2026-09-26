-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smartcut
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ausencia_barbero`
--

DROP TABLE IF EXISTS `ausencia_barbero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ausencia_barbero` (
  `id_ausencia` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `barbero_id` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_ausencia`),
  KEY `idx_ausencia_barbero_fecha` (`barbero_id`,`fecha_inicio`,`fecha_fin`),
  KEY `fk_ausencia_barberia` (`barberia_id`),
  CONSTRAINT `fk_ausencia_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`) ON DELETE CASCADE,
  CONSTRAINT `fk_ausencia_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`) ON DELETE CASCADE,
  CONSTRAINT `chk_ausencia_rango` CHECK ((`fecha_fin` >= `fecha_inicio`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ausencia_barbero`
--

LOCK TABLES `ausencia_barbero` WRITE;
/*!40000 ALTER TABLE `ausencia_barbero` DISABLE KEYS */;
INSERT INTO `ausencia_barbero` VALUES (1,4,12,'2026-09-08','2026-09-11',NULL,NULL,'Incapacidad medica');
/*!40000 ALTER TABLE `ausencia_barbero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barberia`
--

DROP TABLE IF EXISTS `barberia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barberia` (
  `id_barberia` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dias_atencion` set('lunes','martes','miercoles','jueves','viernes','sabado','domingo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'lunes,martes,miercoles,jueves,viernes,sabado',
  `hora_apertura` time NOT NULL DEFAULT '08:00:00',
  `hora_cierre` time NOT NULL DEFAULT '19:00:00',
  `duracion_turno_minutos` int unsigned NOT NULL DEFAULT '30',
  `onboarding_completo` tinyint(1) NOT NULL DEFAULT '0',
  `estado` enum('activa','inactiva') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activa',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_barberia`),
  KEY `idx_barberia_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barberia`
--

LOCK TABLES `barberia` WRITE;
/*!40000 ALTER TABLE `barberia` DISABLE KEYS */;
INSERT INTO `barberia` VALUES (1,'Barberia Clasica Brayan','Calle 45 # 12-30, Bogota',4.62880000,-74.06450000,'3001112233','contacto@clasicabrayan.com','lunes,martes,miercoles,jueves,viernes,sabado','08:00:00','19:00:00',30,1,'activa','2026-09-06 02:31:38'),(4,'Barberia de Karoll','Carrera 56A #49-29 sur',NULL,NULL,'3103069581','danielaorjbal@gmail.com','lunes,martes,miercoles,jueves,viernes','08:00:00','18:00:00',30,1,'activa','2026-09-06 03:42:45');
/*!40000 ALTER TABLE `barberia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barbero`
--

DROP TABLE IF EXISTS `barbero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barbero` (
  `id_barbero` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_admin` tinyint(1) NOT NULL DEFAULT '0',
  `porcentaje_comision` decimal(5,2) NOT NULL DEFAULT '50.00',
  `debe_cambiar_contrasena` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_ultimo_acceso` datetime DEFAULT NULL,
  `estado` enum('activo','incapacitado','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_ingreso` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`id_barbero`),
  UNIQUE KEY `uq_barbero_correo` (`correo`),
  KEY `idx_barbero_barberia` (`barberia_id`,`estado`),
  CONSTRAINT `fk_barbero_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`) ON DELETE CASCADE,
  CONSTRAINT `chk_barbero_comision` CHECK (((`porcentaje_comision` >= 0) and (`porcentaje_comision` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barbero`
--

LOCK TABLES `barbero` WRITE;
/*!40000 ALTER TABLE `barbero` DISABLE KEYS */;
INSERT INTO `barbero` VALUES (1,1,'Brayan','Ramirez','admin@smartcut.com','$2b$10$REEMPLAZARestehashPorUnoGeneradoConBcryptAAAAAAAAAAAAAAAAAAA','3001112233',1,100.00,0,NULL,'activo','2026-09-05'),(2,1,'Carlos','Mendoza','carlos@smartcut.com','$2b$10$REEMPLAZARestehashPorUnoGeneradoConBcryptBBBBBBBBBBBBBBBBBBB','3002223344',0,50.00,1,NULL,'activo','2026-09-05'),(3,1,'Andres','Lopez','andres@smartcut.com','$2b$10$REEMPLAZARestehashPorUnoGeneradoConBcryptCCCCCCCCCCCCCCCCCCC','3003334455',0,50.00,1,NULL,'activo','2026-09-05'),(11,4,'Karoll','Orjuela','danielaorjbal@gmail.com','$2b$10$b4b0TKIte89VtsLpLmDVfe9umyt9AnEE7d3Lkg1wB.66k1hPJLqce','3103069581',1,100.00,0,'2026-09-26 17:36:43','activo','2026-09-05'),(12,4,'Sebastian','Trujillo','juansetrujillo28@gmail.com','$2b$10$rxKB8PWE7biZWbcRI.LMRO8UJh/Tw8IA.w80m.WUSO7ElZAY/qWjS',NULL,0,50.00,0,'2026-09-26 17:20:55','activo','2026-09-05'),(13,4,'Test','Verificacion','test.verificacion.smartcut@example.com','$2b$10$t1H7TQ/8VRx8bkq9QNNJ5ewztd9I.4w7w6SmtcTJm2XLPBMpp9iea','3009998877',0,40.00,1,NULL,'inactivo','2026-09-26');
/*!40000 ALTER TABLE `barbero` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_barbero_admin_insert` BEFORE INSERT ON `barbero` FOR EACH ROW BEGIN
  IF NEW.es_admin = TRUE AND EXISTS (
      SELECT 1 FROM barbero WHERE barberia_id = NEW.barberia_id AND es_admin = TRUE) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Esta barberia ya tiene un administrador asignado.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_barbero_admin_update` BEFORE UPDATE ON `barbero` FOR EACH ROW BEGIN
  IF NEW.es_admin = TRUE AND OLD.es_admin = FALSE AND EXISTS (
      SELECT 1 FROM barbero
      WHERE barberia_id = NEW.barberia_id AND es_admin = TRUE
        AND id_barbero <> NEW.id_barbero) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Esta barberia ya tiene un administrador asignado.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_barbero_incapacidad_cancela_citas` AFTER UPDATE ON `barbero` FOR EACH ROW BEGIN
  IF NEW.estado IN ('incapacitado','inactivo') AND OLD.estado = 'activo' THEN
    SET @bypass_cancelacion = 1;
    UPDATE cita
    SET estado = 'cancelada',
        cancelada_por = 'admin',
        motivo_cancelacion = CONCAT('Barbero ', NEW.estado),
        fecha_cancelacion = NOW()
    WHERE barbero_id = NEW.id_barbero
      AND estado IN ('pendiente','confirmada')
      AND fecha >= CURDATE();
    SET @bypass_cancelacion = NULL;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_log_barbero_estado` AFTER UPDATE ON `barbero` FOR EACH ROW BEGIN
  IF NEW.estado <> OLD.estado THEN
    INSERT INTO historial_actividad(barberia_id, barbero_id, descripcion)
    VALUES (NEW.barberia_id, @usuario_actual,
      CONCAT('El barbero ', NEW.nombre, ' ', COALESCE(NEW.apellido,''),
             ' cambio de estado: ', OLD.estado, ' -> ', NEW.estado));
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categoria_movimiento`
--

DROP TABLE IF EXISTS `categoria_movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_movimiento` (
  `id_categoria` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('ingreso','gasto','compra') COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uq_categoria_barberia_nombre` (`barberia_id`,`nombre`),
  CONSTRAINT `fk_categoria_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_movimiento`
--

LOCK TABLES `categoria_movimiento` WRITE;
/*!40000 ALTER TABLE `categoria_movimiento` DISABLE KEYS */;
INSERT INTO `categoria_movimiento` VALUES (1,1,'Servicios','ingreso',1),(2,1,'Venta de productos','ingreso',1),(3,1,'Arriendo','gasto',1),(4,1,'Servicios publicos','gasto',1),(5,1,'Nomina','gasto',1),(6,1,'Insumos','compra',1),(7,1,'Herramientas','compra',1),(22,4,'Servicios','ingreso',1),(23,4,'Venta de productos','ingreso',1),(24,4,'Arriendo','gasto',1),(25,4,'Servicios publicos','gasto',1),(26,4,'Nomina','gasto',1),(27,4,'Insumos','compra',1),(28,4,'Herramientas','compra',1),(29,4,'Publicidad','gasto',1);
/*!40000 ALTER TABLE `categoria_movimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cita`
--

DROP TABLE IF EXISTS `cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita` (
  `id_cita` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `cliente_id` bigint unsigned NOT NULL,
  `barbero_id` bigint unsigned NOT NULL,
  `numero_ticket` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consecutivo_dia` int unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `monto_total` decimal(14,2) NOT NULL DEFAULT '0.00',
  `duracion_total_minutos` int unsigned NOT NULL DEFAULT '0',
  `estado` enum('pendiente','confirmada','en_proceso','finalizada','cancelada','no_asistio') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `cancelada_por` enum('cliente','admin','barbero') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_cancelacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_cancelacion` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cita`),
  UNIQUE KEY `uq_cita_ticket` (`barberia_id`,`fecha`,`numero_ticket`),
  KEY `idx_cita_barbero_fecha` (`barbero_id`,`fecha`,`estado`),
  KEY `idx_cita_barberia_fecha` (`barberia_id`,`fecha`),
  KEY `idx_cita_cliente` (`cliente_id`),
  CONSTRAINT `fk_cita_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  CONSTRAINT `fk_cita_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`),
  CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
INSERT INTO `cita` VALUES (1,4,1,12,'T-001',1,'2026-09-07','21:13:28','22:18:28',40000.00,65,'no_asistio',NULL,NULL,NULL,'2026-09-08 02:13:28'),(2,4,2,12,'T-002',2,'2026-09-07','21:15:55','22:45:55',80000.00,90,'finalizada',NULL,NULL,NULL,'2026-09-08 02:15:55'),(3,4,3,12,'T-001',1,'2026-09-10','10:00:00','10:45:00',25000.00,45,'cancelada','admin','Barbero incapacitado','2026-09-08 02:16:14','2026-09-08 02:16:13'),(4,4,4,12,'T-001',1,'2026-09-26','14:59:50','15:44:50',25000.00,45,'finalizada',NULL,NULL,NULL,'2026-09-26 19:59:50'),(5,4,5,12,'T-001',1,'2026-09-28','11:00:00','11:45:00',25000.00,45,'finalizada',NULL,NULL,NULL,'2026-09-26 20:00:08'),(6,4,6,12,'T-001',1,'2026-09-29','09:00:00','09:45:00',25000.00,45,'cancelada','barbero','El cliente aviso que no podia','2026-09-26 20:00:46','2026-09-26 20:00:34'),(7,4,7,11,'T-002',2,'2026-09-26','17:13:55','17:58:55',25000.00,45,'finalizada',NULL,NULL,NULL,'2026-09-26 22:13:55');
/*!40000 ALTER TABLE `cita` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_generar_ticket` BEFORE INSERT ON `cita` FOR EACH ROW BEGIN
  DECLARE v_consecutivo INT UNSIGNED;
  SELECT COALESCE(MAX(consecutivo_dia), 0) + 1 INTO v_consecutivo
  FROM cita
  WHERE barberia_id = NEW.barberia_id AND fecha = NEW.fecha;

  SET NEW.consecutivo_dia = v_consecutivo;
  SET NEW.numero_ticket   = CONCAT('T-', LPAD(v_consecutivo, 3, '0'));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_validar_cancelacion` BEFORE UPDATE ON `cita` FOR EACH ROW BEGIN
  IF NEW.estado = 'cancelada' AND OLD.estado <> 'cancelada' THEN
    IF @bypass_cancelacion IS NULL
       AND TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(OLD.fecha, OLD.hora_inicio)) < 60 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede cancelar con menos de 1 hora de anticipacion.';
    END IF;
    SET NEW.fecha_cancelacion = NOW();
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_finalizada_genera_ingreso` AFTER UPDATE ON `cita` FOR EACH ROW BEGIN
  DECLARE v_categoria  BIGINT UNSIGNED;
  DECLARE v_porcentaje DECIMAL(5,2);

  IF NEW.estado = 'finalizada' AND OLD.estado <> 'finalizada' AND NEW.monto_total > 0 THEN
    SELECT id_categoria INTO v_categoria
    FROM categoria_movimiento
    WHERE barberia_id = NEW.barberia_id AND tipo = 'ingreso' AND activo = TRUE
    ORDER BY id_categoria LIMIT 1;

    SELECT porcentaje_comision INTO v_porcentaje
    FROM barbero WHERE id_barbero = NEW.barbero_id;

    IF v_categoria IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM movimiento_financiero WHERE cita_id = NEW.id_cita) THEN
      INSERT INTO movimiento_financiero(
        barberia_id, barbero_id, tipo, categoria_id, monto,
        monto_comision, porcentaje_aplicado,
        descripcion, cita_id, registrado_por, origen)
      VALUES (NEW.barberia_id, NEW.barbero_id, 'ingreso', v_categoria, NEW.monto_total,
        ROUND(NEW.monto_total * COALESCE(v_porcentaje,0) / 100, 2), v_porcentaje,
        CONCAT('Ingreso por cita ', NEW.numero_ticket), NEW.id_cita, NEW.barbero_id, 'automatico');
    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_no_atendida_anula_ingreso` AFTER UPDATE ON `cita` FOR EACH ROW BEGIN
  IF NEW.estado IN ('cancelada','no_asistio') AND OLD.estado NOT IN ('cancelada','no_asistio') THEN
    UPDATE movimiento_financiero
    SET estado = 'anulado',
        motivo_anulacion = CONCAT('Cita ', NEW.numero_ticket, ' marcada como ', NEW.estado)
    WHERE cita_id = NEW.id_cita AND estado = 'activo';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cita_servicio`
--

DROP TABLE IF EXISTS `cita_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita_servicio` (
  `id_cita_servicio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cita_id` bigint unsigned NOT NULL,
  `servicio_id` bigint unsigned NOT NULL,
  `precio_aplicado` decimal(14,2) NOT NULL,
  `duracion_aplicada` int unsigned NOT NULL,
  PRIMARY KEY (`id_cita_servicio`),
  UNIQUE KEY `uq_cita_servicio` (`cita_id`,`servicio_id`),
  KEY `fk_citaservicio_servicio` (`servicio_id`),
  CONSTRAINT `fk_citaservicio_cita` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id_cita`) ON DELETE CASCADE,
  CONSTRAINT `fk_citaservicio_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita_servicio`
--

LOCK TABLES `cita_servicio` WRITE;
/*!40000 ALTER TABLE `cita_servicio` DISABLE KEYS */;
INSERT INTO `cita_servicio` VALUES (1,1,9,15000.00,20),(2,1,8,25000.00,45),(4,2,10,80000.00,90),(5,3,8,25000.00,45),(6,4,8,25000.00,45),(7,5,8,25000.00,45),(8,6,8,25000.00,45),(9,7,8,25000.00,45);
/*!40000 ALTER TABLE `cita_servicio` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_citaservicio_recalcular_insert` AFTER INSERT ON `cita_servicio` FOR EACH ROW BEGIN
  UPDATE cita c
  SET c.duracion_total_minutos = (SELECT COALESCE(SUM(duracion_aplicada),0)
                                  FROM cita_servicio WHERE cita_id = NEW.cita_id),
      c.monto_total            = (SELECT COALESCE(SUM(precio_aplicado),0)
                                  FROM cita_servicio WHERE cita_id = NEW.cita_id),
      c.hora_fin = ADDTIME(c.hora_inicio,
                     SEC_TO_TIME((SELECT COALESCE(SUM(duracion_aplicada),0)
                                  FROM cita_servicio WHERE cita_id = NEW.cita_id) * 60))
  WHERE c.id_cita = NEW.cita_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_citaservicio_recalcular_delete` AFTER DELETE ON `cita_servicio` FOR EACH ROW BEGIN
  UPDATE cita c
  SET c.duracion_total_minutos = (SELECT COALESCE(SUM(duracion_aplicada),0)
                                  FROM cita_servicio WHERE cita_id = OLD.cita_id),
      c.monto_total            = (SELECT COALESCE(SUM(precio_aplicado),0)
                                  FROM cita_servicio WHERE cita_id = OLD.cita_id),
      c.hora_fin = ADDTIME(c.hora_inicio,
                     SEC_TO_TIME((SELECT COALESCE(SUM(duracion_aplicada),0)
                                  FROM cita_servicio WHERE cita_id = OLD.cita_id) * 60))
  WHERE c.id_cita = OLD.cita_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  KEY `idx_cliente_telefono` (`telefono`),
  KEY `idx_cliente_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Cliente de prueba',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-08 02:13:28'),(2,'Segundo cliente',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-08 02:15:55'),(3,'Cliente futuro',NULL,'3001234567',NULL,NULL,NULL,'activo','2026-09-08 02:16:13'),(4,'Cliente Agenda Test',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-26 19:59:50'),(5,'Cliente Pendiente Test',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-26 20:00:08'),(6,'Cliente Cancelar Test',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-26 20:00:34'),(7,'Karoll Orjuela',NULL,NULL,NULL,NULL,NULL,'activo','2026-09-26 22:13:55');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_actividad`
--

DROP TABLE IF EXISTS `historial_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_actividad` (
  `id_historial` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `barbero_id` bigint unsigned DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `fk_historial_barbero` (`barbero_id`),
  KEY `idx_historial_fecha` (`barberia_id`,`fecha_registro`),
  CONSTRAINT `fk_historial_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_actividad`
--

LOCK TABLES `historial_actividad` WRITE;
/*!40000 ALTER TABLE `historial_actividad` DISABLE KEYS */;
INSERT INTO `historial_actividad` VALUES (1,1,NULL,'Se agrego el servicio \"Corte\" al catalogo','2026-09-06 02:31:38'),(2,1,NULL,'Se agrego el servicio \"Corte + Barba americana\" al catalogo','2026-09-06 02:31:38'),(3,1,NULL,'Se agrego el servicio \"Barba\" al catalogo','2026-09-06 02:31:38'),(4,1,NULL,'Se agrego el servicio \"Diseno\" al catalogo','2026-09-06 02:31:38'),(5,1,NULL,'Se agrego el servicio \"Corte + Diseno\" al catalogo','2026-09-06 02:31:38'),(9,4,11,'Se agrego el servicio \"Corte\" al catalogo','2026-09-06 03:42:45'),(10,4,11,'Se agrego el servicio \"Barba\" al catalogo','2026-09-06 03:42:45'),(11,4,11,'Se agrego el servicio \"Tratamiento capilar\" al catalogo','2026-09-06 03:42:45'),(12,4,NULL,'El barbero Sebastian Trujillo cambio de estado: activo -> incapacitado','2026-09-08 02:16:14'),(13,4,NULL,'El barbero Sebastian Trujillo cambio de estado: incapacitado -> activo','2026-09-08 02:16:15'),(14,4,NULL,'El barbero Test Verificacion cambio de estado: activo -> inactivo','2026-09-26 20:45:50');
/*!40000 ALTER TABLE `historial_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_financiero`
--

DROP TABLE IF EXISTS `movimiento_financiero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_financiero` (
  `id_movimiento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `barbero_id` bigint unsigned DEFAULT NULL,
  `tipo` enum('ingreso','gasto','compra') COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria_id` bigint unsigned NOT NULL,
  `monto` decimal(14,2) NOT NULL,
  `monto_comision` decimal(14,2) DEFAULT NULL,
  `porcentaje_aplicado` decimal(5,2) DEFAULT NULL,
  `cantidad` decimal(10,2) DEFAULT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cita_id` bigint unsigned DEFAULT NULL,
  `registrado_por` bigint unsigned NOT NULL,
  `origen` enum('manual','automatico') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `estado` enum('activo','anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `motivo_anulacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  UNIQUE KEY `uq_movimiento_cita` (`cita_id`),
  KEY `fk_movimiento_categoria` (`categoria_id`),
  KEY `fk_movimiento_registrado_por` (`registrado_por`),
  KEY `idx_movimiento_barberia_fecha` (`barberia_id`,`fecha`,`estado`),
  KEY `idx_movimiento_barbero_fecha` (`barbero_id`,`fecha`,`estado`),
  KEY `idx_movimiento_tipo` (`tipo`),
  CONSTRAINT `fk_movimiento_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`),
  CONSTRAINT `fk_movimiento_barbero` FOREIGN KEY (`barbero_id`) REFERENCES `barbero` (`id_barbero`),
  CONSTRAINT `fk_movimiento_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_movimiento` (`id_categoria`),
  CONSTRAINT `fk_movimiento_cita` FOREIGN KEY (`cita_id`) REFERENCES `cita` (`id_cita`),
  CONSTRAINT `fk_movimiento_registrado_por` FOREIGN KEY (`registrado_por`) REFERENCES `barbero` (`id_barbero`),
  CONSTRAINT `chk_movimiento_monto` CHECK ((`monto` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_financiero`
--

LOCK TABLES `movimiento_financiero` WRITE;
/*!40000 ALTER TABLE `movimiento_financiero` DISABLE KEYS */;
INSERT INTO `movimiento_financiero` VALUES (1,4,12,'ingreso',22,40000.00,20000.00,50.00,NULL,NULL,'Ingreso por cita T-001',1,12,'automatico','anulado','Cita T-001 marcada como no_asistio','2026-09-07 21:13:28'),(2,4,NULL,'gasto',24,1200000.00,NULL,NULL,NULL,NULL,'Arriendo de agosto',NULL,11,'manual','anulado','Se registro por error','2026-08-15 00:00:00'),(3,4,12,'ingreso',22,80000.00,48000.00,60.00,NULL,NULL,'Ingreso por cita T-002',2,12,'automatico','activo',NULL,'2026-09-07 21:15:55'),(4,4,NULL,'gasto',24,1200000.00,NULL,NULL,NULL,NULL,'Arriendo sep',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-09-05 00:00:00'),(5,4,NULL,'gasto',25,300000.00,NULL,NULL,NULL,NULL,'Servicios publicos sep',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-09-10 00:00:00'),(6,4,NULL,'compra',27,500000.00,NULL,NULL,NULL,NULL,'Insumos mes pasado',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-08-05 00:00:00'),(12,4,NULL,'gasto',24,1200000.00,NULL,NULL,NULL,NULL,'TEST Arriendo',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-09-05 00:00:00'),(13,4,NULL,'gasto',25,300000.00,NULL,NULL,NULL,NULL,'TEST Servicios',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-09-10 00:00:00'),(14,4,NULL,'gasto',24,200000.00,NULL,NULL,NULL,NULL,'TEST Arriendo julio',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-07-05 00:00:00'),(15,4,NULL,'gasto',24,1500000.00,NULL,NULL,NULL,NULL,'TEST Arriendo agosto',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-08-05 00:00:00'),(16,4,NULL,'compra',27,300000.00,NULL,NULL,NULL,NULL,'TEST Insumos agosto',NULL,11,'manual','anulado','Movimiento de prueba creado por error durante una verificacion tecnica','2026-08-15 00:00:00'),(17,4,12,'ingreso',22,25000.00,12500.00,50.00,NULL,NULL,'Ingreso por cita T-001',4,12,'automatico','activo',NULL,'2026-09-26 14:59:50'),(18,4,12,'ingreso',22,25000.00,12500.00,50.00,NULL,NULL,'Ingreso por cita T-001',5,12,'automatico','activo',NULL,'2026-09-26 15:00:20'),(19,4,11,'ingreso',22,25000.00,25000.00,100.00,NULL,NULL,'Ingreso por cita T-002',7,11,'automatico','activo',NULL,'2026-09-26 17:13:55');
/*!40000 ALTER TABLE `movimiento_financiero` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_movimiento_validar_categoria` BEFORE INSERT ON `movimiento_financiero` FOR EACH ROW BEGIN
  DECLARE v_tipo_categoria VARCHAR(10);
  DECLARE v_barberia_cat BIGINT UNSIGNED;

  SELECT tipo, barberia_id INTO v_tipo_categoria, v_barberia_cat
  FROM categoria_movimiento WHERE id_categoria = NEW.categoria_id;

  IF v_tipo_categoria <> NEW.tipo THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria no corresponde al tipo de movimiento.';
  END IF;

  IF v_barberia_cat <> NEW.barberia_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La categoria pertenece a otra barberia.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_movimiento_solo_anulacion` BEFORE UPDATE ON `movimiento_financiero` FOR EACH ROW BEGIN
  IF NOT (OLD.estado = 'activo' AND NEW.estado = 'anulado'
          AND NEW.monto = OLD.monto AND NEW.tipo = OLD.tipo
          AND NEW.categoria_id = OLD.categoria_id
          AND NEW.barberia_id = OLD.barberia_id
          AND NEW.fecha = OLD.fecha) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Un movimiento financiero solo puede anularse, no modificarse.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_movimiento_bloquear_delete` BEFORE DELETE ON `movimiento_financiero` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No se puede eliminar un movimiento financiero.';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `servicio`
--

DROP TABLE IF EXISTS `servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicio` (
  `id_servicio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `barberia_id` bigint unsigned NOT NULL,
  `categoria` enum('corte','barba','combo','tratamiento','diseno','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'otro',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `duracion_minutos` int unsigned NOT NULL,
  `precio` decimal(14,2) NOT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_servicio`),
  UNIQUE KEY `uq_servicio_barberia_nombre` (`barberia_id`,`nombre`),
  KEY `idx_servicio_barberia` (`barberia_id`,`estado`),
  CONSTRAINT `fk_servicio_barberia` FOREIGN KEY (`barberia_id`) REFERENCES `barberia` (`id_barberia`) ON DELETE CASCADE,
  CONSTRAINT `chk_servicio_duracion` CHECK ((`duracion_minutos` > 0)),
  CONSTRAINT `chk_servicio_precio` CHECK ((`precio` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio`
--

LOCK TABLES `servicio` WRITE;
/*!40000 ALTER TABLE `servicio` DISABLE KEYS */;
INSERT INTO `servicio` VALUES (1,1,'corte','Corte','Corte clasico',30,25000.00,'activo'),(2,1,'combo','Corte + Barba americana','Corte y perfilado',45,35000.00,'activo'),(3,1,'barba','Barba','Perfilado de barba',20,15000.00,'activo'),(4,1,'diseno','Diseno','Diseno personalizado',20,20000.00,'activo'),(5,1,'combo','Corte + Diseno','Corte con diseno',50,40000.00,'activo'),(8,4,'corte','Corte','Corte clásico',45,25000.00,'activo'),(9,4,'barba','Barba','Perfilado de barba',20,15000.00,'activo'),(10,4,'tratamiento','Tratamiento capilar','Hidratación y cuidado',90,80000.00,'activo');
/*!40000 ALTER TABLE `servicio` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_servicio_bitacora_creacion` AFTER INSERT ON `servicio` FOR EACH ROW BEGIN
  INSERT INTO historial_actividad(barberia_id, barbero_id, descripcion)
  VALUES (NEW.barberia_id, @usuario_actual,
          CONCAT('Se agrego el servicio "', NEW.nombre, '" al catalogo'));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `vw_dashboard_barberia`
--

DROP TABLE IF EXISTS `vw_dashboard_barberia`;
/*!50001 DROP VIEW IF EXISTS `vw_dashboard_barberia`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_dashboard_barberia` AS SELECT 
 1 AS `id_barberia`,
 1 AS `barberia`,
 1 AS `barberos_activos`,
 1 AS `citas_hoy`,
 1 AS `ingresos_mes`,
 1 AS `egresos_mes`,
 1 AS `utilidad_mes`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_dashboard_barbero`
--

DROP TABLE IF EXISTS `vw_dashboard_barbero`;
/*!50001 DROP VIEW IF EXISTS `vw_dashboard_barbero`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_dashboard_barbero` AS SELECT 
 1 AS `id_barbero`,
 1 AS `barberia_id`,
 1 AS `barbero`,
 1 AS `porcentaje_comision`,
 1 AS `citas_hoy`,
 1 AS `finalizadas_hoy`,
 1 AS `comision_mes`,
 1 AS `servicios_mes`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'smartcut'
--

--
-- Dumping routines for database 'smartcut'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_barberia_atiende_dia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_barberia_atiende_dia`(p_barberia_id BIGINT UNSIGNED, p_fecha DATE) RETURNS tinyint(1)
    READS SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE v_dias VARCHAR(120);
  SELECT dias_atencion INTO v_dias FROM barberia WHERE id_barberia = p_barberia_id;
  RETURN FIND_IN_SET(fn_dia_semana_es(p_fecha), COALESCE(v_dias,'')) > 0;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_barbero_disponible` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_barbero_disponible`(
  p_barbero_id  BIGINT UNSIGNED,
  p_fecha       DATE,
  p_hora_inicio TIME,
  p_hora_fin    TIME) RETURNS tinyint(1)
    READS SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE v_barberia   BIGINT UNSIGNED;
  DECLARE v_estado     VARCHAR(20);
  DECLARE v_apertura   TIME;
  DECLARE v_cierre     TIME;

  SELECT b.barberia_id, b.estado, ba.hora_apertura, ba.hora_cierre
    INTO v_barberia, v_estado, v_apertura, v_cierre
  FROM barbero b
  JOIN barberia ba ON ba.id_barberia = b.barberia_id
  WHERE b.id_barbero = p_barbero_id;

  IF v_barberia IS NULL OR v_estado <> 'activo' THEN
    RETURN FALSE;
  END IF;

  IF fn_barberia_atiende_dia(v_barberia, p_fecha) = FALSE THEN
    RETURN FALSE;
  END IF;

  IF p_hora_inicio < v_apertura OR p_hora_fin > v_cierre THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM ausencia_barbero
    WHERE barbero_id = p_barbero_id
      AND p_fecha BETWEEN fecha_inicio AND fecha_fin
      AND (hora_inicio IS NULL
           OR (hora_inicio < p_hora_fin AND hora_fin > p_hora_inicio))
  ) THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM cita
    WHERE barbero_id = p_barbero_id
      AND fecha = p_fecha
      AND estado NOT IN ('cancelada','no_asistio')
      AND hora_inicio < p_hora_fin
      AND hora_fin > p_hora_inicio
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_distancia_km` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_distancia_km`(
  p_lat1 DECIMAL(10,8), p_lon1 DECIMAL(11,8),
  p_lat2 DECIMAL(10,8), p_lon2 DECIMAL(11,8)) RETURNS decimal(10,2)
    DETERMINISTIC
BEGIN
  RETURN 6371 * ACOS(LEAST(1.0,
      COS(RADIANS(p_lat1)) * COS(RADIANS(p_lat2)) * COS(RADIANS(p_lon2) - RADIANS(p_lon1))
    + SIN(RADIANS(p_lat1)) * SIN(RADIANS(p_lat2))));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_ganancia_periodo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_ganancia_periodo`(
  p_barberia_id BIGINT UNSIGNED, p_fecha_inicio DATE, p_fecha_fin DATE) RETURNS decimal(14,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE v_resultado DECIMAL(14,2);
  SELECT COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END), 0)
    INTO v_resultado
  FROM movimiento_financiero
  WHERE barberia_id = p_barberia_id
    AND estado = 'activo'
    AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;
  RETURN v_resultado;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_dia_semana_es` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_dia_semana_es`(p_fecha DATE) RETURNS varchar(10) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    DETERMINISTIC
BEGIN
  RETURN ELT(WEEKDAY(p_fecha) + 1,
    'lunes','martes','miercoles','jueves','viernes','sabado','domingo');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_comision` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_comision`(
  IN p_barbero_id BIGINT UNSIGNED,
  IN p_porcentaje DECIMAL(5,2))
BEGIN
  UPDATE barbero SET porcentaje_comision = p_porcentaje WHERE id_barbero = p_barbero_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_estado_cita` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_estado_cita`(
  IN p_id_cita     BIGINT UNSIGNED,
  IN p_nuevo_estado VARCHAR(20))
BEGIN
  UPDATE cita SET estado = p_nuevo_estado WHERE id_cita = p_id_cita;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_agendar_cita` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agendar_cita`(
  IN p_barberia_id     BIGINT UNSIGNED,
  IN p_nombre_cliente  VARCHAR(80),
  IN p_telefono_cliente VARCHAR(20),
  IN p_barbero_id      BIGINT UNSIGNED,
  IN p_fecha           DATE,
  IN p_hora_inicio     TIME,
  IN p_servicios_csv   VARCHAR(255))
BEGIN
  DECLARE v_cliente_id BIGINT UNSIGNED DEFAULT NULL;
  DECLARE v_cita_id    BIGINT UNSIGNED;
  DECLARE v_duracion   INT UNSIGNED DEFAULT 0;
  DECLARE v_monto      DECIMAL(14,2) DEFAULT 0;
  DECLARE v_hora_fin   TIME;

  IF p_nombre_cliente IS NULL OR TRIM(p_nombre_cliente) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Debes indicar tu nombre.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM barbero
                 WHERE id_barbero = p_barbero_id
                   AND barberia_id = p_barberia_id AND estado = 'activo') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El barbero seleccionado no pertenece a esta barberia.';
  END IF;

  SELECT COALESCE(SUM(duracion_minutos),0), COALESCE(SUM(precio),0)
    INTO v_duracion, v_monto
  FROM servicio
  WHERE barberia_id = p_barberia_id AND estado = 'activo'
    AND FIND_IN_SET(id_servicio, p_servicios_csv) > 0;

  IF v_duracion = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Debes seleccionar al menos un servicio valido.';
  END IF;

  SET v_hora_fin = ADDTIME(p_hora_inicio, SEC_TO_TIME(v_duracion * 60));

  IF fn_barbero_disponible(p_barbero_id, p_fecha, p_hora_inicio, v_hora_fin) = FALSE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El barbero no esta disponible en ese horario.';
  END IF;

  -- Reutiliza el cliente si ya dejo su telefono antes; si no, lo crea.
  IF p_telefono_cliente IS NOT NULL AND TRIM(p_telefono_cliente) <> '' THEN
    SELECT id_cliente INTO v_cliente_id
    FROM cliente WHERE telefono = p_telefono_cliente LIMIT 1;
  END IF;

  IF v_cliente_id IS NULL THEN
    INSERT INTO cliente(nombre, telefono) VALUES (TRIM(p_nombre_cliente), p_telefono_cliente);
    SET v_cliente_id = LAST_INSERT_ID();
  END IF;

  INSERT INTO cita(barberia_id, cliente_id, barbero_id, fecha, hora_inicio, hora_fin,
                   monto_total, duracion_total_minutos, estado)
  VALUES (p_barberia_id, v_cliente_id, p_barbero_id, p_fecha, p_hora_inicio, v_hora_fin,
          v_monto, v_duracion, 'pendiente');
  SET v_cita_id = LAST_INSERT_ID();

  INSERT INTO cita_servicio(cita_id, servicio_id, precio_aplicado, duracion_aplicada)
  SELECT v_cita_id, id_servicio, precio, duracion_minutos
  FROM servicio
  WHERE barberia_id = p_barberia_id AND estado = 'activo'
    AND FIND_IN_SET(id_servicio, p_servicios_csv) > 0;

  -- Esto es lo que la web le muestra al cliente
  SELECT c.id_cita, c.numero_ticket, c.fecha, c.hora_inicio, c.hora_fin,
         c.monto_total, c.duracion_total_minutos,
         ba.nombre AS barberia, ba.direccion,
         CONCAT(b.nombre, ' ', COALESCE(b.apellido,'')) AS barbero
  FROM cita c
  JOIN barberia ba ON ba.id_barberia = c.barberia_id
  JOIN barbero  b  ON b.id_barbero  = c.barbero_id
  WHERE c.id_cita = v_cita_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_agenda_barberia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agenda_barberia`(
  IN p_barberia_id  BIGINT UNSIGNED,
  IN p_barbero_id   BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE)
BEGIN
  SELECT c.id_cita, c.numero_ticket, c.fecha, c.hora_inicio, c.hora_fin,
         c.estado, c.monto_total,
         cl.nombre AS cliente,
         b.id_barbero,
         CONCAT(b.nombre,' ',COALESCE(b.apellido,'')) AS barbero,
         GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
  FROM cita c
  JOIN cliente cl ON cl.id_cliente = c.cliente_id
  JOIN barbero b  ON b.id_barbero  = c.barbero_id
  LEFT JOIN cita_servicio cs ON cs.cita_id = c.id_cita
  LEFT JOIN servicio s ON s.id_servicio = cs.servicio_id
  WHERE c.barberia_id = p_barberia_id
    AND (p_barbero_id IS NULL OR c.barbero_id = p_barbero_id)
    AND c.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY c.id_cita
  ORDER BY c.fecha, c.hora_inicio;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_agenda_barbero` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_agenda_barbero`(
  IN p_barbero_id BIGINT UNSIGNED,
  IN p_fecha      DATE)
BEGIN
  SELECT c.id_cita, c.numero_ticket, c.hora_inicio, c.hora_fin, c.estado, c.monto_total,
         cl.nombre AS cliente, cl.telefono,
         GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
  FROM cita c
  JOIN cliente cl ON cl.id_cliente = c.cliente_id
  LEFT JOIN cita_servicio cs ON cs.cita_id = c.id_cita
  LEFT JOIN servicio s ON s.id_servicio = cs.servicio_id
  WHERE c.barbero_id = p_barbero_id AND c.fecha = p_fecha
  GROUP BY c.id_cita
  ORDER BY c.hora_inicio;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_anular_movimiento` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_anular_movimiento`(
  IN p_id_movimiento BIGINT UNSIGNED,
  IN p_motivo        VARCHAR(255))
BEGIN
  UPDATE movimiento_financiero
  SET estado = 'anulado', motivo_anulacion = p_motivo
  WHERE id_movimiento = p_id_movimiento AND estado = 'activo';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cambiar_contrasena` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cambiar_contrasena`(
  IN p_id_barbero      BIGINT UNSIGNED,
  IN p_contrasena_hash VARCHAR(255))
BEGIN
  UPDATE barbero
  SET contrasena_hash = p_contrasena_hash,
      debe_cambiar_contrasena = FALSE
  WHERE id_barbero = p_id_barbero;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cambiar_estado_barbero` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cambiar_estado_barbero`(
  IN p_barbero_id BIGINT UNSIGNED,
  IN p_estado     VARCHAR(20))
BEGIN
  UPDATE barbero SET estado = p_estado WHERE id_barbero = p_barbero_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cancelar_cita` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cancelar_cita`(
  IN p_id_cita      BIGINT UNSIGNED,
  IN p_cancelada_por VARCHAR(10),
  IN p_motivo       VARCHAR(255))
BEGIN
  UPDATE cita
  SET estado = 'cancelada', cancelada_por = p_cancelada_por, motivo_cancelacion = p_motivo
  WHERE id_cita = p_id_cita;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_configurar_horario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_configurar_horario`(
  IN p_barberia_id     BIGINT UNSIGNED,
  IN p_dias_atencion   VARCHAR(120),
  IN p_hora_apertura   TIME,
  IN p_hora_cierre     TIME,
  IN p_duracion_turno  INT UNSIGNED)
BEGIN
  IF p_hora_cierre <= p_hora_apertura THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La hora de cierre debe ser posterior a la de apertura.';
  END IF;

  UPDATE barberia
  SET dias_atencion          = p_dias_atencion,
      hora_apertura          = p_hora_apertura,
      hora_cierre            = p_hora_cierre,
      duracion_turno_minutos = p_duracion_turno
  WHERE id_barberia = p_barberia_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_consultar_ticket` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_consultar_ticket`(
  IN p_barberia_id BIGINT UNSIGNED,
  IN p_fecha       DATE,
  IN p_ticket      VARCHAR(12))
BEGIN
  SELECT c.numero_ticket, c.fecha, c.hora_inicio, c.estado, c.monto_total,
         cl.nombre AS cliente,
         CONCAT(b.nombre,' ',COALESCE(b.apellido,'')) AS barbero,
         GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
  FROM cita c
  JOIN cliente cl ON cl.id_cliente = c.cliente_id
  JOIN barbero b  ON b.id_barbero  = c.barbero_id
  LEFT JOIN cita_servicio cs ON cs.cita_id = c.id_cita
  LEFT JOIN servicio s ON s.id_servicio = cs.servicio_id
  WHERE c.barberia_id = p_barberia_id AND c.fecha = p_fecha AND c.numero_ticket = p_ticket
  GROUP BY c.id_cita;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_barberia_con_admin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_barberia_con_admin`(
  IN p_nombre_barberia   VARCHAR(150),
  IN p_direccion         VARCHAR(200),
  IN p_telefono_barberia VARCHAR(20),
  IN p_correo_barberia   VARCHAR(150),
  IN p_latitud           DECIMAL(10,8),
  IN p_longitud          DECIMAL(11,8),
  IN p_nombre_admin      VARCHAR(80),
  IN p_apellido_admin    VARCHAR(80),
  IN p_correo_admin      VARCHAR(150),
  IN p_contrasena_hash   VARCHAR(255),
  IN p_telefono_admin    VARCHAR(20))
BEGIN
  DECLARE v_barberia BIGINT UNSIGNED;
  DECLARE v_admin    BIGINT UNSIGNED;

  INSERT INTO barberia(nombre, direccion, telefono, correo, latitud, longitud)
  VALUES (p_nombre_barberia, p_direccion, p_telefono_barberia,
          p_correo_barberia, p_latitud, p_longitud);
  SET v_barberia = LAST_INSERT_ID();

  INSERT INTO barbero(barberia_id, nombre, apellido, correo, contrasena_hash,
                      telefono, es_admin, debe_cambiar_contrasena, estado, fecha_ingreso)
  VALUES (v_barberia, p_nombre_admin, p_apellido_admin, p_correo_admin,
          p_contrasena_hash, p_telefono_admin, TRUE, FALSE, 'activo', CURDATE());
  SET v_admin = LAST_INSERT_ID();

  -- Categorias contables por defecto para que el negocio arranque usable
  INSERT INTO categoria_movimiento(barberia_id, nombre, tipo) VALUES
    (v_barberia, 'Servicios',          'ingreso'),
    (v_barberia, 'Venta de productos', 'ingreso'),
    (v_barberia, 'Arriendo',           'gasto'),
    (v_barberia, 'Servicios publicos', 'gasto'),
    (v_barberia, 'Nomina',             'gasto'),
    (v_barberia, 'Insumos',            'compra'),
    (v_barberia, 'Herramientas',       'compra');

  SELECT v_barberia AS id_barberia, v_admin AS id_admin;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_barbero_provisional` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_barbero_provisional`(
  IN p_barberia_id     BIGINT UNSIGNED,
  IN p_nombre          VARCHAR(80),
  IN p_apellido        VARCHAR(80),
  IN p_correo          VARCHAR(150),
  IN p_contrasena_hash VARCHAR(255),
  IN p_telefono        VARCHAR(20))
BEGIN
  INSERT INTO barbero(barberia_id, nombre, apellido, correo, contrasena_hash,
                      telefono, es_admin, debe_cambiar_contrasena, estado, fecha_ingreso)
  VALUES (p_barberia_id, p_nombre, p_apellido, p_correo, p_contrasena_hash,
          p_telefono, FALSE, TRUE, 'activo', CURDATE());

  SELECT LAST_INSERT_ID() AS id_barbero;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_categoria` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_categoria`(
  IN p_barberia_id BIGINT UNSIGNED,
  IN p_nombre      VARCHAR(50),
  IN p_tipo        VARCHAR(10))
BEGIN
  IF p_tipo NOT IN ('ingreso','gasto','compra') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El tipo debe ser ingreso, gasto o compra.';
  END IF;

  INSERT INTO categoria_movimiento(barberia_id, nombre, tipo)
  VALUES (p_barberia_id, TRIM(p_nombre), p_tipo);

  SELECT LAST_INSERT_ID() AS id_categoria;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_crear_servicio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_crear_servicio`(
  IN p_barberia_id      BIGINT UNSIGNED,
  IN p_categoria        VARCHAR(20),
  IN p_nombre           VARCHAR(100),
  IN p_descripcion      TEXT,
  IN p_duracion_minutos INT UNSIGNED,
  IN p_precio           DECIMAL(14,2))
BEGIN
  INSERT INTO servicio(barberia_id, categoria, nombre, descripcion, duracion_minutos, precio)
  VALUES (p_barberia_id, p_categoria, p_nombre, p_descripcion, p_duracion_minutos, p_precio);
  SELECT LAST_INSERT_ID() AS id_servicio;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_egresos_por_categoria` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_egresos_por_categoria`(
  IN p_barberia_id  BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE)
BEGIN
  SELECT cat.id_categoria, cat.nombre, cat.tipo,
         SUM(m.monto)  AS total,
         COUNT(*)      AS movimientos
  FROM movimiento_financiero m
  JOIN categoria_movimiento cat ON cat.id_categoria = m.categoria_id
  WHERE m.barberia_id = p_barberia_id AND m.estado = 'activo'
    AND m.tipo IN ('gasto','compra')
    AND DATE(m.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY cat.id_categoria
  ORDER BY total DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalizar_onboarding` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalizar_onboarding`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  UPDATE barberia SET onboarding_completo = TRUE WHERE id_barberia = p_barberia_id;
  SELECT * FROM barberia WHERE id_barberia = p_barberia_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_gastos_mensuales_anio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_gastos_mensuales_anio`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT
    DATE_FORMAT(m.fecha, '%Y-%m') AS periodo,
    SUM(m.monto)                  AS total_egresos,
    (SELECT cat.nombre
       FROM movimiento_financiero m2
       JOIN categoria_movimiento cat ON cat.id_categoria = m2.categoria_id
      WHERE m2.barberia_id = p_barberia_id AND m2.estado = 'activo'
        AND m2.tipo IN ('gasto','compra')
        AND DATE_FORMAT(m2.fecha, '%Y-%m') = DATE_FORMAT(ANY_VALUE(m.fecha), '%Y-%m')
      GROUP BY cat.id_categoria
      ORDER BY SUM(m2.monto) DESC LIMIT 1)  AS categoria_mayor,
    (SELECT SUM(m3.monto)
       FROM movimiento_financiero m3
       JOIN categoria_movimiento cat3 ON cat3.id_categoria = m3.categoria_id
      WHERE m3.barberia_id = p_barberia_id AND m3.estado = 'activo'
        AND m3.tipo IN ('gasto','compra')
        AND DATE_FORMAT(m3.fecha, '%Y-%m') = DATE_FORMAT(ANY_VALUE(m.fecha), '%Y-%m')
      GROUP BY cat3.id_categoria
      ORDER BY SUM(m3.monto) DESC LIMIT 1)  AS monto_categoria_mayor
  FROM movimiento_financiero m
  WHERE m.barberia_id = p_barberia_id
    AND m.estado = 'activo'
    AND m.tipo IN ('gasto','compra')
    AND m.fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
  GROUP BY DATE_FORMAT(m.fecha, '%Y-%m')
  ORDER BY periodo;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_informe_mensual` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_informe_mensual`(
  IN p_barberia_id BIGINT UNSIGNED,
  IN p_anio        INT,
  IN p_mes         INT)
BEGIN
  DECLARE v_inicio DATE;
  DECLARE v_fin    DATE;
  SET v_inicio = STR_TO_DATE(CONCAT(p_anio,'-',p_mes,'-01'), '%Y-%m-%d');
  SET v_fin    = LAST_DAY(v_inicio);

  SELECT ba.nombre AS barberia, ba.direccion, ba.telefono,
         v_inicio AS periodo_inicio, v_fin AS periodo_fin,
         COALESCE(SUM(CASE WHEN m.tipo='ingreso' THEN m.monto END),0) AS total_ingresos,
         COALESCE(SUM(CASE WHEN m.tipo='gasto'   THEN m.monto END),0) AS total_gastos,
         COALESCE(SUM(CASE WHEN m.tipo='compra'  THEN m.monto END),0) AS total_compras,
         COALESCE(SUM(m.monto_comision),0)                            AS total_comisiones,
         fn_calcular_ganancia_periodo(p_barberia_id, v_inicio, v_fin) AS utilidad,
         (SELECT COUNT(*) FROM cita c
           WHERE c.barberia_id = p_barberia_id AND c.estado = 'finalizada'
             AND c.fecha BETWEEN v_inicio AND v_fin)                  AS citas_finalizadas
  FROM barberia ba
  LEFT JOIN movimiento_financiero m
    ON m.barberia_id = ba.id_barberia AND m.estado = 'activo'
   AND DATE(m.fecha) BETWEEN v_inicio AND v_fin
  WHERE ba.id_barberia = p_barberia_id
  GROUP BY ba.id_barberia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_barberias_publicas` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_barberias_publicas`()
BEGIN
  SELECT id_barberia, nombre, direccion, telefono, latitud, longitud,
         dias_atencion, hora_apertura, hora_cierre
  FROM barberia
  WHERE estado = 'activa' AND onboarding_completo = TRUE
  ORDER BY nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_barberos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_barberos`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT id_barbero, nombre, apellido, correo, telefono, es_admin,
         debe_cambiar_contrasena, estado, fecha_ingreso, fecha_ultimo_acceso
  FROM barbero WHERE barberia_id = p_barberia_id
  ORDER BY es_admin DESC, nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_barberos_publicos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_barberos_publicos`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT id_barbero, nombre, apellido
  FROM barbero
  WHERE barberia_id = p_barberia_id AND estado = 'activo'
  ORDER BY nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_categorias` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_categorias`(
  IN p_barberia_id BIGINT UNSIGNED, IN p_tipo VARCHAR(10))
BEGIN
  SELECT * FROM categoria_movimiento
  WHERE barberia_id = p_barberia_id AND activo = TRUE
    AND (p_tipo IS NULL OR tipo = p_tipo)
  ORDER BY tipo, nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_clientes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_clientes`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT cl.id_cliente, cl.nombre, cl.telefono,
         COUNT(c.id_cita) AS total_citas,
         MAX(c.fecha) AS ultima_visita
  FROM cliente cl
  JOIN cita c ON c.cliente_id = cl.id_cliente
  WHERE c.barberia_id = p_barberia_id
  GROUP BY cl.id_cliente
  ORDER BY ultima_visita DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_movimientos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_movimientos`(
  IN p_barberia_id  BIGINT UNSIGNED,
  IN p_barbero_id   BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE,
  IN p_tipo         VARCHAR(10))
BEGIN
  SELECT m.*, cat.nombre AS categoria
  FROM movimiento_financiero m
  JOIN categoria_movimiento cat ON cat.id_categoria = m.categoria_id
  WHERE m.barberia_id = p_barberia_id
    AND m.estado = 'activo'
    AND (p_barbero_id IS NULL OR m.barbero_id = p_barbero_id)
    AND (p_tipo IS NULL OR m.tipo = p_tipo)
    AND DATE(m.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
  ORDER BY m.fecha DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_servicios` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_servicios`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT * FROM servicio WHERE barberia_id = p_barberia_id ORDER BY categoria, nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_servicios_publicos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_servicios_publicos`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT id_servicio, categoria, nombre, descripcion, duracion_minutos, precio
  FROM servicio
  WHERE barberia_id = p_barberia_id AND estado = 'activo'
  ORDER BY categoria, nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_listar_slots_disponibles` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_listar_slots_disponibles`(
  IN p_barbero_id BIGINT UNSIGNED,
  IN p_fecha      DATE,
  IN p_duracion   INT UNSIGNED)
BEGIN
  DECLARE v_apertura TIME;
  DECLARE v_cierre   TIME;
  DECLARE v_paso     INT UNSIGNED;

  SELECT ba.hora_apertura, ba.hora_cierre, ba.duracion_turno_minutos
    INTO v_apertura, v_cierre, v_paso
  FROM barbero b
  JOIN barberia ba ON ba.id_barberia = b.barberia_id
  WHERE b.id_barbero = p_barbero_id;

  SET v_paso = GREATEST(COALESCE(v_paso, 30), 5);

  WITH RECURSIVE rejilla AS (
    SELECT CAST(v_apertura AS TIME) AS hora
    UNION ALL
    SELECT ADDTIME(hora, SEC_TO_TIME(v_paso * 60))
    FROM rejilla
    WHERE ADDTIME(hora, SEC_TO_TIME(v_paso * 60)) < v_cierre
  )
  SELECT hora AS hora_inicio,
         ADDTIME(hora, SEC_TO_TIME(p_duracion * 60)) AS hora_fin
  FROM rejilla
  WHERE ADDTIME(hora, SEC_TO_TIME(p_duracion * 60)) <= v_cierre
    AND (p_fecha > CURDATE() OR (p_fecha = CURDATE() AND hora > CURTIME()))
    AND fn_barbero_disponible(p_barbero_id, p_fecha, hora,
          ADDTIME(hora, SEC_TO_TIME(p_duracion * 60))) = TRUE
  ORDER BY hora;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_obtener_credenciales` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_obtener_credenciales`(IN p_correo VARCHAR(150))
BEGIN
  SELECT b.id_barbero, b.barberia_id, b.nombre, b.apellido, b.correo,
         b.contrasena_hash, b.es_admin, b.debe_cambiar_contrasena, b.estado,
         ba.nombre AS nombre_barberia, ba.onboarding_completo
  FROM barbero b
  JOIN barberia ba ON ba.id_barberia = b.barberia_id
  WHERE b.correo = p_correo AND b.estado <> 'inactivo';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_perfil_usuario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_perfil_usuario`(IN p_barbero_id BIGINT UNSIGNED)
BEGIN
  SELECT b.id_barbero, b.nombre, b.apellido, b.correo, b.telefono,
         b.es_admin, b.porcentaje_comision, b.estado,
         b.fecha_ingreso, b.fecha_ultimo_acceso,
         ba.id_barberia, ba.nombre AS barberia, ba.direccion
  FROM barbero b
  JOIN barberia ba ON ba.id_barberia = b.barberia_id
  WHERE b.id_barbero = p_barbero_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ranking_barberos` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ranking_barberos`(
  IN p_barberia_id  BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE)
BEGIN
  SELECT b.id_barbero,
         CONCAT(b.nombre,' ',COALESCE(b.apellido,'')) AS barbero,
         b.porcentaje_comision,
         COUNT(DISTINCT c.id_cita)            AS citas_atendidas,
         COALESCE(SUM(m.monto),0)             AS facturacion,
         COALESCE(SUM(m.monto_comision),0)    AS comision
  FROM barbero b
  LEFT JOIN cita c ON c.barbero_id = b.id_barbero
       AND c.estado = 'finalizada' AND c.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
  LEFT JOIN movimiento_financiero m ON m.cita_id = c.id_cita AND m.estado = 'activo'
  WHERE b.barberia_id = p_barberia_id AND b.estado <> 'inactivo'
  GROUP BY b.id_barbero
  ORDER BY facturacion DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_acceso` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_acceso`(IN p_id_barbero BIGINT UNSIGNED)
BEGIN
  UPDATE barbero SET fecha_ultimo_acceso = NOW() WHERE id_barbero = p_id_barbero;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_atencion` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_atencion`(
  IN p_barbero_id     BIGINT UNSIGNED,
  IN p_nombre_cliente VARCHAR(80),
  IN p_servicios_csv  VARCHAR(255))
BEGIN
  DECLARE v_barberia   BIGINT UNSIGNED;
  DECLARE v_cliente_id BIGINT UNSIGNED;
  DECLARE v_cita_id    BIGINT UNSIGNED;
  DECLARE v_duracion   INT UNSIGNED DEFAULT 0;
  DECLARE v_monto      DECIMAL(14,2) DEFAULT 0;
  DECLARE v_inicio     TIME;

  SELECT barberia_id INTO v_barberia
  FROM barbero WHERE id_barbero = p_barbero_id AND estado = 'activo';

  IF v_barberia IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El barbero no existe o no esta activo.';
  END IF;

  IF p_nombre_cliente IS NULL OR TRIM(p_nombre_cliente) = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Debes indicar el nombre del cliente.';
  END IF;

  SELECT COALESCE(SUM(duracion_minutos),0), COALESCE(SUM(precio),0)
    INTO v_duracion, v_monto
  FROM servicio
  WHERE barberia_id = v_barberia AND estado = 'activo'
    AND FIND_IN_SET(id_servicio, p_servicios_csv) > 0;

  IF v_duracion = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Debes seleccionar al menos un servicio valido.';
  END IF;

  SET v_inicio = CURTIME();

  INSERT INTO cliente(nombre) VALUES (TRIM(p_nombre_cliente));
  SET v_cliente_id = LAST_INSERT_ID();

  -- Se crea como pendiente para que los triggers de cita_servicio
  -- recalculen totales; el UPDATE final dispara el ingreso.
  INSERT INTO cita(barberia_id, cliente_id, barbero_id, fecha, hora_inicio, hora_fin,
                   monto_total, duracion_total_minutos, estado)
  VALUES (v_barberia, v_cliente_id, p_barbero_id, CURDATE(), v_inicio,
          ADDTIME(v_inicio, SEC_TO_TIME(v_duracion * 60)), v_monto, v_duracion, 'pendiente');
  SET v_cita_id = LAST_INSERT_ID();

  INSERT INTO cita_servicio(cita_id, servicio_id, precio_aplicado, duracion_aplicada)
  SELECT v_cita_id, id_servicio, precio, duracion_minutos
  FROM servicio
  WHERE barberia_id = v_barberia AND estado = 'activo'
    AND FIND_IN_SET(id_servicio, p_servicios_csv) > 0;

  UPDATE cita SET estado = 'finalizada' WHERE id_cita = v_cita_id;

  SELECT c.id_cita, c.numero_ticket, c.hora_inicio, c.hora_fin, c.monto_total,
         m.monto_comision, cl.nombre AS cliente
  FROM cita c
  JOIN cliente cl ON cl.id_cliente = c.cliente_id
  LEFT JOIN movimiento_financiero m ON m.cita_id = c.id_cita
  WHERE c.id_cita = v_cita_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_ausencia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_ausencia`(
  IN p_barbero_id   BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE,
  IN p_hora_inicio  TIME,
  IN p_hora_fin     TIME,
  IN p_motivo       VARCHAR(255))
BEGIN
  DECLARE v_barberia BIGINT UNSIGNED;
  SELECT barberia_id INTO v_barberia FROM barbero WHERE id_barbero = p_barbero_id;

  INSERT INTO ausencia_barbero(barberia_id, barbero_id, fecha_inicio, fecha_fin,
                               hora_inicio, hora_fin, motivo)
  VALUES (v_barberia, p_barbero_id, p_fecha_inicio, p_fecha_fin,
          p_hora_inicio, p_hora_fin, p_motivo);
  SELECT LAST_INSERT_ID() AS id_ausencia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_movimiento` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_movimiento`(
  IN p_barberia_id    BIGINT UNSIGNED,
  IN p_barbero_id     BIGINT UNSIGNED,
  IN p_tipo           VARCHAR(10),
  IN p_categoria_id   BIGINT UNSIGNED,
  IN p_monto          DECIMAL(14,2),
  IN p_cantidad       DECIMAL(10,2),
  IN p_unidad_medida  VARCHAR(20),
  IN p_descripcion    VARCHAR(255),
  IN p_fecha          DATETIME,
  IN p_registrado_por BIGINT UNSIGNED)
BEGIN
  DECLARE v_es_admin BOOLEAN;

  SELECT es_admin INTO v_es_admin FROM barbero WHERE id_barbero = p_registrado_por;

  IF COALESCE(v_es_admin, FALSE) = FALSE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo el administrador puede registrar movimientos manuales.';
  END IF;

  IF p_tipo = 'ingreso' AND DATE(p_fecha) <> CURDATE() THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Los ingresos manuales solo pueden registrarse con la fecha de hoy.';
  END IF;

  IF p_tipo IN ('gasto','compra') AND DATE(p_fecha) > CURDATE() THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No se pueden registrar gastos o compras con fecha futura.';
  END IF;

  INSERT INTO movimiento_financiero(
    barberia_id, barbero_id, tipo, categoria_id, monto, cantidad,
    unidad_medida, descripcion, fecha, registrado_por, origen)
  VALUES (p_barberia_id, p_barbero_id, p_tipo, p_categoria_id, p_monto, p_cantidad,
          p_unidad_medida, p_descripcion, COALESCE(p_fecha, NOW()), p_registrado_por, 'manual');

  SELECT LAST_INSERT_ID() AS id_movimiento;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_reporte_financiero` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reporte_financiero`(
  IN p_barberia_id   BIGINT UNSIGNED,
  IN p_fecha_inicio  DATE,
  IN p_fecha_fin     DATE)
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto END),0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN tipo='gasto'   THEN monto END),0) AS total_gastos,
    COALESCE(SUM(CASE WHEN tipo='compra'  THEN monto END),0) AS total_compras,
    fn_calcular_ganancia_periodo(p_barberia_id, p_fecha_inicio, p_fecha_fin) AS utilidad
  FROM movimiento_financiero
  WHERE barberia_id = p_barberia_id AND estado = 'activo'
    AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_resumen_barberia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_resumen_barberia`(IN p_barberia_id BIGINT UNSIGNED)
BEGIN
  SELECT
    (SELECT COUNT(*) FROM barbero b
      WHERE b.barberia_id = p_barberia_id AND b.estado = 'activo')  AS barberos_activos,
    (SELECT COUNT(*) FROM cita c
      WHERE c.barberia_id = p_barberia_id AND c.fecha = CURDATE()
        AND c.estado <> 'cancelada')                                AS citas_hoy,
    (SELECT COALESCE(SUM(m.monto),0) FROM movimiento_financiero m
      WHERE m.barberia_id = p_barberia_id AND m.tipo = 'ingreso' AND m.estado = 'activo'
        AND YEAR(m.fecha) = YEAR(CURDATE()) AND MONTH(m.fecha) = MONTH(CURDATE()))
                                                                    AS ingresos_mes,
    (SELECT COALESCE(SUM(m.monto),0) FROM movimiento_financiero m
      WHERE m.barberia_id = p_barberia_id AND m.tipo IN ('gasto','compra')
        AND m.estado = 'activo'
        AND YEAR(m.fecha) = YEAR(CURDATE()) AND MONTH(m.fecha) = MONTH(CURDATE()))
                                                                    AS egresos_mes;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_resumen_barbero` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_resumen_barbero`(IN p_barbero_id BIGINT UNSIGNED)
BEGIN
  SELECT
    (SELECT COUNT(*) FROM cita c
      WHERE c.barbero_id = p_barbero_id AND c.fecha = CURDATE()
        AND c.estado <> 'cancelada')                                AS citas_hoy,
    (SELECT COUNT(*) FROM cita c
      WHERE c.barbero_id = p_barbero_id AND c.fecha = CURDATE()
        AND c.estado = 'finalizada')                                AS finalizadas_hoy,
    (SELECT COALESCE(SUM(m.monto_comision),0) FROM movimiento_financiero m
      WHERE m.barbero_id = p_barbero_id AND m.tipo = 'ingreso' AND m.estado = 'activo'
        AND YEAR(m.fecha) = YEAR(CURDATE()) AND MONTH(m.fecha) = MONTH(CURDATE()))
                                                                    AS comision_mes,
    (SELECT COUNT(*) FROM cita_servicio cs
      JOIN cita c ON c.id_cita = cs.cita_id
      WHERE c.barbero_id = p_barbero_id AND c.estado = 'finalizada'
        AND YEAR(c.fecha) = YEAR(CURDATE()) AND MONTH(c.fecha) = MONTH(CURDATE()))
                                                                    AS servicios_mes;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_serie_ingresos_diarios` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_serie_ingresos_diarios`(
  IN p_barberia_id  BIGINT UNSIGNED,
  IN p_barbero_id   BIGINT UNSIGNED,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE)
BEGIN
  SELECT DATE(fecha) AS dia,
         COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN
           CASE WHEN p_barbero_id IS NULL THEN monto ELSE monto_comision END
         END), 0) AS ingresos,
         COALESCE(SUM(CASE WHEN tipo IN ('gasto','compra') THEN monto END), 0) AS egresos
  FROM movimiento_financiero
  WHERE barberia_id = p_barberia_id
    AND estado = 'activo'
    AND (p_barbero_id IS NULL OR barbero_id = p_barbero_id)
    AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY DATE(fecha)
  ORDER BY dia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_dashboard_barberia`
--

/*!50001 DROP VIEW IF EXISTS `vw_dashboard_barberia`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_dashboard_barberia` AS select `ba`.`id_barberia` AS `id_barberia`,`ba`.`nombre` AS `barberia`,(select count(0) from `barbero` `b` where ((`b`.`barberia_id` = `ba`.`id_barberia`) and (`b`.`estado` = 'activo'))) AS `barberos_activos`,(select count(0) from `cita` `c` where ((`c`.`barberia_id` = `ba`.`id_barberia`) and (`c`.`fecha` = curdate()) and (`c`.`estado` not in ('cancelada','no_asistio')))) AS `citas_hoy`,(select coalesce(sum(`m`.`monto`),0) from `movimiento_financiero` `m` where ((`m`.`barberia_id` = `ba`.`id_barberia`) and (`m`.`tipo` = 'ingreso') and (`m`.`estado` = 'activo') and (year(`m`.`fecha`) = year(curdate())) and (month(`m`.`fecha`) = month(curdate())))) AS `ingresos_mes`,(select coalesce(sum(`m`.`monto`),0) from `movimiento_financiero` `m` where ((`m`.`barberia_id` = `ba`.`id_barberia`) and (`m`.`tipo` in ('gasto','compra')) and (`m`.`estado` = 'activo') and (year(`m`.`fecha`) = year(curdate())) and (month(`m`.`fecha`) = month(curdate())))) AS `egresos_mes`,`fn_calcular_ganancia_periodo`(`ba`.`id_barberia`,date_format(curdate(),'%Y-%m-01'),last_day(curdate())) AS `utilidad_mes` from `barberia` `ba` where (`ba`.`estado` = 'activa') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_dashboard_barbero`
--

/*!50001 DROP VIEW IF EXISTS `vw_dashboard_barbero`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_dashboard_barbero` AS select `b`.`id_barbero` AS `id_barbero`,`b`.`barberia_id` AS `barberia_id`,concat(`b`.`nombre`,' ',coalesce(`b`.`apellido`,'')) AS `barbero`,`b`.`porcentaje_comision` AS `porcentaje_comision`,(select count(0) from `cita` `c` where ((`c`.`barbero_id` = `b`.`id_barbero`) and (`c`.`fecha` = curdate()) and (`c`.`estado` <> 'cancelada'))) AS `citas_hoy`,(select count(0) from `cita` `c` where ((`c`.`barbero_id` = `b`.`id_barbero`) and (`c`.`fecha` = curdate()) and (`c`.`estado` = 'finalizada'))) AS `finalizadas_hoy`,(select coalesce(sum(`m`.`monto_comision`),0) from `movimiento_financiero` `m` where ((`m`.`barbero_id` = `b`.`id_barbero`) and (`m`.`tipo` = 'ingreso') and (`m`.`estado` = 'activo') and (year(`m`.`fecha`) = year(curdate())) and (month(`m`.`fecha`) = month(curdate())))) AS `comision_mes`,(select count(0) from (`cita_servicio` `cs` join `cita` `c` on((`c`.`id_cita` = `cs`.`cita_id`))) where ((`c`.`barbero_id` = `b`.`id_barbero`) and (`c`.`estado` = 'finalizada') and (year(`c`.`fecha`) = year(curdate())) and (month(`c`.`fecha`) = month(curdate())))) AS `servicios_mes` from `barbero` `b` where (`b`.`estado` <> 'inactivo') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26 17:44:25
