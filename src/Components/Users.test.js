import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import axios from 'axios';
import Users from './Users';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('./User', () => ({ default: () => null }));

test('distinguishes a failed request from an empty people list', async () => {
  axios.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] });
  render(<Users />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load people');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No profiles yet.')).toBeInTheDocument();
});
