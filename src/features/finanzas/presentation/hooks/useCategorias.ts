import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { Categoria, TipoMovimiento } from '../../domain/finanzas';

/** Categorías de movimiento, opcionalmente filtradas por tipo. Solo admin. */
export function useCategorias(tipo?: TipoMovimiento): EstadoApi<Categoria[]> {
  return useApi(
    () => finanzasApi.listarCategorias(tipo).then((respuesta) => respuesta.categorias),
    [tipo],
  );
}

/** Alta de una categoría nueva. Las siete por defecto no se pueden eliminar. */
export function useCrearCategoria(): EstadoMutacion<
  { nombre: string; tipo: TipoMovimiento },
  Categoria
> {
  const mutacion = useMutacion((datos: { nombre: string; tipo: TipoMovimiento }) =>
    finanzasApi.crearCategoria(datos).then((respuesta) => respuesta.categoria),
  );
  return mutacion;
}
