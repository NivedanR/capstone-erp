import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

export function useApi<T>(): UseApiResponse<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiFunction: (...args: any[]) => Promise<any>, ...args: any[]) => {
    setState({ data: null, loading: true, error: null });
    try {
      console.log('[useApi] Executing API call:', apiFunction.name);
      const response = await apiFunction(...args);
      
      // Handle both direct data and response.data structures
      const data = response?.data || response;
      console.log('[useApi] API Response:', {
        function: apiFunction.name,
        data,
        status: response?.status,
      });

      if (data?.error) {
        throw new Error(data.error);
      }

      setState({ data, loading: false, error: null });
    } catch (error) {
      console.error('[useApi] API Error:', {
        function: apiFunction.name,
        error,
        response: (error as AxiosError)?.response?.data,
      });

      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.response?.data?.error || 
        axiosError.message || 
        'An error occurred';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

export default useApi; 