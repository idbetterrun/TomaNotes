import { useCallback, useEffect, useMemo, useState } from 'react';
import { searchNotes } from '../lib/searchNotes';

const RECENT_SEARCHES_KEY = 'tomanotes:recent-searches';
const MAX_RECENT_SEARCHES = 8;

function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    console.error('[Search] Failed to load recent searches:', error);
    return [];
  }
}

export function useNoteSearch({ notes, searchOptions = {} }) {
  // Search UI reads this single state object instead of embedding search logic in components.
  const [query, setQueryValue] = useState('');
  const [recent, setRecent] = useState(() => loadRecentSearches());
  const [filters, setFilters] = useState({
    tags: [],
    type: 'all',
    date: null,
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('[Search] Failed to persist recent searches:', error);
    }
  }, [recent]);

  const results = useMemo(() => (
    searchNotes({ notes, query, filters, options: searchOptions })
  ), [filters, notes, query, searchOptions]);

  const rememberQuery = useCallback((value = query) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setRecent(prev => [
      trimmed,
      ...prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES));
  }, [query]);

  const setQuery = useCallback((value) => {
    setQueryValue(value);
    setIsOpen(true);
  }, []);

  const applyRecentSearch = useCallback((value) => {
    setQueryValue(value);
    setIsOpen(true);
    setRecent(prev => [
      value,
      ...prev.filter(item => item.toLowerCase() !== value.toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES));
  }, []);

  const setTypeFilter = useCallback((type) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);

  const toggleTagFilter = useCallback((tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(item => item !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      tags: [],
      type: 'all',
      date: null,
    });
  }, []);

  const clearQuery = useCallback(() => {
    setQueryValue('');
  }, []);

  const closePanel = useCallback(({ clearQueryOnClose = false } = {}) => {
    setIsOpen(false);
    if (clearQueryOnClose) {
      setQueryValue('');
    }
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    searchState: {
      isOpen,
      query,
      results,
      recent,
      filters,
    },
    searchActions: {
      openPanel,
      closePanel,
      setQuery,
      clearQuery,
      rememberQuery,
      applyRecentSearch,
      setTypeFilter,
      toggleTagFilter,
      resetFilters,
    },
  };
}
