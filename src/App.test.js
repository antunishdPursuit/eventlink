import { vi, test, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';

vi.mock('axios', () => ({ default: { defaults: {}, get: vi.fn(() => Promise.resolve({ data: {} })) } }));
vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
afterEach(() => vi.clearAllMocks());

test('renders the home route inside the application router', async () => {
  render(<MemoryRouter initialEntries={['/']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /find your next live experience/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /explore events/i })).toHaveAttribute('href', '/events');
  expect(screen.queryByRole('link', { name: /create account/i })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute('href', '/signin');
});

test('Explore events opens public discovery rather than the people directory', async () => {
  render(<MemoryRouter initialEntries={['/']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole('link', { name: 'Explore events' }));
  expect(await screen.findByRole('heading', { name: 'Events', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Search events' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'People', level: 1 })).not.toBeInTheDocument();
});

test('resets scrolling when navigating to another page', async () => {
  render(<MemoryRouter initialEntries={['/about']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
  window.scrollTo.mockClear();
  fireEvent.click(screen.getByRole('link', { name: 'Sign in', exact: true }));
  expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
});

