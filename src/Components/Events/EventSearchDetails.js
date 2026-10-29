import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import axios from "axios";
import { useAuth } from '../../AuthContext';

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function EventSearchDetails( {event, user, handleAddEvents, removedEvent}) {
  const { userId } = useAuth();
  const canAdd = userId != null && String(userId) === String(user.id);
  const venue = event._embedded?.venues?.[0];
  const eventImage = event.images?.find((image) => image.ratio === '16_9')?.url || event.images?.[0]?.url;
  const [addedEvents, setAddedEvents] = useState([]);
  const [addError, setAddError] = useState(false);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    if (removedEvent) setAddedEvents(items => items.filter(item => item.artist !== removedEvent.artist));
  }, [removedEvent]);
  const isEventAdded = addedEvents.some((addedEvent) => addedEvent.artist === event.name);

  const handleAdd = () => {
    setAddError(false);
    setAdding(true);
    const newEvent = {
      artist: event.name,
      venue: venue?.name || '',
      city: venue?.city?.name || '',
      artist_picture: eventImage || '',
      price: event.priceRanges?.[0]?.min ?? null,
      user_id: user.id,
    }

    axios
      .post(`${API}/users/${user.id}/events`, newEvent)
      .then(() => {
          setAddedEvents(items => [...items, newEvent]);
          handleAddEvents(newEvent)
        })
      .catch(() => setAddError(true))
      .finally(() => setAdding(false));
    };

  return (
    <div className="card-body">
      <div className="row align-items-center">
        <div className="col-md-3">
              {eventImage && <img src={eventImage} alt="" className="event-search-box" />}
        </div>
        <div className="col-md-7">
          <h4 className="card-title fs-5">{event.name}</h4>
          <h5 className="card-subtitle fs-6">
            {[venue?.city?.name, venue?.state?.stateCode, venue?.name].filter(Boolean).join(' · ')}
          </h5>
          <h5 className="fs-6">Event Date: {event.dates.start.localDate}</h5>
        </div>
        <div className="col-md-2">
            {!event.priceRanges?.length ? (
            <div className="d-flex flex-column align-items-center">
              <Link to={event.url} className="fs-6 mb-2">Check Price</Link>
              {canAdd && (!isEventAdded ? (
                <button className="btn btn-success btn-sm" onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
              ) : (
                <p className="fs-6">Event added!</p>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <Link to={event.url} className="fs-6 mb-2">Tickets:<br/> ${event.priceRanges[0].min} - ${event.priceRanges[0].max}</Link>
              {canAdd && (!isEventAdded ? (
                <button className="btn btn-success btn-sm" onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
              ) : (
                <p className="fs-6">Event added!</p>
              ))}
            </div>
          )}
        </div>
      </div>
      {addError && <p role="alert">Unable to add event. Please try again.</p>}
    </div>
  );
}

export default EventSearchDetails;
