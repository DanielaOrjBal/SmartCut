const { config } = require('../config/env');
const { AppError } = require('../utils/AppError');
const { inputSchema, placeIdSchema, coordsSchema } = require('../schemas/places.schema');

// Places API (New) — reemplaza la legacy /maps/api/place/*
const PLACES_NEW_BASE = 'https://places.googleapis.com/v1/places';
const STATIC_MAPS_BASE = 'https://maps.googleapis.com/maps/api/staticmap';

function validar(schema, valor) {
  const resultado = schema.safeParse(valor);
  if (!resultado.success) {
    throw new AppError(resultado.error.issues[0].message, 400);
  }
  return resultado.data;
}

function placesHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': config.googlePlaces.apiKey,
  };
}

/**
 * GET /api/places/autocomplete?input=texto
 * Proxy hacia Places API (New) — autocomplete.
 */
async function autocomplete(req, res) {
  const input = validar(inputSchema, req.query.input);

  if (!config.googlePlaces.apiKey) {
    throw new AppError('El servicio de búsqueda de direcciones no está configurado.', 503);
  }

  const respuesta = await fetch(`${PLACES_NEW_BASE}:autocomplete`, {
    method: 'POST',
    headers: placesHeaders(),
    body: JSON.stringify({
      input,
      languageCode: 'es',
      includedRegionCodes: ['co'],
      includedPrimaryTypes: ['geocode', 'premise', 'street_address'],
    }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    console.error('[places] autocomplete error:', respuesta.status, error);
    throw new AppError('Error al consultar el servicio de direcciones.', 502);
  }

  const datos = await respuesta.json();

  const sugerencias = (datos.suggestions ?? []).map((s) => {
    const pred = s.placePrediction;
    return {
      placeId: pred.placeId,
      descripcion: pred.text?.text ?? '',
      principal: pred.structuredFormat?.mainText?.text ?? '',
      secundario: pred.structuredFormat?.secondaryText?.text ?? '',
    };
  });

  res.json({ sugerencias });
}

/**
 * GET /api/places/details?place_id=xxx
 * Proxy hacia Places API (New) — place details.
 */
async function details(req, res) {
  const placeId = validar(placeIdSchema, req.query.place_id);

  if (!config.googlePlaces.apiKey) {
    throw new AppError('El servicio de búsqueda de direcciones no está configurado.', 503);
  }

  const respuesta = await fetch(`${PLACES_NEW_BASE}/${placeId}`, {
    method: 'GET',
    headers: {
      ...placesHeaders(),
      'X-Goog-FieldMask': 'formattedAddress,location',
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    console.error('[places] details error:', respuesta.status, error);
    throw new AppError('No se pudo obtener el detalle de esa dirección.', 502);
  }

  const datos = await respuesta.json();

  res.json({
    direccion: datos.formattedAddress,
    latitud: datos.location.latitude,
    longitud: datos.location.longitude,
  });
}

/**
 * GET /api/places/staticmap?lat=X&lng=Y
 * Proxy de imagen PNG del mapa estático. Requiere Maps Static API habilitada.
 */
async function staticmap(req, res) {
  const { lat, lng } = validar(coordsSchema, req.query);

  if (!config.googlePlaces.apiKey) {
    throw new AppError('El servicio de mapas no está configurado.', 503);
  }

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: '16',
    size: '600x220',
    maptype: 'roadmap',
    markers: `color:red|${lat},${lng}`,
    key: config.googlePlaces.apiKey,
    language: 'es',
  });

  const respuesta = await fetch(`${STATIC_MAPS_BASE}?${params}`);
  if (!respuesta.ok) {
    throw new AppError('Error al generar el mapa.', 502);
  }

  const tipo = respuesta.headers.get('content-type') ?? 'image/png';
  const buffer = await respuesta.arrayBuffer();

  // Helmet pone CORP: same-origin por defecto, lo que bloquea imágenes
  // cargadas desde un origen distinto (localhost:8081 → localhost:4000).
  // Se sobreescribe solo aquí porque esta ruta sirve imágenes públicas.
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Content-Type', tipo);
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(Buffer.from(buffer));
}

module.exports = { autocomplete, details, staticmap };
