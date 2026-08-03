import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Ticket, ArrowRight, Shield, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { ToastNotification } from '../components/ToastNotification';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'var(--danger-color)' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'var(--warning-color)' };
    return { score: 3, label: 'Strong', color: 'var(--success-color)' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateField = (name, value, allValues = formData) => {
    let fieldError = '';
    if (name === 'name') {
      if (!value.trim()) {
        fieldError = 'Full name is required';
      } else if (value.trim().length < 2) {
        fieldError = 'Name must be at least 2 characters';
      }
    } else if (name === 'email') {
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
    } else if (name === 'confirmPassword') {
      if (!value) {
        fieldError = 'Please confirm your password';
      } else if (value !== allValues.password) {
        fieldError = 'Passwords do not match';
      }
    }
    return fieldError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setServerError('');

    const fieldError = validateField(name, value, updatedForm);
    setErrors(prev => ({ ...prev, [name]: fieldError }));

    if (name === 'password' && updatedForm.confirmPassword) {
      const confirmErr = validateField('confirmPassword', updatedForm.confirmPassword, updatedForm);
      setErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const validateForm = () => {
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);
    const confirmErr = validateField('confirmPassword', formData.confirmPassword);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr
    };

    setErrors(newErrors);
    return !nameErr && !emailErr && !passErr && !confirmErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.success) {
        if (response.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setServerError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'Server error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={28} />
          </div>
          <h2>Create Account</h2>
          <p>Join QueueFlow for seamless queue navigation</p>
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
              <span>Customer Account</span>
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
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Prince Dharmapala"
                className={errors.name ? 'input-error' : ''}
                disabled={isSubmitting}
              />
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
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
                placeholder="name@example.com"
                className={errors.email ? 'input-error' : ''}
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
                placeholder="At least 6 characters"
                className={errors.password ? 'input-error' : ''}
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar-bg">
                  <div
                    className="strength-bar-fill"
                    style={{
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  {strength.label} Password
                </span>
              </div>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={
              isSubmitting ||
              !!errors.name ||
              !!errors.email ||
              !!errors.password ||
              !!errors.confirmPassword ||
              !formData.name ||
              !formData.email ||
              !formData.password
            }
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
