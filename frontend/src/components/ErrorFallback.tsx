import React from 'react';

interface ErrorFallbackProps {
  error: 'not-found' | 'server-error' | 'network-error' | 'unknown';
  productId?: string | number;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorFallback({ 
  error, 
  productId, 
  onRetry, 
  className = '' 
}: ErrorFallbackProps) {
  const getErrorContent = () => {
    switch (error) {
      case 'not-found':
        return {
          icon: '🔍',
          title: 'Προϊόν Δε Βρέθηκε',
          message: `Το προϊόν${productId ? ` με ID ${productId}` : ''} δεν υπάρχει ή δεν είναι διαθέσιμο.`,
          suggestion: 'Ελέγξτε το URL ή επιστρέψτε στην κύρια σελίδα.',
          showRetry: false
        };
      
      case 'server-error':
        return {
          icon: '⚠️',
          title: 'Σφάλμα Διακομιστή',
          message: 'Παρουσιάστηκε πρόβλημα με τον διακομιστή κατά τη φόρτωση του προϊόντος.',
          suggestion: 'Παρακαλώ δοκιμάστε ξανά σε λίγα λεπτά.',
          showRetry: true
        };
      
      case 'network-error':
        return {
          icon: '🌐',
          title: 'Πρόβλημα Σύνδεσης',
          message: 'Δεν είναι δυνατή η σύνδεση με το διακομιστή.',
          suggestion: 'Ελέγξτε τη σύνδεσή σας στο διαδίκτυο και δοκιμάστε ξανά.',
          showRetry: true
        };
      
      default:
        return {
          icon: '❌',
          title: 'Παρουσιάστηκε Σφάλμα',
          message: 'Κάτι πήγε στραβά κατά τη φόρτωση του προϊόντος.',
          suggestion: 'Παρακαλώ δοκιμάστε ξανά.',
          showRetry: true
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className={`text-center py-12 ${className}`} data-testid="error-fallback">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4" role="img" aria-label="Error icon">
          {content.icon}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {content.title}
        </h2>
        
        <p className="text-gray-600 mb-2">
          {content.message}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          {content.suggestion}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {content.showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              data-testid="retry-button"
            >
              Δοκιμάστε Ξανά
            </button>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            data-testid="back-button"
          >
            Πίσω
          </button>
        </div>
      </div>
    </div>
  );
}