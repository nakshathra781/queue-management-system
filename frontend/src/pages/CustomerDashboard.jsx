import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SkeletonCard, SkeletonTable } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ToastNotification } from '../components/ToastNotification';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Plus, Bell, Volume2, ShieldAlert } from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, tokensRes] = await Promise.all([
        api.getServices(),
        api.getMyTokens()
      ]);

      if (servicesRes.success) setServices(servicesRes.data || []);
      if (tokensRes.success) setMyTokens(tokensRes.data || []);
      if (servicesRes.data?.length > 0 && !selectedServiceId) {
        setSelectedServiceId(servicesRes.data[0]._id);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10 seconds for real-time queue status
    return () => clearInterval(interval);
  }, []);

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.createToken({
        serviceId: selectedServiceId,
        notes,
        priority
      });

      if (response.success && response.data) {
        setToast({ type: 'success', message: `Token ${response.data.tokenNumber} generated successfully!` });
        setNotes('');
        setMyTokens(prev => [response.data, ...prev]);
      } else {
        setToast({ type: 'error', message: response.message || 'Failed to generate token' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Error generating token' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeToken = myTokens.find(t => t.status === 'waiting' || t.status === 'called');
  const filteredTokens = myTokens.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="dashboard-container">
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Customer Queue Portal</h1>
          <p className="dashboard-subtitle">
            Welcome back, <span className="highlight-user">{user?.name}</span>. Monitor your active queue token and request services.
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-icon-only" title="Refresh Queue Status">
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          <span>Sync Status</span>
        </button>
      </div>

      {loading ? (
        <div className="dashboard-grid">
          <SkeletonCard height="240px" />
          <SkeletonCard height="240px" />
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Live Active Token Status Card */}
          <div className="card active-token-card">
            <div className="card-header">
              <div className="card-title">
                <Ticket className="card-title-icon highlight" size={22} />
                <span>Active Queue Ticket</span>
              </div>
              {activeToken && (
                <span className={`status-pill status-${activeToken.status}`}>
                  {activeToken.status === 'called' ? 'NOW CALLED' : 'WAITING IN QUEUE'}
                </span>
              )}
            </div>

            <div className="card-body">
              {activeToken ? (
                <div className="token-display-box">
                  <div className="token-number-lg">{activeToken.tokenNumber}</div>
                  <div className="token-service-name">{activeToken.serviceName}</div>

                  {activeToken.status === 'called' ? (
                    <div className="token-called-alert">
                      <Volume2 size={24} className="pulse-icon" />
                      <div className="called-text">
                        Please proceed immediately to <strong>Counter {activeToken.counterNumber || 1}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="token-progress-wrapper">
                      <div className="token-progress-bar">
                        <div className="token-progress-fill pulse"></div>
                      </div>
                      <div className="progress-meta">
                        <Clock size={16} />
                        <span>Estimated wait: ~5-10 mins</span>
                      </div>
                    </div>
                  )}

                  {activeToken.notes && (
                    <div className="token-notes-preview">
                      <strong>Notes:</strong> {activeToken.notes}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No Active Ticket"
                  description="You do not have any active waiting or called tokens. Select a service on the right to join the queue."
                />
              )}
            </div>
          </div>

          {/* Issue New Queue Token Form */}
          <div className="card generate-token-card">
            <div className="card-header">
              <div className="card-title">
                <Plus className="card-title-icon" size={22} />
                <span>Request New Token</span>
              </div>
            </div>

            <div className="card-body">
              {services.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Services Unavailable"
                  description="Currently no service counters are open."
                />
              ) : (
                <form onSubmit={handleGenerateToken} className="generate-form">
                  <div className="form-group">
                    <label htmlFor="serviceSelect">Select Service Counter</label>
                    <select
                      id="serviceSelect"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="select-input"
                      disabled={submitting}
                    >
                      {services.map((srv) => (
                        <option key={srv._id} value={srv._id}>
                          {srv.name} ({srv.estimatedWaitMinutes} min est. wait)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prioritySelect">Queue Priority</label>
                    <select
                      id="prioritySelect"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="select-input"
                      disabled={submitting}
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority (Senior Citizens / Special Assistance)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tokenNotes">Additional Notes / Inquiry Details (Optional)</label>
                    <textarea
                      id="tokenNotes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Asking about account plan upgrade..."
                      className="textarea-input"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submitting || !selectedServiceId}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-sm"></span>
                        <span>Generating Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Get Queue Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ticket History Section */}
      <div className="card history-card">
        <div className="card-header flex-between">
          <div className="card-title">
            <Clock size={20} />
            <span>My Ticket History</span>
          </div>

          <div className="filter-tabs">
            {['all', 'waiting', 'called', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body no-padding">
          {loading ? (
            <SkeletonTable rows={3} />
          ) : filteredTokens.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No Tickets Found"
              description={
                filterStatus === 'all'
                  ? "You haven't requested any tickets yet."
                  : `No tickets found under '${filterStatus}' status.`
              }
            />
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Service</th>
                    <th>Requested At</th>
                    <th>Counter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((tok) => (
                    <tr key={tok._id}>
                      <td className="font-bold highlight-code">{tok.tokenNumber}</td>
                      <td>{tok.serviceName}</td>
                      <td className="text-subtle">
                        {new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>{tok.counterNumber ? `Counter ${tok.counterNumber}` : '-'}</td>
                      <td>
                        <span className={`status-badge status-${tok.status}`}>
                          {tok.status}
                        </span>
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
