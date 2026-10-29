import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('axios', () => ({ default: { defaults: {}, get: vi.fn(), post: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

function AccountControls() {
  const { userId, signIn, signOut, register, authPending, setUserId } = useAuth();
  return <><output aria-label="Current user">{userId ?? 'none'}</output>
    <button onClick={() => signIn('test-person', 'test-password-123')}>Sign in</button>
    <button disabled={authPending} onClick={() => register({ username: 'test-person' }, 'test-password-123')}>Register</button>
    <button onClick={signOut}>Sign out</button>
    <button onClick={() => setUserId(null)}>Clear identity</button></>;
}

test.each(['Sign in', 'Register', 'Sign out'])('a late initial session response cannot override %s', async action => {
  let finishSession;
  axios.get.mockImplementation(() => new Promise(resolve => { finishSession = resolve; }));
  axios.post.mockImplementation(url => Promise.resolve({ data: { userId: url.endsWith('register') ? 8 : 7 } }));
  render(<AuthProvider><AccountControls /></AuthProvider>);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: action })));
  const expected = action === 'Sign in' ? '7' : action === 'Register' ? '8' : 'none';
  await waitFor(() => expect(screen.getByLabelText('Current user')).toHaveTextContent(expected));
  await act(async () => finishSession({ data: { userId: action === 'Sign out' ? 7 : null } }));
  expect(screen.getByLabelText('Current user')).toHaveTextContent(expected);
});

test('overlapping account mutations are rejected before a second request is sent', async () => {
  axios.get.mockResolvedValue({ data: { userId: null } });
  let finishFirst;
  axios.post.mockImplementation(() => new Promise(resolve => { finishFirst = resolve; }));
  let account;
  function CaptureAccount() { account = useAuth(); return <span />; }
  render(<AuthProvider><CaptureAccount /></AuthProvider>);
  let first;
  act(() => { first = account.register({ username: 'test-person' }, 'test-password-123'); });
  await expect(account.signIn('another-person', 'test-password-456')).rejects.toThrow('already in progress');
  expect(axios.post).toHaveBeenCalledTimes(1);
  await act(async () => { finishFirst({ data: { userId: 8 } }); await first; });
  expect(account.userId).toBe(8);
});

test('a superseded login reports that it was not applied', async () => {
  axios.get.mockResolvedValue({ data: { userId: null } });
  let finishLogin;
  axios.post.mockImplementation(() => new Promise(resolve => { finishLogin = resolve; }));
  let account;
  function CaptureAccount() { account = useAuth(); return <span />; }
  render(<AuthProvider><CaptureAccount /></AuthProvider>);
  let login;
  act(() => { login = account.signIn('test-person', 'test-password-123'); });
  act(() => account.setUserId(null));
  let result;
  await act(async () => { finishLogin({ data: { userId: 7 } }); result = await login; });
  expect(result.applied).toBe(false);
  expect(account.userId).toBeNull();
});
