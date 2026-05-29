import { Search } from 'lucide-react';
import type { ProjectStatus } from '../../types';
import './SearchFilterBar.css';

type FilterStatus = 'all' | ProjectStatus;

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (f: FilterStatus) => void;
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'draft',       label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete' },
];

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: SearchFilterBarProps) {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="search"
          className="search-input"
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search projects"
          id="dashboard-search"
        />
      </div>

      <div className="filter-chips" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-chip ${activeFilter === f.value ? 'filter-chip-active' : ''}`}
            onClick={() => onFilterChange(f.value)}
            id={`filter-${f.value}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
