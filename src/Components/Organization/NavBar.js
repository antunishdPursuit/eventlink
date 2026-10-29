import { Link, NavLink, useLocation } from 'react-router-dom';
import '../../Css/NavBarCss.css';
import { useAuth } from '../../AuthContext';

export default function NavBar() {
  const { userId, signOut, authPending } = useAuth();
  const { pathname } = useLocation();
  const accountAction = userId ? <button className="nav-signout" disabled={authPending} onClick={() => signOut().catch(() => {})}>Sign out</button> : <NavLink to="/signin">Sign in</NavLink>;
  if (pathname !== '/') return <nav className="site-nav interior-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/">Event<span>Link</span></Link>
    <ul className="interior-nav-links">
      <li><NavLink to="/users" end>People</NavLink></li>
      <li><NavLink to="/users/new">Create profile</NavLink></li>
      <li><NavLink to="/about">About</NavLink></li>
    </ul>
    <div className="interior-nav-account">{accountAction}</div>
  </nav>;
  return <nav className="site-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/">Event<span>Link</span></Link>
    <ul className="nav-right">
      <li><NavLink to="/users" end>People</NavLink></li>
      <li><NavLink to="/users/new">Create profile</NavLink></li>
      <li><NavLink to="/about">About</NavLink></li>
      <li>{accountAction}</li>
    </ul>
  </nav>;
}
