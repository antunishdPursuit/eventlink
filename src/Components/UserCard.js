import '../Css/UserDetailsCss.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { displayProfileDate } from '../profileFormUtils';

export default function UserCard({ user, id, handleDelete, savedCount }) {
  const { userId, authPending } = useAuth();
  const isOwner = String(userId) === String(id);
  return <div className="card-body">
    <div className="profile-controls">
      {isOwner && <Link to={`/users/${id}/edit`} className="profile-edit-link">Edit profile</Link>}
    </div>
    <div className="profile-identity">
      <img src={user.profile_picture} alt={user.username} className="rounded-circle user-avatar image-box" />
      <div className="profile-summary">
        <h1 className="card-title">{user.username}</h1>
        <p className="card-text">{user.bio}</p>
      </div>
    </div>
    <dl className="profile-facts">
      <div><dt>Saved events</dt><dd>{savedCount == null ? <span aria-label="Saved event count unavailable">—</span> : savedCount}</dd></div>
      <div><dt>Looking for group</dt><dd>{user.looking_for_group ? 'Yes' : 'No'}</dd></div>
      <div><dt>Joined</dt><dd className="profile-joined"><time dateTime={user.date_created?.slice(0, 10)}>{displayProfileDate(user.date_created)}</time></dd></div>
    </dl>
    {isOwner && <div className="profile-owner-actions"><button className="profile-delete" type="button" onClick={handleDelete} disabled={authPending}>{authPending ? 'Please wait...' : 'Delete profile'}</button></div>}
  </div>;
}
