import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function SignIn() {
  const { signIn, authPending, userId, sessionLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function submit(event) {
    event.preventDefault();
    if (submitting || authPending || sessionLoading) return;
    setError('');
    setSubmitting(true);
    try { const result = await signIn(username, password); if (result.applied && mounted.current) navigate(`/users/${result.userId}`); }
    catch (failure) {
      const status = failure.response?.status;
      const message = status === 401 ? 'Incorrect username or password.'
        : status === 429 ? 'Too many sign-in attempts. Wait 15 minutes and try again.'
        : status === 403 ? 'Sign-in is blocked from this address. Open EventLink at 127.0.0.1:3225 and try again.'
        : !failure.response ? 'Cannot reach the sign-in service. Please try again.'
        : 'Sign-in is unavailable right now. Please try again.';
      if (mounted.current) setError(message);
    }
    finally { if (mounted.current) setSubmitting(false); }
  }
  if (!sessionLoading && userId != null) return <Navigate to={`/users/${userId}`} replace />;
  return <section className="container account-page sign-in-page">
    <form className="auth-form" onSubmit={submit} aria-busy={submitting}>
      <header className="account-header"><h1>Sign In</h1><p>Open your profile and saved events</p></header>
      {sessionLoading && <p role="status">Checking your account...</p>}
      <div className="auth-field">
      <label htmlFor="login-name">Username</label>
      <input className="form-control" id="login-name" autoComplete="username" placeholder="Enter your username" value={username} onChange={event => setUsername(event.target.value)} disabled={submitting || authPending || sessionLoading} required />
      </div>
      <div className="auth-field">
      <label htmlFor="login-password">Password</label>
      <input className="form-control" id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} disabled={submitting || authPending || sessionLoading} required />
      </div>
      {error && <p role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={submitting || authPending || sessionLoading}>{submitting ? 'Signing in...' : 'Sign In'}</button>
      <p className="auth-switch">New here? <Link to="/users/new">Create profile</Link></p>
    </form>
  </section>;
}
