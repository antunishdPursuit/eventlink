import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import axios from 'axios';
import Home from './Home';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));

test('failed homepage events can be retried without reloading the page', async () => {
  let attempts = 0;
  axios.get.mockImplementation(url => url.endsWith('/users') ? Promise.resolve({ data: [] }) : ++attempts === 1 ? Promise.reject(new Error('Offline')) : Promise.resolve({ data: { events: [{ id: 'example', name: 'Recovered concert' }] } }));
  render(<MemoryRouter><Home /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Events are unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Recovered concert' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(attempts).toBe(2);
});
