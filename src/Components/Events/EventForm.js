import { useId, useState } from 'react';

export default function EventForm({ eventDetails, toggleView, handleSubmit }) {
  const [draft, setDraft] = useState(eventDetails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formId = useId();
  const fields = [
    ['artist', 'Artist', 'text'],
    ['venue', 'Venue', 'text'],
    ['city', 'City', 'text'],
    ['price', 'Price', 'number'],
    ['artist_picture', 'Event image URL', 'text'],
  ];
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await handleSubmit({ ...draft, price: draft.price === '' ? null : draft.price });
      toggleView();
    } catch (_) {
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="event-edit-form" onSubmit={submit} aria-busy={saving}>
      <h3>Edit event</h3>
      {fields.map(([key, label, type]) => (
        <div className="event-edit-field" key={key}>
          <label htmlFor={`${formId}-${key}`}>{label}</label>
          <input id={`${formId}-${key}`} className="form-control" type={type}
            min={type === 'number' ? '0' : undefined} step={type === 'number' ? '.01' : undefined}
            value={draft[key] ?? ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
            disabled={saving}
            required={key === 'artist' || key === 'city' || key === 'venue'} />
        </div>
      ))}
      {draft.artist_picture && <img src={draft.artist_picture} alt="Event preview" className="event-edit-preview" onError={(event) => { event.currentTarget.hidden = true; }} onLoad={(event) => { event.currentTarget.hidden = false; }} />}
      {error && <p role="alert">{error}</p>}
      <div className="event-edit-actions profile-form-actions">
        <button type="button" className="btn btn-secondary" onClick={toggleView} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>
    </form>
  );
}
