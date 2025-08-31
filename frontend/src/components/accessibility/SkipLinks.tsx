'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface SkipLink {
  href: string;
  label: string;
  onClick?: () => void;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Enhanced skip links component for keyboard navigation
 * Provides multiple skip options for complex layouts
 */
export default function SkipLinks({ 
  links,
  className = ''
}: SkipLinksProps) {
  const defaultLinks: SkipLink[] = [
    {
      href: '#main-content',
      label: 'Μετάβαση στο κύριο περιεχόμενο',
      onClick: () => focusElement('main-content')
    },
    {
      href: '#primary-navigation',
      label: 'Μετάβαση στην πλοήγηση',
      onClick: () => focusElement('primary-navigation')
    },
    {
      href: '#search-form',
      label: 'Μετάβαση στην αναζήτηση',
      onClick: () => focusElement('search-form')
    },
    {
      href: '#footer',
      label: 'Μετάβαση στο υποσέλιδο',
      onClick: () => focusElement('footer')
    }
  ];

  const activeLinks = links || defaultLinks;

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Ensure element is focusable
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus();
      
      // Remove tabindex after focus for natural tab flow
      element.addEventListener('blur', () => {
        element.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <nav 
      aria-label="Skip navigation links"
      className={`skip-links ${className}`}
    >
      <ul className="flex flex-col">
        {activeLinks.map((link, index) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                link.onClick?.();
              }}
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              style={{
                // Ensure skip links appear above everything else
                zIndex: 9999,
                // Position for stacking when multiple are focused
                top: `${1 + index * 3}rem`,
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Skip link for specific sections
 */
export function SectionSkipLink({ 
  targetId,
  label,
  className = ''
}: {
  targetId: string;
  label: string;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Focus the element for screen readers
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`sr-only focus:not-sr-only focus:absolute focus:z-50 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {label}
    </a>
  );
}

/**
 * Skip to content component with enhanced functionality
 */
export function SkipToContent({ 
  targetId = 'main-content',
  label = 'Skip to main content'
}: {
  targetId?: string;
  label?: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Ensure the skip link is the first focusable element
    if (linkRef.current && document.body.firstElementChild) {
      document.body.insertBefore(linkRef.current, document.body.firstElementChild);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.getElementById(targetId);
    
    if (mainContent) {
      // Smooth scroll to target
      mainContent.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Ensure the target is focusable and focus it
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
      
      // Focus after scroll completes
      setTimeout(() => {
        mainContent.focus();
      }, 300);
      
      // Remove tabindex on blur to maintain natural tab order
      const handleBlur = () => {
        mainContent.removeAttribute('tabindex');
        mainContent.removeEventListener('blur', handleBlur);
      };
      
      mainContent.addEventListener('blur', handleBlur);
    }
  };

  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium z-[9999] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150"
    >
      {label}
    </a>
  );
}