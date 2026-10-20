'use client';

import { createContext, useContext, useState, useMemo } from 'react';

const DashboardFilterContext = createContext({
  timeRange: '7d',
  setTimeRange: () => {},
  category: 'all',
  setCategory: () => {},
  severity: 'all',
  setSeverity: () => {},
  platform: 'all',
  setPlatform: () => {},
  resetFilters: () => {},
  hasActiveFilters: false,
  activeFilterCount: 0,
});

export function DashboardFilterProvider({ children }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [platform, setPlatform] = useState('all');

  const hasActiveFilters = useMemo(() => {
    return timeRange !== '7d' || category !== 'all' || severity !== 'all' || platform !== 'all';
  }, [timeRange, category, severity, platform]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (timeRange !== '7d') count++;
    if (category !== 'all') count++;
    if (severity !== 'all') count++;
    if (platform !== 'all') count++;
    return count;
  }, [timeRange, category, severity, platform]);

  const resetFilters = () => {
    setTimeRange('7d');
    setCategory('all');
    setSeverity('all');
    setPlatform('all');
  };

  const value = {
    timeRange,
    setTimeRange,
    category,
    setCategory,
    severity,
    setSeverity,
    platform,
    setPlatform,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error('useDashboardFilter must be used within a DashboardFilterProvider');
  }
  return context;
}
