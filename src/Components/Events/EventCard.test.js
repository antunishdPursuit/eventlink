import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import EventCard from './EventCard';

vi.mock('../../AuthContext', () => ({ useAuth: () => ({ userId: 1 }) }));

test('an edited image replaces a failed previous image', () => {
  const event = { user_id: 1, artist: 'Artist', venue: 'Venue', city: 'City', price: 0, artist_picture: 'https://example.com/broken.jpg' };
  const view = render(<EventCard event={event} />);
  fireEvent.error(screen.getByAltText('Preview'));
  expect(screen.getByAltText('Preview')).not.toBeVisible();
  view.rerender(<EventCard event={{ ...event, artist_picture: 'https://example.com/updated.jpg' }} />);
  expect(screen.getByAltText('Preview')).toBeVisible();
  expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/updated.jpg');
});
