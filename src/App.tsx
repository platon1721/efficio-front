import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth/AuthProvider';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md space-y-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                <p className="text-sm text-gray-500">
                    {error instanceof Error ? error.message : 'Unknown error'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

export default function App() {
  return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
  );
}