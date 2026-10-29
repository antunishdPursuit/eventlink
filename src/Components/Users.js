import '../Css/IndexCss.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import User from './User';
const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3003';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [sort, setSort] = useState('original');
  useEffect(() => {
    let active = true;
    setStatus('loading');
    axios.get(`${API}/users`).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error('Invalid response');
      if (active) { setUsers(data); setStatus('ready'); }
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [attempt]);
  const visibleUsers = [...users];
  if (sort.startsWith('username')) visibleUsers.sort((a, b) => a.username.localeCompare(b.username));
  if (sort.startsWith('group')) visibleUsers.sort((a, b) => Number(a.looking_for_group) - Number(b.looking_for_group));
  if (sort.endsWith('desc')) visibleUsers.reverse();
  return <div className="people-directory">
    <div className="people-toolbar">
      <h1 className="people-heading">People</h1>
      <div className="people-sort">
        <label htmlFor="people-sort">Sort by</label>
        <select id="people-sort" className="form-select" value={sort} onChange={event => setSort(event.target.value)}>
          <option value="original">Original order</option>
          <option value="username-asc">Username A–Z</option>
          <option value="username-desc">Username Z–A</option>
          <option value="group-desc">Looking for group: yes first</option>
          <option value="group-asc">Looking for group: no first</option>
        </select>
      </div>
    </div>
    {status === 'loading' && <p role="status">Loading people...</p>}
    {status === 'error' && <div role="alert"><p>Unable to load people.</p><button type="button" className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
    {status === 'ready' && users.length === 0 && <p>No profiles yet.</p>}
    {status === 'ready' && <div className="people-grid">{visibleUsers.map(user => <User key={user.id} user={user} />)}</div>}
  </div>;
}
