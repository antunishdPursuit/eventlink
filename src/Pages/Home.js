import '../Css/HomeCss.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [eventStatus, setEventStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    if (API) axios.get(`${API}/users`).then(({ data }) => {
      if (active && Array.isArray(data)) setUsers(data);
    }).catch(() => {});
    if (!API) setEventStatus('unavailable');
    else axios.get(`${API}/api/events`, {
      params: { stateCode: 'NY', classificationName: 'music', size: 3 }
    }).then(({ data }) => {
      if (!active) return;
      const found = data.events || [];
      setEvents(found);
      setEventStatus(found.length ? 'ready' : 'empty');
    }).catch(() => { if (active) setEventStatus('unavailable'); });
    return () => { active = false; };
  }, []);

  const user = users[userIndex];
  return (
    <div className="home_container">
      <section className="home_hero">
        <div className="home_hero_content">
          <h1>Find your next <span>live experience</span></h1>
          <p>Discover events and keep track of the ones you love.</p>
          <Link className="home_primary" to="/users">Explore events</Link>
        </div>
      </section>
      <section className="home_featured" aria-labelledby="featured-title">
        <div className="home_section_heading">
          <h2 id="featured-title">Live music in New York</h2>
        </div>
        {eventStatus === 'loading' && <p>Loading events...</p>}
        {eventStatus === 'empty' && <p>No events found.</p>}
        {eventStatus === 'unavailable' && <p>Events are unavailable right now.</p>}
        <div className="home_event_grid">
          {events.map(event => {
            const venue = event._embedded?.venues?.[0];
            const image = event.images?.find(item => item.ratio === '16_9')?.url || event.images?.[0]?.url;
            return <article className="home_event_card" key={event.id}>
              {image && <img src={image} alt="" />}
              <div><h3>{event.name}</h3>
                {venue && <p>{[venue.name, venue.city?.name].filter(Boolean).join(' · ')}</p>}
                {event.dates?.start?.localDate && <p>{event.dates.start.localDate}</p>}
              </div>
            </article>;
          })}
        </div>
      </section>
      {user && <section className="home_community">
        <div><h2>Music brings people together</h2><p>Meet people who love live events.</p></div>
        <div className="home_person">
          {user.profile_picture && <img src={user.profile_picture} alt="" />}
          <div><Link to={`/users/${user.id}`}>{user.username}</Link><p>{user.bio}</p></div>
          {users.length > 1 && <button onClick={() => setUserIndex((userIndex + 1) % users.length)}>Change person</button>}
        </div>
      </section>}
    </div>
  );
}
