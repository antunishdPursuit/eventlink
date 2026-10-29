import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import { AuthProvider } from '../AuthContext';
import NavBar from '../Components/Organization/NavBar';
import SignIn from './SignIn';

vi.mock('axios', () => ({ default: { defaults: {}, get: vi.fn(), post: vi.fn() } }));
beforeEach(() => { vi.resetAllMocks(); axios.get.mockResolvedValue({ data: { userId: null } }); });

function Profile() {
  const { id } = useParams();
  return <h1>Profile {id}</h1>;
}
function EventDestination() { const location = useLocation(); return <><h1>Events</h1><p>{location.search + location.hash}</p></>; }
function openAccount(path = '/signin') {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><NavBar /><Routes>
    <Route path="/signin" element={<SignIn />} />
    <Route path="/events" element={<EventDestination />} />
    <Route path="/users/:id" element={<Profile />} />
    <Route path="/users" element={<h1>People directory</h1>} />
    <Route path="/users/new" element={<h1>Create your account</h1>} />
    <Route path="/" element={<h1>Home</h1>} />
  </Routes></AuthProvider></MemoryRouter>);
}
async function enterCredentials() {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'account-owner' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
}

test('sign-in opens the owner profile and keeps it reachable from People', async () => {
  axios.post.mockResolvedValueOnce({ data: { userId: 7 } });
  openAccount();
  await enterCredentials();
  expect(await screen.findByRole('heading', { name: 'Profile 7' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'My profile' })).toHaveAttribute('href', '/users/7');
  expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'People' }));
  expect(await screen.findByRole('heading', { name: 'People directory' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'My profile' }));
  expect(await screen.findByRole('heading', { name: 'Profile 7' })).toBeInTheDocument();
});

test.each(['/users/2', '/'])('My profile uses the authenticated owner while viewing %s', async path => {
  axios.get.mockResolvedValueOnce({ data: { userId: 7 } });
  openAccount(path);
  expect(await screen.findByRole('link', { name: 'My profile' })).toHaveAttribute('href', '/users/7');
  fireEvent.click(screen.getByLabelText('Account menu'));
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();
});

test('an existing session visiting sign-in opens its own profile', async () => {
  axios.get.mockResolvedValueOnce({ data: { userId: 7 } });
  openAccount();
  expect(await screen.findByRole('heading', { name: 'Profile 7' })).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('a new visitor can reach registration directly from the sign-in card', () => {
  openAccount();
  fireEvent.click(within(screen.getByText('New here?')).getByRole('link', { name: 'Create account' }));
  expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
});

test('sign-in restores a pending search and event without automatically saving', async () => {
  axios.post.mockResolvedValueOnce({ data: { userId: 7 } });
  openAccount('/signin?returnTo=' + encodeURIComponent('/events?postalCode=98101#event-show-2'));
  expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/users/new?returnTo=' + encodeURIComponent('/events?postalCode=98101#event-show-2'));
  await enterCredentials();
  expect(await screen.findByRole('heading', { name: 'Events' })).toBeInTheDocument();
  expect(screen.getByText('?postalCode=98101#event-show-2')).toBeInTheDocument();
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post.mock.calls[0][0]).toMatch(/\/auth\/login$/);
});

test('an external return URL falls back to the authenticated profile', async () => {
  axios.post.mockResolvedValueOnce({ data: { userId: 7 } });
  openAccount('/signin?returnTo=' + encodeURIComponent('https://example.com/steal'));
  await enterCredentials();
  expect(await screen.findByRole('heading', { name: 'Profile 7' })).toBeInTheDocument();
});

test('account menu keeps sign-out out of primary navigation and surfaces failure', async () => {
  axios.get.mockResolvedValueOnce({ data: { userId: 7 } });
  axios.post.mockRejectedValueOnce(new Error('Offline'));
  openAccount('/');
  await screen.findByRole('link', { name: 'My profile' });
  expect(screen.getByLabelText('Account menu').closest('details')).not.toHaveAttribute('open');
  fireEvent.click(screen.getByLabelText('Account menu'));
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to sign out');
  fireEvent.keyDown(screen.getByLabelText('Account menu'), { key: 'Escape' });
  expect(screen.getByLabelText('Account menu').closest('details')).not.toHaveAttribute('open');
  expect(screen.getByLabelText('Account menu')).toHaveFocus();
});

test.each([
  [401, 'Incorrect username or password.'],
  [403, 'Sign-in is blocked from this address.'],
  [429, 'Too many sign-in attempts.'],
  [503, 'Sign-in is unavailable right now.'],
  [null, 'Cannot reach the sign-in service.'],
])('a sign-in failure (%s) explains its cause and keeps the form usable', async (status, message) => {
  axios.post.mockRejectedValueOnce(status ? { response: { status } } : new Error('Network error'));
  openAccount();
  await enterCredentials();
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.getByLabelText('Username')).toHaveValue('account-owner');
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  expect(screen.queryByRole('link', { name: 'My profile' })).not.toBeInTheDocument();
});

test('session restoration blocks a competing sign-in request', async () => {
  let restoreSession;
  axios.get.mockImplementationOnce(() => new Promise(resolve => { restoreSession = resolve; }));
  openAccount();
  expect(screen.getByRole('status')).toHaveTextContent('Checking your account');
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  expect(axios.post).not.toHaveBeenCalled();
  await act(async () => restoreSession({ data: { userId: 7 } }));
  expect(await screen.findByRole('heading', { name: 'Profile 7' })).toBeInTheDocument();
});
