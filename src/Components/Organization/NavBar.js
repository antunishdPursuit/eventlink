import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import '../../Css/NavBarCss.css';
import { useAuth } from '../../AuthContext';

export default function NavBar() {
  const { userId, signOut, authPending } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menu = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (menu.current) menu.current.open = false;
    setError('');
  }, [pathname, userId]);
  useEffect(() => {
    const dismiss = event => {
      if (menu.current && !menu.current.contains(event.target)) menu.current.open = false;
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  async function logout() {
    setError('');
    try {
      const result = await signOut();
      if (result.applied) navigate('/');
    } catch { setError('Unable to sign out. Try again.'); }
  }
  return <nav className="site-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/">Event<span>Link</span></Link>
    <ul className="nav-right">
      <li><NavLink to="/events">Events</NavLink></li>
      <li><NavLink to="/users" end>People</NavLink></li>
      <li><NavLink to="/about">About</NavLink></li>
      <li>{userId != null ? <div className="nav-account-action">
        <NavLink to={`/users/${userId}`}>My profile</NavLink>
        <details className="nav-account" ref={menu} onKeyDown={event => {
          if (event.key === 'Escape') {
            menu.current.open = false;
            menu.current.querySelector('summary').focus();
          }
        }}>
          <summary aria-label="Account menu"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor"><path d="m3 6 5 5 5-5" /></svg></summary>
          <div className="nav-account-menu">
            <button className="nav-signout" type="button" disabled={authPending} onClick={logout}>{authPending ? 'Signing out...' : 'Sign out'}</button>
            {error && <p role="alert">{error}</p>}
          </div>
        </details>
      </div> : <NavLink to="/signin">Sign in</NavLink>}</li>
    </ul>
  </nav>;
}
