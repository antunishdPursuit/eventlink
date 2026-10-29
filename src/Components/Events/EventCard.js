import "../../Css/EventCardCss.css"
import { useAuth } from '../../AuthContext';

function User({ event, handleDelete, toggleView }) {
    const { userId } = useAuth();
    const selectedImage = event.artist_picture;

  return (
    <div className="card saved-event-row">
        <div className="card-body">
                <div className="saved-event-thumbnail">
                <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 45V18l25-5v26M24 23l25-5" fill="none" stroke="currentColor" strokeWidth="4" /><ellipse cx="17" cy="46" rx="8" ry="6" fill="currentColor" /><ellipse cx="42" cy="40" rx="8" ry="6" fill="currentColor" /></svg>
                {selectedImage &&
                <img 
                key={selectedImage}
                alt="Preview" 
                src={selectedImage} 
                onError={(event) => { event.currentTarget.hidden = true; }}
                className="img-fluid rounded event-card" 
                />}
                </div>
            <div className="saved-event-details">
                <h4 className="card-title">{event.artist}</h4>
                <h5 className="card-subtitle">In {event.city} at {event.venue}</h5>
                <p className="card-text">{event.price == null ? 'Price unavailable' : `Min Price: $${event.price}`}</p>
            </div>
            {String(userId) === String(event.user_id) && <div className="saved-event-actions">
              <button className="btn btn-primary" onClick={toggleView}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(event.id)}>Delete</button>
            </div>}
        </div>
    </div>
  );
}

export default User;
