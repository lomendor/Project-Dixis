'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Producer {
  id: number;
  name: string;
  region?: string;
  category?: string;
  description?: string;
  created_at?: string;
}

interface ProducersClientProps {
  initialProducers: Producer[];
}

export default function ProducersClient({ initialProducers }: ProducersClientProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Extract unique regions and categories
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(initialProducers.map(p => p.region).filter(Boolean)));
    return uniqueRegions.sort();
  }, [initialProducers]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(initialProducers.map(p => p.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [initialProducers]);

  // Filter and sort producers
  const filteredProducers = useMemo(() => {
    let filtered = [...initialProducers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(p => p.region === regionFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Sort
    if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'el'));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'el'));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [initialProducers, searchQuery, regionFilter, categoryFilter, sortBy]);

  return (
    <div className="producers-content">
      {/* Filters Section */}
      <aside className="filters-panel" role="search" aria-label={t('producers.filter')}>
        <div className="filter-group">
          <label htmlFor="search-input">
            {t('producers.search')}
          </label>
          <input
            id="search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('producers.searchPlaceholder')}
            aria-label={t('producers.search')}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="region-select">
            {t('producers.region')}
          </label>
          <select
            id="region-select"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            aria-label={t('producers.region')}
          >
            <option value="all">{t('producers.regionAll')}</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-select">
            {t('producers.category')}
          </label>
          <select
            id="category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={t('producers.category')}
          >
            <option value="all">{t('producers.categoryAll')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-select">
            {t('producers.sortBy')}
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label={t('producers.sortBy')}
          >
            <option value="name-asc">{t('producers.sortByName')}</option>
            <option value="name-desc">{t('producers.sortByNameDesc')}</option>
            <option value="newest">{t('producers.sortByNewest')}</option>
          </select>
        </div>
      </aside>

      {/* Results Section */}
      <main className="producers-list" role="region" aria-label={t('producers.title')}>
        <div className="list-header">
          <p className="producers-count" aria-live="polite">
            {t('producers.total', { count: filteredProducers.length })}
          </p>
        </div>

        {filteredProducers.length === 0 ? (
          <div className="empty-state" role="status">
            <p className="empty-message">{t('producers.empty')}</p>
            <p className="empty-hint">{t('producers.emptyHint')}</p>
          </div>
        ) : (
          <div className="producers-grid">
            {filteredProducers.map(producer => (
              <article key={producer.id} className="producer-card card">
                <h2 className="producer-name">{producer.name}</h2>
                {producer.region && (
                  <p className="producer-meta">
                    <span className="meta-label">{t('producers.region')}:</span>{' '}
                    {producer.region}
                  </p>
                )}
                {producer.category && (
                  <p className="producer-meta">
                    <span className="meta-label">{t('producers.category')}:</span>{' '}
                    {producer.category}
                  </p>
                )}
                {producer.description && (
                  <p className="producer-description">{producer.description}</p>
                )}
                <Link
                  href={`/producers/${producer.id}`}
                  className="btn btn-primary"
                  aria-label={`${t('producers.viewProfile')} - ${producer.name}`}
                >
                  {t('producers.viewProfile')}
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
