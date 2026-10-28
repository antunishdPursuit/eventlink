import { Link } from 'react-router-dom';
import '../../Css/NavBarCss.css';

export default function NavBar() {
  return <nav className="site-nav" aria-label="Main navigation">
    <Link className="site-brand" to="/">Event<span>Link</span></Link>
    <ul className="nav-right">
      <li><Link to="/users">People</Link></li>
      <li><Link to="/users/new">Create profile</Link></li>
      <li><Link to="/about">About</Link></li>
    </ul>
  </nav>;
}
