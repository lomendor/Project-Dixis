'use client';
import { useEffect, useState } from 'react';
import { isIOS } from '@/lib/isIOS';

export default function ProductsDiagOverlay() {
  const [stats, setStats] = useState({
    navigations: 0,
    visibility: 0,
    pagehide: 0,
    pageshow: 0,
    swCount: 0,
    ua: '',
    isIOSDetected: false,
    diagEnabled: false,
  });

  useEffect(() => {
    // Check if ?diag=1 is present
    const params = new URLSearchParams(window.location.search);
    const diagEnabled = params.get('diag') === '1';

    if (!diagEnabled) return undefined;

    // Only run on iOS
    if (!isIOS()) return undefined;

    const ua = navigator.userAgent || '';
    setStats(prev => ({ ...prev, ua, isIOSDetected: true, diagEnabled: true }));

    let navCount = 0;
    let visCount = 0;
    let pagehideCount = 0;
    let pageshowCount = 0;

    // Track navigation events
    const trackNav = () => {
      navCount++;
      setStats(prev => ({ ...prev, navigations: navCount }));
    };

    // Track visibility changes
    const trackVisibility = () => {
      visCount++;
      setStats(prev => ({ ...prev, visibility: visCount }));
    };

    // Track pagehide
    const trackPagehide = () => {
      pagehideCount++;
      setStats(prev => ({ ...prev, pagehide: pagehideCount }));
    };

    // Track pageshow
    const trackPageshow = () => {
      pageshowCount++;
      setStats(prev => ({ ...prev, pageshow: pageshowCount }));
    };

    // Track service workers
    const checkSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          setStats(prev => ({ ...prev, swCount: regs.length }));
        } catch {}
      }
    };

    // Listen to events
    document.addEventListener('visibilitychange', trackVisibility);
    window.addEventListener('pagehide', trackPagehide);
    window.addEventListener('pageshow', trackPageshow);

    // For navigation tracking, we use performance API
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          trackNav();
        }
      }
    });

    try {
      perfObserver.observe({ entryTypes: ['navigation'] });
    } catch {}

    // Check SW periodically
    checkSW();
    const swInterval = setInterval(checkSW, 2000);

    return () => {
      document.removeEventListener('visibilitychange', trackVisibility);
      window.removeEventListener('pagehide', trackPagehide);
      window.removeEventListener('pageshow', trackPageshow);
      perfObserver.disconnect();
      clearInterval(swInterval);
    };
  }, []);

  if (!stats.diagEnabled || !stats.isIOSDetected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 99999,
        maxWidth: '280px',
        border: '2px solid #0f0',
        boxShadow: '0 4px 12px rgba(0,255,0,0.3)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff0' }}>
        AG116.9 iOS Diag
      </div>
      <div>Navigations: {stats.navigations}</div>
      <div>Visibility: {stats.visibility}</div>
      <div>Pagehide: {stats.pagehide}</div>
      <div>Pageshow: {stats.pageshow}</div>
      <div style={{ color: stats.swCount > 0 ? '#f00' : '#0f0' }}>
        SW Count: {stats.swCount}
      </div>
      <div style={{ fontSize: '9px', marginTop: '8px', color: '#888', wordBreak: 'break-all' }}>
        {stats.ua.substring(0, 60)}...
      </div>
    </div>
  );
}
