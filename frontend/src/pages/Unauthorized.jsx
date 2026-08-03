import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { user } = useAuth();
  const targetDashboard = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-wrapper">
          <ShieldAlert size={48} className="unauthorized-icon" />
        </div>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page. This portal requires appropriate role credentials.</p>
        <Link to={targetDashboard} className="btn btn-primary">
          <ArrowLeft size={18} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
