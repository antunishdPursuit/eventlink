import "../../Css/EventCardCss.css"
import axios from "axios";
import EventSearchDetails from "../Events/EventSearchDetails";
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function UserSearch({user, handleAddEvents, removedEvent}) {
    const [search, setSearch] = useState(`stateCode=NY`)
    const [eventsTicketmaster, setEventsTicketmaster] = useState([])
    const [noEvents, setNoEvents] = useState(false)
    const [searchError, setSearchError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [isLoading, setIsLoading] = useState(true);

  
    // Fetch data and update state
    useEffect(() => {
      let active = true;
      setIsLoading(true);
      setSearchError(false);
      axios.get(`${API}/api/events?size=10&${search}`)
        .then(({ data }) => {
          if (!active) return;
          const events = data.events || [];
          setEventsTicketmaster(events);
          setNoEvents(events.length === 0);
        })
        .catch(() => {
          if (active) setSearchError(true);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => { active = false; };
    }, [search, attempt]);


    function searchState(event) {
        event.preventDefault();
        setSearch(`stateCode=${event.target.offsetParent.children[0].value}`)
    }

    function searchZipcode(event) {
        event.preventDefault();
        setSearch(`postalCode=${event.target.offsetParent.children[0].value}`)
    }

    return (
        <div className="eventlink-discovery">
            <h2>Find events</h2>
            <form className="d-flex">
                <div className="input-group me-2">
                    <input 
                        id="state"
                        type="search" 
                        className="form-control" 
                        aria-label="Search by State"
                        placeholder="Search by State" 
                    />
                    <button 
                        className="btn btn-primary" 
                        type="submit" 
                        onClick={searchState}
                    >Search</button>
                </div>
                <div className="input-group">
                    <input 
                        id="zipcode"
                        type="search" 
                        className="form-control" 
                        aria-label="Search by Zipcode"
                        placeholder="Search by Zipcode" 
                    />
                    <button 
                        className="btn btn-primary" 
                        type="submit"
                        onClick={searchZipcode}
                    >Search</button>
                </div>
            </form>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                searchError ?
                <div role="alert"><p>Unable to load events.</p><button type="button" className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
                : noEvents ?
                <p>No events found in {search.split('=')[1]}.</p>
                :
                eventsTicketmaster.map(event => (
                    <EventSearchDetails key={event.id} event={event} user={user} handleAddEvents={handleAddEvents} removedEvent={removedEvent}/>
                ))
            )}
        </div>
    );
}

export default UserSearch;

