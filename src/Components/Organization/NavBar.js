import { Link } from 'react-router-dom';
import '../../Css/NavBarCss.css';
import { useAuth } from '../../AuthContext';

export default function NavBar() {
  const { userId, signOut } = useAuth();
  return <nav className="site-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/">Event<span>Link</span></Link>
    <ul className="nav-right">
      <li><Link to="/users">People</Link></li>
      <li><Link to="/users/new">Create profile</Link></li>
      <li><Link to="/about">About</Link></li>
      <li>{userId ? <button className="nav-signout" onClick={() => signOut().catch(() => {})}>Sign out</button> : <Link to="/signin">Sign in</Link>}</li>
    </ul>
  </nav>;
}
