import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Event from "../Events/Event";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function Events({newEventToAdd, onEventDeleted}) {
  let { id } = useParams();
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [actionError, setActionError] = useState('');
  const [refreshError, setRefreshError] = useState(false);
  const loadedProfile = useRef(null);
  const requestVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const version = ++requestVersion.current;
    const hasLoaded = loadedProfile.current === id;
    if (!hasLoaded) { setStatus('loading'); setEvents([]); }
    setRefreshError(false);
    axios
      .get(`${API}/users/${id}/events`)
      .then((response) => {
        if (!Array.isArray(response.data)) throw new Error('Invalid response');
        if (active && version === requestVersion.current) { loadedProfile.current = id; setEvents(response.data); setStatus('ready'); }
      })
      .catch(() => { if (active && version === requestVersion.current) { if (hasLoaded) setRefreshError(true); else setStatus('error'); } });
    return () => { active = false; };
  }, [id, newEventToAdd, attempt]);

  const handleDelete = (eventId) => {
    setActionError('');
    axios
      .delete(`${API}/users/${id}/events/${eventId}`)
      .then((response) => {
          requestVersion.current += 1;
          onEventDeleted(response.data);
          setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
          setAttempt(value => value + 1);
        })
      .catch(() => setActionError('Unable to delete event. Please try again.'));
  };

  const handleEdit = async (updatedEvent) => {
    const response = await axios.put(`${API}/users/${id}/events/${updatedEvent.id}`, updatedEvent);
        requestVersion.current += 1;
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === updatedEvent.id ? response.data : event
          )
        );
        setAttempt(value => value + 1);
  };

  return (
    <section className="Events">
        <h2>Events</h2>
        {status === 'loading' && <p role="status">Loading saved events...</p>}
        {status === 'error' && <div role="alert"><p>Unable to load saved events.</p><button className="btn btn-primary" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
        {refreshError && <div role="alert"><p>Unable to refresh saved events.</p><button className="btn btn-primary" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
        {status === 'ready' && events.length === 0 && <p>No saved events yet.</p>}
        {actionError && <p role="alert">{actionError}</p>}
        {status === 'ready' && events.map((event) => (
            <Event
            key={event.id}
            event={event}
            handleSubmit={handleEdit}
            handleDelete={handleDelete}
            />
        ))}
    </section>
  );
}

export default Events;
