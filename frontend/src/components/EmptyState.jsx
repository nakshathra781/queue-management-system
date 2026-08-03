import React from 'react';
import { Inbox, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrapper">
        <Icon size={40} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
