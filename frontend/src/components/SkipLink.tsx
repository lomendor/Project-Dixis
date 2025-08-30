'use client';

export default function SkipLink() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  };

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
}