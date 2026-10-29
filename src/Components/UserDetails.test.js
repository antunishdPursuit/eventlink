import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import axios from 'axios';
import UserDetails from './UserDetails';
vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('./UserCard', () => ({ default: () => <h1>Loaded profile</h1> }));
vi.mock('./Events/Events', () => ({ default: () => <h2>Saved events</h2> }));
vi.mock('./Events/EventSearch', () => ({ default: () => <h2>Find Events</h2> }));
const open = () => render(<MemoryRouter initialEntries={['/users/999999']}><Routes><Route path="/users/:id" element={<UserDetails />} /></Routes></MemoryRouter>);

test('a missing profile has a useful return link without unrelated event panels', async () => {
  axios.get.mockRejectedValueOnce({ response: { status: 404 } });
  open();
  expect(await screen.findByRole('heading', { name: 'Profile not found' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to people' })).toHaveAttribute('href', '/users');
  expect(screen.queryByRole('heading', { name: 'Find Events' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Saved events' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
});

test('a temporary profile failure can still be retried', async () => {
  axios.get.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: { id: 1 } });
  open();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load profile.');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Loaded profile' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Find Events' })).toBeInTheDocument();
});
