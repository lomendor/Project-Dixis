interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass} data-testid="loading-spinner">
      <div 
        className={`animate-spin rounded-full ${spinnerSizes[size]} border-b-2 border-green-600 mb-4`}
        data-testid="loading-spinner-icon"
      ></div>
      <p className="text-gray-600 text-sm font-medium" data-testid="loading-spinner-text">{text}</p>
    </div>
  );
}