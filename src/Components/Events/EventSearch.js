import '../../Css/EventCardCss.css';
import axios from 'axios';
import EventSearchDetails from './EventSearchDetails';
import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export default function EventSearch({ user, handleAddEvents, removedEvent }) {
  const [query, setQuery] = useState('stateCode=NY');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('');
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [validationError, setValidationError] = useState('');
  useEffect(() => {
    let active = true;
    setStatus('loading');
    axios.get(`${API}/api/events?size=10&${query}`).then(({ data }) => {
      if (!active) return;
      setEvents(data.events || []);
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [query, attempt]);
  function search(event) {
    event.preventDefault();
    const value = (zip || state).trim();
    if ((zip && !/^\d{5}$/.test(value)) || (!zip && !/^[a-z]{2}$/i.test(value))) {
      setValidationError('Enter a two-letter state code or a five-digit ZIP code.');
      return;
    }
    setValidationError('');
    const next = zip ? `postalCode=${value}` : `stateCode=${value.toUpperCase()}`;
    if (next === query) setAttempt(value => value + 1);
    else setQuery(next);
  }
  return <section className="eventlink-discovery" aria-labelledby="discovery-title">
    <h2 id="discovery-title">Find events</h2>
    <form className="discovery-search" onSubmit={search}>
      <div><label htmlFor="event-state">State</label><input id="event-state" className="form-control" type="search" value={state} placeholder="State code" aria-label="Search by State" onChange={event => { setState(event.target.value); setZip(''); }} /></div>
      <div><label htmlFor="event-zip">ZIP code</label><input id="event-zip" className="form-control" type="search" inputMode="numeric" value={zip} placeholder="ZIP code" aria-label="Search by Zipcode" onChange={event => { setZip(event.target.value); setState(''); }} /></div>
      <button className="btn btn-primary" type="submit">Search events</button>
    </form>
    {validationError && <p className="search-validation" role="alert">{validationError}</p>}
    <div className="discovery-result-heading"><h3>Search results</h3>{status === 'ready' && <span>{events.length} {events.length === 1 ? 'event' : 'events'}</span>}</div>
    {status === 'loading' && <p role="status">Loading events...</p>}
    {status === 'error' && <div role="alert"><p>Unable to load events.</p><button type="button" className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
    {status === 'ready' && events.length === 0 && <p>No events found in {query.split('=')[1]}.</p>}
    {status === 'ready' && events.map(event => <EventSearchDetails key={event.id} event={event} user={user} handleAddEvents={handleAddEvents} removedEvent={removedEvent} />)}
  </section>;
}
