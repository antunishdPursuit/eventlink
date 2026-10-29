import ProfileFields from './ProfileFields';
import DeleteControl from './DeleteControl';
import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isProfileImageUrl } from '../profileFormUtils';
import { useAuth } from '../AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export default function UserEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, sessionLoading, deleteProfile, authPending } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isOwner = userId != null && String(userId) === String(id);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeProfile = useRef(null);

  useEffect(() => {
    activeProfile.current = id;
    return () => { activeProfile.current = null; };
  }, [id]);

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    setStatus('loading');
    setSubmitting(false);
    axios.get(API + '/users/' + id).then(({ data }) => {
      if (!data?.id) throw new Error('Profile unavailable');
      if (!active) return;
      setUser(data);
      setSelectedImage(data.profile_picture || '');
      setPreviewError(false);
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [id, attempt, isOwner]);

  function handleTextChange(event) {
    const { id: field, value } = event.target;
    if (field === 'profile_picture') {
      setPreviewError(false);
      setSelectedImage(isProfileImageUrl(value) ? value : '');
    }
    setUser(current => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || deleting) return;
    if (!isProfileImageUrl(user.profile_picture)) {
      setError('Use a link to a JPG, JPEG or PNG image.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await axios.put(API + '/users/' + id, user);
      if (activeProfile.current === id) navigate('/users/' + id);
    } catch (failure) {
      if (activeProfile.current === id) setError(failure.response?.data?.error || 'Unable to save your changes. Please try again.');
    } finally {
      if (activeProfile.current === id) setSubmitting(false);
    }
  }

  return <div className="profile-form-card">
    <header className="account-header"><h1>Edit Profile</h1></header>
    {sessionLoading ? <p role="status">Checking your account...</p> : !isOwner ? <div><p>Only the profile owner can make changes.</p><Link className="btn btn-primary" to={userId == null ? '/signin' : '/users/' + id}>{userId == null ? 'Sign in' : 'Back to profile'}</Link></div> : <>
    {status === 'loading' && <p role="status">Loading your profile...</p>}
    {status === 'error' && <div role="alert"><p>Unable to load this profile.</p><button className="btn btn-primary" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
    {status === 'ready' && <form onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset disabled={submitting || deleting}>
        <ProfileFields user={user} onTextChange={handleTextChange}
          onGroupChange={() => setUser(current => ({ ...current, looking_for_group: !current.looking_for_group }))}
          selectedImage={selectedImage} previewError={previewError}
          onPreviewError={() => { setSelectedImage(''); setPreviewError(true); }} date={user.date_created?.slice(0, 10)} />
      </fieldset>
      {error && <p className="form-feedback" role="alert">{error}</p>}
      <div className="profile-form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate('/users/' + id)} disabled={submitting || deleting}>Cancel</button><button type="submit" className="btn btn-primary profile-submit" disabled={submitting || deleting}>{submitting ? 'Saving...' : 'Save changes'}</button></div>
    </form>}
    {status === 'ready' && <details className="account-settings"><summary>Account settings</summary><h2>Delete profile</h2><p>Permanently remove your profile and all saved events. This cannot be undone.</p>
      <DeleteControl label="Delete profile" description="Your profile and all saved events will be permanently deleted." disabled={submitting || authPending} onPendingChange={setDeleting} onDelete={async () => {
        const result = await deleteProfile(id);
        if (result.applied && activeProfile.current === id) navigate('/users');
      }} />
    </details>}
    </>}
  </div>;
}
