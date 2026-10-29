import ProfileFields from './ProfileFields';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { isProfileImageUrl, localDateValue } from '../profileFormUtils';

export default function UserNewForm() {
  const { register, authPending } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [user, setUser] = useState(() => ({
    profile_picture: '', username: '', bio: '', looking_for_group: false, date_created: localDateValue(),
  }));

  function handleTextChange(event) {
    const { id, value } = event.target;
    if (id === 'profile_picture') {
      setPreviewError(false);
      setSelectedImage(isProfileImageUrl(value) ? value : '');
    }
    setUser(current => ({ ...current, [id]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || authPending) return;
    if (!isProfileImageUrl(user.profile_picture)) {
      setError('Use a link to a JPG, JPEG or PNG image.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await register(user, password);
      if (result.applied && mounted.current) navigate('/users/' + result.userId);
    } catch (failure) {
      if (mounted.current) setError(failure.response?.data?.error || 'Unable to create your profile. Please try again.');
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }

  return <div className="profile-form-card">
    <header className="account-header"><h1>Create Profile</h1><p>Join EventLink and connect with others</p></header>
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset disabled={submitting || authPending}>
        <ProfileFields user={user} onTextChange={handleTextChange}
          onGroupChange={() => setUser(current => ({ ...current, looking_for_group: !current.looking_for_group }))}
          password={password} onPasswordChange={event => setPassword(event.target.value)}
          selectedImage={selectedImage} previewError={previewError}
          onPreviewError={() => { setSelectedImage(''); setPreviewError(true); }} date={user.date_created} />
      </fieldset>
      {error && <p className="form-feedback" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary profile-submit" disabled={submitting || authPending}>{submitting ? 'Creating profile...' : 'Create Profile'}</button>
    </form>
  </div>;
}
