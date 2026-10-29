import { displayProfileDate } from '../profileFormUtils';

export default function ProfileFields({ user, onTextChange, onGroupChange, password, onPasswordChange, selectedImage, previewError, onPreviewError, date }) {
  return <>
    <div className="profile-photo-row">
      <div className="profile-field">
        <label htmlFor="profile_picture">Profile picture URL</label>
        <input id="profile_picture" className="form-control" type="text" value={user.profile_picture} onChange={onTextChange} placeholder="Enter image URL" required />
      </div>
      <div className="profile-preview-block">
        <span>Preview</span>
        <div className="image-preview">
          {selectedImage ? <img key={selectedImage} src={selectedImage} alt="Preview" onError={onPreviewError} /> :
            <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="28" r="13" /><path d="M15 67a25 25 0 0 1 50 0" /></svg>}
        </div>
      </div>
    </div>
    {previewError && <p role="status">Unable to load image preview.</p>}
    <div className="profile-field">
      <label htmlFor="username">Username</label>
      <input id="username" className="form-control" type="text" autoComplete="username" value={user.username} onChange={onTextChange} placeholder="Choose a username" required />
    </div>
    {onPasswordChange && <div className="profile-field">
      <label htmlFor="password">Password <span className="field-hint">(at least 12 characters)</span></label>
      <input id="password" className="form-control" type="password" autoComplete="new-password" minLength={12} maxLength={256} value={password} onChange={onPasswordChange} placeholder="Choose a password" required />
    </div>}
    <div className="profile-field">
      <label htmlFor="bio">Bio</label>
      <textarea id="bio" className="form-control" value={user.bio} onChange={onTextChange} placeholder="Tell us about yourself" rows={2} required />
    </div>
    <div className="profile-group-check">
      <input id="looking_for_group" type="checkbox" checked={user.looking_for_group} onChange={onGroupChange} />
      <label htmlFor="looking_for_group">Looking for group</label>
    </div>
    <div className="profile-field">
      <label htmlFor="date_created">Date created</label>
      <input id="date_created" className="form-control" type="text" value={displayProfileDate(date)} readOnly />
    </div>
  </>;
}
