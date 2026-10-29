import { act, fireEvent, render as renderComponent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import EventSearchDetails from './EventSearchDetails';

const auth = vi.hoisted(() => ({ userId: 1, setUserId: vi.fn() }));
vi.mock('../../AuthContext', () => ({ useAuth: () => auth }));
vi.mock('axios', () => ({ default: { post: vi.fn() } }));
const first = { id: 'provider-1', name: 'Same artist', url: 'https://example.com/tickets', dates: { start: { localDate: '2027-01-01', localTime: '19:30:00' } } };
const second = { ...first, id: 'provider-2' };
const render = component => renderComponent(component, { wrapper: MemoryRouter });
beforeEach(() => { vi.resetAllMocks(); auth.userId = 1; });

test('deleting one saved show does not clear another show with the same artist', async () => {
  axios.post.mockResolvedValueOnce({ data: { id: 11 } }).mockResolvedValueOnce({ data: { id: 12 } });
  const onAdd = vi.fn();
  const rows = removed => <><EventSearchDetails event={first} user={{ id: 1 }} handleAddEvents={onAdd} removedEvent={removed} /><EventSearchDetails event={second} user={{ id: 1 }} handleAddEvents={onAdd} removedEvent={removed} /></>;
  const view = render(rows(null));
  fireEvent.click(screen.getAllByRole('button', { name: 'Add to Saved' })[0]);
  await screen.findByText('Saved');
  fireEvent.click(screen.getByRole('button', { name: 'Add to Saved' }));
  await waitFor(() => expect(screen.getAllByText('Saved')).toHaveLength(2));
  view.rerender(rows({ id: 11, artist: 'Same artist' }));
  await waitFor(() => expect(screen.getAllByText('Saved')).toHaveLength(1));
  expect(screen.getByRole('button', { name: 'Add to Saved' })).toBeEnabled();
});

test('an expired save session clears stale identity and returns to event-specific sign-in', async () => {
  axios.post.mockRejectedValueOnce({ response: { status: 401 } });
  function SignInDestination() { const location = useLocation(); return <h1>{location.pathname + location.search}</h1>; }
  renderComponent(<MemoryRouter initialEntries={['/events?postalCode=98101']}><Routes>
    <Route path="/events" element={<EventSearchDetails event={first} user={{ id: 1 }} />} />
    <Route path="/signin" element={<SignInDestination />} />
  </Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Add to Saved' }));
  expect(await screen.findByRole('heading', { name: '/signin?returnTo=' + encodeURIComponent('/events?postalCode=98101#event-provider-1') })).toBeInTheDocument();
  expect(auth.setUserId).toHaveBeenCalledWith(null);
  expect(axios.post).toHaveBeenCalledTimes(1);
});

test('visitors can browse and get an event-specific sign-in action without saving', () => {
  auth.userId = null;
  render(<EventSearchDetails event={first} />);
  const link = screen.getByRole('link', { name: 'Sign in to save' });
  expect(link.getAttribute('href')).toBe('/signin?returnTo=' + encodeURIComponent('/events#event-provider-1'));
  expect(screen.queryByRole('button', { name: 'Add to Saved' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Get Tickets' })).toHaveAttribute('href', first.url);
  expect(axios.post).not.toHaveBeenCalled();
});

test('a failed save shows recovery and keeps the event available', async () => {
  axios.post.mockRejectedValueOnce(new Error('Offline'));
  render(<EventSearchDetails event={first} user={{ id: 1 }} handleAddEvents={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add to Saved' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save this event.');
  expect(screen.getByRole('button', { name: 'Add to Saved' })).toBeEnabled();
  expect(screen.getByText('7:30 PM')).toBeInTheDocument();
});

test('a save for a previous profile cannot mark the current profile as saved', async () => {
  let finishSave;
  axios.post.mockImplementationOnce(() => new Promise(resolve => { finishSave = resolve; }));
  const onAdd = vi.fn();
  const view = render(<EventSearchDetails event={first} user={{ id: 1 }} handleAddEvents={onAdd} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add to Saved' }));
  view.rerender(<EventSearchDetails event={first} user={{ id: 2 }} handleAddEvents={onAdd} />);
  await act(async () => finishSave({ data: { id: 11 } }));
  expect(onAdd).not.toHaveBeenCalled();
  expect(screen.queryByText('Saved')).not.toBeInTheDocument();
});
