import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import UserNewForm from './UserNewForm';

const auth = vi.hoisted(() => ({ register: vi.fn(), userId: null, sessionLoading: false }));
vi.mock('../AuthContext', () => ({ useAuth: () => auth }));
beforeEach(() => { vi.clearAllMocks(); auth.userId = null; auth.sessionLoading = false; });

function Destination() { const location = useLocation(); return <h1>{location.pathname + location.search + location.hash}</h1>; }
function openRegistration(search = '') {
  return render(<MemoryRouter initialEntries={['/users/new' + search]}><Routes>
    <Route path="/users/new" element={<UserNewForm />} />
    <Route path="/events" element={<Destination />} />
    <Route path="/users/:id" element={<Destination />} />
  </Routes></MemoryRouter>);
}

test('a failed preview stops retrying and can be replaced', () => {
  render(<MemoryRouter><UserNewForm /></MemoryRouter>);
  const field = screen.getByLabelText('Profile picture URL');
  fireEvent.change(field, { target: { value: 'https://example.com/broken.jpg' } });
  fireEvent.error(screen.getByAltText('Preview'));
  expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  expect(screen.getByText('Unable to load image preview.')).toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'https://example.com/next.png' } });
  expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/next.png');
  expect(screen.queryByText('Unable to load image preview.')).not.toBeInTheDocument();
});

test.each(['', '?returnTo=' + encodeURIComponent('/events?stateCode=WA#event-show-2')])('registration restores its destination after automatic sign-in (%s)', async search => {
  auth.register.mockImplementationOnce(async () => { auth.userId = 7; return { applied: true, userId: 7 }; });
  openRegistration(search);
  fireEvent.change(screen.getByLabelText('Profile picture URL'), { target: { value: 'https://example.com/avatar.png' } });
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-account' } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'new-test-password-123' } });
  fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'A temporary test account.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  const destination = search ? '/events?stateCode=WA#event-show-2' : '/events';
  expect(await screen.findByRole('heading', { name: destination })).toBeInTheDocument();
  expect(auth.register).toHaveBeenCalledTimes(1);
});

test('an existing account cannot accidentally register a second profile', async () => {
  auth.userId = 7;
  openRegistration('?returnTo=' + encodeURIComponent('/events#event-show-2'));
  expect(await screen.findByRole('heading', { name: '/users/7' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
  expect(auth.register).not.toHaveBeenCalled();
});

test('the return to sign-in keeps the pending event', () => {
  const search = '?returnTo=' + encodeURIComponent('/events?postalCode=98101#event-show-2');
  openRegistration(search);
  expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/signin' + search);
});
