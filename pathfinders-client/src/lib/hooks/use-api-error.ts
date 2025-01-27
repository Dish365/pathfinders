import { toast } from 'sonner';
import { AxiosError } from 'axios';

export function useApiError() {
  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return message;
    }
    
    const message = error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
    return message;
  };

  return { handleError };
} 