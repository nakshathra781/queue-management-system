import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Ticket, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { ToastNotification } from '../components/ToastNotification';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let fieldError = '';
    if (name === 'email') {
      if (!value.trim()) {
        fieldError = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        fieldError = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        fieldError = 'Password is required';
      } else if (value.length < 6) {
        fieldError = 'Password must be at least 6 characters';
      }
    }
    return fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');

    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    const newErrors = { email: emailErr, password: passErr };
    setErrors(newErrors);
    return !emailErr && !passErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (response.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setServerError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setServerError(err.message || 'Unable to connect to server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
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
            onClose={() => setServerError('')}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
            >
              <UserCheck size={16} />
              <span>Customer</span>
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
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
                placeholder={formData.role === 'admin' ? 'admin@queue.com' : 'customer@queue.com'}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (e.g. password123)"
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !!errors.email || !!errors.password}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as {formData.role === 'admin' ? 'Admin' : 'Customer'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
          <div className="demo-credentials">
            <p className="demo-title">Quick Demo Logins:</p>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => setFormData({ email: 'customer@queue.com', password: 'password123', role: 'customer' })}
              >
                Customer Login
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => setFormData({ email: 'admin@queue.com', password: 'password123', role: 'admin' })}
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
