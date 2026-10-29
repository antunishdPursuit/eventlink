import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { Link, useLocation } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export default function EventSearchDetails({ event, user = {}, handleAddEvents, removedEvent }) {
  const location = useLocation();
  const { userId, authPending } = useAuth();
  const canAdd = userId != null && String(userId) === String(user.id);
  const venue = event._embedded?.venues?.[0];
  const image = event.images?.find(item => item.ratio === '16_9')?.url || event.images?.[0]?.url;
  const [savedId, setSavedId] = useState(null);
  const [addError, setAddError] = useState(false);
  const [adding, setAdding] = useState(false);
  const scope = useRef(null);

  useEffect(() => {
    scope.current = { pending: false };
    setSavedId(null);
    setAddError(false);
    setAdding(false);
    return () => { scope.current = null; };
  }, [user.id, event.id]);
  useEffect(() => {
    if (removedEvent && removedEvent.id === savedId) setSavedId(null);
  }, [removedEvent, savedId]);

  const date = event.dates?.start?.localDate;
  const dateValue = date ? new Date(date + 'T12:00:00') : null;
  const validDate = dateValue && !Number.isNaN(dateValue.getTime());
  const localTime = event.dates?.start?.localTime;
  const clock = localTime ? new Date('2000-01-01T' + localTime) : null;
  const displayTime = clock && !Number.isNaN(clock.getTime()) ? clock.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : localTime;
  const classification = event.classifications?.[0];
  const categories = [...new Set([classification?.segment?.name, classification?.genre?.name])].filter(name => name && !['Undefined', 'Other'].includes(name));
  const range = event.priceRanges?.[0];

  async function add() {
    if (!canAdd || authPending || !scope.current || scope.current.pending) return;
    const requestScope = scope.current;
    requestScope.pending = true;
    setAddError(false);
    setAdding(true);
    const saved = { artist: event.name, venue: venue?.name || '', city: venue?.city?.name || '', artist_picture: image || '', price: range?.min ?? null, user_id: user.id };
    try {
      const { data } = await axios.post(API + '/users/' + user.id + '/events', saved);
      if (scope.current !== requestScope) return;
      setSavedId(data.id);
      handleAddEvents?.(data);
    } catch (_) {
      if (scope.current === requestScope) setAddError(true);
    } finally {
      if (scope.current === requestScope) { requestScope.pending = false; setAdding(false); }
    }
  }

  const eventAnchor = 'event-' + event.id;
  const returnTo = '/events' + location.search + '#' + encodeURIComponent(eventAnchor);
  return <article className="discovery-event" id={eventAnchor} tabIndex={-1} aria-labelledby={eventAnchor + '-title'}>
    <div className="discovery-event-art">{image && <img key={image} src={image} alt="" className="discovery-event-image" onError={event => { event.currentTarget.hidden = true; }} />}</div>
    <div className="discovery-event-details">
      <h3 id={eventAnchor + '-title'}>{event.name}</h3>
      <p>{venue?.name}</p>
      <p>{[venue?.city?.name, venue?.state?.stateCode].filter(Boolean).join(', ')}</p>
      <div className="event-categories">{categories.map(category => <span key={category} className="event-category">{category}</span>)}</div>
    </div>
    <div className="discovery-event-date">
      {validDate && <span className="event-weekday">{dateValue.toLocaleDateString('en-US', { weekday: 'short' })}</span>}
      <time dateTime={date || undefined}>{validDate ? dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : date || 'Date unavailable'}</time>
      {displayTime && <span>{displayTime}</span>}
      {range && <span className="event-price">{range.max !== range.min ? '$' + range.min + '–$' + range.max : '$' + range.min}</span>}
    </div>
    <div className="discovery-event-actions">
      {event.url && <a href={event.url} target="_blank" rel="noreferrer" className="event-ticket-link">Get Tickets <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 3H2v11h11v-4M9 2h5v5M14 2 7 9" /></svg></a>}
      {canAdd && (savedId != null ? <p className="event-added" role="status">Saved</p> : <button type="button" className="event-save" onClick={add} disabled={adding || authPending}>{adding ? 'Saving...' : 'Add to Saved'}</button>)}
      {userId == null && <Link className="event-save" to={'/signin?returnTo=' + encodeURIComponent(returnTo)}>Sign in to save</Link>}
    </div>
    {addError && <p className="event-action-error" role="alert">Unable to save this event. Please try again.</p>}
  </article>;
}
