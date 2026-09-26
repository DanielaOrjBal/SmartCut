import { apiClient } from '../../../../core/api/client';
import type { OnboardingPayload, OnboardingResponse } from '../../domain/onboarding';

/**
 * Único punto donde el onboarding toca la red: un solo POST con los 7 pasos.
 * El backend lo procesa dentro de una transacción.
 */
export function enviarOnboarding(payload: OnboardingPayload): Promise<OnboardingResponse> {
  return apiClient.post<OnboardingResponse>('/onboarding', payload);
}
