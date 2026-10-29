import "../../Css/EventCardCss.css"
import { useAuth } from '../../AuthContext';
import { useState } from 'react';
import DeleteControl from '../DeleteControl';

function User({ event, handleDelete, toggleView }) {
    const { userId } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const selectedImage = event.artist_picture;

  return (
    <div className="card saved-event-row">
        <div className="card-body">
                <div className="saved-event-thumbnail">
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
                <p className="card-subtitle">{[event.venue, event.city].filter(Boolean).join(' · ')}</p>
                <p className="card-text">{event.price == null ? 'Price unavailable' : `From $${Number(event.price).toFixed(2)}`}</p>
            </div>
            {String(userId) === String(event.user_id) && <div className="saved-event-actions">
              <button className="btn btn-primary" disabled={deleting} onClick={toggleView}>Edit</button>
              <DeleteControl label="Delete" description={'Permanently remove ' + event.artist + ' from your saved events?'} onPendingChange={setDeleting} onDelete={() => handleDelete(event.id)} />
            </div>}
        </div>
    </div>
  );
}

export default User;
