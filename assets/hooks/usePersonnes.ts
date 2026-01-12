import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { Personne, PaginatedResponse } from '../types';

interface SearchParams {
  q?: string;
  unassigned?: boolean;
  page?: number;
  limit?: number;
}

interface SearchResult {
  items: Personne[];
  total: number;
  pages: number;
}

// Query keys factory
export const personneKeys = {
  all: ['personnes'] as const,
  lists: () => [...personneKeys.all, 'list'] as const,
  list: (params: SearchParams) => [...personneKeys.lists(), params] as const,
  details: () => [...personneKeys.all, 'detail'] as const,
  detail: (id: number) => [...personneKeys.details(), id] as const,
};

// Fetch all personnes (paginated)
export function usePersonnes(params: SearchParams = {}) {
  return useQuery({
    queryKey: personneKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set('q', params.q);
      if (params.unassigned) searchParams.set('unassigned', 'true');
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const url = `/api/personnes/search?${searchParams}`;
      return apiGet<SearchResult>(url);
    },
  });
}

// Fetch single personne by ID
export function usePersonne(id: number | undefined) {
  return useQuery({
    queryKey: personneKeys.detail(id!),
    queryFn: () => apiGet<Personne>(`/api/personnes/${id}`),
    enabled: !!id,
  });
}

// Create personne
export function useCreatePersonne() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Personne>) =>
      apiPost<Personne>('/api/personnes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personneKeys.lists() });
    },
  });
}

// Update personne
export function useUpdatePersonne() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Personne> }) =>
      apiPut<Personne>(`/api/personnes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: personneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personneKeys.lists() });
    },
  });
}

// Delete personne
export function useDeletePersonne() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/personnes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personneKeys.lists() });
    },
  });
}

// Update presence
export function useUpdatePresence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      present,
      withSms,
    }: {
      id: number;
      present: boolean;
      withSms?: boolean;
    }) =>
      apiPut<Personne>(`/api/personnes/${id}/update-presence`, {
        present,
        withSms,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: personneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: personneKeys.lists() });
    },
  });
}
