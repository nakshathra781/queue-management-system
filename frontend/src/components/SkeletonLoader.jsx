import React from 'react';

export const SkeletonCard = ({ height = '120px' }) => (
  <div className="skeleton-card" style={{ height }}>
    <div className="skeleton-pulse skeleton-header"></div>
    <div className="skeleton-pulse skeleton-body"></div>
    <div className="skeleton-pulse skeleton-footer"></div>
  </div>
);

export const SkeletonTable = ({ rows = 4 }) => (
  <div className="skeleton-table">
    <div className="skeleton-pulse skeleton-table-header"></div>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="skeleton-pulse skeleton-table-row"></div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="skeleton-stats-grid">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="skeleton-stat-card">
        <div className="skeleton-pulse skeleton-icon"></div>
        <div className="skeleton-pulse skeleton-value"></div>
        <div className="skeleton-pulse skeleton-label"></div>
      </div>
    ))}
  </div>
);
