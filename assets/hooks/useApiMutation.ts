import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiRequestError } from '../lib/api';

interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  showErrorToast?: boolean;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Wrapper around useMutation that provides consistent error handling via toast
 *
 * Features:
 * - Automatic error toast on mutation failure
 * - Optional success toast message
 * - Better error messages for API errors
 *
 * @example
 * const mutation = useApiMutation({
 *   mutationFn: (data) => apiPost('/api/items', data),
 *   successMessage: 'Item créé avec succès',
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['items'] });
 *   },
 * });
 */
export function useApiMutation<TData = unknown, TVariables = void>(
  config: MutationConfig<TData, TVariables>
) {
  const {
    mutationFn,
    successMessage,
    showErrorToast = true,
    onSuccess,
    onError
  } = config;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      if (showErrorToast) {
        const message = getErrorMessage(error);
        toast.error(message);
      }
      onError?.(error, variables);
    },
  });
}

/**
 * Extract a user-friendly error message from an error
 */
function getErrorMessage(error: Error): string {
  if (error instanceof ApiRequestError) {
    return error.message || 'Une erreur est survenue';
  }
  return error.message || 'Une erreur est survenue';
}

export default useApiMutation;
