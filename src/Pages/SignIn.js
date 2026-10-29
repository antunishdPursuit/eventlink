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
    catch (_) { if (mounted.current) setError('Unable to sign in. Check your details and try again.'); }
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
