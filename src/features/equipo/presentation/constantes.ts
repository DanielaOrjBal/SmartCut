import { colors, estadoCitaColors } from '../../../core/theme/tokens';
import type { EstadoBarbero } from '../../auth/domain/auth';

export const COLOR_ESTADO: Record<EstadoBarbero, string> = {
  activo: '#16A34A',
  incapacitado: estadoCitaColors.no_asistio,
  inactivo: colors.danger,
};

export const ETIQUETA_ESTADO: Record<EstadoBarbero, string> = {
  activo: 'Activo',
  incapacitado: 'Incapacitado',
  inactivo: 'Inactivo',
};
