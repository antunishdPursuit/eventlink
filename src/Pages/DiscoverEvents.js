import EventSearch from '../Components/Events/EventSearch';
import { useAuth } from '../AuthContext';

export default function DiscoverEvents() {
  const { userId } = useAuth();
  return <div className="events-page"><EventSearch user={{ id: userId }} title="Events" /></div>;
}
