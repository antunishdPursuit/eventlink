import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import EventSearch from './EventSearch';

vi.mock('axios', () => ({ default: { defaults: {}, get: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

test('distinguishes an empty result from a failed request and allows retry', async () => {
  axios.get.mockRejectedValueOnce(new Error('Service unavailable'))
    .mockResolvedValueOnce({ data: { events: [] } });
  render(<EventSearch user={{ id: 1 }} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load events.');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.getByText('No events found in NY.')).toBeInTheDocument());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('the labeled search form preserves state and ZIP searches', async () => {
  axios.get.mockResolvedValue({ data: { events: [] } });
  render(<EventSearch user={{ id: 1 }} />);
  await screen.findByText('No events found in NY.');
  fireEvent.change(screen.getByLabelText('Search by Zipcode'), { target: { value: '10001' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search events' }));
  await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('postalCode=10001')));
  fireEvent.change(screen.getByLabelText('Search by State'), { target: { value: 'CA' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search events' }));
  await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('stateCode=CA')));
});
