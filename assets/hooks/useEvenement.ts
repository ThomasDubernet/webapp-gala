import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiPost } from '../lib/api';
import type { Evenement, PaginatedResponse } from '../types';

// Query keys factory
export const evenementKeys = {
  all: ['evenements'] as const,
  detail: () => [...evenementKeys.all, 'detail'] as const,
};

// Fetch the current event (assuming single event)
export function useEvenement() {
  return useQuery({
    queryKey: evenementKeys.detail(),
    queryFn: async () => {
      const data = await apiGet<PaginatedResponse<Evenement>>('/api/evenements');
      // Return the first event (single event system)
      return data['hydra:member'][0] ?? null;
    },
  });
}

// Update event
export function useUpdateEvenement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Evenement> }) =>
      apiPut<Evenement>(`/api/evenements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evenementKeys.detail() });
    },
  });
}

// Sync with BilletWeb
export function useSyncBilletWeb() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost('/api/billet-web/sync', {}),
    onSuccess: () => {
      // Invalidate related queries after sync
      queryClient.invalidateQueries({ queryKey: evenementKeys.detail() });
      queryClient.invalidateQueries({ queryKey: ['personnes'] });
    },
  });
}
