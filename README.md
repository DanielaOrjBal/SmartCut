# SmartCut

Aplicación móvil de gestión de barberías. Proyecto Integrador 2026-2 — Grupo 01N30.

Dos tipos de usuario:

- **Dueño-administrador** — registra su barbería en un onboarding de 7 pasos y crea las cuentas de su equipo.
- **Barbero** — no se registra solo. El administrador le entrega credenciales provisionales y, al entrar por primera vez, la app lo obliga a cambiar la contraseña.

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

## 2. Configurar el backend

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

## 3. Levantar el backend

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

## 4. Levantar la app

```bash
npm install      # desde la raíz del proyecto
npx expo start
```

Escanea el QR con Expo Go (el de SDK 54) o pulsa `a` para abrir el emulador de Android.

> **BASE_URL según dónde pruebes:**
>
> | Dónde corre la app | Qué poner en `LAN_IP` | `BASE_URL` que resulta |
> |---|---|---|
> | **Emulador de Android** | déjalo vacío `''` | `http://10.0.2.2:4000/api` |
> | **Celular físico** con Expo Go | tu IP LAN, ej. `'192.168.1.10'` | `http://192.168.1.10:4000/api` |
>
> Edita [`src/core/config/env.ts`](src/core/config/env.ts):
> ```ts
> export const LAN_IP = '192.168.1.10';
> ```
> El celular y el PC deben estar en la misma red Wi-Fi. Para conocer tu IP LAN corre `ipconfig` en PowerShell.

---

## 5. Endpoints

`idBarberia` **nunca** sale del body ni de la query: siempre del JWT. En las rutas donde se indica, `barberoId` es apenas una sugerencia — si quien pregunta no es admin, el backend la ignora y fuerza el suyo.

**Acceso:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/salud` | — | Prueba de vida |
| `POST` | `/api/onboarding` | — | Crea barbería + admin + horario + servicios + barberos **en una transacción** |
| `POST` | `/api/auth/login` | — | Devuelve JWT y perfil |
| `POST` | `/api/auth/cambiar-contrasena` | JWT | Cambia la clave y baja `debe_cambiar_contrasena` |
| `POST` | `/api/barberos` | JWT + admin | Agrega un barbero |
| `GET` | `/api/barberia/:id/barberos` | JWT + admin | Lista el equipo con `pendienteActivacion` |

**Dashboard, perfil y catálogo:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/dashboard/barbero` | JWT | Resumen de quien pregunta (comisión, no facturación) |
| `GET` | `/api/dashboard/barberia` | JWT + admin | Resumen global del negocio |
| `GET` | `/api/perfil` | JWT | Perfil completo, con comisión y fechas de cuenta |
| `GET` | `/api/servicios` | JWT | Catálogo activo |

**Agenda y atenciones:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/agenda?periodo\|desde&hasta&barberoId` | JWT | Un barbero solo ve la suya; el admin, la global con filtro opcional |
| `POST` | `/api/atenciones` | JWT | Registra una atención sin cita |
| `PATCH` | `/api/citas/:id/estado` | JWT | Confirmar/iniciar/finalizar/cancelar/no asistió; solo sobre citas propias |

**Finanzas:**

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `GET` | `/api/finanzas/resumen?periodo` | JWT + admin | Ingresos, gastos, compras, comisiones, utilidad y variación |
| `GET` | `/api/finanzas/serie?periodo&barberoId` | JWT | Serie diaria/mensual |
| `GET` | `/api/finanzas/ranking?periodo` | JWT | Tabla completa para el admin; solo la fila propia para el barbero |
| `GET` | `/api/finanzas/gastos-anuales` | JWT + admin | Últimos 12 meses con el rubro de mayor gasto de cada uno |
| `GET` | `/api/finanzas/egresos-categoria?periodo` | JWT + admin | Desglose de gastos por categoría |
| `GET` | `/api/finanzas/movimientos?periodo&tipo` | JWT + admin | Lista filtrable de movimientos |
| `GET` | `/api/finanzas/mis-movimientos?periodo` | JWT | Atenciones propias del barbero |
| `POST` | `/api/finanzas/movimientos` | JWT + admin | Registra un movimiento manual |
| `PATCH` | `/api/finanzas/movimientos/:id/anular` | JWT + admin | Anula con motivo obligatorio |
| `GET` | `/api/finanzas/categorias?tipo` | JWT + admin | Lista categorías |
| `POST` | `/api/finanzas/categorias` | JWT + admin | Crea una categoría |
| `GET` | `/api/finanzas/informe?anio&mes` | JWT + admin | Datos para el informe mensual en PDF |

**Caja diaria** (solo administrador):

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/caja/abrir` | Abre la caja del día con monto de apertura |
| `POST` | `/api/caja/cerrar` | Cierra la caja con monto de cierre |
| `GET` | `/api/caja/hoy` | Estado actual + desglose de movimientos del día |
| `GET` | `/api/caja/historial?periodo` | Historial de cajas en un rango de fechas |

**Equipo** (solo administrador):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/equipo?periodo` | Lista con desempeño del período |
| `GET` | `/api/equipo/:id?periodo` | Detalle: datos, comisión, citas e ingresos generados |
| `POST` | `/api/equipo/:id/ausencias` | Registra ausencia; `esIncapacidad: true` cancela citas futuras |
| `PATCH` | `/api/equipo/:id/estado` | activo / incapacitado / inactivo |
| `PATCH` | `/api/equipo/:id/comision` | 0 a 100 |

**Barbería** (solo administrador):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/barberia` | Nombre, dirección, teléfono y horario |
| `PATCH` | `/api/barberia/horario` | Configura días, horas y duración del turno |

**Asistente financiero** (solo administrador):

| Método | Ruta | Protección | Qué hace |
|---|---|---|---|
| `POST` | `/api/asistente` | JWT + admin | Consulta al asistente Gemini con contexto financiero de los últimos 30 días |

**Reservas públicas** (sin autenticación):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/publico/barberias` | Lista barberías disponibles |
| `GET` | `/api/publico/barberias/:id` | Detalle de una barbería |
| `GET` | `/api/publico/barberias/:id/barberos` | Barberos de la barbería |
| `GET` | `/api/publico/barberias/:id/servicios` | Servicios disponibles |
| `GET` | `/api/publico/disponibilidad` | Slots disponibles para un barbero y fecha |
| `GET` | `/api/publico/clientes?correo` | Busca un cliente por correo |
| `POST` | `/api/publico/reservas` | Crea una reserva y envía confirmación por correo |
| `GET` | `/api/publico/reservas/:token/:operacion` | Consulta una reserva por token |
| `POST` | `/api/publico/reservas/:token/cancelar` | Cancela una reserva desde el enlace del correo |
| `PATCH` | `/api/publico/reservas/:token/reprogramar` | Reprograma una reserva desde el enlace del correo |

Errores: `400` validación o `SIGNAL` de la base · `401` credenciales o token · `403` permisos · `404` recurso inexistente · `409` correo/categoría duplicados · `500` genérico.

---

## 6. Estados de cita y sus colores

Definidos en [`src/core/theme/tokens.ts`](src/core/theme/tokens.ts) y usados siempre a través de ese mapa.

| Estado | Color | Significado |
|---|---|---|
| `pendiente` | Amarillo/ámbar | Agendada, sin confirmar |
| `confirmada` | Azul | Confirmada |
| `en_proceso` | Turquesa | Atendiéndose ahora |
| `finalizada` | Verde | Atendida y cobrada |
| `cancelada` | Rojo | Cancelada |
| `no_asistio` | Naranja | El cliente no llegó |

---

## 7. Estructura

```
SmartCut/
├── db/                        # migraciones SQL numeradas (00 → 06)
├── App.tsx
├── src/
│   ├── app/
│   │   ├── AppContent.tsx
│   │   └── navigation/        # RootNavigator, AuthNavigator, OnboardingNavigator,
│   │                          # AppNavigator (el drawer), ContenidoDrawer, decidirStack()
│   ├── core/
│   │   ├── api/ config/ storage/ validacion/
│   │   ├── theme/             # tokens.ts — colores, incluidos los 6 de estado de cita
│   │   ├── hooks/             # useApi, useMutacion
│   │   └── components/        # Esqueleto, EstadoError, EstadoVacio, SelectorPeriodo…
│   └── features/
│       ├── onboarding/        # los 7 pasos
│       ├── auth/              # login y cambio de contraseña
│       ├── splash/
│       ├── dashboard/
│       ├── asistente/         # asistente financiero con Gemini (solo admin)
│       ├── atenciones/        # registro de atención sin cita
│       ├── agenda/
│       ├── caja/              # caja diaria (solo admin)
│       ├── finanzas/
│       ├── equipo/            # solo admin
│       └── configuracion/
├── web/                       # web pública de reservas (React + Tailwind)
│   └── src/
│       ├── features/
│       │   ├── landing/       # listado de barberías + página 404
│       │   ├── reserva/       # wizard de 5 pasos
│       │   └── gestion/       # cancelar / reprogramar desde enlace de correo
│       └── lib/api/
└── server/
    └── src/
        ├── index.js           # fija TZ=America/Bogota antes de cualquier require
        ├── config/            # env, pool de MySQL y cliente Gemini
        ├── queues/            # cola de correos con worker de reintentos
        ├── routes/ controllers/ services/
        ├── schemas/           # validación con Zod
        ├── middlewares/       # validar, autenticar, rateLimiter, errorHandler
        └── utils/             # password, jwt, sp, periodo, numero
```

Cada feature sigue la misma forma: `data/remote/`, `domain/`, `presentation/{screens,components,hooks}/`.

### Decisiones de arquitectura

- **El onboarding acumula en memoria y guarda una sola vez.** Un único POST procesado en transacción; si algo falla, no queda nada a medias.
- **La contraseña se hashea en el servidor, nunca en el cliente.**
- **Todo el acceso a datos pasa por procedimientos almacenados.** No hay SQL suelto en los controladores.
- **La base de datos no valida contraseñas.** `sp_obtener_credenciales` devuelve el hash y Node compara con `bcrypt.compare()`.
- **El JWT se guarda en `expo-secure-store`** (Keychain/Keystore). AsyncStorage solo guarda la marca de "onboarding completado".
- **`idBarberia` nunca sale del body ni de la query.** Siempre del JWT.
- **Los rangos de fecha se calculan en el backend** con `resolverPeriodo`/`periodoAnterior`. La semana empieza el lunes.
- **Gemini nunca recibe PII ni acceso directo a la BD.** Solo recibe agregados anónimos de los últimos 30 días.
- **La cola de correos persiste en MySQL.** El worker reintenta automáticamente y recupera jobs interrumpidos al arrancar.

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
