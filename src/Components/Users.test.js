import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import axios from 'axios';
import Users from './Users';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('./User', () => ({ default: ({ user }) => <div data-testid="person">{user.username}</div> }));

test('distinguishes a failed request from an empty people list', async () => {
  axios.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] });
  render(<Users />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load people');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No profiles yet.')).toBeInTheDocument();
});

test('the compact sort control preserves username and group sorting', async () => {
  axios.get.mockResolvedValueOnce({ data: [
    { id: 1, username: 'Zoe', looking_for_group: true },
    { id: 2, username: 'Amy', looking_for_group: false },
  ] });
  render(<Users />);
  await screen.findByText('Zoe');
  fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'username-asc' } });
  expect(screen.getAllByTestId('person').map(item => item.textContent)).toEqual(['Amy', 'Zoe']);
  fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'group-desc' } });
  expect(screen.getAllByTestId('person').map(item => item.textContent)).toEqual(['Zoe', 'Amy']);
});
