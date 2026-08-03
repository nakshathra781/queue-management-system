import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastNotification = ({ message, type = 'info', onClose, autoDismiss = 4000 }) => {
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="toast-icon success" />,
    error: <AlertCircle size={20} className="toast-icon error" />,
    warning: <AlertCircle size={20} className="toast-icon warning" />,
    info: <Info size={20} className="toast-icon info" />
  };

  return (
    <div className={`toast-banner toast-${type}`}>
      <div className="toast-content">
        {icons[type] || icons.info}
        <span className="toast-message">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="toast-close-btn" aria-label="Close notification">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
