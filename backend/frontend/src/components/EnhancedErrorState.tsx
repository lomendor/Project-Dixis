interface EnhancedErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  variant?: 'error' | '404' | '500' | 'network';
  showDetails?: boolean;
}

export default function EnhancedErrorState({ 
  error, 
  onRetry, 
  variant = 'error',
  showDetails = false 
}: EnhancedErrorStateProps) {
  const getErrorConfig = () => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    switch (variant) {
      case '404':
        return {
          icon: '🔍',
          title: 'Product Not Found',
          description: 'The product you\'re looking for doesn\'t exist or may have been removed.',
          suggestion: 'Check the URL or browse our products to find what you need.',
        };
      case '500':
        return {
          icon: '⚠️',
          title: 'Server Error',
          description: 'Something went wrong on our end. We\'re working to fix this issue.',
          suggestion: 'Please try again in a few moments or contact support if the problem persists.',
        };
      case 'network':
        return {
          icon: '📡',
          title: 'Connection Problem',
          description: 'Unable to connect to our servers. Please check your internet connection.',
          suggestion: 'Verify your internet connection and try again.',
        };
      default:
        return {
          icon: '❌',
          title: 'Something Went Wrong',
          description: errorMessage || 'An unexpected error occurred while loading the product.',
          suggestion: 'Please try refreshing the page or contact support if the problem continues.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6" data-testid="error-state">
      {/* Error Icon */}
      <div className="text-6xl mb-4" role="img" aria-label="Error">
        {config.icon}
      </div>

      {/* Error Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {config.title}
      </h2>

      {/* Error Description */}
      <p className="text-gray-600 text-center mb-4 max-w-md">
        {config.description}
      </p>

      {/* Suggestion */}
      <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
        {config.suggestion}
      </p>

      {/* Error Details (for development/debugging) */}
      {showDetails && error instanceof Error && (
        <details className="mb-6 w-full max-w-md">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
            Technical Details
          </summary>
          <pre className="text-xs bg-gray-100 p-3 rounded text-gray-700 overflow-auto">
            {error.message}
            {error.stack && `\n\nStack:\n${error.stack}`}
          </pre>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            data-testid="retry-button"
          >
            Try Again
          </button>
        )}
        
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          data-testid="back-home-button"
        >
          Back to Products
        </button>
      </div>
    </div>
  );
}