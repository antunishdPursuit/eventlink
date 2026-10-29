import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export default function EventSearchDetails({ event, user, handleAddEvents, removedEvent }) {
  const { userId } = useAuth();
  const canAdd = userId != null && String(userId) === String(user.id);
  const venue = event._embedded?.venues?.[0];
  const image = event.images?.find(item => item.ratio === '16_9')?.url || event.images?.[0]?.url;
  const [addedEvents, setAddedEvents] = useState([]);
  const [addError, setAddError] = useState(false);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (removedEvent) setAddedEvents(items => items.filter(item => item.artist !== removedEvent.artist));
  }, [removedEvent]);
  const added = addedEvents.some(item => item.artist === event.name);
  const date = event.dates?.start?.localDate;
  const dateValue = date ? new Date(`${date}T12:00:00`) : null;
  const validDate = dateValue && !Number.isNaN(dateValue.getTime());
  const time = event.dates?.start?.localTime;
  const category = event.classifications?.[0]?.segment?.name;
  async function add() {
    setAddError(false);
    setAdding(true);
    const saved = { artist: event.name, venue: venue?.name || '', city: venue?.city?.name || '', artist_picture: image || '', price: event.priceRanges?.[0]?.min ?? null, user_id: user.id };
    try {
      await axios.post(`${API}/users/${user.id}/events`, saved);
      setAddedEvents(items => [...items, saved]);
      handleAddEvents(saved);
    } catch (_) { setAddError(true); }
    finally { setAdding(false); }
  }
  return <article className="discovery-event">
    {image && <img src={image} alt="" className="discovery-event-image" />}
    <div className="discovery-event-details">
      <h4>{event.name}</h4>
      <p>{venue?.name}</p>
      <p>{[venue?.city?.name, venue?.state?.stateCode].filter(Boolean).join(', ')}</p>
      {category && <span className="event-category">{category}</span>}
    </div>
    <div className="discovery-event-date">
      {validDate && <span className="event-weekday">{dateValue.toLocaleDateString('en-US', { weekday: 'short' })}</span>}
      <time dateTime={date || undefined}>{validDate ? dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : date || 'Date unavailable'}</time>
      {time && <span>{time.slice(0, 5)}</span>}
    </div>
    <div className="discovery-event-actions">
      <a href={event.url} className="event-ticket-link">{event.priceRanges?.length ? `Tickets: $${event.priceRanges[0].min}–$${event.priceRanges[0].max}` : 'Check price'}</a>
      {canAdd && (added ? <p className="event-added" role="status">Event added!</p> : <button type="button" className="event-save" onClick={add} disabled={adding}>{adding ? 'Adding...' : 'Add to saved'}</button>)}
    </div>
    {addError && <p className="event-action-error" role="alert">Unable to add event. Please try again.</p>}
  </article>;
}
