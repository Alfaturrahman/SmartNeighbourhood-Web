import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options?: UseApiOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (err) {
        setError(err);
        
        if (options?.onError) {
          options.onError(err);
        }
        
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}
