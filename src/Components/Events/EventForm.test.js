import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import EventForm from './EventForm';

const event = { id: 7, artist: 'Artist', venue: 'Venue', city: 'City', price: 0, artist_picture: '' };

test('preserves the draft on failure and closes only after a successful save', async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValueOnce({});
  const close = vi.fn();
  render(<EventForm eventDetails={event} handleSubmit={save} toggleView={close} />);
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Boston' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save changes');
  expect(screen.getByLabelText('City')).toHaveValue('Boston');
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ city: 'Boston', price: 0 }));
});

test('cancel closes without saving', () => {
  const save = vi.fn();
  const close = vi.fn();
  render(<EventForm eventDetails={event} handleSubmit={save} toggleView={close} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
});
