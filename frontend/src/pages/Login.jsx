import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Ticket,
  ArrowRight,
  UserCheck,
  Shield,
} from "lucide-react";
import { ToastNotification } from "../components/ToastNotification";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let fieldError = "";

    if (name === "email") {
      if (!value.trim()) {
        fieldError = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        fieldError = "Please enter a valid email address";
      }
    }

    if (name === "password") {
      if (!value) {
        fieldError = "Password is required";
      } else if (value.length < 6) {
        fieldError = "Password must be at least 6 characters";
      }
    }

    return fieldError;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setServerError("");

    const fieldError = validateField(name, value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: fieldError,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((previousData) => ({
      ...previousData,
      role,
    }));

    setServerError("");
  };

  const validateForm = () => {
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);

    return !emailError && !passwordError;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response?.token && response?.user) {
        if (response.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }

        return;
      }

      setServerError(
        response?.message ||
          "Login failed. Please check your email and password."
      );
    } catch (error) {
      setServerError(
        error?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCustomerDemo = () => {
    setFormData({
      email: "customer@queue.com",
      password: "password123",
      role: "customer",
    });

    setErrors({});
    setServerError("");
  };

  const fillAdminDemo = () => {
    setFormData({
      email: "admin@queue.com",
      password: "password123",
      role: "admin",
    });

    setErrors({});
    setServerError("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Ticket size={28} />
          </div>

          <h2>Welcome Back</h2>

          <p>Sign in to your QueueFlow portal</p>
        </div>

        {serverError && (
          <ToastNotification
            type="error"
            message={serverError}
            onClose={() => setServerError("")}
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate
        >
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${
                formData.role === "customer" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("customer")}
              disabled={isSubmitting}
            >
              <UserCheck size={16} />
              <span>Customer</span>
            </button>

            <button
              type="button"
              className={`role-btn ${
                formData.role === "admin" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("admin")}
              disabled={isSubmitting}
            >
              <Shield size={16} />
              <span>Counter Admin</span>
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />

              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  formData.role === "admin"
                    ? "Enter admin email"
                    : "Enter customer email"
                }
                className={errors.email ? "input-error" : ""}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {errors.email && (
              <span className="field-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? "input-error" : ""}
                autoComplete="current-password"
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
                tabIndex={-1}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <span className="field-error">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={
              isSubmitting ||
              Boolean(errors.email) ||
              Boolean(errors.password)
            }
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>
                  Sign In as{" "}
                  {formData.role === "admin"
                    ? "Admin"
                    : "Customer"}
                </span>

                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account yet?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>

          <div className="demo-credentials">
            <p className="demo-title">
              Quick Demo Logins:
            </p>

            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={fillCustomerDemo}
                disabled={isSubmitting}
              >
                Customer Login
              </button>

              <button
                type="button"
                className="demo-chip"
                onClick={fillAdminDemo}
                disabled={isSubmitting}
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};