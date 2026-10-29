import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    try { await signIn(username, password); navigate('/users'); }
    catch (_) { setError('Unable to sign in. Check your details and try again.'); }
  }
  return <section className="container account-page sign-in-page">
    <form className="auth-form" onSubmit={submit}>
      <header className="account-header"><h1>Sign in</h1><p>Welcome back to EventLink</p></header>
      <div className="auth-field">
      <label htmlFor="login-name">Username</label>
      <input className="form-control" id="login-name" autoComplete="username" placeholder="Enter your username" value={username} onChange={event => setUsername(event.target.value)} required />
      </div>
      <div className="auth-field">
      <label htmlFor="login-password">Password</label>
      <input className="form-control" id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} required />
      </div>
      {error && <p role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit">Sign in</button>
    </form>
  </section>;
}
