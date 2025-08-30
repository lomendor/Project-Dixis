import { Producer } from '@/lib/api';

interface ProducerInfoProps {
  producer: Producer;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function ProducerInfo({ producer, className = '', variant = 'default' }: ProducerInfoProps) {
  if (!producer) {
    return (
      <div className={`border-t pt-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Producer Information
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-gray-500 text-center py-2">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Producer information not available
          </div>
        </div>
      </div>
    );
  }

  const hasContactInfo = producer.phone || producer.email || producer.website;
  const hasDetails = producer.business_name || producer.location || producer.description;

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 p-3 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-green-600">
              {producer.name?.charAt(0).toUpperCase() || 'P'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">
              {producer.name || 'Unknown Producer'}
            </p>
            {producer.location && (
              <p className="text-sm text-gray-600 truncate">
                📍 {producer.location}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t pt-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Producer Information
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        {/* Producer Name */}
        <div>
          <h4 className="font-medium text-gray-900 text-lg">
            {producer.name || 'Unknown Producer'}
          </h4>
          
          {producer.business_name && producer.business_name !== producer.name && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Business:</span> {producer.business_name}
            </p>
          )}
        </div>

        {/* Location */}
        {producer.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">{producer.location}</span>
          </div>
        )}

        {/* Description */}
        {producer.description && (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {producer.description}
            </p>
          </div>
        )}

        {/* Contact Information */}
        {variant === 'detailed' && hasContactInfo && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Contact Information</p>
            <div className="space-y-1">
              {producer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${producer.phone}`} className="hover:text-green-600">
                    {producer.phone}
                  </a>
                </div>
              )}
              
              {producer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${producer.email}`} className="hover:text-green-600">
                    {producer.email}
                  </a>
                </div>
              )}
              
              {producer.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <a 
                    href={producer.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-green-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when minimal info */}
        {!hasDetails && !hasContactInfo && (
          <div className="text-center py-2 text-gray-500">
            <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Limited producer information available</p>
          </div>
        )}
      </div>
    </div>
  );
}