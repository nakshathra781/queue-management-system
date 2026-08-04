import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  SkeletonCard,
  SkeletonTable,
} from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import { ToastNotification } from "../components/ToastNotification";
import {
  Ticket,
  Clock,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Plus,
  Volume2,
} from "lucide-react";

export const CustomerDashboard = () => {
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("normal");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const normalizeServices = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.services)) return response.services;
    if (Array.isArray(response?.data)) return response.data;

    return [];
  };

  const normalizeTokens = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.tokens)) return response.tokens;
    if (Array.isArray(response?.data)) return response.data;

    return [];
  };

  const fetchData = async (showLoader = false) => {
  try {
    if (showLoader) {
      setLoading(true);
    }

      const [servicesResponse, tokensResponse] = await Promise.all([
        api.getServices(),
        api.getMyTokens(),
      ]);

      const receivedServices = normalizeServices(servicesResponse);
      const receivedTokens = normalizeTokens(tokensResponse);

      setServices(receivedServices);
      setMyTokens(receivedTokens);

      if (receivedServices.length > 0) {
        setSelectedServiceId((currentServiceId) => {
          return currentServiceId || receivedServices[0]._id;
        });
      }
    } catch (error) {
      console.error("Customer dashboard error:", error);

      setToast({
        type: "error",
        message:
          error.message || "Failed to load customer dashboard data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchData(true);

  const interval = setInterval(() => {
    fetchData(false);
  }, 10000);

  return () => clearInterval(interval);
}, []);

  const handleGenerateToken = async (event) => {
    event.preventDefault();

    if (!selectedServiceId) {
      setToast({
        type: "error",
        message: "Please select a service",
      });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      const response = await api.createToken({
  customerName: user?.name || "Customer",
  phone: user?.phone || "0000000000",
  serviceId: selectedServiceId,
  });
      const createdToken =
        response?.token || response?.data || response;

      setToast({
        type: "success",
        message: createdToken?.tokenNumber
          ? `Token ${createdToken.tokenNumber} generated successfully`
          : response?.message || "Token generated successfully",
      });

      setNotes("");

      await fetchData();
    } catch (error) {
      console.error("Token generation error:", error);

      setToast({
        type: "error",
        message: error.message || "Unable to generate token",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceName = (token) => {
    return (
      token?.service?.name ||
      token?.serviceName ||
      "General Service"
    );
  };

  const getEstimatedTime = (service) => {
    return (
      service?.averageServiceTime ||
      service?.estimatedWaitMinutes ||
      10
    );
  };

  const activeToken = useMemo(() => {
    return myTokens.find((token) =>
      ["waiting", "called"].includes(token.status)
    );
  }, [myTokens]);

  const filteredTokens = useMemo(() => {
    if (filterStatus === "all") return myTokens;

    return myTokens.filter(
      (token) => token.status === filterStatus
    );
  }, [myTokens, filterStatus]);

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
          <h1 className="dashboard-title">
            Customer Queue Portal
          </h1>

          <p className="dashboard-subtitle">
            Welcome back,{" "}
            <span className="highlight-user">
              {user?.name || "Customer"}
            </span>
            . Monitor your active queue token and request services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          className="btn btn-secondary btn-icon-only"
          title="Refresh Queue Status"
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "spinning" : ""}
          />

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
          <div className="card active-token-card">
            <div className="card-header">
              <div className="card-title">
                <Ticket
                  className="card-title-icon highlight"
                  size={22}
                />

                <span>Active Queue Ticket</span>
              </div>

              {activeToken && (
                <span
                  className={`status-pill status-${activeToken.status}`}
                >
                  {activeToken.status === "called"
                    ? "NOW CALLED"
                    : "WAITING IN QUEUE"}
                </span>
              )}
            </div>

            <div className="card-body">
              {activeToken ? (
                <div className="token-display-box">
                  <div className="token-number-lg">
                    {activeToken.tokenNumber}
                  </div>

                  <div className="token-service-name">
                    {getServiceName(activeToken)}
                  </div>

                  {activeToken.status === "called" ? (
                    <div className="token-called-alert">
                      <Volume2
                        size={24}
                        className="pulse-icon"
                      />

                      <div className="called-text">
                        Your token has been called. Please proceed
                        to the service counter.
                      </div>
                    </div>
                  ) : (
                    <div className="token-progress-wrapper">
                      <div className="token-progress-bar">
                        <div className="token-progress-fill pulse" />
                      </div>

                      <div className="progress-meta">
                        <Clock size={16} />

                        <span>
                          Queue position:{" "}
                          {activeToken.queuePosition || 1}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeToken.notes && (
                    <div className="token-notes-preview">
                      <strong>Notes:</strong>{" "}
                      {activeToken.notes}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No Active Ticket"
                  description="You do not have an active token. Select a service to join the queue."
                />
              )}
            </div>
          </div>

          <div className="card generate-token-card">
            <div className="card-header">
              <div className="card-title">
                <Plus
                  className="card-title-icon"
                  size={22}
                />

                <span>Request New Token</span>
              </div>
            </div>

            <div className="card-body">
              {services.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Services Unavailable"
                  description="No active services were found. Ask the admin to create a service."
                />
              ) : (
                <form
                  onSubmit={handleGenerateToken}
                  className="generate-form"
                >
                  <div className="form-group">
                    <label htmlFor="serviceSelect">
                      Select Service
                    </label>

                    <select
                      id="serviceSelect"
                      value={selectedServiceId}
                      onChange={(event) =>
                        setSelectedServiceId(
                          event.target.value
                        )
                      }
                      className="select-input"
                      disabled={submitting}
                    >
                      {services.map((service) => (
                        <option
                          key={service._id}
                          value={service._id}
                        >
                          {service.name} —{" "}
                          {getEstimatedTime(service)} minutes
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prioritySelect">
                      Queue Priority
                    </label>

                    <select
                      id="prioritySelect"
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value)
                      }
                      className="select-input"
                      disabled={submitting}
                    >
                      <option value="normal">
                        Normal Priority
                      </option>

                      <option value="high">
                        High Priority
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tokenNotes">
                      Additional Notes (optional)
                    </label>

                    <textarea
                      id="tokenNotes"
                      rows={2}
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value)
                      }
                      placeholder="Enter inquiry details"
                      className="textarea-input"
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={
                      submitting || !selectedServiceId
                    }
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-sm" />
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

      <div className="card history-card">
        <div className="card-header flex-between">
          <div className="card-title">
            <Clock size={20} />
            <span>My Ticket History</span>
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
                onClick={() =>
                  setFilterStatus(status)
                }
                className={`filter-tab ${
                  filterStatus === status
                    ? "active"
                    : ""
                }`}
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
                filterStatus === "all"
                  ? "You have not generated any tickets yet."
                  : `No ${filterStatus} tickets found.`
              }
            />
          ) : (
            <div className="responsive-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Service</th>
                    <th>Queue Position</th>
                    <th>Requested At</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTokens.map((token) => (
                    <tr key={token._id}>
                      <td className="font-bold highlight-code">
                        {token.tokenNumber}
                      </td>

                      <td>
                        {getServiceName(token)}
                      </td>

                      <td>
                        {token.queuePosition || "-"}
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