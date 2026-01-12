import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { Table, PaginatedResponse } from '../types';

// Query keys factory
export const tableKeys = {
  all: ['tables'] as const,
  lists: () => [...tableKeys.all, 'list'] as const,
  list: () => [...tableKeys.lists()] as const,
  details: () => [...tableKeys.all, 'detail'] as const,
  detail: (id: number) => [...tableKeys.details(), id] as const,
};

// Fetch all tables
export function useTables() {
  return useQuery({
    queryKey: tableKeys.list(),
    queryFn: () => apiGet<PaginatedResponse<Table>>('/api/tables'),
    select: (data) => data['hydra:member'],
  });
}

// Fetch single table by ID
export function useTable(id: number | undefined) {
  return useQuery({
    queryKey: tableKeys.detail(id!),
    queryFn: () => apiGet<Table>(`/api/tables/${id}`),
    enabled: !!id,
  });
}

// Create table
export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Table>) => apiPost<Table>('/api/tables', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// Update table (position, name, etc.)
export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Table> }) =>
      apiPut<Table>(`/api/tables/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// Delete table
export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}
