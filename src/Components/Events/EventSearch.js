import '../../Css/EventCardCss.css';
import axios from 'axios';
import EventSearchDetails from './EventSearchDetails';
import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';
const stateChoices = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'],
  ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'],
  ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'],
  ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

export default function EventSearch({ user, handleAddEvents, removedEvent, title = 'Find Events' }) {
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
    <h1 id="discovery-title">{title}</h1>
    <form className="discovery-search" onSubmit={search}>
      <div><label htmlFor="event-state">State</label><input id="event-state" className="form-control form-select" type="search" list="event-states" value={state} placeholder="State code" aria-label="Search by State" onChange={event => { setState(event.target.value); setZip(''); }} /><datalist id="event-states">{stateChoices.map(([code, name]) => <option key={code} value={code} label={name + ' (' + code + ')'} />)}</datalist></div>
      <div><label htmlFor="event-zip">ZIP code</label><input id="event-zip" className="form-control" type="search" inputMode="numeric" value={zip} placeholder="ZIP code" aria-label="Search by Zipcode" onChange={event => { setZip(event.target.value); setState(''); }} /></div>
      <button className="btn btn-primary" type="submit">Search events</button>
    </form>
    {validationError && <p className="search-validation" role="alert">{validationError}</p>}
    <div className="discovery-result-heading"><h3>Search Results</h3>{status === 'ready' && <span>{events.length} {events.length === 1 ? 'event' : 'events'}</span>}</div>
    {status === 'loading' && <p role="status">Loading events...</p>}
    {status === 'error' && <div role="alert"><p>Unable to load events.</p><button type="button" className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
    {status === 'ready' && events.length === 0 && <p>No events found in {query.split('=')[1]}.</p>}
    {status === 'ready' && events.map(event => <EventSearchDetails key={event.id} event={event} user={user} handleAddEvents={handleAddEvents} removedEvent={removedEvent} />)}
  </section>;
}
