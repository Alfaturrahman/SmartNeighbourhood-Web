interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = 'border-primary' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`} />
  );
}

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Memuat...', fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" color="border-primary" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="animate-pulse p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
