import "../Css/UserDetailsCss.css"
import axios from "axios";
import UserCard from "./UserCard";
import Events from "./Events/Events";
import EventSearch from "./Events/EventSearch"
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function UserDetails() {
    const [user, setUser] = useState([]);
    const [profileError, setProfileError] = useState(false);
    const [profileAttempt, setProfileAttempt] = useState(0);
    const [newEventToAdd, setNewEventToAdd] = useState({})
    const [removedEvent, setRemovedEvent] = useState(null);
    const [savedCount, setSavedCount] = useState({ id: null, value: null });
    let { id } = useParams();

    const updateSavedCount = useCallback((profileId, value) => setSavedCount({ id: profileId, value }), []);
 
    useEffect(() => {
      let active = true;
      setUser([]);
      setProfileError(false);
      axios
        .get(`${API}/users/${id}`)
        .then((response) => {
          if (!active) return;
          if (response.data?.id) setUser(response.data);
          else setProfileError(true);
        })
        .catch(() => {
          if (active) setProfileError(true);
        });
      return () => { active = false; };
    }, [id, profileAttempt]);


  function handleAddEvents(event) {
    setNewEventToAdd(event)
}

  return (
    <div className="eventlink-profile-layout">
      <div className="profile-column">
        <Link to="/users" className="profile-back">Back to people</Link>
        <div className="card profile-card mb-3">
          {user.id ? <UserCard user={user} id={id} savedCount={savedCount.id === id ? savedCount.value : null} /> : profileError ?
            <div className="profile-loading" role="alert"><p>Unable to load profile.</p><button className="btn btn-primary" type="button" onClick={() => setProfileAttempt(value => value + 1)}>Try again</button></div> :
            <p className="profile-loading" role="status">Loading profile...</p>}
        </div>
        <div className="card saved-events-card">
          <Events newEventToAdd={newEventToAdd} onEventDeleted={setRemovedEvent} onCountChange={updateSavedCount} />
        </div>
      </div>
      <div className="d-flex flex-column justify-content-between">
        <EventSearch user={user} handleAddEvents={handleAddEvents} removedEvent={removedEvent} />
      </div>
    </div>
  );
}

export default UserDetails;

