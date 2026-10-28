import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('axios', () => ({ get: jest.fn(() => Promise.resolve({ data: [] })) }));

test('renders the home route inside the application router', async () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /find your next live experience/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /explore events/i })).toHaveAttribute('href', '/users');
  expect(screen.getByRole('link', { name: /create profile/i })).toHaveAttribute('href', '/users/new');
});
