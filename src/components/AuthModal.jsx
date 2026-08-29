import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

/** Simple password strength scorer: 0 (weak) → 3 (strong) */
const getPasswordStrength = (pwd) => {
  if (pwd.length < MIN_PASSWORD_LENGTH) return 0;
  let score = 0;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 3);
};

const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pwdStrength = mode === 'signup' ? getPasswordStrength(password) : -1;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      handleClose();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, firstName, lastName);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created! Please check your email to verify, then sign in.');
      setTimeout(() => switchMode('login'), 3000);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset email sent! Check your inbox.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <span className="logo-title" style={{ fontSize: '1.5rem' }}>AIMEE</span>
            <span className="logo-sub" style={{ fontSize: '0.6rem' }}>COLLECTION</span>
          </div>
          <h2 className="auth-modal-title">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Join the Aimee Collection community'}
            {mode === 'forgot' && 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success" role="status" aria-live="polite">
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {success}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
              />
            </div>
            <div className="auth-input-group">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => switchMode('forgot')}
            >
              Forgot password?
            </button>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={20} className="spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
            <div className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => switchMode('signup')}>Create one</button>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="auth-name-row">
              <div className="auth-input-group">
                <User size={18} className="auth-input-icon" />
                <input
                  id="signup-first-name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  aria-label="First name"
                />
              </div>
              <div className="auth-input-group">
                <User size={18} className="auth-input-icon" />
                <input
                  id="signup-last-name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-label="Last name"
                />
              </div>
            </div>
            <div className="auth-input-group">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
              />
            </div>
            <div className="auth-input-group">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={`Create password (min. ${MIN_PASSWORD_LENGTH} chars)`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                aria-label="Create password"
                aria-describedby="pwd-strength"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div id="pwd-strength" className="pwd-strength-wrap" aria-label={`Password strength: ${strengthLabel[pwdStrength]}`}>
                <div className="pwd-strength-bar">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="pwd-strength-segment"
                      style={{
                        background: i <= pwdStrength ? strengthColor[pwdStrength] : 'var(--border-color)',
                      }}
                    />
                  ))}
                </div>
                <span className="pwd-strength-label" style={{ color: strengthColor[pwdStrength] }}>
                  {strengthLabel[pwdStrength]}
                </span>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={20} className="spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
            <div className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')}>Sign in</button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <form className="auth-form" onSubmit={handleForgot}>
            <div className="auth-input-group">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="forgot-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={20} className="spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
            </button>
            <div className="auth-switch">
              Remember your password?{' '}
              <button type="button" onClick={() => switchMode('login')}>Sign in</button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <ShieldCheck size={14} />
          <span>Secured by Supabase</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
