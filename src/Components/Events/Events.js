import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Event from "../Events/Event";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";

function Events({newEventToAdd, onEventDeleted}) {
  let { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/users/${id}/events`)
      .then((response) => {
        setEvents(response.data);
      });
  }, [id, newEventToAdd]);

  const handleDelete = (eventId) => {
    axios
      .delete(`${API}/users/${id}/events/${eventId}`)
      .then(
        (response) => {
          onEventDeleted(response.data);
          setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        },
        (error) => console.error(error)
      )
      .catch((c) => console.warn("catch", c));
  };

  const handleEdit = (updatedEvent) => {
    axios
      .put(`${API}/users/${id}/events/${updatedEvent.id}`, updatedEvent)
      .then((response) => {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === updatedEvent.id ? response.data : event
          )
        );
      })
      .catch((c) => console.warn("catch", c));
  };

  return (
    <section className="Events">
        <h2>Events</h2>
        {events.map((event) => (
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
