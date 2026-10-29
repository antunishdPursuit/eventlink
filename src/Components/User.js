import "../Css/IndexCss.css"
import { Link } from "react-router-dom";

function User({ user }) {
  return (
    <div className="people-grid-item">
      <div className="card shadow-sm card-box">
        <img src={user.profile_picture} className="card-img-top" alt={user.username} />
        <div className="card-body">
            <h2 className="card-title people-card-name">{user.username}</h2>
            <p className="card-text">Looking for group: <span className={user.looking_for_group ? 'group-yes' : ''}>{user.looking_for_group ? "Yes" : "No"}</span></p>
            <Link to={`/users/${user.id}`} className="people-card-link">Learn more <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </div>
  );
}

export default User;
