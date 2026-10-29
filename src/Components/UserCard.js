import '../Css/UserDetailsCss.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function UserCard({ user, id, handleDelete }) {
  const { userId } = useAuth();
  const isOwner = String(userId) === String(id);
  return <div className="card-body">
    <div className="profile-controls">
      {isOwner && <Link to={`/users/${id}/edit`} className="profile-edit-link">Edit profile</Link>}
    </div>
    <div className="profile-identity">
      <img src={user.profile_picture} alt={user.username} className="rounded-circle user-avatar image-box" />
      <div className="profile-summary">
        <h3 className="card-title">{user.username} {user.looking_for_group && <span className="star">⭐️</span>}</h3>
        <p className="card-text">{user.bio}</p>
      </div>
    </div>
    <div className="profile-meta">
      <p>Date created: {new Date(user.date_created).toLocaleDateString()}</p>
      {isOwner && <button className="profile-delete" type="button" onClick={handleDelete}>Delete profile</button>}
    </div>
  </div>;
}
