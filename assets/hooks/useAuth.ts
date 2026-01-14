import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import type { User } from '../types';

// Query keys factory
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => apiGet<User>('/api/user/me'),
    staleTime: 5 * 60 * 1000, // User data is fresh for 5 minutes
    retry: false, // Don't retry on auth errors
  });
}

// Check if user is authenticated
export function useIsAuthenticated() {
  const { data, isLoading, isError } = useCurrentUser();
  return {
    isAuthenticated: !!data && !isError,
    isLoading,
    user: data,
  };
}

// Check if user has a specific role
export function useHasRole(role: string) {
  const { data } = useCurrentUser();
  return data?.roles?.includes(role) ?? false;
}
