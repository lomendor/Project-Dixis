import { useState, useEffect, useCallback } from 'react';

export type ImageState = 'loading' | 'loaded' | 'error' | 'timeout';

export const useImageTimeout = (src: string, timeout = 3000, maxRetries = 2) => {
  const [state, setState] = useState<ImageState>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const loadImage = useCallback(() => {
    if (!src) return setState('error');
    
    setState('loading');
    const img = new Image();
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = img.onerror = null;
    };

    timeoutId = setTimeout(() => { cleanup(); setState('timeout'); }, timeout);
    img.onload = () => { cleanup(); setState('loaded'); };
    img.onerror = () => { cleanup(); setState('error'); };
    img.src = src;
  }, [src, timeout]);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      loadImage();
    }
  }, [retryCount, maxRetries, loadImage]);

  useEffect(() => {
    setRetryCount(0);
    loadImage();
  }, [loadImage]);

  return { state, retry, retryCount };
};