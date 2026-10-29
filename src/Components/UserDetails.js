import "../Css/UserDetailsCss.css"
import axios from "axios";
import UserCard from "./UserCard";
import Events from "./Events/Events";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function UserDetails() {
    const [user, setUser] = useState([]);
    const [profileError, setProfileError] = useState(false);
    const [profileMissing, setProfileMissing] = useState(false);
    const [profileAttempt, setProfileAttempt] = useState(0);
    const [savedCount, setSavedCount] = useState({ id: null, value: null });
    let { id } = useParams();

    const updateSavedCount = useCallback((profileId, value) => setSavedCount({ id: profileId, value }), []);
 
    useEffect(() => {
      let active = true;
      setUser([]);
      setProfileError(false);
      setProfileMissing(false);
      axios
        .get(`${API}/users/${id}`)
        .then((response) => {
          if (!active) return;
          if (response.data?.id) setUser(response.data);
          else setProfileError(true);
        })
        .catch(error => {
          if (active) {
            if (error.response?.status === 404) setProfileMissing(true);
            else setProfileError(true);
          }
        });
      return () => { active = false; };
    }, [id, profileAttempt]);


  return (
    <div className="eventlink-profile-layout">
      <div className="profile-column">
        <Link to="/users" className="profile-back">Back to people</Link>
        <div className="card profile-card mb-3">
          {user.id ? <UserCard user={user} id={id} savedCount={savedCount.id === id ? savedCount.value : null} /> : profileMissing ?
            <div className="profile-loading"><h1>Profile not found</h1><p>This profile is no longer available.</p></div> : profileError ?
            <div className="profile-loading" role="alert"><p>Unable to load profile.</p><button className="btn btn-primary" type="button" onClick={() => setProfileAttempt(value => value + 1)}>Try again</button></div> :
            <p className="profile-loading" role="status">Loading profile...</p>}
        </div>
        {user.id && <div className="card saved-events-card">
          <Events onCountChange={updateSavedCount} />
        </div>}
      </div>
    </div>
  );
}

export default UserDetails;

