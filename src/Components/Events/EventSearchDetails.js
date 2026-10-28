import { Link } from "react-router-dom";
import { useState } from "react";

import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function EventSearchDetails( {event, user, handleAddEvents}) {
  const venue = event._embedded?.venues?.[0];
  const eventImage = event.images?.find((image) => image.ratio === '16_9')?.url || event.images?.[0]?.url;
  const [addedEvents, setAddedEvents] = useState([]);
  const isEventAdded = addedEvents.some((addedEvent) => addedEvent.artist === event.name);

  const handleAdd = () => {
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
      .then(
        (response) => {
          setAddedEvents([...addedEvents, newEvent]);
          handleAddEvents(newEvent)
          console.log("success");
        },
        (error) => console.error(error)
      )
      .catch((c) => console.warn("catch", c));
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
              {!isEventAdded ? (
                <button className="btn btn-success btn-sm" onClick={handleAdd}>Add</button>
              ) : (
                <p className="fs-6">Event added!</p>
              )}
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <Link to={event.url} className="fs-6 mb-2">Tickets:<br/> ${event.priceRanges[0].min} - ${event.priceRanges[0].max}</Link>
              {!isEventAdded ? (
                <button className="btn btn-success btn-sm" onClick={handleAdd}>Add</button>
              ) : (
                <p className="fs-6">Event added!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventSearchDetails;
