# SmartCut

Aplicación móvil de gestión de barberías. Proyecto Integrador 2026-2 — Grupo 01N30.

Dos tipos de usuario:

- **Dueño-administrador** — registra su barbería en un onboarding de 7 pasos y crea las cuentas de su equipo.
- **Barbero** — no se registra solo. El administrador le entrega credenciales provisionales y, al entrar por primera vez, la app lo obliga a cambiar la contraseña.

## Alcance de esta iteración

Sobre el flujo de acceso de la fase anterior (onboarding, login, cambio obligatorio de contraseña), esta fase agrega los **dashboards con datos reales** de los dos roles:

- **Registro de atención sin cita** — la única fuente de datos reales mientras no existe la web pública de reservas.
- **Inicio** de barbero y de administrador (con sus dos capas, "Mi negocio" y "Mi trabajo").
- **Gráficas interactivas** (tocar para resaltar y ver el detalle): ingresos vs. egresos, comparación de barberos, gastos anuales.
- **Agenda** — la propia para el barbero, la global con filtros para el administrador.
- **Finanzas** — comisión y ranking para el barbero; resumen, movimientos, categorías e informe mensual en PDF para el administrador.
- **Equipo** (solo administrador) — alta de barberos, ausencias/incapacidades, estado y comisión.
- **Configuración** — datos de la cuenta, cambio de contraseña y (solo administrador) horario de atención.
- **Drawer lateral** — reemplazó el stack simple de la fase anterior como navegación de toda la app ya logueada.

Todavía **no** están: envío de correos, edición de datos personales o de la barbería (ver la nota de la sección de Configuración más abajo), reprogramación de citas, historial de clientes, inventario, notificaciones push, modo offline ni multi-sede.

---

## 1. Requisitos previos

| Herramienta | Versión | Nota |
|---|---|---|
| Node.js | 20.19 o superior | Lo exige Expo SDK 54 |
| MySQL Server | 8.0+ | Probado con 8.0.42 |
| MySQL Workbench | 8.0 | Para importar el script |
| Expo Go | **la build de SDK 54** | Ver el aviso de abajo |
| Android Studio | opcional | Solo si vas a usar emulador |

> ⚠️ **Expo Go debe ser el de SDK 54.** El de la Play Store trae el SDK más reciente y da el error *"Project is incompatible with this version of Expo Go"*. Descarga el correcto desde:
> - Celular Android físico → <https://expo.dev/go?sdkVersion=54&platform=android&device=true>
> - Emulador de Android → <https://expo.dev/go?sdkVersion=54&platform=android&device=false>

---

## 2. Importar la base de datos

Esta fase agrega comisión por porcentaje y los procedimientos de dashboards, agenda, finanzas y equipo. El script para importar es **`smartcut_v2.sql`** (`smartcut.sql`, el original, se quedó en el esquema de la fase anterior sin comisiones — no lo uses para esta fase).

Abre `smartcut_v2.sql` en MySQL Workbench y ejecuta el **script completo** (Ctrl+Shift+Enter).

> 🚨 **Ejecútalo entero, desde la línea 1.** Es un `mysqldump`, así que ya trae su propio `DROP DATABASE IF EXISTS` / `CREATE DATABASE` con la collation correcta (`utf8mb4_unicode_ci`) al principio — igual que antes, si creas el esquema a mano y corres el script desde un `USE smartcut;` a mitad de camino, la collation queda mezclada y el login se rompe con `ER_CANT_AGGREGATE_2COLLATIONS`.

Para comprobar que quedó bien:

```sql
SELECT DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'smartcut';
-- Debe decir: utf8mb4_unicode_ci
```

El script crea 10 tablas, 2 vistas, 39 procedimientos y 5 funciones.

> ⚠️ **Corrige `sp_gastos_mensuales_anio` después de importar.** Tal como viene en `smartcut_v2.sql`, ese procedimiento falla siempre con el error 1055 de MySQL (`ONLY_FULL_GROUP_BY`): sus dos subconsultas correlacionadas comparan `DATE_FORMAT(m2.fecha,'%Y-%m')` contra `DATE_FORMAT(m.fecha,'%Y-%m')`, y `m.fecha` no es funcionalmente dependiente del `GROUP BY` externo. Corre esto una sola vez después de importar (no toca ninguna tabla, trigger ni otra rutina, solo reemplaza esta rutina):
>
> ```sql
> DROP PROCEDURE IF EXISTS `sp_gastos_mensuales_anio`;
>
> DELIMITER ;;
> CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_gastos_mensuales_anio`(IN p_barberia_id BIGINT UNSIGNED)
> BEGIN
>   SELECT
>     DATE_FORMAT(m.fecha, '%Y-%m') AS periodo,
>     SUM(m.monto)                  AS total_egresos,
>     (SELECT cat.nombre
>        FROM movimiento_financiero m2
>        JOIN categoria_movimiento cat ON cat.id_categoria = m2.categoria_id
>       WHERE m2.barberia_id = p_barberia_id AND m2.estado = 'activo'
>         AND m2.tipo IN ('gasto','compra')
>         AND DATE_FORMAT(m2.fecha, '%Y-%m') = DATE_FORMAT(ANY_VALUE(m.fecha), '%Y-%m')
>       GROUP BY cat.id_categoria
>       ORDER BY SUM(m2.monto) DESC LIMIT 1)  AS categoria_mayor,
>     (SELECT SUM(m3.monto)
>        FROM movimiento_financiero m3
>        JOIN categoria_movimiento cat3 ON cat3.id_categoria = m3.categoria_id
>       WHERE m3.barberia_id = p_barberia_id AND m3.estado = 'activo'
>         AND m3.tipo IN ('gasto','compra')
>         AND DATE_FORMAT(m3.fecha, '%Y-%m') = DATE_FORMAT(ANY_VALUE(m.fecha), '%Y-%m')
>       GROUP BY cat3.id_categoria
>       ORDER BY SUM(m3.monto) DESC LIMIT 1)  AS monto_categoria_mayor
>   FROM movimiento_financiero m
>   WHERE m.barberia_id = p_barberia_id
>     AND m.estado = 'activo'
>     AND m.tipo IN ('gasto','compra')
>     AND m.fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
>   GROUP BY DATE_FORMAT(m.fecha, '%Y-%m')
>   ORDER BY periodo;
> END ;;
> DELIMITER ;
> ```
>
> El cambio es mínimo: `m.fecha` → `ANY_VALUE(m.fecha)` dentro de las dos subconsultas. `ANY_VALUE()` le dice a MySQL que cualquier fila del grupo sirve para eso — y es cierto, todas comparten el mismo mes agrupado. Sin este parche, la gráfica de gastos anuales (Inicio del admin y Finanzas) nunca carga.

> Los barberos de prueba (`admin@smartcut.com`, `carlos@smartcut.com`, `andres@smartcut.com`) tienen hashes marcador, así que **no pueden iniciar sesión**. Están solo para inspeccionar el modelo. Como `barbero.correo` es UNIQUE **global**, no reutilices esos correos al probar el onboarding o recibirás un 409.

---

## 3. Configurar el backend

```bash
cd server
npm install
copy .env.example .env      # PowerShell o cmd
# cp .env.example .env      # Git Bash
```

Edita `server/.env`:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu-contraseña-de-mysql
DB_NAME=smartcut

PORT=4000

JWT_SECRET=
JWT_EXPIRES_IN=7d
```

Genera el `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`server/.env` está en `.gitignore`: **nunca se sube al repositorio.**

---

## 4. Levantar el backend

```bash
cd server
npm run dev      # con nodemon, recarga al guardar
# npm start      # sin recarga
```

Deberías ver:

```
✅ Conectado a MySQL → root@localhost:3306/smartcut
🚀 API de SmartCut escuchando en http://localhost:4000/api
```

Prueba de vida: <http://localhost:4000/api/salud> → `{"estado":"ok","servicio":"smartcut-api"}`

---

## 5. Levantar la app

```bash
npm install      # desde la raíz del proyecto
npx expo start
```

Escanea el QR con Expo Go (el de SDK 54) o pulsa `a` para abrir el emulador de Android.

---

## 6. ⭐ Qué `BASE_URL` usar según dónde pruebes

**Este es el punto donde más tiempo se pierde la primera vez.** La app y el servidor están en máquinas distintas desde el punto de vista de la red: para tu celular, `localhost` es el celular mismo, no tu PC.

Todo se controla desde **una sola constante** en [`src/core/config/env.ts`](src/core/config/env.ts):

| Dónde corre la app | Qué poner en `LAN_IP` | `BASE_URL` que resulta |
|---|---|---|
| **Emulador de Android** | déjalo vacío `''` | `http://10.0.2.2:4000/api` |
| **Simulador de iOS** (solo macOS) | déjalo vacío `''` | `http://localhost:4000/api` |
| **Celular físico** con Expo Go | tu IP LAN, ej. `'192.168.1.10'` | `http://192.168.1.10:4000/api` |
| **Navegador** (`npx expo start --web`) | déjalo vacío `''` | `http://localhost:4000/api` |

Por qué:

- `10.0.2.2` es el alias que el emulador de Android usa para alcanzar el `localhost` de la máquina anfitriona. Dentro del emulador, `127.0.0.1` es el emulador.
- El simulador de iOS comparte la red con el Mac, así que `localhost` funciona directo.
- Un **celular físico** no tiene forma de resolver tu `localhost`: necesita la IP de tu PC en la red Wi-Fi.

### Cómo averiguar tu IP LAN en Windows

```powershell
ipconfig
```

Busca el adaptador de Wi-Fi y toma la **Dirección IPv4** (algo como `192.168.1.10`). También aparece en la URL que muestra Metro al arrancar: `exp://192.168.1.10:8081`.

Luego edita `src/core/config/env.ts`:

```ts
export const LAN_IP = '192.168.1.10';
```

El celular y el PC deben estar **en la misma red Wi-Fi**.

> Si cambias `PORT` en `server/.env`, cambia también `API_PORT` en `src/core/config/env.ts`.

---

## 7. Recorrido de prueba

**Acceso** (fase anterior, sin cambios):

1. Completa los 7 pasos del onboarding.
2. En el paso 7, **copia las contraseñas provisionales** de los barberos (se muestran una sola vez).
3. Pulsa "Ir a iniciar sesión".
4. Entra con el correo de un barbero y su clave provisional.
5. La app te obliga a cambiar la contraseña: no hay flecha atrás ni gesto de deslizar.
6. Cámbiala y entras a Inicio del barbero, ahora con datos reales.

**Dashboards** (esta fase):

7. Toca el botón **+** flotante y registra una atención (nombre del cliente + servicios). El resultado muestra el ticket, el monto cobrado y **la comisión** — nunca el monto completo como si fuera del barbero.
8. Verifica que las cuatro tarjetas de Inicio se actualizaron solas, y que "Ingresos del mes" es su comisión, no lo que cobró.
9. Abre el drawer (ícono de hamburguesa, arriba a la izquierda) y entra a **Agenda**: la atención que acabas de registrar aparece en verde (finalizada).
10. Entra a **Finanzas**: tu gráfica de comisión y tu posición en el ranking, sin ver a los demás barberos.
11. Desde el drawer, **Cerrar sesión** → vuelve al login. Entra con el correo del administrador.
12. En Inicio, cambia entre **Mi negocio** (métricas globales y gráficas — mayores que la comisión del barbero, porque incluyen la parte del negocio) y **Mi trabajo** (las mismas tarjetas que ve un barbero, con los datos propios del admin).
13. Cambia el período (Día/Semana/Mes/Trimestre/Año) y confirma que las gráficas recargan. Toca una barra: se resalta, el resto se atenúa, y aparece el panel de detalle debajo. Toca fuera para deseleccionar.
14. En **Finanzas** → registra un gasto con fecha del mes pasado (el selector de fecha lo permite); intenta un ingreso con fecha pasada y confirma que el backend lo rechaza con un mensaje claro.
15. Descarga el **informe mensual en PDF** y ábrelo.
16. En **Equipo**, agrega un barbero (misma tarjeta de credencial del onboarding) y registra una incapacidad a uno existente: sus citas futuras deben quedar canceladas automáticamente.
17. En **Agenda**, marca una cita como "no asistió" y verifica en Workbench que el movimiento asociado quedó en `anulado` y que la utilidad del mes bajó en consecuencia.
18. En **Configuración**, cambia tu contraseña y (como admin) el horario de atención.

Comprobación en Workbench:

```sql
SELECT nombre, correo, es_admin, debe_cambiar_contrasena, fecha_ultimo_acceso FROM barbero;
SELECT nombre, dias_atencion, hora_apertura, hora_cierre, onboarding_completo FROM barberia;
SELECT COUNT(*) FROM categoria_movimiento;   -- 7 por barbería, creadas automáticamente
SELECT id_cita, estado, monto_total FROM cita ORDER BY id_cita DESC LIMIT 5;
SELECT id_movimiento, tipo, monto, monto_comision, estado FROM movimiento_financiero ORDER BY id_movimiento DESC LIMIT 5;
```

---

## 8. Endpoints

`idBarberia` **nunca** sale del body ni de la query: siempre del JWT. En las rutas donde se indica, `barberoId` es apenas una sugerencia — si quien pregunta no es admin, el backend la ignora y fuerza el suyo.

**Acceso** (fase anterior):

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/salud` | — | Prueba de vida |
| `POST` | `/api/onboarding` | — | Crea barbería + admin + horario + servicios + barberos **en una transacción** |
| `POST` | `/api/auth/login` | — | Devuelve JWT y perfil |
| `POST` | `/api/auth/cambiar-contrasena` | JWT | Cambia la clave y baja `debe_cambiar_contrasena` |
| `POST` | `/api/barberos` | JWT + admin | Agrega un barbero (mismo flujo que en Equipo) |
| `GET` | `/api/barberia/:id/barberos` | JWT + admin | Lista el equipo con `pendienteActivacion` |

**Dashboard, perfil y catálogo:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/dashboard/barbero` | JWT | Resumen de quien pregunta (comisión, no facturación) |
| `GET` | `/api/dashboard/barberia` | JWT + admin | Resumen global del negocio |
| `GET` | `/api/perfil` | JWT | Perfil completo, con comisión y fechas de cuenta |
| `GET` | `/api/servicios` | JWT | Catálogo activo, para el modal de registro de atención |

**Agenda y atenciones:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/agenda?periodo\|desde&hasta&barberoId` | JWT | Un barbero solo ve la suya; el admin, la global con filtro opcional |
| `POST` | `/api/atenciones` | JWT | Registra una atención sin cita — la única fuente de datos reales |
| `PATCH` | `/api/citas/:id/estado` | JWT | Confirmar/iniciar/finalizar/cancelar/no asistió; solo sobre citas propias |

**Finanzas:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/finanzas/resumen?periodo` | JWT + admin | Ingresos, gastos, compras, comisiones, utilidad y variación vs. período anterior |
| `GET` | `/api/finanzas/serie?periodo&barberoId` | JWT | Serie diaria/mensual; con `barberoId` devuelve comisión en vez de facturación |
| `GET` | `/api/finanzas/ranking?periodo` | JWT | Tabla completa para el admin; solo la fila propia + posición para el barbero |
| `GET` | `/api/finanzas/gastos-anuales` | JWT + admin | Últimos 12 meses, con el rubro de mayor gasto de cada uno |
| `GET` | `/api/finanzas/egresos-categoria?periodo` | JWT + admin | Desglose de gastos y compras por categoría |
| `GET` | `/api/finanzas/movimientos?periodo&tipo` | JWT + admin | Lista filtrable de movimientos del negocio |
| `GET` | `/api/finanzas/mis-movimientos?periodo` | JWT | Las atenciones propias del barbero, con monto y comisión |
| `POST` | `/api/finanzas/movimientos` | JWT + admin | Registra un movimiento manual (las 3 reglas de fecha las valida la base) |
| `PATCH` | `/api/finanzas/movimientos/:id/anular` | JWT + admin | Anula con motivo obligatorio — nunca se edita ni se borra |
| `GET` | `/api/finanzas/categorias?tipo` | JWT + admin | Lista categorías |
| `POST` | `/api/finanzas/categorias` | JWT + admin | Crea una categoría (las 7 por defecto no se pueden eliminar: el sistema no ofrece esa operación) |
| `GET` | `/api/finanzas/informe?anio&mes` | JWT + admin | Datos para el informe mensual en PDF |

**Equipo** (solo administrador):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/equipo?periodo` | Lista con desempeño del período |
| `GET` | `/api/equipo/:id?periodo` | Detalle: datos, comisión, citas atendidas e ingresos generados |
| `POST` | `/api/equipo/:id/ausencias` | Registra ausencia; `esIncapacidad: true` además cancela por trigger las citas futuras |
| `PATCH` | `/api/equipo/:id/estado` | activo / incapacitado / inactivo |
| `PATCH` | `/api/equipo/:id/comision` | 0 a 100 |

**Barbería** (solo administrador):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/barberia` | Nombre, dirección, teléfono y horario — de solo lectura salvo el horario |
| `PATCH` | `/api/barberia/horario` | Configura días, horas y duración del turno (mismo `sp_configurar_horario` del onboarding) |

Errores: `400` validación o `SIGNAL` de la base · `401` credenciales o token · `403` permisos o cuenta incapacitada · `404` recurso ajeno o inexistente · `409` correo/categoría duplicados · `500` genérico (el detalle solo va al log del servidor).

---

## 9. Estados de cita y sus colores

Definidos en [`src/core/theme/tokens.ts`](src/core/theme/tokens.ts) (`estadoCitaColors` / `estadoCitaEtiquetas` / `estadoCitaFondos`), y usados siempre a través de ese mapa — nunca un color suelto en una pantalla — en Agenda, Inicio y el detalle de cada cita.

| Estado | Color | Significado |
|---|---|---|
| `pendiente` | Amarillo/ámbar | Agendada, sin confirmar |
| `confirmada` | Azul | Confirmada |
| `en_proceso` | Turquesa (`accent` del tema) | Atendiéndose ahora |
| `finalizada` | Verde | Atendida y cobrada |
| `cancelada` | Rojo | Cancelada |
| `no_asistio` | Naranja | El cliente no llegó |

`cancelada` y `no_asistio` son colores distintos a propósito: los dos terminan sin cobrar (el trigger `trg_cita_no_atendida_anula_ingreso` anula el movimiento en ambos casos), pero de un vistazo hay que poder distinguir quién avisó de quién simplemente no llegó.

"Citas hoy" cuenta todas las agendadas para hoy **excluyendo canceladas**; las de `no_asistio` sí cuentan, aunque no generen dinero.

---

## 10. Modelo de comisiones

Se implementó **comisión por porcentaje** (`barbero.porcentaje_comision`, 50 % por defecto y 100 % para el administrador, que se queda con lo que él mismo atiende). Solo el administrador puede modificarla, desde Equipo.

Esto tiene una consecuencia que atraviesa toda la app: **"ingresos" significa cosas distintas según quién mire.**

- Para el **barbero**, ingresos es su comisión — `movimiento_financiero.monto_comision`.
- Para el **administrador**, ingresos es la facturación completa del negocio — `movimiento_financiero.monto`, que incluye lo que se quedan los barberos.

Nunca se mezclan las dos cifras, y nunca se le muestra al barbero la facturación bruta. En el código, esta regla vive en `sp_serie_ingresos_diarios` (devuelve una u otra según reciba `barberoId`) y en cada endpoint de `finanzas.service.js`, siempre comentada donde aparece.

`sp_registrar_atencion` y el trigger `trg_cita_finalizada_genera_ingreso` calculan la comisión automáticamente al finalizar una cita — nunca se calcula en Node.

---

## 11. Estructura

```
SmartCut/
├── smartcut_v2.sql            # fuente de verdad del modelo de datos de esta fase
├── App.tsx
├── src/
│   ├── app/
│   │   ├── AppContent.tsx     # providers + NavigationContainer
│   │   └── navigation/        # RootNavigator, AuthNavigator, OnboardingNavigator,
│   │                          # AppNavigator (el drawer), ContenidoDrawer, decidirStack()
│   ├── core/
│   │   ├── api/ config/ storage/ validacion/
│   │   ├── theme/             # tokens.ts — colores, incluidos los 6 de estado de cita
│   │   ├── hooks/             # useApi, useMutacion — base de todos los hooks de datos
│   │   └── components/        # Esqueleto, EstadoError, EstadoVacio, SelectorPeriodo,
│   │                          # EncabezadoPantalla, BotonAbrirMenu…
│   └── features/
│       ├── onboarding/        # los 7 pasos
│       ├── auth/              # login y cambio de contraseña
│       ├── splash/
│       ├── dashboard/         # Inicio de los dos roles (InicioBarbero se reutiliza
│       │                      # en "Mi trabajo" del admin)
│       ├── atenciones/        # registro de atención sin cita — FAB + modal
│       ├── agenda/            # agenda de citas, detalle con acciones
│       ├── finanzas/          # resumen, gráficas, movimientos, categorías, PDF
│       ├── equipo/            # solo admin
│       └── configuracion/     # cuenta, contraseña, horario (solo admin)
└── server/
    └── src/
        ├── index.js           # fija TZ=America/Bogota antes de cualquier require
        ├── config/            # env y pool de MySQL (timezone -05:00, dateStrings)
        ├── routes/ controllers/ services/
        ├── schemas/           # validación con zod
        ├── middlewares/       # validar, autenticar, errorHandler
        └── utils/             # password, jwt, sp, periodo.js (resolverPeriodo/periodoAnterior)
```

Cada feature sigue la misma forma: `data/remote/`, `domain/`, `presentation/{screens,components,hooks}/`.

### Decisiones de arquitectura

- **El onboarding acumula en memoria y guarda una sola vez.** Ninguna pantalla intermedia toca la red; al confirmar el paso 7 se envía un único POST que el backend procesa en una transacción. Si algo falla, no queda nada a medias.
- **La contraseña se hashea en el servidor, nunca en el cliente.** La app la envía en texto plano dentro del POST y el backend aplica `bcrypt`.
- **Todo el acceso a datos pasa por los procedimientos almacenados.** No hay SQL suelto en los controladores.
- **El servidor controla las transacciones, no los procedimientos.** Ningún SP del script abre transacciones.
- **La base de datos no valida contraseñas.** `sp_obtener_credenciales` devuelve el hash y Node compara con `bcrypt.compare()`.
- **El JWT se guarda en `expo-secure-store`** (Keychain/Keystore). AsyncStorage solo guarda la marca de "onboarding completado".
- **El registro de atención sin cita es la única fuente de datos reales** mientras no exista la web pública de reservas: sin él, ambos dashboards mostrarían ceros.
- **`idBarberia` nunca sale del body ni de la query.** Siempre del JWT, en todos los endpoints de esta fase.
- **Un mismo componente construye el drawer** (`ContenidoDrawer`) y decide su contenido según `esAdmin`; "Equipo" ni siquiera se registra como ruta para un barbero.
- **Los rangos de fecha se calculan en el backend**, con `resolverPeriodo`/`periodoAnterior` (`server/src/utils/periodo.js`). La semana empieza el lunes, y `desde`/`hasta` explícitos siempre ganan sobre `periodo`.
- **Sin librerías de fecha/hora adicionales.** Los selectores de fecha del formulario de movimientos y de ausencias son un stepper propio con chips rápidos, no un calendario de terceros — la fase no permite instalar más UI que `react-native-gifted-charts`.

---

## Diagrama de navegación

```
Splash
  │
  ├── (sin sesión, onboarding sin terminar) ──▶ Onboarding (7 pasos)
  │                                                   │
  │                                                   ▼
  └── (sin sesión, onboarding terminado) ────▶ Login ──▶ [CambiarContraseña, si es obligatorio]
                                                   │
                                                   ▼
                                    App (con sesión) — Drawer lateral
                                                   │
                    ┌──────────────┬──────────────┼──────────────┬────────────────┐
                    ▼              ▼              ▼              ▼                ▼
                 Inicio         Agenda        [Equipo]        Finanzas      Configuración
           (Mi negocio /                     (solo admin)
            Mi trabajo,
             solo admin)
```

Cerrar sesión (desde el drawer, o desde Configuración) borra el token y vuelve al **Login** — no existe una pantalla de acceso separada del login en esta base de código; `decidirStack()` solo distingue `onboarding` / `auth` (login) / `cambioObligatorio` / `app`.

---

## 12. Solución de problemas

**`Project is incompatible with this version of Expo Go`**
Tienes el Expo Go del SDK más reciente. Instala el de SDK 54 desde los enlaces de la sección 1.

**`ER_CANT_AGGREGATE_2COLLATIONS` al iniciar sesión**
La base se creó con la collation equivocada. Vuelve a ejecutar `smartcut_v2.sql` **completo**, desde la línea 1. Ver sección 2.

**La gráfica de gastos anuales nunca carga (error 1055 de MySQL en el log del servidor)**
Falta aplicar el parche de `sp_gastos_mensuales_anio` de la sección 2. Es un procedimiento que viene roto en `smartcut_v2.sql` tal cual se importó; corre el `CREATE PROCEDURE` corregido de esa sección una sola vez.

**`Access denied for user 'root'@'localhost'`**
Falta o está mal `DB_PASSWORD` en `server/.env`.

**La app dice "No pudimos conectar con el servidor"**

1. ¿Está corriendo `npm run dev` en `server/`?
2. ¿`LAN_IP` está bien según la tabla de la sección 6?
3. Si pruebas en celular físico, el Firewall de Windows puede estar bloqueando el puerto 4000. Permite Node.js en redes privadas, o abre el puerto desde PowerShell como administrador:
   ```powershell
   netsh advfirewall firewall add rule name="SmartCut API" dir=in action=allow protocol=TCP localport=4000
   ```
4. Verifica desde el navegador **del celular**: `http://TU_IP_LAN:4000/api/salud`

**`Ya existe una cuenta con ese correo` (409)**
`barbero.correo` es UNIQUE global, no por barbería. Usa otro correo o vuelve a importar el script.

**Perdí las contraseñas provisionales**
No se pueden recuperar: en la base solo queda el hash. El administrador debe crear al barbero de nuevo con otro correo, o cambiarle la clave desde Workbench con un hash generado a mano:
```bash
node -e "console.log(require('bcrypt').hashSync('NuevaClave123*', 10))"
```

**La app abre en el onboarding aunque ya creé mi barbería**
La marca de "onboarding completado" vive en el almacenamiento del dispositivo. Si reinstalaste la app o borraste sus datos, se perdió. Inicia sesión una vez y se vuelve a poner.
