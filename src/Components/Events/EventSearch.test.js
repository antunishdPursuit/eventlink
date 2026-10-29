import { render as renderComponent, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import EventSearch from './EventSearch';

vi.mock('axios', () => ({ default: { defaults: {}, get: vi.fn() } }));
vi.mock('../../AuthContext', () => ({ useAuth: () => ({ userId: null }) }));
const render = (component, initialEntries = ['/events']) => renderComponent(<MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>);

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

test('a returned event restores its ZIP search and receives focus after loading', async () => {
  axios.get.mockResolvedValueOnce({ data: { events: [{ id: 'show-2', name: 'Returned show' }] } });
  render(<EventSearch />, ['/events?postalCode=98101#event-show-2']);
  await screen.findByRole('heading', { name: 'Returned show' });
  expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('postalCode=98101'));
  expect(screen.getByLabelText('Search by Zipcode')).toHaveValue('98101');
  expect(screen.getByRole('article', { name: 'Returned show' })).toHaveFocus();
});

test('a returned event missing from new results gets a useful recovery message', async () => {
  axios.get.mockResolvedValueOnce({ data: { events: [] } });
  render(<EventSearch />, ['/events?stateCode=WA#event-expired']);
  expect(await screen.findByText('That event is no longer in these results. Try another search.')).toHaveAttribute('role', 'status');
  expect(screen.getByRole('button', { name: 'Search events' })).toBeEnabled();
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
