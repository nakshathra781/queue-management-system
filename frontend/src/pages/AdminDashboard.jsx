import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SkeletonStats, SkeletonTable } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ToastNotification } from '../components/ToastNotification';
import { Users, PhoneCall, CheckCircle2, FastForward, Clock, RefreshCw, Filter, Shield, Activity, BarChart3, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    waitingCount: 0,
    calledCount: 0,
    completedCount: 0,
    skippedCount: 0
  });

  const [counterNumber, setCounterNumber] = useState(user?.counterNumber || 1);
  const [loading, setLoading] = useState(true);
  const [actionTokenId, setActionTokenId] = useState(null); // tracking button loading states
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [queueRes, statsRes] = await Promise.all([
        api.getQueue(),
        api.getStats()
      ]);

      if (queueRes.success) setTokens(queueRes.data || []);
      if (statsRes.success) setStats(statsRes.data || {});
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error fetching admin queue data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000); // Polling every 8s
    return () => clearInterval(interval);
  }, []);

  const handleCallToken = async (tokenId) => {
    setActionTokenId(tokenId);
    try {
      const res = await api.callToken(tokenId, counterNumber);
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Token called successfully' });
        await fetchAdminData();
      } else {
        setToast({ type: 'error', message: res.message || 'Failed to call token' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Call action failed' });
    } finally {
      setActionTokenId(null);
    }
  };

  const handleCompleteToken = async (tokenId) => {
    setActionTokenId(tokenId);
    try {
      const res = await api.completeToken(tokenId);
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Token completed' });
        await fetchAdminData();
      } else {
        setToast({ type: 'error', message: res.message || 'Failed to complete token' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Complete action failed' });
    } finally {
      setActionTokenId(null);
    }
  };

  const handleSkipToken = async (tokenId) => {
    setActionTokenId(tokenId);
    try {
      const res = await api.skipToken(tokenId);
      if (res.success) {
        setToast({ type: 'warning', message: res.message || 'Token skipped' });
        await fetchAdminData();
      } else {
        setToast({ type: 'error', message: res.message || 'Failed to skip token' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Skip action failed' });
    } finally {
      setActionTokenId(null);
    }
  };

  const filteredTokens = tokens.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const nextWaitingToken = tokens.find(t => t.status === 'waiting');

  return (
    <div className="dashboard-container">
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Admin Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Counter Admin Console</h1>
          <p className="dashboard-subtitle">
            Manage queue flow, call tickets to counters, and track real-time queue performance.
          </p>
        </div>

        <div className="admin-controls-group">
          <div className="counter-selector-badge">
            <Shield size={16} />
            <span>Counter:</span>
            <select
              value={counterNumber}
              onChange={(e) => setCounterNumber(Number(e.target.value))}
              className="counter-select"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>Counter #{num}</option>
              ))}
            </select>
          </div>

          <button onClick={fetchAdminData} className="btn btn-secondary btn-icon-only" title="Refresh Queue">
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Queue Stats Bar */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-bg primary">
              <Users size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalToday || 0}</span>
              <span className="stat-label">Total Issued Today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg warning">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.waitingCount || 0}</span>
              <span className="stat-label">Waiting in Queue</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg info">
              <PhoneCall size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.calledCount || 0}</span>
              <span className="stat-label">Currently Serving</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg success">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.completedCount || 0}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Panel */}
      {nextWaitingToken && (
        <div className="quick-call-banner">
          <div className="quick-call-info">
            <span className="quick-call-label">NEXT IN LINE:</span>
            <span className="quick-call-token">{nextWaitingToken.tokenNumber}</span>
            <span className="quick-call-service">({nextWaitingToken.serviceName})</span>
          </div>

          <button
            onClick={() => handleCallToken(nextWaitingToken._id)}
            disabled={actionTokenId === nextWaitingToken._id}
            className="btn btn-call-lg"
          >
            <PhoneCall size={20} />
            <span>Call {nextWaitingToken.tokenNumber} to Counter #{counterNumber}</span>
          </button>
        </div>
      )}

      {/* Queue Table Card */}
      <div className="card queue-table-card">
        <div className="card-header flex-between">
          <div className="card-title">
            <Activity size={20} />
            <span>Live Queue Queue Tokens</span>
          </div>

          <div className="filter-tabs">
            {['all', 'waiting', 'called', 'completed', 'skipped'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body no-padding">
          {loading ? (
            <SkeletonTable rows={5} />
          ) : filteredTokens.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Queue Clean & Clear"
              description={
                statusFilter === 'all'
                  ? "There are currently no tokens in the queue system."
                  : `No tokens found with '${statusFilter}' status.`
              }
            />
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Customer Name</th>
                    <th>Service</th>
                    <th>Issued At</th>
                    <th>Status</th>
                    <th>Assigned Counter</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map(tok => (
                    <tr key={tok._id} className={tok.status === 'called' ? 'row-highlight' : ''}>
                      <td className="font-bold highlight-code">{tok.tokenNumber}</td>
                      <td>{tok.userName}</td>
                      <td>{tok.serviceName}</td>
                      <td className="text-subtle">
                        {new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className={`status-badge status-${tok.status}`}>
                          {tok.status}
                        </span>
                      </td>
                      <td>{tok.counterNumber ? `Counter ${tok.counterNumber}` : '-'}</td>
                      <td className="text-right actions-cell">
                        {tok.status === 'waiting' && (
                          <button
                            onClick={() => handleCallToken(tok._id)}
                            disabled={actionTokenId === tok._id}
                            className="btn btn-sm btn-call"
                          >
                            <PhoneCall size={14} />
                            <span>Call</span>
                          </button>
                        )}

                        {tok.status === 'called' && (
                          <>
                            <button
                              onClick={() => handleCompleteToken(tok._id)}
                              disabled={actionTokenId === tok._id}
                              className="btn btn-sm btn-complete"
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => handleSkipToken(tok._id)}
                              disabled={actionTokenId === tok._id}
                              className="btn btn-sm btn-skip"
                            >
                              <FastForward size={14} />
                              <span>Skip</span>
                            </button>
                          </>
                        )}

                        {(tok.status === 'completed' || tok.status === 'skipped') && (
                          <span className="text-subtle text-sm">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
