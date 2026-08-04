import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { SkeletonStats, SkeletonTable } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import { ToastNotification } from "../components/ToastNotification";
import {
  Users,
  PhoneCall,
  CheckCircle2,
  FastForward,
  Clock,
  RefreshCw,
  Shield,
  Activity,
} from "lucide-react";

export const AdminDashboard = () => {
  const { user } = useAuth();

  const [tokens, setTokens] = useState([]);
  const [counterNumber, setCounterNumber] = useState(
    user?.counterNumber || 1
  );
  const [loading, setLoading] = useState(true);
  const [actionTokenId, setActionTokenId] = useState(null);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAdminData = async (showLoader = false) => {
  try {
    if (showLoader) {
      setLoading(true);
    }

      const response = await api.getQueue();

      // Backend returns: { count: number, tokens: [...] }
      const queueTokens = response.tokens || response.data || [];

      setTokens(Array.isArray(queueTokens) ? queueTokens : []);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to load the admin queue",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  fetchAdminData(true);

  const interval = setInterval(() => {
    fetchAdminData(false);
  }, 8000);

  return () => clearInterval(interval);
}, []);

  const handleCallToken = async (tokenId) => {
    try {
      setActionTokenId(tokenId);

      await api.callToken(tokenId);

      setToast({
        type: "success",
        message: `Token called successfully at Counter ${counterNumber}`,
      });

      await fetchAdminData();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to call token",
      });
    } finally {
      setActionTokenId(null);
    }
  };

  const handleCompleteToken = async (tokenId) => {
    try {
      setActionTokenId(tokenId);

      await api.completeToken(tokenId);

      setToast({
        type: "success",
        message: "Token completed successfully",
      });

      await fetchAdminData();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to complete token",
      });
    } finally {
      setActionTokenId(null);
    }
  };

  const handleSkipToken = async (tokenId) => {
    try {
      setActionTokenId(tokenId);

      await api.skipToken(tokenId);

      setToast({
        type: "warning",
        message: "Token skipped successfully",
      });

      await fetchAdminData();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to skip token",
      });
    } finally {
      setActionTokenId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      totalToday: tokens.length,
      waitingCount: tokens.filter(
        (token) => token.status === "waiting"
      ).length,
      calledCount: tokens.filter(
        (token) => token.status === "called"
      ).length,
      completedCount: tokens.filter(
        (token) => token.status === "completed"
      ).length,
      skippedCount: tokens.filter(
        (token) => token.status === "skipped"
      ).length,
    };
  }, [tokens]);

  const filteredTokens = tokens.filter((token) => {
    if (statusFilter === "all") return true;

    return token.status === statusFilter;
  });

  const nextWaitingToken = tokens.find(
    (token) => token.status === "waiting"
  );

  const getCustomerName = (token) => {
    return (
      token.user?.name ||
      token.customerName ||
      token.userName ||
      "Customer"
    );
  };

  const getServiceName = (token) => {
    return (
      token.service?.name ||
      token.serviceName ||
      "General Service"
    );
  };

  return (
    <div className="dashboard-container">
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Counter Admin Console</h1>

          <p className="dashboard-subtitle">
            Manage queue flow, call tickets and update token statuses.
          </p>
        </div>

        <div className="admin-controls-group">
          <div className="counter-selector-badge">
            <Shield size={16} />

            <span>Counter:</span>

            <select
              value={counterNumber}
              onChange={(event) =>
                setCounterNumber(Number(event.target.value))
              }
              className="counter-select"
            >
              {[1, 2, 3, 4, 5, 6].map((number) => (
                <option key={number} value={number}>
                  Counter #{number}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchAdminData(true)}
            className="btn btn-secondary btn-icon-only"
            title="Refresh Queue"
            disabled={loading}
          >
            <RefreshCw
              size={18}
              className={loading ? "spinning" : ""}
            />

            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-bg primary">
              <Users size={22} />
            </div>

            <div className="stat-info">
              <span className="stat-value">
                {stats.totalToday}
              </span>

              <span className="stat-label">
                Active Queue
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg warning">
              <Clock size={22} />
            </div>

            <div className="stat-info">
              <span className="stat-value">
                {stats.waitingCount}
              </span>

              <span className="stat-label">
                Waiting in Queue
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg info">
              <PhoneCall size={22} />
            </div>

            <div className="stat-info">
              <span className="stat-value">
                {stats.calledCount}
              </span>

              <span className="stat-label">
                Currently Called
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg success">
              <CheckCircle2 size={22} />
            </div>

            <div className="stat-info">
              <span className="stat-value">
                {stats.completedCount}
              </span>

              <span className="stat-label">
                Completed
              </span>
            </div>
          </div>
        </div>
      )}

      {nextWaitingToken && (
        <div className="quick-call-banner">
          <div className="quick-call-info">
            <span className="quick-call-label">
              NEXT IN LINE:
            </span>

            <span className="quick-call-token">
              {nextWaitingToken.tokenNumber}
            </span>

            <span className="quick-call-service">
              ({getServiceName(nextWaitingToken)})
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              handleCallToken(nextWaitingToken._id)
            }
            disabled={
              actionTokenId === nextWaitingToken._id
            }
            className="btn btn-call-lg"
          >
            <PhoneCall size={20} />

            <span>
              Call {nextWaitingToken.tokenNumber} to Counter #
              {counterNumber}
            </span>
          </button>
        </div>
      )}

      <div className="card queue-table-card">
        <div className="card-header flex-between">
          <div className="card-title">
            <Activity size={20} />
            <span>Live Queue Tokens</span>
          </div>

          <div className="filter-tabs">
            {[
              "all",
              "waiting",
              "called",
              "completed",
              "skipped",
            ].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-tab ${
                  statusFilter === status ? "active" : ""
                }`}
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
                statusFilter === "all"
                  ? "There are currently no active tokens."
                  : `No ${statusFilter} tokens found.`
              }
            />
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Issued At</th>
                    <th>Status</th>
                    <th>Position</th>
                    <th className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTokens.map((token) => (
                    <tr
                      key={token._id}
                      className={
                        token.status === "called"
                          ? "row-highlight"
                          : ""
                      }
                    >
                      <td className="font-bold highlight-code">
                        {token.tokenNumber}
                      </td>

                      <td>
                        {getCustomerName(token)}
                      </td>

                      <td>
                        {getServiceName(token)}
                      </td>

                      <td className="text-subtle">
                        {new Date(
                          token.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${token.status}`}
                        >
                          {token.status}
                        </span>
                      </td>

                      <td>
                        {token.queuePosition || "-"}
                      </td>

                      <td className="text-right actions-cell">
                        {token.status === "waiting" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleCallToken(token._id)
                              }
                              disabled={
                                actionTokenId === token._id
                              }
                              className="btn btn-sm btn-call"
                            >
                              <PhoneCall size={14} />
                              <span>Call</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSkipToken(token._id)
                              }
                              disabled={
                                actionTokenId === token._id
                              }
                              className="btn btn-sm btn-skip"
                            >
                              <FastForward size={14} />
                              <span>Skip</span>
                            </button>
                          </>
                        )}

                        {token.status === "called" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleCompleteToken(token._id)
                              }
                              disabled={
                                actionTokenId === token._id
                              }
                              className="btn btn-sm btn-complete"
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSkipToken(token._id)
                              }
                              disabled={
                                actionTokenId === token._id
                              }
                              className="btn btn-sm btn-skip"
                            >
                              <FastForward size={14} />
                              <span>Skip</span>
                            </button>
                          </>
                        )}

                        {[
                          "completed",
                          "skipped",
                        ].includes(token.status) && (
                          <span className="text-subtle text-sm">
                            Resolved
                          </span>
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